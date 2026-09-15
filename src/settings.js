const SETTINGS_KEY = 'pancake-newtab-settings';

export const FAHRENHEIT_COUNTRIES = ['US', 'BS', 'BZ', 'KY', 'LR', 'PW', 'FM', 'MH'];

export function loadSettings() {
  try {
    return {
      tempUnit: 'auto',
      windUnit: 'auto',
      defaultTopic: 'local',
      searchEngine: 'duckduckgo',
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'),
    };
  } catch (err) {
    return { tempUnit: 'auto', windUnit: 'auto', defaultTopic: 'local', searchEngine: 'duckduckgo' };
  }
}

export const SEARCH_ENGINES = {
  google: { label: 'Google', url: 'https://www.google.com/search', param: 'q' },
    bing: { label: 'Bing', url: 'https://www.bing.com/search', param: 'q' },
    yahoo: { label: 'Yahoo', url: 'https://search.yahoo.com/search', param: 'p' },
    duckduckgo: { label: 'DuckDuckGo', url: 'https://duckduckgo.com/', param: 'q' },
    brave: { label: 'Brave Search', url: 'https://search.brave.com/search', param: 'q' },
    ecosia: { label: 'Ecosia', url: 'https://www.ecosia.org/search', param: 'q' },
    startpage: { label: 'Startpage', url: 'https://www.startpage.com/sp/search', param: 'query' },
    qwant: { label: 'Qwant', url: 'https://www.qwant.com/', param: 'q' },
};

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

const SHORTCUT_KEY = 'pancake-newtab-shortcut';
const savedIndicator = document.getElementById('saved-indicator');

function flashSaved() {
  savedIndicator.classList.add('show');
  setTimeout(() => savedIndicator.classList.remove('show'), 1200);
}

const settings = loadSettings();

const searchEngineSelect = document.getElementById('search-engine-select');
if (searchEngineSelect) {
  Object.entries(SEARCH_ENGINES).forEach(([value, engine]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = engine.label;
    searchEngineSelect.appendChild(option);
  });
  searchEngineSelect.value = SEARCH_ENGINES[settings.searchEngine]
    ? settings.searchEngine
    : 'duckduckgo';
  searchEngineSelect.addEventListener('change', () => {
    const current = loadSettings();
    current.searchEngine = searchEngineSelect.value;
    saveSettings(current);
    flashSaved();
  });
}

document.querySelectorAll('input[name="tempUnit"]').forEach(radio => {
  radio.checked = radio.value === settings.tempUnit;
  radio.addEventListener('change', () => {
    const current = loadSettings();
    current.tempUnit = radio.value;
    saveSettings(current);
    flashSaved();
  });
});

document.querySelectorAll('input[name="windUnit"]').forEach(radio => {
  radio.checked = radio.value === settings.windUnit;
  radio.addEventListener('change', () => {
    const current = loadSettings();
    current.windUnit = radio.value;
    saveSettings(current);
    flashSaved();
  });
});

const topicSelect = document.getElementById('default-topic-select');
if (topicSelect) {
  topicSelect.value = settings.defaultTopic;
  topicSelect.addEventListener('change', () => {
    const current = loadSettings();
    current.defaultTopic = topicSelect.value;
    saveSettings(current);
    flashSaved();
  });
}

const shortcutList = document.getElementById('settings-shortcut-list');
const clearBtn = document.getElementById('clear-shortcuts-button');

function loadShortcuts() {
  try {
    return JSON.parse(localStorage.getItem(SHORTCUT_KEY)) || [];
  } catch (err) {
    return [];
  }
}

function saveShortcuts(list) {
  localStorage.setItem(SHORTCUT_KEY, JSON.stringify(list));
}

function renderShortcutList() {
  if (!shortcutList) return;

  const list = loadShortcuts();
  shortcutList.innerHTML = '';

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.id = 'settings-empty';
    empty.textContent = 'no shortcuts saved yet';
    shortcutList.appendChild(empty);
    return;
  }

  list.forEach((s, i) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = `${s.name} — ${s.url}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '✕ remove';
    btn.addEventListener('click', () => {
      const updated = loadShortcuts();
      updated.splice(i, 1);
      saveShortcuts(updated);
      renderShortcutList();
      flashSaved();
    });
    li.appendChild(span);
    li.appendChild(btn);
    shortcutList.appendChild(li);
  });
}

clearBtn?.addEventListener('click', () => {
  if (!confirm('Remove all saved shortcuts?')) return;
  saveShortcuts([]);
  renderShortcutList();
  flashSaved();
});

renderShortcutList();
