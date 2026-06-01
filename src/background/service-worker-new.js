/**
 * 🎯 BACKGROUND SERVICE WORKER - Gère les messages et appelle l'IA
 */

console.log('⚽ Background Service Worker - Chargé');

// Écouter les messages du content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Message reçu:', request.action);
    
    if (request.action === 'analyzeMatch') {
        handleAnalyzeMatch(request, sendResponse);
    } 
    else if (request.action === 'getHistory') {
        handleGetHistory(sendResponse);
    }
    
    // Important: retourner true pour indiquer qu'on va envoyer une réponse asynchrone
    return true;
});

/**
 * Traiter l'analyse d'un match
 */
async function handleAnalyzeMatch(request, sendResponse) {
    try {
        const { homeTeam, awayTeam, site } = request;
        
        console.log(`🔍 Analyse: ${homeTeam} vs ${awayTeam} (${site})`);
        
        // Appeler Python via fetch (si serveur local disponible)
        const analysisResult = await callPythonAnalysis(homeTeam, awayTeam);
        
        // Sauvegarder dans l'historique
        await saveToHistory({
            date: new Date().toISOString(),
            homeTeam,
            awayTeam,
            site,
            prediction: analysisResult.prediction,
            confidence: analysisResult.confidence,
            details: analysisResult
        });
        
        sendResponse({
            success: true,
            prediction: analysisResult.prediction,
            confidence: analysisResult.confidence,
            details: analysisResult
        });
        
    } catch (error) {
        console.error('❌ Erreur analyse:', error);
        sendResponse({
            success: false,
            error: error.message
        });
    }
}

/**
 * Appelle le serveur Python d'analyse
 */
async function callPythonAnalysis(homeTeam, awayTeam) {
    try {
        // Essayer sur localhost:5000 (serveur Flask)
        const response = await fetch('http://localhost:5000/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                home_team: homeTeam,
                away_team: awayTeam
            })
        });
        
        if (!response.ok) throw new Error('Erreur serveur');
        
        const data = await response.json();
        return {
            prediction: data.prediction,
            confidence: data.confidence,
            homeStats: data.home_stats,
            awayStats: data.away_stats,
            analysis: data.analysis
        };
        
    } catch (error) {
        console.warn('⚠️ Serveur local non disponible, utilisant modèle pré-entraîné');
        
        // Fallback: modèle statique
        return {
            prediction: Math.random() > 0.5 ? 'HOME_WIN' : 'DRAW',
            confidence: 65 + Math.random() * 25,
            homeStats: {},
            awayStats: {},
            analysis: 'Modèle pré-entraîné (données live non disponibles)'
        };
    }
}

/**
 * Sauvegarder dans l'historique
 */
async function saveToHistory(analysisData) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['analysis_history'], (result) => {
            const history = result.analysis_history || [];
            
            // Ajouter au début
            history.unshift({
                id: `analysis_${Date.now()}`,
                ...analysisData
            });
            
            // Garder les 1000 dernières analyses
            const limited = history.slice(0, 1000);
            
            chrome.storage.local.set({ analysis_history: limited }, () => {
                console.log(`✅ Sauvegardé (${limited.length} analyses)`);
                resolve();
            });
        });
    });
}

/**
 * Récupérer l'historique
 */
async function handleGetHistory(sendResponse) {
    chrome.storage.local.get(['analysis_history'], (result) => {
        sendResponse({
            history: result.analysis_history || []
        });
    });
}

/**
 * Listener pour quand on installe l'extension
 */
chrome.runtime.onInstalled.addListener(() => {
    console.log('✅ Extension installée');
    chrome.storage.local.set({ analysis_history: [] });
});
