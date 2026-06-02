/**
 * 🎯 POPUP - Affiche les matchs et les prédictions
 */

let allMatches = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', initPopup);

async function initPopup() {
    console.log('🎯 Popup chargée');
    
    // Afficher le site courant
    displayCurrentSite();
    
    // Charger les matchs
    await loadMatches();
    
    // Setup des filtres
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            displayMatches();
        });
    });
    
    // Bouton refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadMatches();
    });
}

/**
 * Affiche le site courant dans la popup
 */
async function displayCurrentSite() {
    const tabs = await chrome.tabs.query({active: true, currentWindow: true});
    const currentTab = tabs[0];
    const hostname = new URL(currentTab.url).hostname;
    
    let siteName = 'Site inconnu';
    if (hostname.includes('bet365')) siteName = '🏠 Bet365';
    else if (hostname.includes('unibet')) siteName = '🏠 Unibet';
    else if (hostname.includes('bwin')) siteName = '🏠 Bwin';
    else if (hostname.includes('betfair')) siteName = '🏠 Betfair';
    else if (hostname.includes('draftkings')) siteName = '🏠 DraftKings';
    else if (hostname.includes('fanduel')) siteName = '🏠 FanDuel';
    
    console.log('📍 Site actuel:', siteName);
}

/**
 * Charge les matchs de l'API ou affiche formulaire manuel
 */
async function loadMatches() {
    const container = document.getElementById('matchesContainer');
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des matchs...</p>
            <small>Récupération depuis ESPN...</small>
        </div>
    `;
    
    try {
        // Essayer ESPN API (gratuit, pas de clé)
        const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/events`, {
            timeout: 5000
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extraire les matchs
        allMatches = (data.events || []).map((event, idx) => ({
            id: `match_${idx}`,
            homeTeam: event.competitions?.[0]?.competitors?.[0]?.team?.displayName || 'Team 1',
            awayTeam: event.competitions?.[0]?.competitors?.[1]?.team?.displayName || 'Team 2',
            utcDate: event.date,
            competition: {
                name: event.competitions?.[0]?.league?.name || 'Ligue'
            }
        }));
        
        console.log(`✅ ${allMatches.length} matchs chargés depuis ESPN`);
        
        // Filtrer pour les 24 prochaines heures
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        allMatches = allMatches.filter(m => {
            const matchTime = new Date(m.utcDate);
            return matchTime >= now && matchTime <= tomorrow;
        });
        
        console.log(`📊 ${allMatches.length} matchs dans les 24h`);
        
        if (allMatches.length === 0) {
            showManualInputForm();
            return;
        }
        
        displayMatches();
        
    } catch (error) {
        console.error('❌ Erreur API:', error);
        showManualInputForm();
    }
}

/**
 * Affiche un formulaire pour entrer manuellement les équipes
 */
function showManualInputForm() {
    const container = document.getElementById('matchesContainer');
    
    container.innerHTML = `
        <div style="padding: 16px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px;">Analyser un match</h3>
            <p style="margin: 0 0 12px 0; font-size: 12px; color: var(--text-dim);">Pas de matchs trouvés via l'API. Tapez le nom des équipes:</p>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <input 
                    type="text" 
                    id="homeTeamInput" 
                    placeholder="Équipe à domicile" 
                    style="
                        background: rgba(31, 41, 55, 0.8);
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        color: var(--text);
                        padding: 8px 10px;
                        border-radius: 4px;
                        font-size: 12px;
                    "
                />
                
                <input 
                    type="text" 
                    id="awayTeamInput" 
                    placeholder="Équipe en déplacement" 
                    style="
                        background: rgba(31, 41, 55, 0.8);
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        color: var(--text);
                        padding: 8px 10px;
                        border-radius: 4px;
                        font-size: 12px;
                    "
                />
                
                <button 
                    onclick="analyzeManualMatch()" 
                    style="
                        background: var(--accent);
                        border: none;
                        color: white;
                        padding: 10px;
                        border-radius: 4px;
                        font-weight: 700;
                        cursor: pointer;
                        font-size: 12px;
                        transition: all 0.2s;
                    "
                >
                    Analyser
                </button>
            </div>
        </div>
    `;
}

/**
 * Analyse un match entré manuellement
 */
async function analyzeManualMatch() {
    const homeTeam = document.getElementById('homeTeamInput').value.trim();
    const awayTeam = document.getElementById('awayTeamInput').value.trim();
    
    if (!homeTeam || !awayTeam) {
        alert('Veuillez entrer les deux équipes!');
        return;
    }
    
    analyzeMatch(homeTeam, awayTeam);
}

/**
 * Affiche les matchs avec filtre
 */
function displayMatches() {
    const container = document.getElementById('matchesContainer');
    
    if (allMatches.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 20px;">Aucun match</p>';
        return;
    }
    
    // Grouper par ligue
    const byLeague = {};
    allMatches.forEach(match => {
        const league = match.competition?.name || 'Autre';
        if (!byLeague[league]) byLeague[league] = [];
        byLeague[league].push(match);
    });
    
    let html = '';
    
    Object.entries(byLeague).forEach(([league, matches]) => {
        html += `<div class="league-group">
            <h3 class="league-name">${league}</h3>`;
        
        matches.forEach(match => {
            const homeTeam = match.homeTeam?.name || 'Équipe 1';
            const awayTeam = match.awayTeam?.name || 'Équipe 2';
            const matchTime = new Date(match.utcDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            
            html += `
                <div class="match-card" onclick="analyzeMatch('${homeTeam}', '${awayTeam}')">
                    <div class="match-time">${matchTime}</div>
                    <div class="match-content">
                        <div class="team home-team">${homeTeam}</div>
                        <div class="vs">vs</div>
                        <div class="team away-team">${awayTeam}</div>
                    </div>
                    <div class="match-arrow">➜</div>
                </div>
            `;
        });
        
        html += '</div>';
    });
    
    container.innerHTML = html;
}

/**
 * Analyse un match quand on clique
 */
async function analyzeMatch(homeTeam, awayTeam) {
    console.log('🔍 Analyse:', homeTeam, 'vs', awayTeam);
    
    // Afficher état "chargement"
    const container = document.getElementById('matchesContainer');
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Analyse en cours...</p>
            <small>${homeTeam} vs ${awayTeam}</small>
        </div>
    `;
    
    try {
        // Envoyer au service worker pour l'analyse
        const response = await chrome.runtime.sendMessage({
            action: 'analyzeMatch',
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            site: 'api'
        });
        
        if (response && response.success) {
            displayAnalysisResult(homeTeam, awayTeam, response);
        } else {
            container.innerHTML = `
                <div class="loading-state">
                    <p>❌ Erreur lors de l'analyse</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        container.innerHTML = `
            <div class="loading-state">
                <p>❌ Erreur: ${error.message}</p>
            </div>
        `;
    }
}

/**
 * Affiche le résultat de l'analyse
 */
function displayAnalysisResult(homeTeam, awayTeam, result) {
    const container = document.getElementById('matchesContainer');
    
    const prediction = result.prediction || 'unknown';
    const confidence = result.confidence || 0;
    
    let predictionText = '';
    let predictionColor = '';
    
    if (prediction === 'home') {
        predictionText = `✅ ${homeTeam} GAGNE`;
        predictionColor = '#10b981';
    } else if (prediction === 'away') {
        predictionText = `✅ ${awayTeam} GAGNE`;
        predictionColor = '#f59e0b';
    } else {
        predictionText = '🟰 MATCH NUL';
        predictionColor = '#8b5cf6';
    }
    
    html = `
        <div class="result-container">
            <div class="result-header">
                <button onclick="loadMatches()" class="back-btn">← Retour</button>
                <h2>${homeTeam} vs ${awayTeam}</h2>
            </div>
            
            <div class="result-prediction" style="border-left: 4px solid ${predictionColor}">
                <div class="pred-text">${predictionText}</div>
                <div class="pred-confidence">
                    Confiance: ${(confidence * 100).toFixed(0)}%
                </div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidence * 100}%; background: ${predictionColor};"></div>
                </div>
            </div>
            
            <div class="result-details">
                <div class="detail-item">
                    <span class="detail-label">Prédiction:</span>
                    <span class="detail-value">${predictionText}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Confiance:</span>
                    <span class="detail-value">${(confidence * 100).toFixed(1)}%</span>
                </div>
            </div>
            
            <button onclick="loadMatches()" class="btn-back">Voir d'autres matchs</button>
        </div>
    `;
    
    container.innerHTML = html;
}
