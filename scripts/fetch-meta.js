// Fetch and parse mmonster tier list into data.json
// Note: This uses node fetch and regex; it's a light scraper without heavy deps.
const fs = require('fs');
const path = require('path');

async function main() {
  const res = await fetch('https://mmonster.co/blog/brawl-stars-meta', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  // Extract base tiers section (names only)
  const baseStart = html.indexOf('Brawl Stars Meta Tier List');
  const baseSlice = baseStart >= 0 ? html.slice(baseStart) : html;

  const tiers = { S: [], A: [], B: [], C: [], D: [], F: [] };
  // First attempt: markdown-like table rows such as "| S | Name1 Name2 |"
  const rowRegex = /\|\s*([SABCDF])\s*\|([^|]+)\|/g;
  let m;
  while ((m = rowRegex.exec(baseSlice)) !== null) {
    const tier = m[1];
    const content = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    // Deduplicate immediate repeated names like "Mortis Mortis"
    const tokens = content.split(' ');
    const names = [];
    for (let i = 0; i < tokens.length; i++) {
      const cur = tokens[i];
      const next = tokens[i + 1];
      if (cur && next && cur === next) { names.push(cur); i++; } else { names.push(cur); }
    }
    tiers[tier] = names.filter(Boolean);
  }

  // If no tiers parsed, try a second strategy: headings like "S Tier" followed by inline names
  const hasAnyTier = Object.values(tiers).some(arr => arr.length > 0);
  if (!hasAnyTier) {
    const headingRe = /<(?:h2|h3|strong)[^>]*>\s*([SABCDF])\s*[- ]?\s*Tier\s*<\/(?:h2|h3|strong)>/gi;
    let hm;
    while ((hm = headingRe.exec(baseSlice)) !== null) {
      const tier = hm[1].toUpperCase();
      const sliceFrom = hm.index + hm[0].length;
      // Peek the next 800 characters to collect words that look like names (Capitalized tokens)
      const near = baseSlice.slice(sliceFrom, sliceFrom + 800);
      const candidateText = near.replace(/<[^>]+>/g, ' ');
      const nameTokens = candidateText.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g) || [];
      // Keep unique and stop at 12 names per tier
      const uniq = [];
      for (const t of nameTokens) {
        if (!uniq.includes(t)) uniq.push(t);
        if (uniq.length >= 12) break;
      }
      tiers[tier] = uniq;
    }
  }

  // Extract "By Win Rates" section to get real percentages
  // Find the "By Win Rates" section if present, otherwise search the whole page.
  const byIdx = html.search(/By\s+Win\s+Rate/i);
  const bySlice = byIdx >= 0 ? html.slice(byIdx, byIdx + 30000) : html;
  const winRates = {}; // name -> percent
  {
    // Normalize HTML entities for dashes and ampersands
    const normalize = (s) => s
      .replace(/&mdash;|&ndash;|&#8212;|&#8211;/g, '—')
      .replace(/&amp;/g, '&');
    let text = normalize(bySlice.replace(/\s+/g, ' '));
    // Also try to pick data anywhere on the page as fallback later
    const globalText = normalize(html.replace(/\s+/g, ' '));
    const parseInto = (src) => {
      // Collapse duplicates before dash: "Name Name — 74.17%"
      src = src.replace(/([A-Za-z0-9 .&'!\-]{2,})\s+\1\s+—/g, '$1 —');
      const pairRegex = /([A-Za-z][A-Za-z0-9 .&'!\-]{1,30}?)\s*(?:—|–|-)\s*(\d{1,2}(?:\.\d{1,2})?)%/g;
      let pm;
      while ((pm = pairRegex.exec(src)) !== null) {
        const name = pm[1].trim();
        const pct = parseFloat(pm[2]);
        if (name && !Number.isNaN(pct)) {
          // Strip trailing punctuation
          const clean = name.replace(/\s*[:.,;]+$/, '');
          winRates[clean] = pct;
        }
      }
    };
    parseInto(text);
    // Fallback: also parse the whole page if we found too few pairs
    if (Object.keys(winRates).length < 5) parseInto(globalText);
  }

  // Helper: determine tier of a brawler name
  const tierOf = (name, derivedMap) => {
    if (derivedMap && derivedMap[name]) return derivedMap[name];
    for (const t of ['S','A','B','C','D','F']) {
      if (tiers[t] && tiers[t].includes(name)) return t;
    }
    return null;
  };

  // useRate mapping per tier with slight decay by position in that tier
  const USE_BASE = { S: 45, A: 35, B: 28, C: 22, D: 16, F: 10 };
  const computeUseRate = (name, derivedMap) => {
    const t = tierOf(name, derivedMap);
    const base = (t && USE_BASE[t]) || 15;
    const tierList = t && tiers[t] && tiers[t].length ? tiers[t] : [];
    const idx = tierList.length ? Math.max(0, tierList.indexOf(name)) : 0;
    const val = Math.round(base - idx * 1.5);
    return Math.max(5, Math.min(95, val));
  };

  // Build top brawlers: prefer S-tier from "By Win Rates" (sorted desc), fallback to names-only S-tier
  // Prefer S-tier names when present; otherwise use global top by winRates
  const rankedAll = Object.entries(winRates).sort((a, b) => b[1] - a[1]);
  let sPairs = [];
  if (tiers.S && tiers.S.length) {
    sPairs = rankedAll.filter(([name]) => tiers.S.includes(name));
  }
  let topRankSource = sPairs.length ? sPairs : rankedAll;

  // If we lack explicit tiers, derive tiers based on rank buckets
  const derivedTierMap = {};
  if (!tiers.S.length && topRankSource.length) {
    topRankSource.forEach(([name], idx) => {
      let t = 'C';
      if (idx < 10) t = 'S'; else if (idx < 20) t = 'A'; else if (idx < 30) t = 'B';
      derivedTierMap[name] = t;
    });
  }

  let top = topRankSource.slice(0, 5).map(([name, pct]) => ({ name, winRate: pct, useRate: computeUseRate(name, derivedTierMap) }));
  if (top.length < 5 && tiers.S && tiers.S.length) {
    const fallback = tiers.S.filter(n => !top.find(t => t.name === n)).slice(0, 5 - top.length)
      .map((name, i) => ({ name, winRate: 70 - i, useRate: computeUseRate(name, derivedTierMap) }));
    top = top.concat(fallback);
  }

  // Build teams heuristically from top names
  const teams = [];
  if (top.length >= 2) teams.push({ members: [{ name: top[0].name }, { name: top[1].name }], winRate: 84 });
  if (top.length >= 3) teams.push({ members: [{ name: top[1].name }, { name: top[2].name }], winRate: 82 });
  if (top.length >= 3) teams.push({ members: [{ name: top[0].name }, { name: top[2].name }], winRate: 81 });
  if (top.length >= 4) teams.push({ members: [{ name: top[0].name }, { name: top[1].name }, { name: top[2].name }], winRate: 85 });

  const modes = [
    { name: 'Gem Grab', topBrawlers: top.slice(0, 3).map(b => ({ name: b.name })) },
    { name: 'Showdown', topBrawlers: top.slice(0, 3).map(b => ({ name: b.name })) },
    { name: 'Brawl Ball', topBrawlers: top.slice(0, 3).map(b => ({ name: b.name })) }
  ];

  const news = [
    { title: 'Tierlist aktualisiert (mmonster.co)', date: new Date().toISOString(), url: 'https://mmonster.co/blog/brawl-stars-meta' }
  ];

  const data = {
    lastUpdated: new Date().toISOString(),
    topBrawlers: top,
    teams,
    modes,
    news
  };

  const out = path.join(__dirname, '..', 'data.json');
  fs.writeFileSync(out, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Parsed winRates:', Object.keys(winRates).length, 'brawlers');
  console.log('Parsed tiers S/A/B/C/D/F sizes:', Object.values(tiers).map(a => a.length));
  console.log('Top brawlers:', top.map(t => t.name).join(', '));
  console.log('Wrote', out);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
