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
        }
        // UNIBET
        else if (site === 'unibet') {
            matches = this.parseUnibet();
        }
        // BWIN
        else if (site === 'bwin') {
            matches = this.parseBwin();
        }
        // BETFAIR
        else if (site === 'betfair') {
            matches = this.parseBetfair();
        }
        // FLASHSCORE (universel, fonctionne partout)
        else {
            matches = this.parseGeneric();
        }
        
        return matches;
    }

    /**
     * Parser universel - cherche patterns communs
     */
    static parseGeneric() {
        const matches = [];
        
        // Cherche les patterns de matchs
        const possibleMatches = document.querySelectorAll(
            '[class*="match"], [class*="event"], [class*="game"], ' +
            '[data-test*="match"], [data-test*="event"]'
        );

        possibleMatches.forEach((element, idx) => {
            const text = element.innerText || '';
            
            // Pattern: "Equipe1 vs Equipe2" ou "Equipe1 - Equipe2"
            const vsMatch = text.match(/(.+?)\s+(?:vs|vs\.|versus|vs\s|vs\n|-)\s+(.+?)(?:\n|$)/i);
            
            if (vsMatch && vsMatch[1] && vsMatch[2]) {
                const homeTeam = vsMatch[1].trim();
                const awayTeam = vsMatch[2].trim();
                
                // Validation basique
                if (homeTeam.length > 2 && awayTeam.length > 2 && 
                    homeTeam.length < 50 && awayTeam.length < 50) {
                    
                    matches.push({
                        id: `match_${idx}`,
                        homeTeam: homeTeam.replace(/[0-9:\n\t]/g, '').trim(),
                        awayTeam: awayTeam.replace(/[0-9:\n\t]/g, '').trim(),
                        site: 'generic',
                        element: element
                    });
                }
            }
        });

        return matches;
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
     * Parser UNIBET
     */
    static parseUnibet() {
        const matches = [];
        
        document.querySelectorAll('[class*="EventRow"]').forEach((el, idx) => {
            const teamElements = el.querySelectorAll('[class*="TeamName"]');
            
            if (teamElements.length >= 2) {
                matches.push({
                    id: `unibet_${idx}`,
                    homeTeam: teamElements[0].innerText.trim(),
                    awayTeam: teamElements[1].innerText.trim(),
                    site: 'unibet',
                    element: el
                });
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
