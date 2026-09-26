const appGrid = document.getElementById('appGrid');
const searchInput = document.getElementById('searchInput');
const summaryApps = document.getElementById('summaryApps');
const summarySize = document.getElementById('summarySize');
const sortButtons = document.querySelectorAll('.sort-button');

let apps = [];
let currentSort = 'name';

const initialsFor = (name) => {
  const words = name.split(/\s+|[-_]/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() || '').join('') || 'IPA';
};

const formatSize = (mb) => `${Number(mb).toFixed(1)} MB`;

const getSortedApps = (items) => {
  const sorted = [...items];

  sorted.sort((a, b) => {
    if (currentSort === 'size') return Number(b.binarySizeMb) - Number(a.binarySizeMb);
    if (currentSort === 'version') {
      const av = a.version.split('.').map(Number);
      const bv = b.version.split('.').map(Number);
      const max = Math.max(av.length, bv.length);

      for (let i = 0; i < max; i += 1) {
        const avPart = av[i] || 0;
        const bvPart = bv[i] || 0;
        if (avPart !== bvPart) return bvPart - avPart;
      }
      return 0;
    }

    return a.name.localeCompare(b.name);
  });

  return sorted;
};

const renderSummary = (items) => {
  const totalSize = items.reduce((sum, app) => sum + Number(app.binarySizeMb || 0), 0);
  summaryApps.textContent = String(items.length);
  summarySize.textContent = `${totalSize.toFixed(1)} MB`;
};

const renderApps = (items) => {
  appGrid.innerHTML = '';

  if (!items.length) {
    appGrid.innerHTML = '<div class="empty-state">No apps matched your search.</div>';
    return;
  }

  const cards = getSortedApps(items).map((app) => {
    const card = document.createElement('article');
    card.className = 'app-card';
    card.innerHTML = `
      <div class="app-card-header">
        <div class="app-icon" aria-hidden="true">${initialsFor(app.name)}</div>
        <span class="badge">${app.platform}</span>
      </div>
      <div class="app-meta">
        <h2 class="app-name">${app.name}</h2>
        <span class="app-version">v${app.version}</span>
      </div>
      <p>${app.description}</p>
      <div class="app-details">
        <span>Bundle ID <strong>${app.bundleId}</strong></span>
        <span>Min OS <strong>${app.minimumOs}</strong></span>
        <span>Size <strong>${formatSize(app.binarySizeMb)}</strong></span>
        <span>Platform <strong>${app.platform}</strong></span>
      </div>
      <a class="download-link" href="${app.download}" download>Download IPA</a>
    `;
    return card;
  });

  cards.forEach((card) => appGrid.appendChild(card));
};

const applyFilter = () => {
  const term = searchInput.value.trim().toLowerCase();
  if (!term) {
    renderSummary(apps);
    renderApps(apps);
    return;
  }

  const filtered = apps.filter((app) => {
    const haystack = [
      app.name,
      app.bundleId,
      app.version,
      app.platform,
      app.minimumOs,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(term);
  });

  renderSummary(filtered);
  renderApps(filtered);
};

const loadApps = async () => {
  try {
    const response = await fetch('apps.json');
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status}`);
    }

    const data = await response.json();
    apps = Array.isArray(data) ? data : [];
    renderSummary(apps);
    renderApps(apps);
  } catch (error) {
    console.error('Unable to load app catalog:', error);
    appGrid.innerHTML = '<div class="empty-state">Unable to load the archive catalog.</div>';
  }
};

searchInput.addEventListener('input', applyFilter);

sortButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentSort = button.dataset.sort;
    sortButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    applyFilter();
  });
});

loadApps();
