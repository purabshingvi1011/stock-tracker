# 📊 Stock Tracker Web App

A sleek, interactive, and responsive multi-page stock tracking app that gives real-time stock prices, RSI (Relative Strength Index) analytics, and recent financial news. Built using HTML, CSS, JavaScript, Chart.js, and powered by the Alpha Vantage and Mediastack APIs.

---

## 🔧 Features

- 📈 Daily stock price charts (via Alpha Vantage API)
- 🔍 RSI indicator support for traders
- 🗞️ Latest financial news (via Mediastack API)
- 🧠 Local storage-based watchlist
- 🔍 News filter & investment tips page
- 💻 Fully responsive UI with smooth styling
- ☁️ Python Flask dev server for local hosting

---

## 📁 Project Structure

```
├── index.html              # Home - stock tracker
├── market-news.html        # Page showing financial news
├── investing-tips.html     # Page with useful investment tips
├── styles.css              # Global styling
├── scripts.js              # JS for all interactivity
├── server.py               # Flask server for local testing
├── images/                 # Contains banner & page visuals
│   └── hero.jpg, finance1.jpg, ...
├── .gitignore
└── README.md               # This file
```

---

## 🚀 How to Run

### ▶️ Option 1: Open Static HTML
You can open `index.html` directly in your browser (may have CORS limitations).

### ▶️ Option 2: Use Python Flask Server

1. Install dependencies:
```bash
pip install flask
```

2. Run server:
```bash
python server.py
```

3. Visit:
```
http://127.0.0.1:5000/
```

---

## 🔑 API Keys Required

Make sure you replace placeholder keys in `scripts.js`:

```js
const ALPHA_KEY = "YOUR_ALPHA_VANTAGE_KEY";
const NEWS_KEY = "YOUR_MEDIASTACK_KEY";
```

> You can get free keys from:
> - [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
> - [Mediastack](https://mediastack.com/)

---

## ✨ Bonus Pages

- **Market News** – Live news with filterable search
- **Investing Tips** – Expandable advice cards for beginners
- **Footer** on every page with consistent branding

---

## 📸 Screenshots

_Add your screenshots here by dragging them into the repo._

---

## 📚 License

MIT License – Feel free to remix, extend, and use!

---

## 👤 Author

Purab Shingvi  
[GitHub Profile](https://github.com/purabshingvi1011)
