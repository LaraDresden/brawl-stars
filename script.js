async function loadMeta() {
    try {
        // Alternative API versuchen oder Mock-Daten verwenden
        let metaData;
        
        try {
            const metaRes = await fetch('https://api.brawlify.com/v1/brawlers');
            metaData = await metaRes.json();
            
            if (metaData && metaData.list) {
                const topBrawlers = metaData.list.slice(0, 5).map((brawler, index) => ({
                    name: brawler.name,
                    winRate: Math.floor(Math.random() * 20) + 70, // Mock winRate
                    useRate: Math.floor(Math.random() * 30) + 20   // Mock useRate
                }));
                displayBrawlers(topBrawlers);
            } else {
                throw new Error('Unerwartete API-Antwort');
            }
        } catch (apiError) {
            console.warn('API nicht verfügbar, verwende Mock-Daten:', apiError);
            // Mock-Daten als Fallback
            const mockBrawlers = [
                { name: 'Shelly', winRate: 78, useRate: 45 },
                { name: 'Colt', winRate: 75, useRate: 38 },
                { name: 'Bull', winRate: 73, useRate: 42 },
                { name: 'Jessie', winRate: 71, useRate: 35 },
                { name: 'Brock', winRate: 69, useRate: 33 }
            ];
            displayBrawlers(mockBrawlers);
        }
        
        // Mock Teams
        const mockTeams = [
            { members: [{name: 'Shelly'}, {name: 'Colt'}], winRate: 82 },
            { members: [{name: 'Bull'}, {name: 'Jessie'}], winRate: 79 },
            { members: [{name: 'Shelly'}, {name: 'Bull'}, {name: 'Colt'}], winRate: 85 },
            { members: [{name: 'Jessie'}, {name: 'Brock'}, {name: 'Shelly'}], winRate: 83 },
            { members: [{name: 'Shelly'}, {name: 'Colt'}, {name: 'Bull'}, {name: 'Jessie'}], winRate: 88 }
        ];
        displayTeams(mockTeams);
        
        // Mock Spielmodi
        const mockModes = [
            { name: 'Gem Grab', topBrawlers: [{name: 'Shelly'}, {name: 'Colt'}, {name: 'Bull'}] },
            { name: 'Showdown', topBrawlers: [{name: 'Bull'}, {name: 'Shelly'}, {name: 'Jessie'}] },
            { name: 'Brawl Ball', topBrawlers: [{name: 'Colt'}, {name: 'Brock'}, {name: 'Shelly'}] },
            { name: 'Bounty', topBrawlers: [{name: 'Brock'}, {name: 'Colt'}, {name: 'Jessie'}] },
            { name: 'Heist', topBrawlers: [{name: 'Bull'}, {name: 'Shelly'}, {name: 'Colt'}] }
        ];
        displayModes(mockModes);
        
    } catch (error) {
        console.error('Fehler beim Laden der Meta-Daten:', error);
        document.getElementById('brawlers-list').innerHTML = '<li>❌ Daten konnten nicht geladen werden</li>';
    }
}

async function loadNews() {
    try {
        // Mock News als Fallback, da die API möglicherweise nicht verfügbar ist
        const mockNews = [
            {
                title: 'Neue Brawler verfügbar!',
                date: new Date().toISOString(),
                url: 'https://supercell.com/en/games/brawlstars/',
                image: 'https://via.placeholder.com/300x150/ffcc00/000000?text=Brawl+Stars+News'
            },
            {
                title: 'Season 25 ist gestartet',
                date: new Date(Date.now() - 86400000).toISOString(),
                url: 'https://supercell.com/en/games/brawlstars/',
                image: 'https://via.placeholder.com/300x150/ff9500/ffffff?text=Season+25'
            },
            {
                title: 'Balance-Änderungen',
                date: new Date(Date.now() - 172800000).toISOString(),
                url: 'https://supercell.com/en/games/brawlstars/',
                image: 'https://via.placeholder.com/300x150/1a1f2d/ffcc00?text=Balance+Update'
            }
        ];

        const container = document.getElementById('news-container');
        container.innerHTML = '';
        
        mockNews.forEach(news => {
            const div = document.createElement('div');
            div.className = 'news-item';
            div.innerHTML = `
                <img src="${news.image}" alt="${news.title}" onerror="this.style.display='none'">
                <h3>${news.title}</h3>
                <p>${new Date(news.date).toLocaleDateString('de-DE')}</p>
                <a href="${news.url}" target="_blank" class="news-link">Mehr erfahren</a>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Fehler beim Laden der News:', error);
        document.getElementById('news-container').innerHTML = '<p>❌ News konnten nicht geladen werden</p>';
    }
}

function displayBrawlers(brawlers) {
    const container = document.getElementById('brawlers-list');
    container.innerHTML = '';
    
    brawlers.forEach((brawler, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>#${index + 1}</strong> ${brawler.name} 
            <span class="stats">🏆 ${brawler.winRate}% | 🎯 ${brawler.useRate}%</span>
        `;
        container.appendChild(li);
    });
}

function displayTeams(teams) {
    ['2', '3', '4'].forEach(size => {
        const container = document.getElementById(`teams-${size}`);
        container.innerHTML = '';
        
        const filtered = teams.filter(t => t.members.length == size).slice(0, 3);
        filtered.forEach(team => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${team.members.map(m => m.name).join(' + ')} 
                <span class="stats">🏆 ${team.winRate}%</span>
            `;
            container.appendChild(li);
        });
    });
}

function displayModes(modes) {
    const container = document.getElementById('modes-list');
    container.innerHTML = '';
    
    modes.slice(0, 5).forEach(mode => {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${mode.name}</strong><br>
            Top Brawler: ${mode.topBrawlers.slice(0, 3).map(b => b.name).join(', ')}
        `;
        container.appendChild(li);
    });
}

// Seite laden
window.onload = function() {
    loadMeta();
    loadNews();
    
    // Alle 10 Minuten aktualisieren
    setInterval(() => {
        loadMeta();
        loadNews();
    }, 10 * 60 * 1000);
};