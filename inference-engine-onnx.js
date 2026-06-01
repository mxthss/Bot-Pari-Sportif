/**
 * Updated Inference Engine for Browser
 * Uses ONNX models for lightweight deployment
 * Replaces the previous inference-engine.js
 */

class OnnxInferenceEngine {
  constructor() {
    this.session = null;
    this.models = [];
    this.metadata = null;
    this.loaded = false;
  }

  /**
   * Initialize inference engine
   */
  async initialize() {
    try {
      console.log('[Inference] Initializing ONNX engine...');
      
      // Load metadata
      const metadataRes = await fetch('src/models/metadata.json');
      this.metadata = await metadataRes.json();
      console.log('[Inference] Metadata loaded:', this.metadata.n_features, 'features');
      
      // Load ONNX models
      const modelNames = [
        'random_forest',
        'xgboost',
        'lightgbm',
        'gradient_boosting'
      ];
      
      // Check if ONNX Runtime is available
      if (typeof ort === 'undefined') {
        console.warn('[Inference] ONNX Runtime not available, using fallback');
        this.loaded = false;
        return false;
      }

      for (const modelName of modelNames) {
        try {
          const modelPath = `src/models/${modelName}.onnx`;
          const session = await ort.InferenceSession.create(modelPath);
          this.models.push({
            name: modelName,
            session: session,
            inputName: session.inputNames[0],
            outputName: session.outputNames[0]
          });
          console.log(`[Inference] Loaded: ${modelName}`);
        } catch (error) {
          console.warn(`[Inference] Failed to load ${modelName}:`, error.message);
        }
      }

      if (this.models.length === 0) {
        console.warn('[Inference] No models loaded');
        this.loaded = false;
        return false;
      }

      this.loaded = true;
      console.log(`[Inference] ✅ Engine ready with ${this.models.length} models`);
      return true;

    } catch (error) {
      console.error('[Inference] Initialization failed:', error);
      this.loaded = false;
      return false;
    }
  }

  /**
   * Predict using ensemble of models
   */
  async predict(features) {
    if (!this.loaded || this.models.length === 0) {
      return {
        success: false,
        error: 'Models not loaded',
        fallback: this.getFallbackPrediction()
      };
    }

    try {
      const allPredictions = [];

      // Run all models
      for (const model of this.models) {
        try {
          // Create input tensor
          const inputArray = new Float32Array(features);
          const inputTensor = new ort.Tensor('float32', inputArray, [1, features.length]);

          // Inference
          const results = await model.session.run({
            [model.inputName]: inputTensor
          });

          const output = results[model.outputName];
          const predictions = Array.from(output.data);
          allPredictions.push(predictions);

        } catch (error) {
          console.warn(`[Inference] ${model.name} failed:`, error.message);
        }
      }

      if (allPredictions.length === 0) {
        return {
          success: false,
          error: 'All models failed',
          fallback: this.getFallbackPrediction()
        };
      }

      // Ensemble: average predictions
      const ensemblePred = this.averagePredictions(allPredictions);
      const predictedClass = ensemblePred.indexOf(Math.max(...ensemblePred));
      const classes = ['Away Win', 'Draw', 'Home Win'];

      return {
        success: true,
        prediction: classes[predictedClass],
        probabilities: {
          away_win: ensemblePred[0],
          draw: ensemblePred[1],
          home_win: ensemblePred[2]
        },
        confidence: Math.max(...ensemblePred),
        modelsUsed: allPredictions.length,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('[Inference] Prediction error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackPrediction()
      };
    }
  }

  /**
   * Average predictions from all models
   */
  averagePredictions(predictions) {
    const n = predictions[0].length;
    const result = new Array(n).fill(0);
    
    for (const pred of predictions) {
      for (let i = 0; i < n; i++) {
        result[i] += pred[i];
      }
    }
    
    for (let i = 0; i < n; i++) {
      result[i] /= predictions.length;
    }
    
    return result;
  }

  /**
   * Fallback prediction when models unavailable
   */
  getFallbackPrediction() {
    return {
      away_win: 0.33,
      draw: 0.34,
      home_win: 0.33,
      confidence: 0.33
    };
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      loaded: this.loaded,
      modelsCount: this.models.length,
      features: this.metadata?.n_features || 0,
      ready: this.loaded && this.models.length > 0
    };
  }
}

// Initialize globally
let inferenceEngine = new OnnxInferenceEngine();

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Inference] Auto-initializing...');
  await inferenceEngine.initialize();
});
