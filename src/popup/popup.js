/**
 * ⚽ Football Predictor - Popup UI
 * Displays live predictions when extension icon is clicked
 */

// Load predictions when popup opens
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Popup initialized');
    
    // Setup filter buttons
    setupFilterButtons();
    
    // Load predictions
    await loadPredictions();
    
    // Setup refresh button
    document.getElementById('refreshBtn').addEventListener('click', async (e) => {
        e.target.style.animation = 'spin 0.6s ease-in-out';
        await loadPredictions();
        setTimeout(() => {
            e.target.style.animation = 'none';
        }, 600);
    });
});

/**
 * Load predictions from predictions.json or fetch from API
 */
async function loadPredictions() {
    try {
        const container = document.getElementById('matchesContainer');
        container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Chargement des prédictions...</p><small>Veuillez patienter...</small></div>';
        
        // Try to fetch predictions from storage or API
        let predictions = await getPredictionsData();
        
        if (!predictions || predictions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📊 Aucune prédiction disponible</p>
                    <small>Cliquez sur le bouton 🔄 pour charger les prédictions</small>
                </div>
            `;
            return;
        }
        
        // Render predictions
        renderMatches(predictions);
        
        // Update stats
        updateStats(predictions);
        
    } catch (error) {
        console.error('Error loading predictions:', error);
        document.getElementById('matchesContainer').innerHTML = `
            <div class="empty-state">
                <p>❌ Erreur de chargement</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

/**
 * Get predictions data from various sources
 */
async function getPredictionsData() {
    try {
        // Try to fetch from Chrome storage
        const stored = await new Promise(resolve => {
            chrome.storage.local.get(['predictions'], (result) => {
                resolve(result.predictions);
            });
        });
        
        if (stored && stored.length > 0) {
            return stored;
        }
        
        // Try to fetch from local file
        try {
            const response = await fetch('predictions.json');
            if (response.ok) {
                const data = await response.json();
                return data.predictions || [];
            }
        } catch (e) {
            console.log('predictions.json not found');
        }
        
        // Return demo data for testing
        return generateDemoData();
        
    } catch (error) {
        console.error('Error getting predictions:', error);
        return generateDemoData();
    }
}

/**
 * Generate demo predictions for testing
 */
function generateDemoData() {
    const demoMatches = [
        {
            home_team: 'Manchester City',
            away_team: 'Liverpool',
            league: 'Premier League',
            date: new Date(Date.now() + 24*60*60*1000).toISOString(),
            prediction: 'HOME_WIN',
            confidence: 84.2
        },
        {
            home_team: 'Barcelona',
            away_team: 'Real Madrid',
            league: 'La Liga',
            date: new Date(Date.now() + 48*60*60*1000).toISOString(),
            prediction: 'DRAW',
            confidence: 79.5
        },
        {
            home_team: 'Milan',
            away_team: 'Inter',
            league: 'Serie A',
            date: new Date(Date.now() + 72*60*60*1000).toISOString(),
            prediction: 'AWAY_WIN',
            confidence: 77.3
        },
        {
            home_team: 'PSG',
            away_team: 'Lyon',
            league: 'Ligue 1',
            date: new Date(Date.now() + 12*60*60*1000).toISOString(),
            prediction: 'HOME_WIN',
            confidence: 85.0
        },
    ];
    
    return demoMatches;
}

/**
 * Render matches to UI
 */
function renderMatches(predictions) {
    const container = document.getElementById('matchesContainer');
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    
    // Filter predictions
    let filtered = predictions;
    if (activeFilter === 'home') {
        filtered = predictions.filter(p => p.prediction === 'HOME_WIN');
    } else if (activeFilter === 'draw') {
        filtered = predictions.filter(p => p.prediction === 'DRAW');
    } else if (activeFilter === 'away') {
        filtered = predictions.filter(p => p.prediction === 'AWAY_WIN');
    }
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>🔍 Aucun match trouvé</p>
                <small>Essayez un autre filtre</small>
            </div>
        `;
        return;
    }
    
    // Render cards
    container.innerHTML = filtered.map((match, idx) => createMatchCard(match, idx)).join('');
    
    // Add click handlers
    document.querySelectorAll('.match-card').forEach(card => {
        card.addEventListener('click', () => showMatchDetails(card));
    });
}

/**
 * Create match card HTML
 */
function createMatchCard(match, idx) {
    const predictionBadge = getPredictionBadge(match.prediction);
    const timeStr = new Date(match.date).toLocaleString('fr-FR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const confidencePercent = match.confidence ? Math.round(match.confidence) : 75;
    
    return `
        <div class="match-card" data-index="${idx}">
            <div class="match-header">
                <span class="match-league">${match.league || 'Match'}</span>
                <span class="match-time">📅 ${timeStr}</span>
            </div>
            
            <div class="match-teams">
                <div class="team">
                    <div class="team-name">${match.home_team || 'Domicile'}</div>
                </div>
                <div class="vs-divider">vs</div>
                <div class="team">
                    <div class="team-name">${match.away_team || 'Extérieur'}</div>
                </div>
            </div>
            
            <div class="prediction-box">
                <div class="prediction-row">
                    <span class="prediction-label">Prédiction</span>
                    <span class="prediction-result">
                        ${predictionBadge}
                    </span>
                </div>
                <div class="prediction-row">
                    <span class="prediction-label">Confiance</span>
                    <span class="prediction-result">
                        <span class="prediction-value">${confidencePercent}%</span>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${confidencePercent}%"></div>
                        </div>
                    </span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get prediction badge HTML
 */
function getPredictionBadge(prediction) {
    const badges = {
        'HOME_WIN': '<span class="badge badge-home-win">🏠 Victoire Domicile</span>',
        'DRAW': '<span class="badge badge-draw">🤝 Match Nul</span>',
        'AWAY_WIN': '<span class="badge badge-away-win">✈️ Victoire Extérieur</span>'
    };
    
    return badges[prediction] || '<span class="badge">Inconnu</span>';
}

/**
 * Show match details
 */
function showMatchDetails(card) {
    // Could show expanded view or navigate to betting site
    const idx = card.dataset.index;
    console.log('Match clicked:', idx);
}

/**
 * Update statistics
 */
function updateStats(predictions) {
    document.getElementById('matchCount').textContent = predictions.length;
    
    const avgConfidence = predictions.reduce((sum, p) => sum + (p.confidence || 0), 0) / predictions.length;
    document.getElementById('avgConfidence').textContent = Math.round(avgConfidence) + '%';
    
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Setup filter buttons
 */
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked
            btn.classList.add('active');
            
            // Reload matches with new filter
            const predictions = await getPredictionsData();
            renderMatches(predictions);
        });
    });
}

/**
 * Auto-refresh every 10 minutes
 */
setInterval(() => {
    loadPredictions();
}, 10 * 60 * 1000);

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updatePredictions') {
        loadPredictions();
        sendResponse({ status: 'updated' });
    }
});
