/**
 * 🌐 CONTENT SCRIPT - Injecte les boutons "Analyser" sur les matchs
 */

console.log('⚽ Football Predictor Content Script - Chargé');

// Attendre que le DOM soit prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContentScript);
} else {
    initContentScript();
}

/**
 * Initialise le content script
 */
async function initContentScript() {
    console.log('🚀 Initialisation...');
    
    // Petit délai pour que les matchs se chargent
    setTimeout(() => {
        injectAnalysisButtons();
    }, 1000);
    
    // Ré-injecter si le DOM change (matchs chargés dynamiquement)
    const observer = new MutationObserver(() => {
        injectAnalysisButtons();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false
    });
}

/**
 * Injecte les boutons "⚽ ANALYSER" sous chaque match
 */
function injectAnalysisButtons() {
    const site = SiteDetector.detectCurrentSite();
    const matches = SiteDetector.extractMatches();
    
    console.log(`✅ ${matches.length} matchs trouvés sur ${site}`);
    
    matches.forEach((match) => {
        // Vérifier que le bouton n'existe pas déjà
        if (match.element.querySelector('.football-predictor-btn')) {
            return;
        }
        
        // Créer le bouton
        const button = document.createElement('button');
        button.className = 'football-predictor-btn';
        button.innerHTML = '⚽ ANALYSER';
        button.style.cssText = `
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            border: none;
            border-radius: 6px;
            padding: 10px 16px;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            margin-top: 8px;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        `;
        
        button.onmouseover = () => {
            button.style.background = 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)';
            button.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.5)';
        };
        
        button.onmouseout = () => {
            button.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)';
            button.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
        };
        
        // Quand on clique
        button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            analyzeMatch(match);
        };
        
        // Injecter après l'élément du match
        match.element.appendChild(button);
    });
}

/**
 * Quand user clique sur "Analyser"
 */
async function analyzeMatch(match) {
    console.log('📊 Analyse en cours:', match.homeTeam, 'vs', match.awayTeam);
    
    // Envoyer un message au background script
    chrome.runtime.sendMessage({
        action: 'analyzeMatch',
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        site: match.site
    }, (response) => {
        if (response && response.success) {
            console.log('✅ Analyse reçue:', response.prediction);
            
            // Montrer la popup
            chrome.runtime.sendMessage({
                action: 'openPopup',
                analysisResult: response
            });
        } else {
            console.error('❌ Erreur:', response?.error);
        }
    });
}
