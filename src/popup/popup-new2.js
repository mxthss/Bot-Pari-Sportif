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
 * Charge les matchs de l'API football-data.org
 */
async function loadMatches() {
    const container = document.getElementById('matchesContainer');
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Chargement des matchs...</p>
            <small>Récupération depuis l'API football...</small>
        </div>
    `;
    
    try {
        // Récupérer les matchs d'aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const apiKey = 'afc56201394e4b5fb06a97b5b97d4848'; // Free tier key
        
        const response = await fetch(`https://api.football-data.org/v4/matches?status=SCHEDULED`, {
            headers: { 'X-Auth-Token': apiKey }
        });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        allMatches = data.matches || [];
        
        console.log(`✅ ${allMatches.length} matchs chargés`);
        
        // Filtrer pour les 24 prochaines heures
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        allMatches = allMatches.filter(m => {
            const matchTime = new Date(m.utcDate);
            return matchTime >= now && matchTime <= tomorrow;
        });
        
        console.log(`📊 ${allMatches.length} matchs dans les 24h`);
        
        if (allMatches.length === 0) {
            container.innerHTML = `
                <div class="loading-state">
                    <p>❌ Aucun match trouvé</p>
                    <small>Pas de matchs programmés aujourd'hui</small>
                </div>
            `;
            return;
        }
        
        displayMatches();
        
    } catch (error) {
        console.error('❌ Erreur chargement API:', error);
        container.innerHTML = `
            <div class="loading-state">
                <p>❌ Erreur lors du chargement</p>
                <small>${error.message}</small>
            </div>
        `;
    }
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
