/**
 * 🌐 CONTENT SCRIPT - Désactivé (on utilise la popup API instead)
 * 
 * NOTE: Cet script a causé des crashes Chrome à cause d'une boucle MutationObserver infinie.
 * On utilise maintenant la popup avec ESPN API — pas besoin d'injecter des boutons!
 */

console.log('⚽ Content Script - Désactivé (utiliser la popup à la place)');

// Script désactivé intentionnellement pour éviter les crashes
// La popup récupère les matchs via l'API ESPN


/**
 * Injecte les boutons "⚽ ANALYSER" sous chaque match
 */
function injectAnalysisButtons() {
    const site = SiteDetector.detectCurrentSite();
    const matches = SiteDetector.extractMatches();
    
    console.log(`✅ ${matches.length} matchs trouvés sur ${site}`);
    
    // Ajouter du CSS pour les boutons
    if (!document.getElementById('football-predictor-styles')) {
        const style = document.createElement('style');
        style.id = 'football-predictor-styles';
        style.textContent = `
            .football-predictor-btn {
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
                color: white !important;
                border: none !important;
                border-radius: 6px !important;
                padding: 8px 14px !important;
                font-weight: 700 !important;
                font-size: 13px !important;
                cursor: pointer !important;
                margin: 8px 0 !important;
                transition: all 0.2s !important;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
                display: inline-block !important;
                z-index: 99999 !important;
                position: relative !important;
            }
            
            .football-predictor-btn:hover {
                background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%) !important;
                box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5) !important;
                transform: translateY(-2px) !important;
            }
            
            .football-predictor-btn:active {
                transform: translateY(0) !important;
            }
            
            .football-predictor-wrapper {
                margin-top: 8px !important;
                margin-bottom: 8px !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    matches.forEach((match, idx) => {
        // Vérifier que le bouton n'existe pas déjà
        if (match.element.querySelector('.football-predictor-btn')) {
            return;
        }
        
        // Créer un wrapper pour le bouton
        const wrapper = document.createElement('div');
        wrapper.className = 'football-predictor-wrapper';
        
        // Créer le bouton
        const button = document.createElement('button');
        button.className = 'football-predictor-btn';
        button.type = 'button';
        button.textContent = '⚽ ANALYSER';
        
        // Event listeners
        button.onmouseover = () => {
            button.style.transform = 'translateY(-2px)';
        };
        
        button.onmouseout = () => {
            button.style.transform = 'translateY(0)';
        };
        
        button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            analyzeMatch(match);
        };
        
        // Ajouter le bouton au wrapper
        wrapper.appendChild(button);
        
        // Injecter APRÈS l'élément du match
        try {
            if (match.element.parentElement) {
                match.element.parentElement.insertBefore(wrapper, match.element.nextSibling);
            } else {
                match.element.appendChild(wrapper);
            }
            console.log(`✅ Bouton injecté pour ${match.homeTeam} vs ${match.awayTeam}`);
        } catch (e) {
            console.error('❌ Erreur injection bouton:', e);
        }
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
            }, () => {
                // Callback vide - le popup s'ouvrira
            });
        } else {
            console.error('❌ Erreur:', response ? response.error : 'Unknown error');
        }
    });
}
