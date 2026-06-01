/**
 * 🎯 POPUP JS - Affiche les analyses et l'historique
 */

// Charger quand la popup s'ouvre
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📱 Popup ouverte');
    
    // Vérifier s'il y a une analyse en cours
    const urlParams = new URLSearchParams(window.location.search);
    const analysisResult = sessionStorage.getItem('currentAnalysis');
    
    if (analysisResult) {
        showAnalysisResult(JSON.parse(analysisResult));
        sessionStorage.removeItem('currentAnalysis');
    } else {
        loadHistory();
    }
    
    // Bouton pour revenir à l'historique
    document.getElementById('backBtn')?.addEventListener('click', loadHistory);
});

/**
 * Afficher le résultat d'une analyse
 */
function showAnalysisResult(result) {
    const container = document.getElementById('matchesContainer');
    
    const html = `
        <div class="analysis-result">
            <div class="result-header">
                <h2>${result.details?.homeTeam || 'Équipe 1'} vs ${result.details?.awayTeam || 'Équipe 2'}</h2>
                <small>${new Date(result.details?.date).toLocaleString('fr-FR')}</small>
            </div>
            
            <div class="result-box">
                <div class="prediction-large">
                    <div class="pred-label">PRÉDICTION</div>
                    <div class="pred-badge ${result.prediction.toLowerCase()}">
                        ${getPredictionText(result.prediction)}
                    </div>
                </div>
                
                <div class="confidence-large">
                    <div class="conf-label">CONFIANCE</div>
                    <div class="conf-value">${Math.round(result.confidence)}%</div>
                    <div class="conf-bar">
                        <div class="conf-fill" style="width: ${result.confidence}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="result-details">
                <h3>📊 Détails</h3>
                <p>${result.details?.analysis || 'Analyse basée sur les données live'}</p>
            </div>
            
            <button class="btn-back" id="backBtn">← Retour à l'historique</button>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Charger et afficher l'historique
 */
async function loadHistory() {
    console.log('📜 Chargement historique...');
    
    const container = document.getElementById('matchesContainer');
    
    chrome.storage.local.get(['analysis_history'], (result) => {
        const history = result.analysis_history || [];
        
        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>📊 Aucune analyse encore</p>
                    <small>Clique sur "⚽ ANALYSER" sur un site de pari pour commencer!</small>
                </div>
            `;
            return;
        }
        
        // Afficher les analyses
        let html = '<div class="history-list">';
        
        history.forEach((analysis, idx) => {
            const date = new Date(analysis.date);
            const confidence = Math.round(analysis.confidence);
            
            html += `
                <div class="history-item" onclick="showHistoryDetail(${idx})">
                    <div class="item-header">
                        <strong>${analysis.homeTeam} vs ${analysis.awayTeam}</strong>
                        <small>${date.toLocaleDateString('fr-FR')} ${date.toLocaleTimeString('fr-FR')}</small>
                    </div>
                    
                    <div class="item-footer">
                        <span class="badge-${analysis.prediction.toLowerCase()}">
                            ${getPredictionText(analysis.prediction)}
                        </span>
                        <span class="confidence">${confidence}%</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Ajouter le compteur
        const statsHtml = `
            <div class="stats-header">
                📊 ${history.length} analyses
            </div>
        `;
        document.querySelector('.stats-panel').innerHTML = statsHtml;
    });
}

/**
 * Afficher un détail d'analyse
 */
function showHistoryDetail(index) {
    chrome.storage.local.get(['analysis_history'], (result) => {
        const history = result.analysis_history || [];
        if (history[index]) {
            showAnalysisResult({
                ...history[index],
                prediction: history[index].prediction
            });
        }
    });
}

/**
 * Convertir prédiction en texte
 */
function getPredictionText(pred) {
    const map = {
        'HOME_WIN': '🏠 Victoire Domicile',
        'DRAW': '🤝 Match Nul',
        'AWAY_WIN': '✈️ Victoire Extérieur'
    };
    return map[pred] || pred;
}

/**
 * Écouter les messages du background
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showAnalysis') {
        showAnalysisResult(request.data);
    }
});
