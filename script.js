async function loadMeta() {
    try {
        const metaRes = await fetch('https://api.brawlify.com/v1/meta');
        const metaData = await metaRes.json();
        
        // Top 5 Brawler
        const topBrawlers = metaData.brawlers.slice(0, 5);
        displayBrawlers(topBrawlers);
        
        // Top Teams
        const teams = metaData.teams;
        displayTeams(teams);
        
        // Spielmodi
        const modes = metaData.modes;
        displayModes(modes);
        
    } catch (error) {
        console.error('Fehler beim Laden der Meta-Daten:', error);
        document.getElementById('brawlers-list').innerHTML = '<li>❌ Daten konnten nicht geladen werden</li>';
    }
}

async function loadNews() {
    try {
        const res = await fetch('https://api.brawlify.com/v1/news');
        const data = await res.json();
        const container = document.getElementById('news-container');
        container.innerHTML = '';
        
        data.news.slice(0, 3).forEach(news => {
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
    }, 600000);
};