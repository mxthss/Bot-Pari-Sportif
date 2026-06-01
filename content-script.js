/**
 * Content Script - Injected into webpage
 * Detects football matches and extracts team information
 * Communicates with service worker for predictions
 */

console.log('[Content Script] Loaded');

// Cache to avoid duplicate processing
const processedMatches = new Set();
let predictionWidgets = new Map();

/**
 * Initialize content script
 */
function initialize() {
  console.log('[Content Script] Initializing match detection...');
  
  detectAndParseMatches();
  
  // Watch for dynamic content changes
  observeDOMChanges();
}

/**
 * Observer for dynamic DOM changes (SPA/AJAX loaded matches)
 */
function observeDOMChanges() {
  const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type === 'childList') {
        // Check for new match elements
        detectAndParseMatches();
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'data-match-id', 'id']
  });
}

/**
 * Detect and parse football matches on the page
 */
function detectAndParseMatches() {
  // Try common patterns
  const matches = document.querySelectorAll('[data-match-id], .match-row, .event-item, .fixture');
  
  matches.forEach(matchElement => {
    const matchId = matchElement.getAttribute('data-match-id') || matchElement.id;
    
    if (matchId && !processedMatches.has(matchId)) {
      processedMatches.add(matchId);
      
      const matchData = {
        id: matchId,
        homeTeam: extractTeamName(matchElement, 'home'),
        awayTeam: extractTeamName(matchElement, 'away'),
        timestamp: new Date().toISOString()
      };
      
      // Send to service worker
      chrome.runtime.sendMessage({
        type: 'MATCH_DETECTED',
        data: matchData
      }, (response) => {
        if (response?.success) {
          console.log('[Content Script] Match sent for prediction:', matchData);
        }
      });
    }
  });
}

/**
 * Extract team name from match element
 */
function extractTeamName(element, position) {
  const selectors = {
    home: ['.home-team', '.team-home', '[data-team="home"]', '.team:first-child'],
    away: ['.away-team', '.team-away', '[data-team="away"]', '.team:last-child']
  };
  
  for (let selector of selectors[position]) {
    const teamElement = element.querySelector(selector);
    if (teamElement) {
      return teamElement.textContent.trim();
    }
  }
  
  return 'Unknown';
}

// Start detection when page loads
window.addEventListener('load', initialize);
document.addEventListener('DOMContentLoaded', initialize);
