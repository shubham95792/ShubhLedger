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
const themeToggleBtnEls = document.querySelectorAll(".theme-toggle");
const navToggleBtnEl = document.getElementById("navToggleBtn");
const siteHeaderEl = document.querySelector(".site-header");

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
const THEME_KEY = "tejam_dashboard_theme";
const WALLET_KEY = "tejam_dashboard_wallet";
const WALLET_FALLBACK = "0x7788...0052";

function setText(node, value) {
  if (node) node.textContent = value;
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
  head.innerHTML = "<span>Token</span><span>Balance</span><span>Price</span><span>Value</span><span>24h</span>";
  tokenListEl.appendChild(head);

  tokens.forEach((token) => {
    const row = document.createElement("div");
    row.className = "token-row";
    row.innerHTML = `
      <span class="token-symbol">${token.symbol}</span>
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
  const data = dataByRange[range];
  if (!data) return;

  setText(totalValueEl, data.total);
  setText(totalDeltaEl, data.totalDelta);
  setText(pnlValueEl, data.pnl);
  setText(pnlDeltaEl, data.pnlDelta);

  const lead = data.tokens[0];
  setText(focusTokenEl, `${lead.symbol} ${lead.change}`);
  setText(tokensMetaEl, connected ? `${data.tokens.length} tokens synced` : `${data.tokens.length} wallet tokens`);

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

function setWallet(connectedState, address = "") {
  connected = connectedState;
  walletBtnEls.forEach((btn) => {
    if (btn.classList.contains("wallet-trigger")) {
      btn.textContent = connected ? address : "Connect Wallet";
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
    } else {
      localStorage.removeItem(WALLET_KEY);
    }
  } catch (_error) {
    // Ignore localStorage write issues.
  }
}

walletBtnEls.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (!connected) {
      setWallet(true, WALLET_FALLBACK);
      render(currentRange);
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
  if (savedWallet) {
    setWallet(true, savedWallet);
  } else {
    setWallet(false);
  }
} catch (_error) {
  setWallet(false);
}

if (navToggleBtnEl && siteHeaderEl) {
  navToggleBtnEl.addEventListener("click", () => {
    const isOpen = siteHeaderEl.classList.toggle("nav-open");
    navToggleBtnEl.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navToggleBtnEl.textContent = isOpen ? "Close" : "Menu";
  });
}
