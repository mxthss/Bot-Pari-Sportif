
/**
 * ONNX Runtime Inference Engine
 * Lightweight model inference for browser
 */

class OnnxInferenceEngine {
  constructor() {
    this.session = null;
    this.scaler = null;
    this.metadata = null;
    this.inputName = null;
    this.outputName = null;
    this.loaded = false;
  }

  /**
   * Initialize with ONNX model
   */
  async initialize(modelPath) {
    try {
      // Ensure ONNX Runtime is available
      if (typeof ort === 'undefined') {
        console.error('ONNX Runtime not loaded');
        return false;
      }

      console.log('[ONNX] Loading model:', modelPath);
      
      // Load ONNX model
      this.session = await ort.InferenceSession.create(modelPath);
      
      // Get input/output names
      const inputNames = this.session.inputNames;
      const outputNames = this.session.outputNames;
      
      if (inputNames.length === 0 || outputNames.length === 0) {
        console.error('[ONNX] Invalid model structure');
        return false;
      }

      this.inputName = inputNames[0];
      this.outputName = outputNames[0];
      
      console.log('[ONNX] Model loaded successfully');
      console.log('[ONNX] Input:', this.inputName);
      console.log('[ONNX] Output:', this.outputName);
      
      this.loaded = true;
      return true;

    } catch (error) {
      console.error('[ONNX] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Predict with feature array
   */
  async predict(features) {
    if (!this.loaded) {
      return {
        success: false,
        error: 'Model not loaded'
      };
    }

    try {
      // Create input tensor
      const inputArray = new Float32Array(features);
      const inputTensor = new ort.Tensor('float32', inputArray, [1, features.length]);

      // Run inference
      const results = await this.session.run({
        [this.inputName]: inputTensor
      });

      // Get predictions
      const outputTensor = results[this.outputName];
      const predictions = Array.from(outputTensor.data);

      // Get top class
      const classIdx = predictions.indexOf(Math.max(...predictions));
      const classes = ['Away Win', 'Draw', 'Home Win'];
      
      return {
        success: true,
        prediction: classes[classIdx],
        probabilities: {
          away_win: predictions[0],
          draw: predictions[1],
          home_win: predictions[2]
        },
        confidence: Math.max(...predictions),
        rawOutput: predictions
      };

    } catch (error) {
      console.error('[ONNX] Prediction error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get model info
   */
  getInfo() {
    return {
      loaded: this.loaded,
      inputName: this.inputName,
      outputName: this.outputName,
      sessionReady: this.session !== null
    };
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OnnxInferenceEngine;
}
