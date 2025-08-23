function displayBrawlers(brawlers) {
    console.log('Zeige Brawler:', brawlers);
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
    console.log('Zeige Teams:', teams);
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
    console.log('Zeige Modi:', modes);
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
    console.log('Seite wird geladen...');
    loadDataFromJson().catch(err => {
        console.warn('Falle auf Mock-Daten zurück:', err);
        loadMockData();
    });
    
    // Alle 10 Minuten aktualisieren
    setInterval(() => {
        loadDataFromJson().catch(() => loadMockData());
    }, 10 * 60 * 1000);
};

async function loadDataFromJson() {
    const url = `data.json?v=${Date.now()}`; // Cache-Busting
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    if (Array.isArray(data.topBrawlers)) displayBrawlers(data.topBrawlers);
    if (Array.isArray(data.teams)) displayTeams(data.teams);
    if (Array.isArray(data.modes)) displayModes(data.modes);
    if (Array.isArray(data.news)) renderNewsFromData(data.news);
    
    // Optional: Zeitstempel anzeigen
    const footer = document.querySelector('footer p');
    if (footer && data.lastUpdated) {
        footer.textContent = `🚀 Automatisch aktualisiert | Stand: ${new Date(data.lastUpdated).toLocaleDateString('de-DE')}`;
    }
}

function loadMockData() {
    console.log('Lade Mock-Daten...');
    
    // Mock-Brawler Daten
    const mockBrawlers = [
        { name: 'Shelly', winRate: 78, useRate: 45 },
        { name: 'Colt', winRate: 75, useRate: 38 },
        { name: 'Bull', winRate: 73, useRate: 42 },
        { name: 'Jessie', winRate: 71, useRate: 35 },
        { name: 'Brock', winRate: 69, useRate: 33 }
    ];
    displayBrawlers(mockBrawlers);
    
    // Mock Teams
    const mockTeams = [
        { members: [{name: 'Shelly'}, {name: 'Colt'}], winRate: 82 },
        { members: [{name: 'Bull'}, {name: 'Jessie'}], winRate: 79 },
        { members: [{name: 'Poco'}, {name: 'Frank'}], winRate: 76 },
        { members: [{name: 'Shelly'}, {name: 'Bull'}, {name: 'Colt'}], winRate: 85 },
        { members: [{name: 'Jessie'}, {name: 'Brock'}, {name: 'Shelly'}], winRate: 83 },
        { members: [{name: 'Poco'}, {name: 'Frank'}, {name: 'Bull'}], winRate: 81 },
        { members: [{name: 'Shelly'}, {name: 'Colt'}, {name: 'Bull'}, {name: 'Jessie'}], winRate: 88 },
        { members: [{name: 'Brock'}, {name: 'Poco'}, {name: 'Frank'}, {name: 'Shelly'}], winRate: 86 }
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
    
    // Mock News
    loadMockNews();
}

function loadMockNews() {
    console.log('Lade Mock-News...');
    const mockNews = [
        {
            title: '🎉 Neue Brawler verfügbar!',
            date: new Date().toISOString(),
            url: 'https://supercell.com/en/games/brawlstars/'
        },
        {
            title: '⚡ Season 25 ist gestartet',
            date: new Date(Date.now() - 86400000).toISOString(),
            url: 'https://supercell.com/en/games/brawlstars/'
        },
        {
            title: '⚖️ Balance-Änderungen',
            date: new Date(Date.now() - 172800000).toISOString(),
            url: 'https://supercell.com/en/games/brawlstars/'
        }
    ];

    const container = document.getElementById('news-container');
    container.innerHTML = '';
    
    mockNews.forEach(news => {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <h3>${news.title}</h3>
            <p>📅 ${new Date(news.date).toLocaleDateString('de-DE')}</p>
            <a href="${news.url}" target="_blank" class="news-link">Mehr erfahren</a>
        `;
        container.appendChild(div);
    });
}

function renderNewsFromData(newsItems) {
    const container = document.getElementById('news-container');
    container.innerHTML = '';
    newsItems.slice(0, 3).forEach(news => {
        const div = document.createElement('div');
        div.className = 'news-item';
        div.innerHTML = `
            <h3>${news.title}</h3>
            <p>📅 ${new Date(news.date).toLocaleDateString('de-DE')}</p>
            <a href="${news.url}" target="_blank" class="news-link">Mehr erfahren</a>
        `;
        container.appendChild(div);
    });
}