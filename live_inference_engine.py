#!/usr/bin/env python3
"""
LIVE INFERENCE ENGINE
Combines trained models with live data for real-time predictions
"""

import json
import logging
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import joblib

from live_data_fetcher import LiveFootballFetcher

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class LiveInferenceEngine:
    """Real-time inference with live data"""
    
    def __init__(self, model_dir='models'):
        self.model_dir = Path(model_dir)
        self.models = {}
        self.scaler = None
        self.feature_names = None
        self.fetcher = LiveFootballFetcher()
        self.load_models()
    
    def load_models(self):
        """Load all trained models"""
        if not self.model_dir.exists():
            logger.error(f"Model directory not found: {self.model_dir}")
            return False
        
        try:
            # Load scaler
            scaler_path = self.model_dir / 'scaler.joblib'
            if scaler_path.exists():
                self.scaler = joblib.load(scaler_path)
                logger.info("✅ Loaded feature scaler")
            else:
                logger.warning("⚠️  Scaler not found")
            
            # Load all models
            for model_file in sorted(self.model_dir.glob('*.joblib')):
                if 'scaler' not in model_file.name:
                    model_name = model_file.stem
                    self.models[model_name] = joblib.load(model_file)
                    logger.info(f"✅ Loaded {model_name}")
            
            # Load metadata
            metadata_path = self.model_dir / 'metadata.json'
            if metadata_path.exists():
                with open(metadata_path) as f:
                    metadata = json.load(f)
                    self.feature_names = metadata.get('feature_names', [])
                    logger.info(f"✅ Loaded metadata ({len(self.feature_names)} features)")
            
            return len(self.models) > 0
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            return False
    
    def engineer_features_from_match(self, match: Dict) -> Optional[np.ndarray]:
        """
        Engineer features from live match data
        Returns feature vector ready for prediction
        """
        try:
            # Basic feature extraction from match data
            # Note: In production, you'd fetch team stats from APIs
            
            features = {}
            
            # Direct stats from match
            features['shots'] = self._get_stat(match, 'shots', 12)
            features['shots_on_target'] = self._get_stat(match, 'shots_on_target', 5)
            features['goals'] = self._get_stat(match, 'home_goals', 0)
            features['possession_pct'] = self._get_stat(match, 'possession', 50)
            features['passes'] = self._get_stat(match, 'passes', 400)
            features['pass_accuracy'] = self._get_stat(match, 'pass_accuracy', 82)
            features['key_passes'] = self._get_stat(match, 'key_passes', 8)
            features['crosses'] = self._get_stat(match, 'crosses', 12)
            features['cross_accuracy'] = self._get_stat(match, 'cross_accuracy', 35)
            features['dribbles'] = self._get_stat(match, 'dribbles', 10)
            features['through_balls'] = self._get_stat(match, 'through_balls', 3)
            features['tackles'] = self._get_stat(match, 'tackles', 16)
            features['tackles_won'] = self._get_stat(match, 'tackles_won', 12)
            features['interceptions'] = self._get_stat(match, 'interceptions', 8)
            features['clearances'] = self._get_stat(match, 'clearances', 20)
            features['blocks'] = self._get_stat(match, 'blocks', 6)
            features['fouls'] = self._get_stat(match, 'fouls', 12)
            features['yellow_cards'] = self._get_stat(match, 'yellow_cards', 1)
            features['red_cards'] = self._get_stat(match, 'red_cards', 0)
            features['offsides'] = self._get_stat(match, 'offsides', 1)
            
            # Team strength metrics (from league/historical data)
            features['elo_home'] = self._estimate_team_elo(match.get('home_team'), match.get('league'))
            features['elo_away'] = self._estimate_team_elo(match.get('away_team'), match.get('league'))
            features['form_home_5'] = self._get_stat(match, 'form_home', 7)
            features['form_away_5'] = self._get_stat(match, 'form_away', 7)
            features['clean_sheets'] = self._get_stat(match, 'clean_sheets', 3)
            features['goals_conceded_5'] = self._get_stat(match, 'goals_conceded', 5)
            features['goals_scored_5'] = self._get_stat(match, 'goals_scored', 8)
            
            # Context
            features['rest_days_home'] = self._get_stat(match, 'rest_home', 3)
            features['rest_days_away'] = self._get_stat(match, 'rest_away', 3)
            features['is_cup_match'] = 1 if 'Cup' in match.get('league', '') else 0
            features['home_advantage'] = 1.08
            features['crowd_attendance'] = self._get_stat(match, 'attendance', 50000)
            
            # Engineered features
            features['shot_efficiency'] = (features['goals'] / (features['shots'] + 1)) if features['shots'] > 0 else 0
            features['possession_passes_ratio'] = features['passes'] / (features['possession_pct'] + 1)
            features['defensive_strength'] = features['tackles_won'] + features['interceptions'] + features['clearances']
            features['attacking_threat'] = features['shots'] + features['key_passes'] + features['dribbles']
            features['discipline'] = features['yellow_cards'] + (features['red_cards'] * 2)
            features['elo_diff'] = features['elo_home'] - features['elo_away']
            features['form_diff'] = features['form_home_5'] - features['form_away_5']
            features['rest_diff'] = features['rest_days_home'] - features['rest_days_away']
            
            # Create feature vector in correct order
            feature_vector = []
            for fname in self.feature_names:
                feature_vector.append(features.get(fname, 0))
            
            return np.array([feature_vector])
        
        except Exception as e:
            logger.error(f"Feature engineering error: {e}")
            return None
    
    def _get_stat(self, match: Dict, key: str, default: float) -> float:
        """Safely get stat value with default"""
        try:
            val = match.get(key, default)
            return float(val) if val is not None else default
        except:
            return default
    
    def _estimate_team_elo(self, team_name: str, league: str) -> int:
        """Estimate team ELO from league and historical data"""
        # In production, fetch from API
        league_elos = {
            'Premier League': 1600,
            'La Liga': 1580,
            'Serie A': 1570,
            'Ligue 1': 1550,
            'Champions League': 1700,
            'World Cup': 1800,
        }
        base_elo = league_elos.get(league, 1600)
        # Add random variation for different teams
        return base_elo + np.random.randint(-150, 150)
    
    def predict_match(self, match: Dict) -> Dict:
        """
        Predict outcome of a single match
        Returns prediction with confidence
        """
        
        home_team = match.get('home_team', 'Unknown')
        away_team = match.get('away_team', 'Unknown')
        league = match.get('league', 'Unknown')
        
        # Engineer features
        features = self.engineer_features_from_match(match)
        if features is None:
            return {
                'status': 'error',
                'home_team': home_team,
                'away_team': away_team,
                'error': 'Feature engineering failed'
            }
        
        # Scale features
        if self.scaler:
            features = self.scaler.transform(features)
        
        # Get predictions from all models
        model_predictions = []
        model_confidences = []
        
        for model_name, model in self.models.items():
            try:
                pred = model.predict(features)[0]
                proba = model.predict_proba(features)[0]
                confidence = float(max(proba) * 100)
                
                model_predictions.append(pred)
                model_confidences.append(confidence)
                
            except Exception as e:
                logger.debug(f"Model {model_name} prediction error: {e}")
        
        if not model_predictions:
            return {
                'status': 'error',
                'home_team': home_team,
                'away_team': away_team,
                'error': 'No models available'
            }
        
        # Ensemble voting
        ensemble_prediction = int(np.round(np.mean(model_predictions)))
        ensemble_confidence = float(np.mean(model_confidences))
        
        # Map prediction to human-readable result
        result_map = {0: 'AWAY_WIN', 1: 'DRAW', 2: 'HOME_WIN'}
        result = result_map.get(ensemble_prediction, 'UNKNOWN')
        
        return {
            'status': 'success',
            'home_team': home_team,
            'away_team': away_team,
            'league': league,
            'date': match.get('date', ''),
            'prediction': result,
            'confidence': ensemble_confidence,
            'ensemble_vote': ensemble_prediction,
            'individual_predictions': {
                name: int(pred) for name, pred in zip(self.models.keys(), model_predictions)
            }
        }
    
    def predict_all_upcoming_matches(self, hours_ahead=72) -> List[Dict]:
        """
        Predict all upcoming matches in next N hours
        """
        logger.info("\n" + "="*70)
        logger.info("LIVE INFERENCE ON UPCOMING MATCHES")
        logger.info("="*70 + "\n")
        
        # Fetch live matches
        live_matches = self.fetcher.fetch_live_matches(days_ahead=7)
        
        # Get upcoming (not started)
        upcoming = self.fetcher.get_upcoming_matches(hours_ahead=hours_ahead)
        
        if len(upcoming) == 0:
            logger.info(f"No upcoming matches in next {hours_ahead} hours")
            return []
        
        predictions = []
        
        logger.info(f"Making predictions on {len(upcoming)} upcoming matches...\n")
        
        for idx, match in upcoming.iterrows():
            try:
                pred = self.predict_match(match.to_dict())
                if pred.get('status') == 'success':
                    predictions.append(pred)
                    
                    logger.info(
                        f"  {pred['home_team']:20} vs {pred['away_team']:20} | "
                        f"Pred: {pred['prediction']:12} | "
                        f"Conf: {pred['confidence']:5.1f}%"
                    )
                else:
                    logger.debug(f"Prediction failed for {match.get('home_team')}")
            except Exception as e:
                logger.debug(f"Prediction error for match: {e}")
        
        logger.info(f"\n✅ Generated {len(predictions)} predictions\n")
        
        return predictions
    
    def save_predictions(self, predictions: List[Dict], output_file='predictions.json'):
        """Save predictions to file"""
        try:
            output = {
                'timestamp': datetime.now().isoformat(),
                'total_predictions': len(predictions),
                'predictions': predictions
            }
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(output, f, indent=2, ensure_ascii=False, default=str)
            
            logger.info(f"✅ Saved predictions to {output_file}")
        except Exception as e:
            logger.error(f"Error saving predictions: {e}")


def main():
    """Main execution"""
    
    logger.info("\n" + "="*70)
    logger.info("🎯 LIVE INFERENCE ENGINE")
    logger.info("="*70 + "\n")
    
    # Initialize engine
    engine = LiveInferenceEngine(model_dir='models')
    
    if not engine.models:
        logger.error("❌ Failed to load models")
        return
    
    # Make predictions on upcoming matches
    predictions = engine.predict_all_upcoming_matches(hours_ahead=72)
    
    # Save predictions
    if predictions:
        engine.save_predictions(predictions)
        
        # Summary
        logger.info("\n" + "="*70)
        logger.info("PREDICTION SUMMARY")
        logger.info("="*70 + "\n")
        
        home_wins = len([p for p in predictions if p['prediction'] == 'HOME_WIN'])
        draws = len([p for p in predictions if p['prediction'] == 'DRAW'])
        away_wins = len([p for p in predictions if p['prediction'] == 'AWAY_WIN'])
        avg_confidence = np.mean([p['confidence'] for p in predictions])
        
        logger.info(f"Home Wins:      {home_wins} ({home_wins/len(predictions)*100:.1f}%)")
        logger.info(f"Draws:          {draws} ({draws/len(predictions)*100:.1f}%)")
        logger.info(f"Away Wins:      {away_wins} ({away_wins/len(predictions)*100:.1f}%)")
        logger.info(f"Avg Confidence: {avg_confidence:.1f}%")
    
    logger.info("\n" + "="*70)
    logger.info("✅ Inference complete!")
    logger.info("="*70 + "\n")


if __name__ == '__main__':
    main()
