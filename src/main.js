// man fuck javascript
import { loadSettings, SEARCH_ENGINES, FAHRENHEIT_COUNTRIES } from './settings.js';

const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const initialSearchEngine = SEARCH_ENGINES[loadSettings().searchEngine] || SEARCH_ENGINES.duckduckgo;
searchForm.action = initialSearchEngine.url;
searchInput.name = initialSearchEngine.param;
searchInput.placeholder = `search ${initialSearchEngine.label.toLowerCase()}... (e.g. how to get a girlfriend)`;

searchForm.addEventListener('submit', () => {
  const engine = SEARCH_ENGINES[loadSettings().searchEngine] || SEARCH_ENGINES.duckduckgo;
  searchForm.action = engine.url;
  searchInput.name = engine.param;
});

const SHORTCUT_KEY = 'pancake-newtab-shortcut';
const shortcutGrid = document.getElementById('shortcut-grid');
const addForm = document.getElementById('add-shortcut-form');
const nameInput = document.getElementById('shortcut-name-input');
const urlInput = document.getElementById('shortcut-url-input');

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

function faviconFor(url) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=32&domain=${host}`;
  } catch (err) {
    return '';
  }
}

function renderShortcuts() {
  const list = loadShortcuts();
  shortcutGrid.innerHTML = '';
  
  list.forEach((s, i) => {
    const a = document.createElement('a');
    a.href = s.url;
    a.className = 'shortcut';
    const icon = faviconFor(s.url);
    a.innerHTML = `
      <button class="remove-btn" type="button" title="remove">✕</button>
      ${icon ? `<img src="${icon}" width="22" height="22" style="border-radius:4px" />` : '<span class="emoji">🔗</span>'}
      <span>${s.name}</span>
    `;
    a.querySelector('.remove-btn').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const updated = loadShortcuts();
      updated.splice(i, 1);
      saveShortcuts(updated);
      renderShortcuts();
      loadTopic(activeTopic);
    });
    shortcutGrid.appendChild(a);
  })

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.id = 'shortcut-empty';
    empty.textContent = 'no shortcuts yet :(';
    shortcutGrid.appendChild(empty);
  }

  const addTile = document.createElement('button');
  addTile.id = 'add-shortcut-tile';
  addTile.type = 'button';
  addTile.innerHTML = `<span class="emoji">➕</span><span>add shortcut :3</span>`;
  addTile.addEventListener('click', () => {
    addForm.classList.add('open');
    nameInput.value = '';
    urlInput.value = '';
    nameInput.focus();
  });
  shortcutGrid.appendChild(addTile);
}

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

document.getElementById('add-shortcut-save').addEventListener('click', () => {
  const name = nameInput.value.trim();
  const url = normalizeUrl(urlInput.value);
  if (!url) return;
  const list = loadShortcuts();
  list.push({ name: name || url, url });
  saveShortcuts(list);
  renderShortcuts();
  addForm.classList.remove('open');
  loadTopic(activeTopic);
});

document.getElementById('add-shortcut-cancel').addEventListener('click', () => {
  addForm.classList.remove('open');
});

[nameInput, urlInput].forEach(inp => {
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('add-shortcut-save').click();
    if (e.key === 'Escape') addForm.classList.remove('open');
  });
});

renderShortcuts();

// news stuff yea

const GLOBAL_FEEDS = [
  { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' }
];

const newsList = document.getElementById('news-list');
const newsStatus = document.getElementById('news-status');
const newsHeading = document.querySelector('#news-card h2');
const topicTabs = document.getElementById('topic-tabs');

function googleNewsFeed(hl, gl, ceid, label) {
  return {
    name: `Google News (${label})`,
    url: `https://news.google.com/rss?hl=${hl}&gl=${gl}&ceid=${ceid}`
  };
}

const COUNTRY_FEEDS = {
  US: [googleNewsFeed('en-US', 'US', 'US:en', 'US')],
  CA: [googleNewsFeed('en-CA', 'CA', 'CA:en', 'Canada')],
  GB: [googleNewsFeed('en-GB', 'GB', 'GB:en', 'UK')],
  IE: [googleNewsFeed('en-IE', 'IE', 'IE:en', 'Ireland')],
  AU: [googleNewsFeed('en-AU', 'AU', 'AU:en', 'Australia')],
  NZ: [googleNewsFeed('en-NZ', 'NZ', 'NZ:en', 'New Zealand')],
  ZA: [googleNewsFeed('en-ZA', 'ZA', 'ZA:en', 'South Africa')],
  IN: [googleNewsFeed('en-IN', 'IN', 'IN:en', 'India')],
  PK: [googleNewsFeed('en-PK', 'PK', 'PK:en', 'Pakistan')],
  BD: [googleNewsFeed('bn', 'BD', 'BD:bn', 'Bangladesh')],
  NG: [googleNewsFeed('en-NG', 'NG', 'NG:en', 'Nigeria')],
  KE: [googleNewsFeed('en-KE', 'KE', 'KE:en', 'Kenya')],
  GH: [googleNewsFeed('en-GH', 'GH', 'GH:en', 'Ghana')],
  PH: [googleNewsFeed('en-PH', 'PH', 'PH:en', 'Philippines')],
  SG: [googleNewsFeed('en-SG', 'SG', 'SG:en', 'Singapore')],
  MY: [googleNewsFeed('en-MY', 'MY', 'MY:en', 'Malaysia')],
  ID: [googleNewsFeed('id', 'ID', 'ID:id', 'Indonesia')],
  VN: [googleNewsFeed('vi', 'VN', 'VN:vi', 'Vietnam')],
  TH: [googleNewsFeed('th', 'TH', 'TH:th', 'Thailand')],
  HK: [googleNewsFeed('en-HK', 'HK', 'HK:en', 'Hong Kong')],
  TW: [googleNewsFeed('zh-TW', 'TW', 'TW:zh-Hant', 'Taiwan')],
  JP: [googleNewsFeed('ja', 'JP', 'JP:ja', 'Japan')],
  KR: [googleNewsFeed('ko', 'KR', 'KR:ko', 'Korea')],
  IL: [googleNewsFeed('he', 'IL', 'IL:he', 'Israel')],
  TR: [googleNewsFeed('tr', 'TR', 'TR:tr', 'Turkey')],
  EG: [googleNewsFeed('ar', 'EG', 'EG:ar', 'Egypt')],
  SA: [googleNewsFeed('ar', 'SA', 'SA:ar', 'Saudi Arabia')],
  AE: [googleNewsFeed('ar', 'AE', 'AE:ar', 'UAE')],
  PL: [googleNewsFeed('pl', 'PL', 'PL:pl', 'Poland')],
  DE: [googleNewsFeed('de', 'DE', 'DE:de', 'Germany')],
  AT: [googleNewsFeed('de', 'AT', 'AT:de', 'Austria')],
  CH: [googleNewsFeed('de', 'CH', 'CH:de', 'Switzerland')],
  FR: [googleNewsFeed('fr', 'FR', 'FR:fr', 'France')],
  BE: [googleNewsFeed('nl', 'BE', 'BE:nl', 'Belgium')],
  NL: [googleNewsFeed('nl', 'NL', 'NL:nl', 'Netherlands')],
  ES: [googleNewsFeed('es', 'ES', 'ES:es', 'Spain')],
  PT: [googleNewsFeed('pt-PT', 'PT', 'PT:pt-150', 'Portugal')],
  IT: [googleNewsFeed('it', 'IT', 'IT:it', 'Italy')],
  GR: [googleNewsFeed('el', 'GR', 'GR:el', 'Greece')],
  SE: [googleNewsFeed('sv', 'SE', 'SE:sv', 'Sweden')],
  NO: [googleNewsFeed('no', 'NO', 'NO:no', 'Norway')],
  DK: [googleNewsFeed('da', 'DK', 'DK:da', 'Denmark')],
  FI: [googleNewsFeed('fi', 'FI', 'FI:fi', 'Finland')],
  CZ: [googleNewsFeed('cs', 'CZ', 'CZ:cs', 'Czechia')],
  HU: [googleNewsFeed('hu', 'HU', 'HU:hu', 'Hungary')],
  RO: [googleNewsFeed('ro', 'RO', 'RO:ro', 'Romania')],
  BG: [googleNewsFeed('bg', 'BG', 'BG:bg', 'Bulgaria')],
  UA: [googleNewsFeed('uk', 'UA', 'UA:uk', 'Ukraine')],
  RU: [googleNewsFeed('ru', 'RU', 'RU:ru', 'Russia')],
  BR: [googleNewsFeed('pt-BR', 'BR', 'BR:pt-419', 'Brazil')],
  MX: [googleNewsFeed('es-419', 'MX', 'MX:es-419', 'Mexico')],
  AR: [googleNewsFeed('es-419', 'AR', 'AR:es-419', 'Argentina')],
  CO: [googleNewsFeed('es-419', 'CO', 'CO:es-419', 'Colombia')],
  CL: [googleNewsFeed('es-419', 'CL', 'CL:es-419', 'Chile')],
};

const TOPIC_FEEDS = {
  local: null, // handled specially — uses COUNTRY_FEEDS / GLOBAL_FEEDS
  world: [{ name: 'Google News (World)', url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en-US&gl=US&ceid=US:en' }],
  business: [{ name: 'Google News (Business)', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en' }],
  technology: [{ name: 'Google News (Tech)', url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en' }],
  sports: [{ name: 'Google News (Sports)', url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en' }],
  science: [{ name: 'Google News (Science)', url: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en' }],
  entertainment: [{ name: 'Google News (Entertainment)', url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en' }],
  health: [{ name: 'Google News (Health)', url: 'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en' }],
};

const TOPIC_LABELS = {
  local: '📍 Local',
  world: '🌍 World',
  business: '💼 Business',
  technology: '💻 Tech',
  sports: '⚽ Sports',
  science: '🔬 Science',
  entertainment: '🎬 Entertainment',
  health: '🏥 Health',
};

let cachedCountryCode = null;
let activeTopic = 'local';

async function fetchFeed(feed) {
  try {
    const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(feed.url));
    const data = await res.json();
    if (data.status !== 'ok' || !data.items?.length) return [];
    return data.items.slice(0, 30).map(item => ({
      title: item.title,
      link: item.link,
      source: feed.name
    }));
  } catch (err) {
    return [];
  }
}

function newsItemLimit() {
  const shortcutCount = shortcutGrid.querySelectorAll('.shortcut').length;
  return shortcutCount <= 9
    ? 6
    : 6 + Math.floor((shortcutCount - 9) / 3);
}

async function detectCountryCode() {
  if (cachedCountryCode !== undefined && cachedCountryCode !== null) return cachedCountryCode;
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    cachedCountryCode = data.country_code || null;
    return cachedCountryCode;
  } catch (err) {
    return null;
  }
}

async function renderNewsFrom(feeds) {
  const results = await Promise.all(feeds.map(fetchFeed));
  const combined = results.flat();
  newsList.innerHTML = '';
  if (combined.length === 0) {
    newsStatus.style.display = 'block';
    newsStatus.textContent = "couldn't load headlines right now";
    return false;
  }
  newsStatus.style.display = 'none';
  combined.slice(0, newsItemLimit()).forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.link;
    a.innerHTML = `${item.title} <span style="color: var(--subtext); font-size: 11px;">— ${item.source}</span>`;
    li.appendChild(a);
    newsList.appendChild(li);
  });
  return true;
}

async function loadLocalNews() {
  const countryCode = await detectCountryCode();
  const localFeeds = countryCode ? COUNTRY_FEEDS[countryCode] : null;

  if (localFeeds) {
    newsHeading.textContent = `🌍 da news (${countryCode})`;
    const ok = await renderNewsFrom(localFeeds);
    if (ok) return;
  }

  newsHeading.textContent = '🌍 da news';
  await renderNewsFrom(GLOBAL_FEEDS);
}

async function loadTopic(topic) {
  activeTopic = topic;
  newsStatus.style.display = 'block';
  newsStatus.textContent = 'loading headlines...';
  newsList.innerHTML = '';

  [...topicTabs.children].forEach(btn => {
    btn.classList.toggle('active', btn.dataset.topic === topic);
  });

  if (topic === 'local') {
    await loadLocalNews();
    return;
  }

  newsHeading.textContent = `🌍 da news — ${TOPIC_LABELS[topic].replace(/^\S+\s/, '')}`;
  await renderNewsFrom(TOPIC_FEEDS[topic]);
}

Object.keys(TOPIC_LABELS).forEach(topic => {
  const btn = document.createElement('button');
  btn.className = 'topic-tab';
  btn.type = 'button';
  btn.dataset.topic = topic;
  btn.textContent = TOPIC_LABELS[topic];
  btn.addEventListener('click', () => loadTopic(topic));
  topicTabs.appendChild(btn);
});

loadTopic('local');

// weather shit
const WEATHER_AGREEMENT_KEY = 'pancake-weather-agreement';
const weatherCard = document.getElementById('weather-card');
const weatherDetails = document.getElementById('weather-details');
const weatherPermission = document.getElementById('weather-permission');
const weatherPermissionButton = document.getElementById('weather-permission-button');
const weatherEmoji = document.getElementById('weather-emoji');
const weatherTemp = document.getElementById('weather-temp');
const weatherPlace = document.getElementById('weather-place');
const weatherFeelsLike = document.getElementById('weather-feels-like');
const weatherHumidity = document.getElementById('weather-humidity');
const weatherWind = document.getElementById('weather-wind');
const weatherHighLow = document.getElementById('weather-high-low');
const weatherStatus = document.getElementById('weather-status');

const WEATHER_ICONS = {
  0: '☀️', 1: '🌤', 2: '⛅', 3: '☁️',
  45: '🌫', 48: '🌫',
  51: '🌦', 53: '🌦', 55: '🌦',
  61: '🌧', 63: '🌧', 65: '🌧',
  71: '🌨', 73: '🌨', 75: '🌨',
  80: '🌦', 81: '🌧', 82: '⛈',
  95: '⛈', 96: '⛈', 99: '⛈'
};

function showWeatherDetails() {
  weatherCard.classList.remove('weather-locked');
  weatherCard.classList.add('weather-unlocked');
  weatherDetails.setAttribute('area-hidden', 'false');
}

async function resolveUnits() {
  const settings = loadSettings();
  let countryCode;
  const getCountryCode = async () => countryCode ??= await detectCountryCode();

  let temp = settings.tempUnit;
  if (temp === 'kelvin') temp = 'celsius';
  if (temp === 'auto') {
    const useFahrenheit = FAHRENHEIT_COUNTRIES.includes(await getCountryCode());
    temp = useFahrenheit ? 'fahrenheit' : 'celsius';
  }

  let wind = settings.windUnit;
  if (wind === 'auto') {
    const useMph = FAHRENHEIT_COUNTRIES.includes(await getCountryCode());
    wind = useMph ? 'mph' : 'kmh';
  }

  return {
    temp,
    wind,
    display: settings.tempUnit === 'kelvin' ? 'kelvin' : undefined,
  };
}

async function loadWeatherFor(lat, lon, placeName) {
  try {
    const units = await resolveUnits();
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min` +
      `&temperature_unit=${units.temp}&wind_speed_unit=${units.wind}&timezone=auto`
    );
    const data = await res.json();
    const c = data.current;
    const isKelvin = units.display === 'kelvin';
    const displayTemperature = value => isKelvin ? value + 273.15 : value;
    const unitLabel = isKelvin ? ' K' : units.temp === 'fahrenheit' ? '°F' : '°C';
    const windUnitLabel = units.wind === 'mph' ? 'mph' : 'km/h';
 
    weatherEmoji.textContent = WEATHER_ICONS[c.weather_code] ?? '🌡';
    weatherTemp.textContent = `${Math.round(displayTemperature(c.temperature_2m))}${unitLabel}`;
    weatherPlace.textContent = placeName;
    weatherFeelsLike.textContent = `feels like ${Math.round(displayTemperature(c.apparent_temperature))}${unitLabel}`;
    weatherHumidity.textContent = `💧 ${Math.round(c.relative_humidity_2m)}%`;
    weatherWind.textContent = `💨 ${Math.round(c.wind_speed_10m)} ${windUnitLabel}`;
 
    if (data.daily?.temperature_2m_max?.[0] !== undefined) {
      const hi = Math.round(displayTemperature(data.daily.temperature_2m_max[0]));
      const lo = Math.round(displayTemperature(data.daily.temperature_2m_min[0]));
      if (weatherHighLow) {
        weatherHighLow.textContent = `H: ${hi}${unitLabel}  L: ${lo}${unitLabel}`;
      }
    }
  } catch (err) {
    weatherStatus.textContent = "couldn't load weather";
  }
}

async function fallbackToIpLocation() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    const label = `${data.city || 'your area'} (approx.)`;
    loadWeatherFor(data.latitude, data.longitude, label);
  } catch (err) {
    weatherStatus.textContent = 'weather unavailable :(';
    weatherPlace.textContent = '';
  }
}

function loadWeather() {
  if (!navigator.geolocation) {
    fallbackToIpLocation();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => loadWeatherFor(pos.coords.latitude, pos.coords.longitude, 'your location'),
    () => fallbackToIpLocation(),
    { timeout: 5000 }
  );
}

function requestWeatherPermission() {
  localStorage.setItem(WEATHER_AGREEMENT_KEY, 'accepted');
  showWeatherDetails();
  loadWeather();
}

weatherCard.classList.add('weather-locked');
weatherDetails.setAttribute('area-hidden', 'true');
weatherPermissionButton.addEventListener('click', requestWeatherPermission);

if (localStorage.getItem(WEATHER_AGREEMENT_KEY) === 'accepted') {
  showWeatherDetails();
  loadWeather();
}
