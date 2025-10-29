const API_KEY = '4eabc4ed1cca4481b18121323252610';
const BASE = 'https://api.weatherapi.com/v1/current.json';

const qInput = document.getElementById('q');
const searchBtn = document.getElementById('searchBtn');
const outputArea = document.getElementById('outputArea');

function showLoading() {
  outputArea.innerHTML = `
    <div class="result">
      <div class="icon">🔄</div>
      <div class="meta">
        <div class="temp">Loading...</div>
        <div class="desc">Please wait while we fetch the weather.</div>
      </div>
    </div>`;
}

function showError(msg) {
  outputArea.innerHTML = `<div class="error">${escapeHtml(msg)}</div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[c]));
}

function renderWeather(data) {
  const loc = `${data.location.name}${data.location.region ? ', ' + data.location.region : ''}, ${data.location.country}`;
  const temp_c = data.current.temp_c;
  const temp_f = data.current.temp_f;
  const cond = data.current.condition.text;
  const iconUrl = 'https:' + data.current.condition.icon;
  const humidity = data.current.humidity;
  const wind_kph = data.current.wind_kph;
  const feelslike_c = data.current.feelslike_c;
  const last_updated = data.current.last_updated;

  outputArea.innerHTML = `
    <div class="result">
      <div class="icon"><img src="${escapeHtml(iconUrl)}" alt="${escapeHtml(cond)} icon"></div>
      <div class="meta">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:16px">
          <div>
            <div class="temp">${temp_c}°C <span style="font-size:14px;color:var(--muted);">(${temp_f}°F)</span></div>
            <div class="desc">${escapeHtml(cond)}</div>
          </div>
          <div class="small">${escapeHtml(loc)}</div>
        </div>

        <div class="info-grid">
          <div class="info"><div class="small">Feels like</div><div>${feelslike_c}°C</div></div>
          <div class="info"><div class="small">Humidity</div><div>${humidity}%</div></div>
          <div class="info"><div class="small">Wind</div><div>${wind_kph} kph</div></div>
          <div class="info"><div class="small">Last update</div><div>${escapeHtml(last_updated)}</div></div>
        </div>
      </div>
    </div>`;
}

async function fetchWeather(query) {
  if (!query) {
    showError('Please enter a location.');
    return;
  }
  showLoading();
  searchBtn.disabled = true;
  try {
    const url = `${BASE}?key=${encodeURIComponent(API_KEY)}&q=${encodeURIComponent(query)}&aqi=yes`;
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      const msg = err?.error?.message || `HTTP error ${res.status}`;
      showError(msg);
      return;
    }
    const data = await res.json();
    renderWeather(data);
  } catch (err) {
    showError('Network error or CORS blocked.');
  } finally {
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener('click', () => fetchWeather(qInput.value.trim()));
qInput.addEventListener('keydown', e => { if (e.key === 'Enter') fetchWeather(qInput.value.trim()); });

qInput.focus();
