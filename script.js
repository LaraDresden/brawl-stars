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
        console.warn('Daten konnten nicht geladen werden:', err);
        showErrorPlaceholders();
    });
    
    // Alle 10 Minuten aktualisieren
    setInterval(() => {
        loadDataFromJson().catch(() => showErrorPlaceholders());
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

function showErrorPlaceholders() {
    const bl = document.getElementById('brawlers-list');
    const t2 = document.getElementById('teams-2');
    const t3 = document.getElementById('teams-3');
    const t4 = document.getElementById('teams-4');
    const ml = document.getElementById('modes-list');
    const nc = document.getElementById('news-container');
    if (bl) bl.innerHTML = '<li>❌ Daten aktuell nicht verfügbar</li>';
    if (t2) t2.innerHTML = '<li>❌ Daten aktuell nicht verfügbar</li>';
    if (t3) t3.innerHTML = '<li>❌ Daten aktuell nicht verfügbar</li>';
    if (t4) t4.innerHTML = '<li>❌ Daten aktuell nicht verfügbar</li>';
    if (ml) ml.innerHTML = '<li>❌ Daten aktuell nicht verfügbar</li>';
    if (nc) nc.innerHTML = '<p>❌ News aktuell nicht verfügbar</p>';
    const footer = document.querySelector('footer p');
    if (footer) footer.textContent = '⚠️ Datenquelle nicht erreichbar – bitte später erneut versuchen.';
}

// Entfernt: loadMockNews (kein Fallback mehr)

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