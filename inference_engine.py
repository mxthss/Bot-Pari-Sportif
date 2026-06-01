#!/usr/bin/env python3
"""
Model Inference Engine
Loads trained models and makes predictions
Used by the browser extension
"""

import json
import logging
from pathlib import Path
import joblib
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InferenceEngine:
    """Load and use trained models for predictions"""
    
    def __init__(self, models_dir='ml-training/models'):
        self.models_dir = Path(models_dir)
        self.models = {}
        self.scaler = None
        self.metadata = {}
        self.loaded = False
        
    def load_models(self):
        """Load all trained models"""
        if not self.models_dir.exists():
            logger.error(f"Models directory not found: {self.models_dir}")
            return False
        
        try:
            logger.info(f"Loading models from {self.models_dir}...")
            
            # Load scaler
            scaler_path = self.models_dir / 'scaler.joblib'
            if scaler_path.exists():
                self.scaler = joblib.load(scaler_path)
                logger.info("  ✓ Loaded scaler")
            
            # Load metadata
            metadata_path = self.models_dir / 'metadata.json'
            if metadata_path.exists():
                with open(metadata_path) as f:
                    self.metadata = json.load(f)
                logger.info(f"  ✓ Loaded metadata ({self.metadata.get('n_features', 0)} features)")
            
            # Load all models
            model_files = list(self.models_dir.glob('*.joblib'))
            for model_file in model_files:
                if 'scaler' not in model_file.name:
                    model_name = model_file.stem
                    self.models[model_name] = joblib.load(model_file)
                    logger.info(f"  ✓ Loaded {model_name}")
            
            if not self.models:
                logger.warning("No models found. Run training first!")
                return False
            
            self.loaded = True
            logger.info(f"✅ Loaded {len(self.models)} models")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            return False
    
    def predict(self, features_dict):
        """
        Make prediction from feature dictionary
        
        Args:
            features_dict: Dict with feature names as keys
            
        Returns:
            Dict with predictions and confidence
        """
        
        if not self.loaded:
            return {
                'success': False,
                'error': 'Models not loaded'
            }
        
        try:
            # Convert to array
            feature_order = self.metadata.get('feature_names', [])
            features = np.array([features_dict.get(f, 0) for f in feature_order]).reshape(1, -1)
            
            # Scale
            if self.scaler:
                features = self.scaler.transform(features)
            
            # Predict with all models
            predictions = []
            for model in self.models.values():
                if hasattr(model, 'predict_proba'):
                    pred = model.predict_proba(features)[0]
                else:
                    pred = model.predict(features)[0]
                predictions.append(pred)
            
            # Ensemble: average predictions
            ensemble_pred = np.mean(predictions, axis=0)
            
            # Get winner
            classes = {0: 'Away Win', 1: 'Draw', 2: 'Home Win'}
            predicted_class = np.argmax(ensemble_pred)
            
            result = {
                'success': True,
                'prediction': classes[predicted_class],
                'probabilities': {
                    'away_win': float(ensemble_pred[0]),
                    'draw': float(ensemble_pred[1]),
                    'home_win': float(ensemble_pred[2]),
                },
                'confidence': float(np.max(ensemble_pred)),
                'ensemble_size': len(self.models),
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_model_info(self):
        """Get information about loaded models"""
        return {
            'loaded': self.loaded,
            'n_models': len(self.models),
            'model_names': list(self.models.keys()),
            'n_features': self.metadata.get('n_features', 0),
            'feature_names': self.metadata.get('feature_names', []),
        }

# Singleton instance
_engine = None

def get_engine():
    """Get or create inference engine"""
    global _engine
    if _engine is None:
        _engine = InferenceEngine()
        _engine.load_models()
    return _engine

if __name__ == '__main__':
    # Test
    engine = get_engine()
    
    # Example: Real match data
    test_features = {
        'shots_for': 15,
        'shots_on_target_for': 8,
        'goals_for': 2,
        'possession_pct': 60,
        'passes_completed': 500,
        'pass_accuracy': 85.5,
        'key_passes': 10,
        'crosses': 25,
        'dribbles': 15,
        'fouls_committed': 12,
        'shots_against': 10,
        'shots_on_target_against': 5,
        'goals_against': 1,
        'tackles': 25,
        'interceptions': 12,
        'clearances': 30,
        'blocks': 8,
        'fouls_against': 15,
        'yellow_cards': 2,
        'red_cards': 0,
        'elo_rating_home': 1950,
        'elo_rating_away': 1750,
        'form_last_5_home': 10,
        'form_last_5_away': 7,
        'goals_conceded_l5_home': 2,
        'goals_conceded_l5_away': 4,
        'goals_scored_l5_home': 12,
        'goals_scored_l5_away': 8,
        'clean_sheets_home': 2,
        'clean_sheets_away': 1,
        'h2h_wins_home': 3,
        'h2h_wins_away': 1,
        'h2h_draws': 1,
        'h2h_goals_for_home': 10,
        'h2h_goals_for_away': 4,
        'is_home_game': 1,
        'crowd_attendance': 55000,
        'weather_temp': 18,
        'weather_rain': 0,
        'league_difficulty': 0.75,
        'season_progress': 0.5,
        'rest_days_home': 7,
        'rest_days_away': 5,
        'home_advantage_factor': 1.08,
    }
    
    print("\n" + "="*60)
    print("INFERENCE ENGINE TEST")
    print("="*60)
    
    info = engine.get_model_info()
    print(f"\nModel Status: {'✅ Ready' if info['loaded'] else '❌ Not loaded'}")
    print(f"Ensemble Size: {info['n_models']} models")
    
    if info['loaded']:
        print("\nTesting prediction...")
        result = engine.predict(test_features)
        
        if result['success']:
            print(f"\nPrediction Result: {result['prediction']}")
            print(f"Confidence: {result['confidence']:.2%}")
            print(f"\nProbabilities:")
            for outcome, prob in result['probabilities'].items():
                bar_length = int(prob * 30)
                bar = '█' * bar_length + '░' * (30 - bar_length)
                print(f"  {outcome:12} {bar} {prob:.2%}")
        else:
            print(f"Prediction failed: {result['error']}")
    
    print("\n" + "="*60)
