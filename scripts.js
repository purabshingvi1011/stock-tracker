// Replace with your real API keys
const ALPHA_KEY = "LYJC20A8EY0EIU9I";  // from alpha vantage
const NEWS_KEY = "dea33c886324fb3e942eaaf9a12bf45e";      // from mediastack

// Elements
const addTickerBtn = document.getElementById("addTickerBtn");
const tickerInput = document.getElementById("tickerInput");
const watchlistEl = document.getElementById("watchlist");
const stockTitleEl = document.getElementById("stockTitle");
const stockInfoEl = document.getElementById("stockInfo");
const stockChartEl = document.getElementById("stockChart");
const newsListEl = document.getElementById("newsList");

let stockChart; // Chart.js instance

// Load watchlist from localStorage
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
renderWatchlist();

// Add Ticker to watchlist
if (addTickerBtn) {
  addTickerBtn.addEventListener("click", () => {
    let ticker = tickerInput.value.trim().toUpperCase();
    tickerInput.value = "";
    if (!ticker) return;
    if (!watchlist.includes(ticker)) {
      watchlist.push(ticker);
      localStorage.setItem("watchlist", JSON.stringify(watchlist));
      renderWatchlist();
    }
  });
}

// Render watchlist
function renderWatchlist() {
  if (!watchlistEl) return;
  watchlistEl.innerHTML = "";
  watchlist.forEach(ticker => {
    const badge = document.createElement("div");
    badge.classList.add("ticker-badge");
    badge.textContent = ticker;
    badge.addEventListener("click", () => {
      fetchStockData(ticker);
      fetchNews(ticker);
    });
    watchlistEl.appendChild(badge);
  });
}

// Fetch stock data from Alpha Vantage
async function fetchStockData(ticker) {
  const dailyUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=compact&apikey=${ALPHA_KEY}`;
  const rsiUrl = `https://www.alphavantage.co/query?function=RSI&symbol=${ticker}&interval=daily&time_period=14&series_type=close&apikey=${ALPHA_KEY}`;

  try {
    const [dailyRes, rsiRes] = await Promise.all([
      fetch(dailyUrl),
      fetch(rsiUrl),
    ]);
    if (!dailyRes.ok || !rsiRes.ok) throw new Error("Network error");

    const [dailyData, rsiData] = await Promise.all([
      dailyRes.json(),
      rsiRes.json()
    ]);

    if (dailyData["Error Message"] || dailyData["Note"]) {
      throw new Error(dailyData["Error Message"] || dailyData["Note"] || "Daily fetch error");
    }

    displayStockData(ticker, dailyData, rsiData);
  } catch (err) {
    console.error(err);
    if (stockTitleEl) {
      stockTitleEl.textContent = `Failed to fetch data for ${ticker}`;
    }
    if (stockInfoEl) {
      stockInfoEl.innerHTML = `<p>${err.message}</p>`;
    }
    if (stockChart) stockChart.destroy();
  }
}

function displayStockData(ticker, dailyData, rsiData) {
  if (!stockTitleEl || !stockInfoEl || !stockChartEl) return;

  stockTitleEl.textContent = `${ticker} Stock Info`;

  const timeSeries = dailyData["Time Series (Daily)"];
  if (!timeSeries) {
    stockInfoEl.innerHTML = "<p>No daily data found.</p>";
    return;
  }

  const dates = Object.keys(timeSeries).sort((a,b) => new Date(a) - new Date(b));
  const labels = [];
  const closePrices = [];
  dates.forEach(date => {
    labels.push(date);
    closePrices.push(parseFloat(timeSeries[date]["4. close"]));
  });

  const latestDate = dates[dates.length - 1];
  const latestInfo = timeSeries[latestDate];
  const open = latestInfo["1. open"];
  const high = latestInfo["2. high"];
  const low  = latestInfo["3. low"];
  const close = latestInfo["4. close"];
  stockInfoEl.innerHTML = `
    <p><strong>Latest Date:</strong> ${latestDate}</p>
    <p><strong>Open:</strong> ${open}</p>
    <p><strong>High:</strong> ${high}</p>
    <p><strong>Low:</strong> ${low}</p>
    <p><strong>Close:</strong> ${close}</p>
  `;

  // RSI
  let rsiValues = [];
  let rsiTimes = [];
  if (rsiData["Technical Analysis: RSI"]) {
    const rsiSeries = rsiData["Technical Analysis: RSI"];
    rsiTimes = Object.keys(rsiSeries).sort((a, b) => new Date(a) - new Date(b));
    rsiValues = rsiTimes.map(t => parseFloat(rsiSeries[t]["RSI"]));
  }

  if (stockChart) {
    stockChart.destroy();
  }
  const ctx = stockChartEl.getContext("2d");
  const datasets = [
    {
      label: `${ticker} Close`,
      data: closePrices,
      borderColor: "rgba(75,192,192,1)",
      fill: false,
      yAxisID: 'y',
      tension: 0.1
    }
  ];

  // If RSI data exists
  if (rsiValues.length > 0) {
    const rsiDataPoints = labels.map(lbl => {
      const idx = rsiTimes.indexOf(lbl);
      return idx >= 0 ? rsiValues[idx] : null;
    });
    datasets.push({
      label: `${ticker} RSI (14)`,
      data: rsiDataPoints,
      borderColor: "rgba(255,99,132,1)",
      fill: false,
      yAxisID: 'y1',
      tension: 0.1
    });
  }

  stockChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      scales: {
        y: {
          type: 'linear',
          position: 'left',
          title: { display: true, text: 'Price (USD)' }
        },
        y1: {
          type: 'linear',
          position: 'right',
          title: { display: true, text: 'RSI' },
          min: 0,
          max: 100,
          grid: { drawOnChartArea: false }
        },
        x: {
          display: true,
          title: { display: true, text: 'Date' }
        }
      }
    }
  });
}

async function fetchNews(ticker) {
  if (!newsListEl) return;
  newsListEl.innerHTML = "<li>Loading news...</li>";

  const url = `http://api.mediastack.com/v1/news?access_key=${NEWS_KEY}&keywords=${ticker}&languages=en&sort=published_desc`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("News fetch error");

    const json = await resp.json();

    // Mediastack returns "data" array, not "articles" or "status"
    if (!json.data) {
      throw new Error("Mediastack returned no 'data' field.");
    }

    displayNews(json.data, ticker);
  } catch (err) {
    console.error(err);
    newsListEl.innerHTML = `<li>Error fetching news: ${err.message}</li>`;
  }
}


function displayNews(articles, ticker) {
  if (!newsListEl) return;
  newsListEl.innerHTML = "";
  if (!articles || articles.length === 0) {
    newsListEl.innerHTML = "<li>No news found</li>";
    return;
  }
  articles.slice(0, 5).forEach(article => {
    const li = document.createElement("li");
    const title = article.title || "No Title";
    const url = article.url || "#";
    li.innerHTML = `<a href="${url}" target="_blank">${title}</a>`;
    newsListEl.appendChild(li);
  });
}

/************************************************************************
  MARKET NEWS PAGE (market-news.html)
************************************************************************/
const newsFilterInput = document.getElementById("newsFilter");
const newsItemsContainer = document.getElementById("newsItems");

if (newsFilterInput && newsItemsContainer) {
  // If we're on market-news.html
  newsFilterInput.addEventListener("input", () => {
    const filterVal = newsFilterInput.value.toLowerCase();
    const cards = newsItemsContainer.querySelectorAll(".news-card");

    cards.forEach(card => {
      const text = card.innerText.toLowerCase();
      card.style.display = text.includes(filterVal) ? "block" : "none";
    });
  });
}

/************************************************************************
  INVESTING TIPS PAGE (investing-tips.html)
************************************************************************/
const tipHeaders = document.querySelectorAll(".tips-header");
if (tipHeaders) {
  tipHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      if (content) {
        content.classList.toggle("show");
      }
    });
  });
}
