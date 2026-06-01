#!/usr/bin/env python3
"""
🚀 FLASK SERVER - API pour les analyses de matchs
Lance sur http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os
import json
import sys

# Ajouter le répertoire ML au path
sys.path.insert(0, os.path.dirname(__file__))

from live_data_fetcher import LiveDataFetcher
from live_inference_engine import LiveInferenceEngine

app = Flask(__name__)
CORS(app)

# Charger les modèles
print("📦 Chargement des modèles...")
try:
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    
    with open(os.path.join(models_dir, 'random_forest.joblib'), 'rb') as f:
        rf_model = joblib.load(f)
    
    with open(os.path.join(models_dir, 'xgboost.joblib'), 'rb') as f:
        xgb_model = joblib.load(f)
    
    with open(os.path.join(models_dir, 'lightgbm.joblib'), 'rb') as f:
        lgb_model = joblib.load(f)
    
    with open(os.path.join(models_dir, 'gradient_boosting.joblib'), 'rb') as f:
        gb_model = joblib.load(f)
    
    with open(os.path.join(models_dir, 'scaler.joblib'), 'rb') as f:
        scaler = joblib.load(f)
    
    with open(os.path.join(models_dir, 'metadata.json'), 'r') as f:
        metadata = json.load(f)
    
    print("✅ Modèles chargés")
except Exception as e:
    print(f"❌ Erreur chargement modèles: {e}")
    sys.exit(1)

# Initialiser les engines
data_fetcher = LiveDataFetcher()
inference_engine = LiveInferenceEngine(
    models={'rf': rf_model, 'xgb': xgb_model, 'lgb': lgb_model, 'gb': gb_model},
    scaler=scaler,
    metadata=metadata
)

@app.route('/analyze', methods=['POST'])
def analyze_match():
    """
    Analyser un match en temps réel
    
    Request:
    {
        "home_team": "Manchester City",
        "away_team": "Liverpool"
    }
    
    Response:
    {
        "prediction": "HOME_WIN",
        "confidence": 84.5,
        "home_stats": {...},
        "away_stats": {...},
        "analysis": "..."
    }
    """
    try:
        data = request.json
        home_team = data.get('home_team')
        away_team = data.get('away_team')
        
        if not home_team or not away_team:
            return jsonify({'error': 'Équipes manquantes'}), 400
        
        print(f"📊 Analyse: {home_team} vs {away_team}")
        
        # Fetcher les données live
        match_data = data_fetcher.fetch_match_data(home_team, away_team)
        
        # Faire la prédiction
        prediction = inference_engine.predict_match(match_data)
        
        return jsonify({
            'success': True,
            'prediction': prediction['prediction'],
            'confidence': float(prediction['confidence']),
            'home_stats': match_data.get('home_stats', {}),
            'away_stats': match_data.get('away_stats', {}),
            'analysis': f"Prédiction basée sur {len(match_data.get('recent_matches', []))} matchs récents"
        })
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({'status': 'OK', 'version': '1.0.0'})

@app.route('/', methods=['GET'])
def index():
    """Info du serveur"""
    return jsonify({
        'name': 'Football Predictor API',
        'version': '1.0.0',
        'endpoints': {
            '/analyze': 'POST - Analyser un match',
            '/health': 'GET - Health check'
        }
    })

if __name__ == '__main__':
    print("🚀 Démarrage du serveur sur http://localhost:5000")
    print("💡 Accessible depuis l'extension Chrome")
    app.run(host='localhost', port=5000, debug=False)
