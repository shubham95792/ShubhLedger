const dataByRange = {
  "1d": {
    total: "$128,940.14",
    totalDelta: "+4.88% today",
    pnl: "+$2,914.72",
    pnlDelta: "+$426.30 unrealized",
    axis: ["00:00", "06:00", "12:00", "18:00", "Now"],
    trend: [118200, 120200, 121000, 122100, 123200, 124300, 125400, 126600, 127900, 128940],
    tokens: [
      { symbol: "BTC", balance: "1.9200", price: "$65,840", value: "$126,412", change: "+2.1%" },
      { symbol: "ETH", balance: "8.4000", price: "$3,420", value: "$28,728", change: "+1.6%" },
      { symbol: "SOL", balance: "132.1000", price: "$147", value: "$19,418", change: "+3.4%" },
      { symbol: "ARB", balance: "2240.00", price: "$1.08", value: "$2,419", change: "-0.9%" },
      { symbol: "AVAX", balance: "148.00", price: "$39.30", value: "$5,816", change: "+2.8%" },
      { symbol: "ATOM", balance: "460.00", price: "$9.44", value: "$4,342", change: "+1.3%" }
    ],
    ticker: ["BTC +2.1%", "ETH +1.6%", "SOL +3.4%", "OP +4.0%", "ARB -0.9%", "AVAX +2.8%"]
  },
  "7d": {
    total: "$123,772.51",
    totalDelta: "+9.26% this week",
    pnl: "+$8,042.43",
    pnlDelta: "+$1,211.10 unrealized",
    axis: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    trend: [111800, 113500, 114800, 116100, 117200, 119000, 120500, 121600, 122900, 123772],
    tokens: [
      { symbol: "BTC", balance: "1.9000", price: "$64,184", value: "$121,950", change: "+4.9%" },
      { symbol: "ETH", balance: "8.1000", price: "$3,456", value: "$27,996", change: "+3.8%" },
      { symbol: "SOL", balance: "129.0000", price: "$138", value: "$17,820", change: "+7.1%" },
      { symbol: "ARB", balance: "2190.00", price: "$1.17", value: "$2,562", change: "+1.4%" },
      { symbol: "AVAX", balance: "145.00", price: "$40.10", value: "$5,814", change: "+5.5%" },
      { symbol: "OP", balance: "980.00", price: "$3.44", value: "$3,371", change: "+2.7%" }
    ],
    ticker: ["BTC +4.9%", "ETH +3.8%", "SOL +7.1%", "AVAX +5.5%", "OP +2.7%", "ARB +1.4%"]
  },
  "30d": {
    total: "$109,430.27",
    totalDelta: "+18.24% this month",
    pnl: "+$16,738.54",
    pnlDelta: "+$2,904.77 unrealized",
    axis: ["W1", "W2", "W3", "W4", "Now"],
    trend: [91500, 94800, 97200, 99600, 101800, 103600, 105200, 106900, 108100, 109430],
    tokens: [
      { symbol: "BTC", balance: "1.7800", price: "$60,786", value: "$108,200", change: "+10.1%" },
      { symbol: "ETH", balance: "7.2000", price: "$3,461", value: "$24,920", change: "+8.4%" },
      { symbol: "SOL", balance: "120.0000", price: "$127.6", value: "$15,310", change: "+12.9%" },
      { symbol: "AVAX", balance: "140.00", price: "$38.20", value: "$5,348", change: "+7.2%" },
      { symbol: "OP", balance: "920.00", price: "$3.10", value: "$2,852", change: "+8.0%" },
      { symbol: "ARB", balance: "2100.00", price: "$1.14", value: "$2,394", change: "+4.0%" }
    ],
    ticker: ["BTC +10.1%", "ETH +8.4%", "SOL +12.9%", "AVAX +7.2%", "OP +8.0%", "ARB +4.0%"]
  }
};

const totalValueEl = document.getElementById("totalValue");
const totalDeltaEl = document.getElementById("totalDelta");
const pnlValueEl = document.getElementById("pnlValue");
const pnlDeltaEl = document.getElementById("pnlDelta");
const focusTokenEl = document.getElementById("focusToken");
const walletBtnEls = document.querySelectorAll(".wallet-btn");
const walletLogoutBtnEls = document.querySelectorAll(".wallet-logout");
const walletAddressEls = document.querySelectorAll(".wallet-address");
const walletMenuEl = document.querySelector(".wallet-menu");
const walletTriggerEl = document.querySelector(".wallet-trigger");
const walletDropdownEl = document.querySelector(".wallet-dropdown");
const walletStateEl = document.getElementById("walletState");
const connectOverlayEl = document.getElementById("connectOverlay");
const themeToggleBtnEls = document.querySelectorAll(".theme-toggle");
const navToggleBtnEl = document.getElementById("navToggleBtn");
const siteHeaderEl = document.querySelector(".site-header");
const syncWalletBtnEl = document.getElementById("syncWalletBtn");

const axisEl = document.getElementById("axis");
const tokenListEl = document.getElementById("tokenList");
const tokensMetaEl = document.getElementById("tokensMeta");
const tokenTickerRowEl = document.getElementById("tokenTickerRow");
const tokenTickerRowCloneEl = document.getElementById("tokenTickerRowClone");

const tokenLogoMap = {
  BTC: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png",
  ETH: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
  SOL: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  OP: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png",
  ARB: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png",
  AVAX: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png",
  ATOM: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/cosmos/info/logo.png"
};

const gridGroupEl = document.getElementById("gridGroup");
const areaPathEl = document.getElementById("areaPath");
const linePathEl = document.getElementById("linePath");
const pointGroupEl = document.getElementById("pointGroup");
const latestPointEl = document.getElementById("latestPoint");

let currentRange = "1d";
let connected = false;
let liveData = null;
let autoRefreshId = null;
let didInitialSync = false;
let lastTokens = null;
let walletLoadVersion = 0;
let walletLoadInFlight = false;
let lastAutoSyncAt = 0;
let priceCache = new Map();
let symbolQuoteCache = new Map();
let lastPriceFetch = 0;
const PRICE_CACHE_TTL = 30000;
const SYMBOL_QUOTE_CACHE_TTL = 300000;
const THEME_KEY = "shubhledger_dashboard_theme";
const WALLET_KEY = "shubhledger_dashboard_wallet";
const API_BASE = (() => {
  if (window.location.port !== "5500") return "api";
  const firstSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";
  const projectRoot = firstSegment && !firstSegment.includes(".") ? firstSegment : "ShubhLedger";
  return `http://localhost/${projectRoot}/api`;
})();
const WALLET_REFRESH_MS = 120000;
const WALLET_SYNC_MS = 900000;
const MIN_TOKEN_VALUE = 0.01;

const coingeckoIdMap = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  OP: "optimism",
  ARB: "arbitrum",
  AVAX: "avalanche-2",
  ATOM: "cosmos",
  USDT: "tether",
  USDC: "usd-coin",
  DAI: "dai",
  MATIC: "polygon-ecosystem-token",
  POL: "polygon-ecosystem-token",
  WETH: "ethereum",
  WBNB: "binancecoin",
  WMATIC: "polygon-ecosystem-token",
  WPOL: "polygon-ecosystem-token"
};

const coingeckoPlatformMap = {
  eth: "ethereum",
  bsc: "binance-smart-chain",
  arbitrum: "arbitrum-one",
  base: "base",
  optimism: "optimism",
  polygon: "polygon-pos"
};

const wrappedNativeByChain = {
  eth: { platform: "ethereum", address: "0xc02aa39b223fe8d0a0e5c4f27ead9083c756cc2" },
  bsc: { platform: "binance-smart-chain", address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c" },
  polygon: { platform: "polygon-pos", address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" },
  arbitrum: { platform: "arbitrum-one", address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" },
  optimism: { platform: "optimism", address: "0x4200000000000000000000000000000000000006" },
  base: { platform: "base", address: "0x4200000000000000000000000000000000000006" }
};

function setText(node, value) {
  if (node) node.textContent = value;
}

function isNativePlaceholder(address) {
  const a = String(address || "").toLowerCase();
  return a === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" ||
    a === "0x0000000000000000000000000000000000001010";
}

function isValidContractAddress(address) {
  const a = String(address || "").toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(a) &&
    a !== "0x0000000000000000000000000000000000000000" &&
    a !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" &&
    a !== "0x0000000000000000000000000000000000001010";
}

function toShortAddress(address) {
  const text = String(address || "");
  if (text.length <= 16) return text;
  return `${text.slice(0, 8)}...${text.slice(-6)}`;
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
    themeToggleBtnEls.forEach((btn) => setText(btn, "Light Mode"));
    return;
  }

  root.removeAttribute("data-theme");
  themeToggleBtnEls.forEach((btn) => setText(btn, "Dark Mode"));
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch (_error) {
    // Ignore localStorage read issues and fallback to system preference.
  }

  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function drawGrid() {
  if (!gridGroupEl) return;
  gridGroupEl.innerHTML = "";
  [18, 34, 50, 66, 82].forEach((y) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "0");
    line.setAttribute("x2", "100");
    line.setAttribute("y1", String(y));
    line.setAttribute("y2", String(y));
    line.setAttribute("class", "grid-line");
    gridGroupEl.appendChild(line);
  });
}

function normalizeTrend(values) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const spread = Math.max(1, max - min);
  const step = 100 / (values.length - 1);

  return values.map((value, index) => {
    const x = index * step;
    const y = 88 - ((value - min) / spread) * 68;
    return { x, y };
  });
}

function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

function renderTrend(values) {
  if (!areaPathEl || !linePathEl || !pointGroupEl || !latestPointEl) return;

  const points = normalizeTrend(values);
  const line = smoothPath(points);
  const area = `${line} L 100 96 L 0 96 Z`;

  drawGrid();
  linePathEl.setAttribute("d", line);
  areaPathEl.setAttribute("d", area);

  pointGroupEl.innerHTML = "";
  points.forEach((point) => {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", point.x.toFixed(2));
    dot.setAttribute("cy", point.y.toFixed(2));
    dot.setAttribute("r", "0.55");
    dot.setAttribute("fill", "#6ecdfc");
    pointGroupEl.appendChild(dot);
  });

  const latest = points[points.length - 1];
  latestPointEl.setAttribute("cx", latest.x.toFixed(2));
  latestPointEl.setAttribute("cy", latest.y.toFixed(2));
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPercent(value) {
  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

function parseMoney(value) {
  const n = Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parsePercent(value) {
  const n = Number(String(value || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function getCurrentWalletAddress() {
  try {
    const saved = localStorage.getItem(WALLET_KEY);
    if (saved) return saved;
  } catch (_error) {
    // Ignore localStorage read issues.
  }
  const text = walletTriggerEl?.textContent?.trim() || "";
  return text && text !== "Connect Wallet" ? text : "";
}

function renderAxis(labels) {
  if (!axisEl) return;
  axisEl.innerHTML = "";
  labels.forEach((label) => {
    const span = document.createElement("span");
    span.textContent = label;
    axisEl.appendChild(span);
  });
}

function renderTokenTable(tokens) {
  if (!tokenListEl) return;
  tokenListEl.innerHTML = "";

  const head = document.createElement("div");
  head.className = "token-row token-head";
  head.innerHTML = "<span>Token</span><span>Chain</span><span>Balance</span><span>Price</span><span>Value</span><span>24h</span>";
  tokenListEl.appendChild(head);

  if (!tokens.length) {
    const empty = document.createElement("div");
    empty.className = "token-row token-empty";
    empty.textContent = "No wallet tokens found for the latest snapshot.";
    tokenListEl.appendChild(empty);
    return;
  }

  tokens.forEach((token) => {
    const row = document.createElement("div");
    row.className = "token-row";
    row.innerHTML = `
      <span class="token-symbol">${token.symbol}</span>
      <span class="token-chain">${token.chain || "-"}</span>
      <span>${token.balance}</span>
      <span>${token.price}</span>
      <span>${token.value}</span>
      <span class="${token.change.startsWith("-") ? "down" : "good"}">${token.change}</span>
    `;
    tokenListEl.appendChild(row);
  });
}

function renderTicker(items) {
  [tokenTickerRowEl, tokenTickerRowCloneEl].forEach((row) => {
    if (!row) return;
    row.innerHTML = "";
    const repeated = [...items, ...items];
    repeated.forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "ticker-chip";
      const symbol = item.split(" ")[0];

      const logo = document.createElement("img");
      logo.className = "ticker-logo";
      logo.alt = `${symbol} logo`;
      logo.loading = "lazy";
      logo.src = tokenLogoMap[symbol] || "";
      logo.onerror = () => {
        logo.remove();
        chip.classList.add("ticker-chip--fallback");
      };

      const label = document.createElement("span");
      label.className = "ticker-label";
      label.textContent = item;

      chip.appendChild(logo);
      chip.appendChild(label);
      row.appendChild(chip);
    });
  });
}

function render(range) {
  currentRange = range;
  const isConnected = connected || Boolean(getCurrentWalletAddress());
  if (isConnected && !liveData) {
    const hasRenderedTable = tokenListEl && tokenListEl.childElementCount > 0;
    if (!hasRenderedTable) {
      const fallback = dataByRange[range];
      if (fallback) {
        setText(totalValueEl, fallback.total);
        setText(totalDeltaEl, fallback.totalDelta);
        setText(pnlValueEl, fallback.pnl);
        setText(pnlDeltaEl, fallback.pnlDelta);
        const lead = fallback.tokens[0];
        setText(focusTokenEl, lead ? `${lead.symbol} ${lead.change}` : "-");
        renderAxis(fallback.axis);
        renderTrend(fallback.trend);
        renderTokenTable(fallback.tokens);
        renderTicker(fallback.ticker);
      }
    }
    setText(tokensMetaEl, walletLoadInFlight ? "Refreshing wallet data..." : "Fetching wallet data...");
    return;
  }

  const data = isConnected && liveData ? liveData : dataByRange[range];
  if (!data) return;

  setText(totalValueEl, data.total);
  setText(totalDeltaEl, data.totalDelta);
  setText(pnlValueEl, data.pnl);
  setText(pnlDeltaEl, data.pnlDelta);

  const lead = data.tokens[0];
  setText(focusTokenEl, lead ? `${lead.symbol} ${lead.change}` : "-");
  setText(tokensMetaEl, isConnected ? `${data.tokens.length} tokens synced` : `${data.tokens.length} wallet tokens`);

  renderAxis(data.axis);
  renderTrend(data.trend);
  renderTokenTable(data.tokens);
  renderTicker(data.ticker);
}

function setRangeButtons(active) {
  document.querySelectorAll(".range-btn").forEach((btn) => {
    const on = btn.dataset.range === active;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-selected", on ? "true" : "false");
  });
}

document.querySelectorAll(".range-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    setRangeButtons(btn.dataset.range);
    render(btn.dataset.range);
  });
});

function setWalletDropdown(open) {
  if (!walletMenuEl || !walletTriggerEl || !walletDropdownEl) return;
  const shouldOpen = Boolean(open && connected);
  walletMenuEl.classList.toggle("is-open", shouldOpen);
  walletTriggerEl.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
  walletDropdownEl.setAttribute("aria-hidden", shouldOpen ? "false" : "true");
}

async function fetchWalletTokens(address, forceRefresh = false) {
  try {
    const url = `${API_BASE}/latest_wallet.php?address=${encodeURIComponent(address)}${forceRefresh ? "&refresh=1" : ""}`;
    const response = await fetch(url, {
      cache: "no-store"
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      return { data: null, error: payload?.error || "request_failed" };
    }
    const json = await response.json();
    if (!json?.success) return { data: null, error: json?.error || "request_failed" };
    return { data: json, error: null };
  } catch (_error) {
    return { data: null, error: "request_failed" };
  }
}

function canonicalPriceSymbol(symbol, chain) {
  const s = String(symbol || "").toUpperCase();
  const c = String(chain || "").toLowerCase();
  if (s === "WETH") return "ETH";
  if (s === "WBNB") return "BNB";
  if (s === "WMATIC" || s === "WPOL") return "POL";
  if (s === "MATIC" && c === "polygon") return "POL";
  return s;
}

async function buildLiveDataFromBackend(payload) {
  const rawTokens = Array.isArray(payload?.tokens) ? payload.tokens : [];
  const prepared = rawTokens.map((token) => {
    const symbol = String(token?.symbol || "-").toUpperCase();
    const chain = String(token?.chain || "-").toUpperCase();
    const balance = Number(token?.balance || 0);
    const price = Number(token?.price || 0);
    const value = Number(token?.value || 0);
    const change = Number(token?.change || 0);
    return { symbol, chain, balance, price, value, change };
  });

  const symbolsNeeded = [
    ...new Set(
      prepared
        .filter((token) => !(Number.isFinite(token.price) && token.price > 0))
        .map((token) => canonicalPriceSymbol(token.symbol, token.chain))
        .filter((symbol) => Boolean(coingeckoIdMap[symbol]))
    )
  ];
  const symbolPrices = symbolsNeeded.length ? await fetchSymbolPrices(symbolsNeeded) : {};
  const previousTokenByKey = new Map(
    Array.isArray(liveData?.tokens)
      ? liveData.tokens.map((token) => [`${String(token.chain || "").toUpperCase()}|${String(token.symbol || "").toUpperCase()}`, token])
      : []
  );

  const tokens = prepared.map((token) => {
    const tokenKey = `${token.chain}|${token.symbol}`;
    const previous = previousTokenByKey.get(tokenKey);
    const canonical = canonicalPriceSymbol(token.symbol, token.chain);
    const id = coingeckoIdMap[canonical];
    const quote = id ? symbolPrices?.[id] : null;
    const previousPrice = previous ? parseMoney(previous.price) : 0;
    const previousChange = previous ? parsePercent(previous.change) : 0;
    const resolvedPrice = token.price > 0 ? token.price : Number(quote?.usd || previousPrice || 0);
    const resolvedChange = Number.isFinite(token.change) && token.change !== 0
      ? token.change
      : Number(quote?.usd_24h_change || previousChange || 0);
    const resolvedValue = resolvedPrice > 0
      ? token.balance * resolvedPrice
      : (token.value > 0 ? token.value : (previous ? parseMoney(previous.value) : 0));
    return {
      symbol: token.symbol,
      chain: token.chain,
      valueRaw: Number(resolvedValue || 0),
      changeRaw: Number(resolvedChange || 0),
      balance: token.balance.toFixed(4),
      price: formatMoney(resolvedPrice || 0),
      value: formatMoney(resolvedValue || 0),
      change: formatPercent(resolvedChange || 0)
    };
  }).filter((token) => Number(token.balance || 0) > 0);

  const totalValue = tokens.reduce((sum, t) => sum + Number(t.valueRaw || 0), 0);
  const totalDeltaValue = tokens.reduce((sum, t) => sum + (Number(t.valueRaw || 0) * Number(t.changeRaw || 0) / 100), 0);
  const totalDeltaPercent = totalValue > 0 ? (totalDeltaValue / totalValue) * 100 : 0;
  return {
    total: formatMoney(totalValue),
    totalDelta: `${formatPercent(totalDeltaPercent)} today`,
    pnl: formatMoney(totalDeltaValue),
    pnlDelta: "24h change",
    axis: dataByRange[currentRange].axis,
    trend: dataByRange[currentRange].trend,
    tokens,
    ticker: dataByRange[currentRange].ticker
  };
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function fetchTokenPriceByPlatform(platform, addresses) {
  const results = {};
  const chunks = chunkArray(addresses, 60);
  for (const chunk of chunks) {
    const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${encodeURIComponent(chunk.join(","))}&vs_currencies=usd&include_24hr_change=true`;
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const json = await response.json();
      if (json && typeof json === "object") {
        Object.assign(results, json);
      }
    } catch (_error) {
      // Ignore per-request failures.
    }
  }
  return results;
}

function makeCacheKey(chain, addressOrSymbol) {
  return `${chain}:${addressOrSymbol}`;
}

function readPriceCache(tokens) {
  if (!priceCache.size) return null;
  const now = Date.now();
  if (now - lastPriceFetch > PRICE_CACHE_TTL) return null;

  const addressPrices = {};
  const symbolPrices = {};

  tokens.forEach((token) => {
    const symbol = String(token.symbol || "").toUpperCase();
    const chainKey = String(token.chain || "").toLowerCase();
    const tokenAddress = String(token.token_address || "").toLowerCase();

    if (tokenAddress) {
      const key = makeCacheKey(chainKey, tokenAddress);
      if (priceCache.has(key)) {
        if (!addressPrices[chainKey]) addressPrices[chainKey] = {};
        addressPrices[chainKey][tokenAddress] = priceCache.get(key);
      }
    }

    if (symbol) {
      const key = makeCacheKey("symbol", symbol);
      if (priceCache.has(key)) {
        const id = coingeckoIdMap[symbol];
        if (id) symbolPrices[id] = priceCache.get(key);
      }
    }
  });

  return { addressPrices, symbolPrices };
}

function writePriceCache(priceMap) {
  lastPriceFetch = Date.now();

  Object.entries(priceMap.addressPrices || {}).forEach(([chain, values]) => {
    Object.entries(values || {}).forEach(([address, data]) => {
      priceCache.set(makeCacheKey(chain, address), data);
    });
  });

  Object.entries(priceMap.symbolPrices || {}).forEach(([id, data]) => {
    const symbol = Object.keys(coingeckoIdMap).find((key) => coingeckoIdMap[key] === id);
    if (symbol) {
      priceCache.set(makeCacheKey("symbol", symbol), data);
    }
  });
}

async function fetchSymbolPrices(symbols) {
  const ids = symbols
    .map((symbol) => coingeckoIdMap[symbol.toUpperCase()])
    .filter(Boolean);
  if (!ids.length) return {};

  const uniqueIds = [...new Set(ids)];
  const now = Date.now();
  const cached = {};
  const missingIds = [];
  uniqueIds.forEach((id) => {
    const cacheEntry = symbolQuoteCache.get(id);
    if (cacheEntry && (now - cacheEntry.at) <= SYMBOL_QUOTE_CACHE_TTL) {
      cached[id] = cacheEntry.quote;
    } else {
      missingIds.push(id);
    }
  });
  if (!missingIds.length) return cached;

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(missingIds.join(","))}&vs_currencies=usd&include_24hr_change=true`;
  try {
    const response = await fetch(url);
    if (!response.ok) return cached;
    const json = await response.json();
    const live = json && typeof json === "object" ? json : {};
    Object.entries(live).forEach(([id, quote]) => {
      if (quote && typeof quote === "object") {
        symbolQuoteCache.set(id, { quote, at: now });
      }
    });
    return { ...cached, ...live };
  } catch (_error) {
    return cached;
  }
}

async function fetchNativeChainPrices(chains) {
  const out = {};
  const uniqueChains = [...new Set(chains)];
  await Promise.all(uniqueChains.map(async (chain) => {
    const conf = wrappedNativeByChain[chain];
    if (!conf) return;
    const url = `https://api.coingecko.com/api/v3/simple/token_price/${conf.platform}?contract_addresses=${conf.address}&vs_currencies=usd`;
    try {
      const response = await fetch(url);
      if (!response.ok) return;
      const json = await response.json();
      out[chain] = Number(json?.[conf.address]?.usd || 0);
    } catch (_error) {
      out[chain] = 0;
    }
  }));
  return out;
}

async function fetchPrices(tokens) {
  const cached = readPriceCache(tokens);
  if (cached) return cached;

  const byAddress = {};
  const symbolList = [];
  const nativeSymbols = new Set();
  const nativeChains = new Set();

  tokens.forEach((token) => {
    const symbol = String(token.symbol || "").toUpperCase();
    const chain = String(token.chain || "").toLowerCase();
    const tokenAddress = String(token.token_address || "").toLowerCase();
    const platform = coingeckoPlatformMap[chain];
    if (isNativePlaceholder(tokenAddress)) {
      if (symbol) nativeSymbols.add(symbol);
      if (chain) nativeChains.add(chain);
      return;
    }

    if (tokenAddress && platform && isValidContractAddress(tokenAddress)) {
      if (!byAddress[chain]) byAddress[chain] = new Set();
      byAddress[chain].add(tokenAddress);
    } else if (symbol) {
      symbolList.push(symbol);
    }
  });

  const addressPrices = {};
  for (const [chain, addressSet] of Object.entries(byAddress)) {
    const platform = coingeckoPlatformMap[chain];
    if (!platform) continue;
    const addresses = Array.from(addressSet);
    if (!addresses.length) continue;
    addressPrices[chain] = await fetchTokenPriceByPlatform(platform, addresses);
  }

  const symbolPrices = await fetchSymbolPrices(symbolList);
  const nativeSymbolPrices = await fetchSymbolPrices([...nativeSymbols]);
  const nativeChainPrices = await fetchNativeChainPrices([...nativeChains]);

  const result = { addressPrices, symbolPrices, nativeSymbolPrices, nativeChainPrices };
  writePriceCache(result);
  return result;
}

function buildLiveData(tokens, priceMap) {
  const computed = tokens.map((token) => {
    const symbol = String(token.symbol || "-").toUpperCase();
    const chain = token.chain ? token.chain.toUpperCase() : "-";
    const chainKey = String(token.chain || "").toLowerCase();
    const tokenAddress = String(token.token_address || "").toLowerCase();
    const balance = Number(token.balance || 0);
    const addressPrice = priceMap.addressPrices?.[chainKey]?.[tokenAddress];
    const symbolId = coingeckoIdMap[symbol];
    const symbolPrice = symbolId ? priceMap.symbolPrices?.[symbolId] : null;
    const nativeSymbolPrice = symbolId ? priceMap.nativeSymbolPrices?.[symbolId] : null;

    const isNative = isNativePlaceholder(tokenAddress);
    const nativeChainPrice = Number(priceMap.nativeChainPrices?.[chainKey] || 0);

    const price = isNative
      ? (nativeChainPrice > 0 ? nativeChainPrice : (nativeSymbolPrice?.usd ?? symbolPrice?.usd ?? 0))
      : (addressPrice?.usd ?? symbolPrice?.usd ?? 0);
    const change = isNative
      ? (nativeSymbolPrice?.usd_24h_change ?? symbolPrice?.usd_24h_change ?? 0)
      : (addressPrice?.usd_24h_change ?? symbolPrice?.usd_24h_change ?? 0);
    const value = balance * price;
    return {
      symbol,
      chain,
      balance,
      price,
      change,
      value
    };
  }).filter((token) =>
    Number.isFinite(token.price) &&
    Number.isFinite(token.value) &&
    token.price > 0 &&
    token.value >= MIN_TOKEN_VALUE
  )
    .sort((a, b) => b.value - a.value);

  const totalValue = computed.reduce((sum, token) => sum + token.value, 0);
  const totalDeltaValue = computed.reduce((sum, token) => sum + (token.value * (token.change / 100)), 0);
  const totalDeltaPercent = totalValue > 0 ? (totalDeltaValue / totalValue) * 100 : 0;

  const formattedTokens = computed.map((token) => ({
    symbol: token.symbol,
    chain: token.chain,
    balance: Number(token.balance).toFixed(4),
    price: formatMoney(token.price || 0),
    value: formatMoney(token.value || 0),
    change: formatPercent(token.change || 0)
  }));

  return {
    total: formatMoney(totalValue),
    totalDelta: `${formatPercent(totalDeltaPercent)} today`,
    pnl: formatMoney(totalDeltaValue),
    pnlDelta: "24h change",
    axis: dataByRange[currentRange].axis,
    trend: dataByRange[currentRange].trend,
    tokens: formattedTokens,
    ticker: dataByRange[currentRange].ticker
  };
}

async function loadWalletData(options = {}) {
  const { forceRefresh = false } = options;
  if (!connected) return;
  if (walletLoadInFlight && !forceRefresh) return;
  const address = getCurrentWalletAddress();
  if (!address) return;
  const loadVersion = ++walletLoadVersion;
  walletLoadInFlight = true;
  try {
    const result = await fetchWalletTokens(address, forceRefresh);
    if (loadVersion !== walletLoadVersion || !connected) return;
    if (result?.error === "no_snapshot" && !didInitialSync) {
      didInitialSync = true;
      const ok = await syncWalletSnapshot(address);
      if (ok) {
        const retry = await fetchWalletTokens(address, true);
        if (loadVersion !== walletLoadVersion || !connected) return;
        if (retry?.data) {
          const retryTokens = Array.isArray(retry.data.tokens) ? retry.data.tokens : [];
          lastTokens = retryTokens;
          const nextLiveData = await buildLiveDataFromBackend(retry.data);
          if (nextLiveData.tokens.length || !liveData) {
            liveData = nextLiveData;
          }
          render(currentRange);
        }
        return;
      }
    }

    const payload = result?.data || null;
    if (!payload) return;
    const tokens = Array.isArray(payload.tokens) ? payload.tokens : [];
    lastTokens = tokens;
    const nextLiveData = await buildLiveDataFromBackend(payload);
    if (nextLiveData.tokens.length || !liveData) {
      liveData = nextLiveData;
    }
    render(currentRange);
  } finally {
    walletLoadInFlight = false;
  }
}

async function syncWalletSnapshot(address) {
  try {
    const response = await fetch(`${API_BASE}/sync_wallet.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ wallet_address: address })
    });
    if (!response.ok) {
      console.error("Wallet sync failed:", response.status, response.statusText);
      return false;
    }
    const json = await response.json();
    if (!json?.success) {
      console.error("Wallet sync failed:", json);
    }
    return Boolean(json?.success);
  } catch (error) {
    console.error("Wallet sync request error:", error);
    return false;
  }
}

function startAutoRefresh() {
  if (autoRefreshId) return;
  autoRefreshId = window.setInterval(async () => {
    if (!connected) return;
    if (walletLoadInFlight) return;
    const now = Date.now();
    const shouldSync = now - lastAutoSyncAt >= WALLET_SYNC_MS;
    if (shouldSync) {
      const address = getCurrentWalletAddress();
      if (address) {
        const ok = await syncWalletSnapshot(address);
        if (ok) lastAutoSyncAt = now;
        await loadWalletData({ forceRefresh: true });
        return;
      }
    }
    await loadWalletData({ forceRefresh: false });
  }, WALLET_REFRESH_MS);
}

function stopAutoRefresh() {
  if (!autoRefreshId) return;
  window.clearInterval(autoRefreshId);
  autoRefreshId = null;
}

function setWallet(connectedState, address = "") {
  connected = connectedState;
  walletLoadVersion += 1;
  walletLoadInFlight = false;
  lastAutoSyncAt = 0;
  didInitialSync = false;
  lastTokens = null;
  walletBtnEls.forEach((btn) => {
    if (btn.classList.contains("wallet-trigger")) {
      btn.textContent = connected ? toShortAddress(address) : "Connect Wallet";
      btn.title = connected ? address : "Connect Wallet";
      return;
    }

    btn.textContent = "Connect Wallet";
    btn.style.display = connected ? "none" : "inline-flex";
  });
  walletAddressEls.forEach((el) => {
    el.textContent = connected ? address : "";
    el.style.display = connected ? "block" : "none";
  });
  if (walletStateEl) {
    walletStateEl.textContent = connected ? "Connected" : "Not connected";
  }
  walletLogoutBtnEls.forEach((btn) => {
    btn.style.display = connected ? "inline-flex" : "none";
  });
  setWalletDropdown(false);
  try {
    if (connected) {
      localStorage.setItem(WALLET_KEY, address);
      startAutoRefresh();
      loadWalletData({ forceRefresh: false });
    } else {
      localStorage.removeItem(WALLET_KEY);
      liveData = null;
      stopAutoRefresh();
    }
  } catch (_error) {
    // Ignore localStorage write issues.
  }

  if (connectOverlayEl) {
    connectOverlayEl.classList.toggle("is-active", !connected);
    connectOverlayEl.setAttribute("aria-hidden", connected ? "true" : "false");
  }
}

async function connectMetaMask() {
  if (!window.ethereum?.request) {
    alert("MetaMask not detected. Please install MetaMask to connect.");
    return "";
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const account = accounts && accounts[0] ? accounts[0] : "";
    if (!account) {
      alert("No wallet account found.");
      return "";
    }
    setWallet(true, account);
    return account;
  } catch (_error) {
    alert("Wallet connection request was rejected.");
    return "";
  }
}

walletBtnEls.forEach((btn) => {
  btn.addEventListener("click", async () => {
    if (!connected) {
      const provider = btn.dataset.wallet;
      if (!provider || provider === "metamask") {
        await connectMetaMask();
        return;
      }
      await connectMetaMask();
      return;
    }

    if (btn.classList.contains("wallet-trigger")) {
      const open = !walletMenuEl?.classList.contains("is-open");
      setWalletDropdown(open);
    }
  });
});

walletLogoutBtnEls.forEach((btn) => {
  btn.addEventListener("click", () => {
    setWallet(false);
    render(currentRange);
  });
});

document.addEventListener("click", (event) => {
  if (!walletMenuEl || !walletMenuEl.classList.contains("is-open")) return;
  if (!walletMenuEl.contains(event.target)) {
    setWalletDropdown(false);
  }
});


themeToggleBtnEls.forEach((btn) => {
  btn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    applyTheme(nextTheme);
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch (_error) {
      // Ignore localStorage write issues.
    }
  });
});

setRangeButtons("1d");
applyTheme(getInitialTheme());
render("1d");

try {
  const savedWallet = localStorage.getItem(WALLET_KEY);
  if (savedWallet && window.ethereum?.request) {
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      const account = accounts && accounts[0] ? accounts[0] : "";
      if (account && account.toLowerCase() === savedWallet.toLowerCase()) {
        setWallet(true, account);
      } else {
        setWallet(false);
      }
    }).catch(() => {
      setWallet(false);
    });
  } else {
    setWallet(false);
  }
} catch (_error) {
  setWallet(false);
}

if (connectOverlayEl) {
  connectOverlayEl.classList.toggle("is-active", !connected);
  connectOverlayEl.setAttribute("aria-hidden", connected ? "true" : "false");
}

if (syncWalletBtnEl) {
  syncWalletBtnEl.addEventListener("click", async () => {
    let address = getCurrentWalletAddress();
    if (!address) {
      const connectedAddress = await connectMetaMask();
      if (!connectedAddress) return;
      address = connectedAddress;
    }
    syncWalletBtnEl.disabled = true;
    syncWalletBtnEl.textContent = "Syncing...";
    const ok = await syncWalletSnapshot(address);
    if (ok) {
      lastAutoSyncAt = Date.now();
    }
    if (connected) {
      await loadWalletData({ forceRefresh: true });
    }
    syncWalletBtnEl.textContent = ok ? "Sync Wallet" : "Sync Failed";
    setTimeout(() => {
      syncWalletBtnEl.textContent = "Sync Wallet";
      syncWalletBtnEl.disabled = false;
    }, 1500);
  });
}

if (navToggleBtnEl && siteHeaderEl) {
  navToggleBtnEl.addEventListener("click", () => {
    const isOpen = siteHeaderEl.classList.toggle("nav-open");
    navToggleBtnEl.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navToggleBtnEl.textContent = isOpen ? "Close" : "Menu";
  });
}
