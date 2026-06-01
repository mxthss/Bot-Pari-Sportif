/**
 * Service Worker - Background Script
 * Handles message passing between content script and popup
 * Manages state and inference requests
 */

console.log('[Service Worker] Initialized');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Service Worker] Message received:', request.type, 'from', sender.url);

  switch (request.type) {
    case 'MATCH_DETECTED':
      // Match data detected on page
      handleMatchDetected(request.data, sender, sendResponse);
      return true; // Keep channel open for async response

    case 'PREDICT_MATCH':
      // Request for prediction
      handlePredictionRequest(request.data, sendResponse);
      return true;

    case 'GET_MODEL_STATUS':
      // Check if model is loaded
      sendResponse({ status: 'ready', version: '1.0.0' });
      return false;

    default:
      console.warn('[Service Worker] Unknown message type:', request.type);
      sendResponse({ error: 'Unknown request type' });
      return false;
  }
});

/**
 * Handle match detection from content script
 */
function handleMatchDetected(matchData, sender, sendResponse) {
  try {
    // Store match data temporarily
    chrome.storage.local.set({
      lastDetectedMatch: matchData,
      matchPageUrl: sender.url,
      timestamp: new Date().toISOString()
    });

    console.log('[Service Worker] Match detected and stored:', matchData);
    sendResponse({ success: true, message: 'Match data received' });
  } catch (error) {
    console.error('[Service Worker] Error handling match:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Handle prediction request
 */
function handlePredictionRequest(matchData, sendResponse) {
  try {
    // Placeholder for inference logic
    const prediction = {
      homeWin: 0.45,
      draw: 0.30,
      awayWin: 0.25,
      confidence: 0.78
    };

    sendResponse({ success: true, prediction });
  } catch (error) {
    console.error('[Service Worker] Error predicting:', error);
    sendResponse({ success: false, error: error.message });
  }
}
