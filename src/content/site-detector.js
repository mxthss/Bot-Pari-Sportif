/**
 * 🌐 SITE DETECTOR - Détecte quel site de pari et extrait les matchs
 */

class SiteDetector {
    static detectCurrentSite() {
        const hostname = window.location.hostname;
        
        if (hostname.includes('bet365')) return 'bet365';
        if (hostname.includes('unibet')) return 'unibet';
        if (hostname.includes('bwin')) return 'bwin';
        if (hostname.includes('betfair')) return 'betfair';
        if (hostname.includes('draftkings')) return 'draftkings';
        if (hostname.includes('fanduel')) return 'fanduel';
        if (hostname.includes('flashscore')) return 'flashscore';
        if (hostname.includes('transfermarkt')) return 'transfermarkt';
        
        return 'unknown';
    }

    /**
     * Extrait tous les matchs visibles sur la page
     */
    static extractMatches() {
        const site = this.detectCurrentSite();
        console.log(`🌐 Détecté: ${site}`);
        
        let matches = [];
        
        // BET365
        if (site === 'bet365') {
            matches = this.parseBet365();
            if (matches.length === 0) matches = this.parseGeneric();
        }
        // UNIBET
        else if (site === 'unibet') {
            matches = this.parseUnibet();
            if (matches.length === 0) matches = this.parseGeneric();
        }
        // BWIN
        else if (site === 'bwin') {
            matches = this.parseBwin();
            if (matches.length === 0) matches = this.parseGeneric();
        }
        // BETFAIR
        else if (site === 'betfair') {
            matches = this.parseBetfair();
            if (matches.length === 0) matches = this.parseGeneric();
        }
        // FALLBACK: universel pour tous les autres
        else {
            matches = this.parseGeneric();
        }
        
        console.log(`📊 Matchs trouvés après parsing: ${matches.length}`);
        return matches;
    }

    /**
     * Parser universel AMÉLIORÉ - cherche TOUS les patterns possibles
     */
    static parseGeneric() {
        const matches = [];
        const processedTexts = new Set();
        
        // Chercher les éléments avec texte visibilité normal
        const allElements = document.querySelectorAll('body *');
        
        allElements.forEach((element) => {
            // Skip invisibles
            if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK'].includes(element.tagName)) {
                return;
            }
            
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return;
            }
            
            // Chercher SEULEMENT le texte direct de cet élément
            let text = '';
            for (let node of element.childNodes) {
                if (node.nodeType === Node.TEXT_NODE) {
                    text += node.textContent + ' ';
                }
            }
            
            text = text.trim();
            if (!text || text.length < 5 || text.length > 500) return;
            
            // Patterns pour trouver les matchs
            const patterns = [
                /(.+?)\s+-\s+(.+?)(?:\s|$)/,  // "Team1 - Team2"
                /(.+?)\s+(?:vs|v\.s\.)\s+(.+?)(?:\s|$)/i  // "Team1 vs Team2"
            ];
            
            patterns.forEach(pattern => {
                const match = text.match(pattern);
                if (!match) return;
                
                let homeTeam = match[1].trim();
                let awayTeam = match[2].trim();
                
                // Nettoyer les noms
                homeTeam = homeTeam.replace(/\d+$/g, '').trim();
                awayTeam = awayTeam.replace(/^\d+/g, '').trim();
                
                const combined = `${homeTeam}|${awayTeam}`;
                
                // Validation stricte
                if (
                    homeTeam.length > 2 && homeTeam.length < 50 &&
                    awayTeam.length > 2 && awayTeam.length < 50 &&
                    !processedTexts.has(combined) &&
                    homeTeam !== awayTeam &&
                    !/^\d+$/.test(homeTeam) &&
                    !/^\d+$/.test(awayTeam)
                ) {
                    processedTexts.add(combined);
                    console.log(`✅ Match trouvé: "${homeTeam}" vs "${awayTeam}"`);
                    matches.push({
                        id: `generic_${matches.length}`,
                        homeTeam: homeTeam,
                        awayTeam: awayTeam,
                        site: 'generic',
                        element: element,
                        parentElement: element.parentElement
                    });
                }
            });
        });
        
        console.log(`🔍 Parser générique trouvé: ${matches.length} matchs`);
        return matches.slice(0, 50);
    }

    /**
     * Parser BET365
     */
    static parseBet365() {
        const matches = [];
        
        // bet365 structure: matches dans des divs spécifiques
        document.querySelectorAll('.sl-CouponCollapseButton').forEach((el, idx) => {
            const text = el.innerText;
            const parts = text.split('\n');
            
            if (parts.length >= 2) {
                matches.push({
                    id: `bet365_${idx}`,
                    homeTeam: parts[0].trim(),
                    awayTeam: parts[1].trim(),
                    site: 'bet365',
                    element: el
                });
            }
        });

        return matches.slice(0, 50); // Max 50 matchs
    }

    /**
     * Parser UNIBET - amélioré avec plusieurs stratégies
     */
    static parseUnibet() {
        const matches = [];
        
        // Stratégie 1: Chercher par classe contenant "event" ou "match"
        document.querySelectorAll('[class*="event"], [class*="match"], [class*="row"]').forEach((el, idx) => {
            const text = el.innerText || '';
            
            // Pattern: "Team1 vs Team2"
            const vsMatch = text.match(/(.+?)\s+(?:vs|v\.s\.|versus)\s+(.+?)(?:\n|$)/i);
            if (vsMatch && vsMatch[1] && vsMatch[2]) {
                const homeTeam = vsMatch[1].trim().split('\n')[0];
                const awayTeam = vsMatch[2].trim().split('\n')[0];
                
                if (homeTeam.length > 2 && awayTeam.length < 50 && awayTeam.length > 2) {
                    matches.push({
                        id: `unibet_${idx}`,
                        homeTeam: homeTeam,
                        awayTeam: awayTeam,
                        site: 'unibet',
                        element: el
                    });
                }
            }
        });

        return matches.slice(0, 50);
    }

    /**
     * Parser BWIN
     */
    static parseBwin() {
        const matches = [];
        
        document.querySelectorAll('[class*="match-row"]').forEach((el, idx) => {
            const text = el.innerText;
            const vsMatch = text.match(/(.+?)\s+-\s+(.+?)(?:\n|$)/);
            
            if (vsMatch) {
                matches.push({
                    id: `bwin_${idx}`,
                    homeTeam: vsMatch[1].trim(),
                    awayTeam: vsMatch[2].trim(),
                    site: 'bwin',
                    element: el
                });
            }
        });

        return matches.slice(0, 50);
    }

    /**
     * Parser BETFAIR
     */
    static parseBetfair() {
        const matches = [];
        
        document.querySelectorAll('[data-eventid]').forEach((el, idx) => {
            const text = el.innerText;
            const vsMatch = text.match(/(.+?)\s+v\s+(.+?)(?:\n|$)/);
            
            if (vsMatch) {
                matches.push({
                    id: `betfair_${idx}`,
                    homeTeam: vsMatch[1].trim(),
                    awayTeam: vsMatch[2].trim(),
                    site: 'betfair',
                    element: el
                });
            }
        });

        return matches.slice(0, 50);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SiteDetector;
}
