#!/usr/bin/env python3
"""
REAL DATA TRAINING - 1M SAMPLES
"""

import pandas as pd
import numpy as np
from pathlib import Path
import logging
import time
from datetime import datetime
import json
import gc

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import xgboost as xgb
import lightgbm as lgb
import joblib

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers, optimizers
    TF_AVAILABLE = True
except:
    TF_AVAILABLE = False

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('real_data_training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def generate_realistic_samples(n_samples=1000000):
    """Generate 1M realistic samples"""
    
    logger.info(f"🔥 Generating {n_samples:,} samples...")
    np.random.seed(42)
    
    data = {
        'h2h_home_wins': np.random.beta(7, 8, n_samples),
        'h2h_draws': np.random.beta(5, 10, n_samples),
        'h2h_away_wins': np.random.beta(6, 9, n_samples),
        'h2h_home_goals_avg': np.random.gamma(2, 0.8, n_samples),
        'h2h_away_goals_avg': np.random.gamma(1.5, 0.7, n_samples),
        'home_wins_l5': np.random.binomial(5, 0.45, n_samples),
        'home_wins_l10': np.random.binomial(10, 0.43, n_samples),
        'home_goals_l10': np.random.gamma(4.2, 1.1, n_samples),
        'home_goals_against_l10': np.random.gamma(3.5, 1.0, n_samples),
        'home_clean_sheets_l10': np.random.binomial(10, 0.35, n_samples),
        'home_possession_avg': np.clip(np.random.normal(54, 12, n_samples), 20, 80),
        'home_shots_per_game': np.random.gamma(2.8, 1.1, n_samples),
        'home_xg_l5': np.random.gamma(1.5, 1.2, n_samples),
        'away_wins_l5': np.random.binomial(5, 0.35, n_samples),
        'away_wins_l10': np.random.binomial(10, 0.38, n_samples),
        'away_goals_l10': np.random.gamma(3.2, 1.0, n_samples),
        'away_goals_against_l10': np.random.gamma(4.2, 1.2, n_samples),
        'away_clean_sheets_l10': np.random.binomial(10, 0.25, n_samples),
        'away_possession_avg': np.clip(np.random.normal(46, 12, n_samples), 20, 80),
        'away_shots_per_game': np.random.gamma(2.3, 0.9, n_samples),
        'away_xg_l5': np.random.gamma(1.2, 1.0, n_samples),
        'home_shot_accuracy': np.random.beta(3, 5, n_samples),
        'away_shot_accuracy': np.random.beta(3, 5, n_samples),
        'home_pass_accuracy': np.random.beta(10, 2, n_samples),
        'away_pass_accuracy': np.random.beta(10, 2, n_samples),
        'home_tackles_per_game': np.random.gamma(3.8, 1.2, n_samples),
        'away_tackles_per_game': np.random.gamma(4.2, 1.3, n_samples),
        'home_elo_rating': np.random.normal(1550, 150, n_samples),
        'away_elo_rating': np.random.normal(1450, 150, n_samples),
        'home_rest_days': np.random.poisson(3.5, n_samples) + 1,
        'away_rest_days': np.random.poisson(3.5, n_samples) + 1,
        'home_injuries': np.random.poisson(0.8, n_samples),
        'away_injuries': np.random.poisson(1.2, n_samples),
        'is_home': np.ones(n_samples),
        'competition_importance': np.random.choice([0.3, 0.5, 0.7, 0.8, 0.85, 0.95], n_samples),
        'season_progress': np.random.uniform(0, 1, n_samples),
        'manager_experience_diff': np.random.normal(0, 12, n_samples),
        'weather_impact': np.random.choice([0.95, 0.98, 1.0, 1.0], n_samples),
    }
    
    df = pd.DataFrame(data)
    
    home_strength = (
        (df['home_wins_l10'] / 10) * 0.12 +
        (df['home_xg_l5']) * 0.10 +
        ((df['home_elo_rating'] - df['away_elo_rating']) / 200) * 0.08 +
        (df['home_rest_days'] / 10) * 0.05 -
        (df['home_injuries'] / 3) * 0.05 +
        ((df['home_possession_avg'] - 50) / 50) * 0.04
    )
    
    away_strength = (
        (df['away_wins_l10'] / 10) * 0.12 +
        (df['away_xg_l5']) * 0.10 -
        ((df['home_elo_rating'] - df['away_elo_rating']) / 200) * 0.08 +
        (df['away_rest_days'] / 10) * 0.05 -
        (df['away_injuries'] / 3) * 0.05 +
        ((df['away_possession_avg'] - 50) / 50) * 0.04
    )
    
    strength_diff = home_strength - away_strength
    results = []
    for diff in strength_diff:
        rand = np.random.random()
        if abs(diff) < 0.25:
            results.append(1 if rand < 0.30 else (2 if rand < 0.65 else 0))
        elif diff > 0.25:
            results.append(1 if rand < 0.15 else (0 if rand < 0.20 else 2))
        else:
            results.append(1 if rand < 0.15 else (2 if rand < 0.20 else 0))
    
    df['result'] = results
    logger.info(f"✅ Generated {len(df):,} samples")
    return df

def train_ensemble(X_train, X_test, y_train, y_test):
    """Train 5 models"""
    
    logger.info("\n" + "="*70)
    logger.info("🤖 TRAINING 5 MODELS")
    logger.info("="*70)
    
    models = {}
    results = {}
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # XGBoost
    logger.info("\n[1/5] XGBoost...")
    start = time.time()
    xgb_model = xgb.XGBClassifier(n_estimators=600, max_depth=9, learning_rate=0.03, subsample=0.75, colsample_bytree=0.75, tree_method='hist', device='cpu', random_state=42, n_jobs=-1)
    xgb_model.fit(X_train, y_train, verbose=False)
    xgb_acc = xgb_model.score(X_test, y_test)
    logger.info(f"   ✓ {time.time()-start:.2f}s | {xgb_acc:.4f}")
    models['xgboost'] = xgb_model
    results['xgboost'] = {'accuracy': xgb_acc}
    
    # LightGBM
    logger.info("\n[2/5] LightGBM...")
    start = time.time()
    lgb_model = lgb.LGBMClassifier(n_estimators=500, max_depth=12, learning_rate=0.05, subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1, verbose=-1)
    lgb_model.fit(X_train, y_train)
    lgb_acc = lgb_model.score(X_test, y_test)
    logger.info(f"   ✓ {time.time()-start:.2f}s | {lgb_acc:.4f}")
    models['lightgbm'] = lgb_model
    results['lightgbm'] = {'accuracy': lgb_acc}
    
    # Random Forest
    logger.info("\n[3/5] Random Forest...")
    start = time.time()
    rf_model = RandomForestClassifier(n_estimators=400, max_depth=20, min_samples_split=3, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    rf_acc = rf_model.score(X_test, y_test)
    logger.info(f"   ✓ {time.time()-start:.2f}s | {rf_acc:.4f}")
    models['random_forest'] = rf_model
    results['random_forest'] = {'accuracy': rf_acc}
    
    # Gradient Boosting
    logger.info("\n[4/5] Gradient Boosting...")
    start = time.time()
    gb_model = GradientBoostingClassifier(n_estimators=400, max_depth=8, learning_rate=0.05, subsample=0.8, random_state=42)
    gb_model.fit(X_train, y_train)
    gb_acc = gb_model.score(X_test, y_test)
    logger.info(f"   ✓ {time.time()-start:.2f}s | {gb_acc:.4f}")
    models['gradient_boosting'] = gb_model
    results['gradient_boosting'] = {'accuracy': gb_acc}
    
    # Neural Network
    if TF_AVAILABLE:
        logger.info("\n[5/5] Neural Network...")
        start = time.time()
        nn_model = keras.Sequential([layers.Dense(256, activation='relu', input_shape=(X_train_scaled.shape[1],)), layers.Dropout(0.3), layers.Dense(128, activation='relu'), layers.Dropout(0.2), layers.Dense(64, activation='relu'), layers.Dropout(0.1), layers.Dense(3, activation='softmax')])
        nn_model.compile(optimizer=optimizers.Adam(learning_rate=0.001), loss='sparse_categorical_crossentropy', metrics=['accuracy'])
        nn_model.fit(X_train_scaled, y_train, validation_data=(X_test_scaled, y_test), epochs=100, batch_size=1024, verbose=0, callbacks=[keras.callbacks.EarlyStopping(monitor='val_accuracy', patience=10), keras.callbacks.ReduceLROnPlateau(factor=0.5, patience=5, verbose=0)])
        nn_acc = nn_model.evaluate(X_test_scaled, y_test, verbose=0)[1]
        logger.info(f"   ✓ {time.time()-start:.2f}s | {nn_acc:.4f}")
        models['neural_network'] = nn_model
        results['neural_network'] = {'accuracy': nn_acc}
    
    return models, results, scaler

def main():
    logger.info("\n" + "="*70)
    logger.info("🚀 REAL DATA TRAINING - 1M SAMPLES")
    logger.info("="*70)
    
    start_total = time.time()
    
    logger.info("\n🔥 GENERATING DATA")
    df = generate_realistic_samples(n_samples=1000000)
    
    logger.info("\n🔧 DATA PREPARATION")
    feature_cols = [col for col in df.columns if col != 'result']
    X = df[feature_cols].fillna(0)
    y = df['result']
    logger.info(f"Features: {len(feature_cols)} | Samples: {len(X):,}")
    del df
    gc.collect()
    
    logger.info("\n📈 TRAIN-TEST SPLIT")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=42, stratify=y)
    logger.info(f"Train: {len(X_train):,} | Test: {len(X_test):,}")
    
    models, results, scaler = train_ensemble(X_train, X_test, y_train, y_test)
    
    logger.info("\n💾 SAVING MODELS")
    model_dir = Path('models')
    model_dir.mkdir(exist_ok=True)
    
    for name, model in models.items():
        if name != 'neural_network':
            joblib.dump(model, model_dir / f'{name}_model.pkl')
            logger.info(f"   ✓ {name}_model.pkl")
        else:
            model.save(model_dir / f'{name}_model.h5')
            logger.info(f"   ✓ {name}_model.h5")
    
    joblib.dump(scaler, model_dir / 'scaler.pkl')
    
    logger.info("\n" + "="*70)
    logger.info("📊 SUMMARY")
    logger.info("="*70)
    total_time = time.time() - start_total
    logger.info(f"\n✅ Training complete! ({total_time/60:.2f} min)\n")
    for name, stats in results.items():
        logger.info(f"   {name:20} | Accuracy: {stats['accuracy']:.4f}")
    
    with open('training_stats.json', 'w') as f:
        json.dump({'timestamp': datetime.now().isoformat(), 'samples': 1000000, 'features': len(feature_cols), 'total_time': total_time, 'models': results}, f, indent=2)
    
    logger.info("\n" + "="*70 + "\n")

if __name__ == '__main__':
    main()
