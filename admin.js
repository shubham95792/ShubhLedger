const walletsCountEl = document.getElementById("walletsCount");
const snapshotsCountEl = document.getElementById("snapshotsCount");
const tokenRowsCountEl = document.getElementById("tokenRowsCount");
const aggregateBalanceEl = document.getElementById("aggregateBalance");
const walletTableBodyEl = document.getElementById("walletTableBody");
const tokenTableBodyEl = document.getElementById("tokenTableBody");
const snapshotTableBodyEl = document.getElementById("snapshotTableBody");
const walletTokensTemplateEl = document.getElementById("walletTokensTemplate");
const walletFilterInputEl = document.getElementById("walletFilterInput");
const refreshBtnEl = document.getElementById("refreshBtn");
const userReportBtnEl = document.getElementById("userReportBtn");
const tokenReportBtnEl = document.getElementById("tokenReportBtn");
const lastUpdatedEl = document.getElementById("lastUpdated");

const API_BASE = (() => {
  if (window.location.port !== "5500") return "api";
  const firstSegment = window.location.pathname.split("/").filter(Boolean)[0] || "";
  const projectRoot = firstSegment && !firstSegment.includes(".") ? firstSegment : "ShubhLedger";
  return `http://localhost/${projectRoot}/api`;
})();

let adminData = {
  summary: {
    wallets_count: 0,
    snapshots_count: 0,
    token_rows_count: 0,
    aggregate_value: 0
  },
  wallets: [],
  snapshots: []
};

let stats = {
  totalTokens: 0,
  safeTokens: 0
};
const ENRICH_CACHE_KEY = "shubhledger_admin_enrich_cache_v1";
const ENRICH_CACHE_TTL_MS = 120000;

const coingeckoPlatformMap = {
  eth: "ethereum",
  bsc: "binance-smart-chain",
  arbitrum: "arbitrum-one",
  base: "base",
  optimism: "optimism",
  polygon: "polygon-pos"
};

const goplusChainMap = {
  eth: "1",
  bsc: "56",
  polygon: "137",
  arbitrum: "42161",
  optimism: "10",
  base: "8453"
};

const wrappedNativeByChain = {
  eth: { platform: "ethereum", address: "0xc02aa39b223fe8d0a0e5c4f27ead9083c756cc2" },
  bsc: { platform: "binance-smart-chain", address: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c" },
  polygon: { platform: "polygon-pos", address: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" },
  arbitrum: { platform: "arbitrum-one", address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1" },
  optimism: { platform: "optimism", address: "0x4200000000000000000000000000000000000006" },
  base: { platform: "base", address: "0x4200000000000000000000000000000000000006" }
};

const nativeSymbolToCoinIds = {
  ETH: ["ethereum"],
  BNB: ["binancecoin"],
  MATIC: ["polygon-ecosystem-token", "matic-network"],
  POL: ["polygon-ecosystem-token", "matic-network"]
};

function fmtNumber(value, maxDigits = 4) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDigits
  });
}

function fmtDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function setStatus(text, isError = false) {
  if (!lastUpdatedEl) return;
  lastUpdatedEl.textContent = text;
  lastUpdatedEl.classList.toggle("ok", !isError);
}

function createCell(text, className = "") {
  const td = document.createElement("td");
  td.textContent = text;
  if (className) td.className = className;
  return td;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function mapWithConcurrency(items, limit, mapper) {
  const out = new Array(items.length);
  let index = 0;
  const workers = Array.from({ length: Math.max(1, limit) }, async () => {
    while (index < items.length) {
      const current = index;
      index += 1;
      out[current] = await mapper(items[current], current);
    }
  });
  await Promise.all(workers);
  return out;
}

function getOverviewFingerprint(data) {
  const wallets = Array.isArray(data?.wallets) ? data.wallets : [];
  const snapshots = Array.isArray(data?.snapshots) ? data.snapshots : [];
  const walletKeys = wallets
    .map((w) => `${String(w.wallet_address || "").toLowerCase()}:${Number(w.snapshot_id || 0)}`)
    .sort();
  const snapshotKeys = snapshots
    .map((s) => `${Number(s.id || 0)}:${Number(s.token_count || 0)}`)
    .sort();
  return `${walletKeys.join("|")}||${snapshotKeys.join("|")}`;
}

function readEnrichCache(fingerprint) {
  try {
    const raw = localStorage.getItem(ENRICH_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (String(parsed.fingerprint || "") !== String(fingerprint || "")) return null;
    const ts = Number(parsed.ts || 0);
    if (!Number.isFinite(ts) || Date.now() - ts > ENRICH_CACHE_TTL_MS) return null;
    if (!parsed.adminData || !parsed.stats) return null;
    return parsed;
  } catch (_error) {
    return null;
  }
}

function writeEnrichCache(fingerprint, data, currentStats) {
  try {
    const payload = {
      ts: Date.now(),
      fingerprint,
      adminData: data,
      stats: currentStats
    };
    localStorage.setItem(ENRICH_CACHE_KEY, JSON.stringify(payload));
  } catch (_error) {
    // Ignore cache write issues.
  }
}

function isValidContractAddress(address) {
  const a = String(address || "").toLowerCase();
  return /^0x[a-f0-9]{40}$/.test(a) &&
    a !== "0x0000000000000000000000000000000000000000" &&
    a !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" &&
    a !== "0x0000000000000000000000000000000000001010";
}

function isNativePlaceholder(address) {
  const a = String(address || "").toLowerCase();
  return a === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" ||
    a === "0x0000000000000000000000000000000000001010";
}

function rowsForTokenReport() {
  const rows = [];
  adminData.wallets.forEach((wallet) => {
    (wallet.tokens || []).forEach((token) => {
      rows.push({
        wallet_address: wallet.wallet_address,
        snapshot_id: wallet.snapshot_id,
        snapshot_at: wallet.snapshot_at,
        chain: token.chain,
        symbol: token.symbol,
        token_address: token.token_address || "",
        balance: token.balance,
        value: token.value || 0,
        token_status: token.token_status || "RISKY / FAKE"
      });
    });
  });
  rows.sort((a, b) => {
    const aSafe = a.token_status === "REAL / SAFE" ? 1 : 0;
    const bSafe = b.token_status === "REAL / SAFE" ? 1 : 0;
    if (aSafe !== bSafe) return bSafe - aSafe;
    return Number(b.value || 0) - Number(a.value || 0);
  });
  return rows;
}

async function fetchCoinGeckoByContracts(chain, addresses) {
  const platform = coingeckoPlatformMap[chain];
  if (!platform || !addresses.length) return {};

  const out = {};
  const chunks = chunkArray(addresses, 60);
  const results = await Promise.all(chunks.map(async (chunk) => {
    const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${encodeURIComponent(chunk.join(","))}&vs_currencies=usd&include_market_cap=true`;
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const json = await response.json();
      return json && typeof json === "object" ? json : null;
    } catch (_error) {
      return null;
    }
  }));

  results.forEach((json) => {
    if (!json || typeof json !== "object") return;
    Object.entries(json).forEach(([contract, payload]) => {
      out[String(contract).toLowerCase()] = {
        listedOnCoinGecko: true,
        price: Number(payload?.usd || 0),
        marketCap: Number(payload?.usd_market_cap || 0)
      };
    });
  });

  return out;
}

async function fetchGoPlusSecurity(chain, addresses) {
  const chainId = goplusChainMap[chain];
  if (!chainId || !addresses.length) return {};

  const out = {};
  const chunks = chunkArray(addresses, 50);
  const results = await Promise.all(chunks.map(async (chunk) => {
    const url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${encodeURIComponent(chunk.join(","))}`;
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const json = await response.json();
      const result = json?.result && typeof json.result === "object" ? json.result : {};
      return result;
    } catch (_error) {
      return null;
    }
  }));

  results.forEach((result) => {
    if (!result || typeof result !== "object") return;
    Object.entries(result).forEach(([contract, payload]) => {
      out[String(contract).toLowerCase()] = {
        contractVerified: String(payload?.is_open_source || "0") === "1",
        holders: Number(payload?.holder_count || 0)
      };
    });
  });

  return out;
}

async function fetchDexData(contractAddress) {
  const url = `https://api.dexscreener.com/latest/dex/tokens/${encodeURIComponent(contractAddress)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return { liquidity: 0, price: 0 };
    const json = await response.json();
    const pairs = Array.isArray(json?.pairs) ? json.pairs : [];
    let maxLiquidity = 0;
    let bestPrice = 0;
    pairs.forEach((pair) => {
      const usd = Number(pair?.liquidity?.usd || 0);
      if (usd > maxLiquidity) {
        maxLiquidity = usd;
        bestPrice = Number(pair?.priceUsd || 0);
      }
    });
    return { liquidity: maxLiquidity, price: bestPrice };
  } catch (_error) {
    return { liquidity: 0, price: 0 };
  }
}

async function fetchNativeSymbolPrices(symbols) {
  const ids = [...new Set(
    symbols
      .flatMap((s) => nativeSymbolToCoinIds[String(s || "").toUpperCase()] || [])
      .filter(Boolean)
  )];
  if (!ids.length) return {};
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd`;
  try {
    const response = await fetch(url);
    if (!response.ok) return {};
    const json = await response.json();
    const bySymbol = {};
    Object.entries(nativeSymbolToCoinIds).forEach(([symbol, symbolIds]) => {
      let price = 0;
      for (const id of symbolIds) {
        const maybe = Number(json?.[id]?.usd || 0);
        if (maybe > 0) {
          price = maybe;
          break;
        }
      }
      bySymbol[symbol] = price;
    });

    // Fallback: CoinGecko ID for POL/MATIC may be empty; use Polygon wrapped-native contract quote.
    const needPolygonFallback = (symbols.includes("POL") || symbols.includes("MATIC")) &&
      Number(bySymbol.POL || 0) <= 0 &&
      Number(bySymbol.MATIC || 0) <= 0;
    if (needPolygonFallback) {
      try {
        const wrappedMatic = "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
        const fallbackUrl = `https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=${wrappedMatic}&vs_currencies=usd`;
        const fallbackResp = await fetch(fallbackUrl);
        if (fallbackResp.ok) {
          const fallbackJson = await fallbackResp.json();
          const fallbackPrice = Number(fallbackJson?.[wrappedMatic]?.usd || 0);
          if (fallbackPrice > 0) {
            if (symbols.includes("POL")) bySymbol.POL = fallbackPrice;
            if (symbols.includes("MATIC")) bySymbol.MATIC = fallbackPrice;
          }
        }
      } catch (_error) {
        // Ignore fallback errors.
      }
    }

    // Secondary fallback by symbol ticker (Binance public API)
    const binancePairBySymbol = {
      ETH: "ETHUSDT",
      BNB: "BNBUSDT",
      MATIC: "POLUSDT",
      POL: "POLUSDT"
    };
    await Promise.all(symbols.map(async (symbolRaw) => {
      const symbol = String(symbolRaw || "").toUpperCase();
      if (Number(bySymbol[symbol] || 0) > 0) return;
      const pair = binancePairBySymbol[symbol];
      if (!pair) return;
      try {
        const tickerUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`;
        const tickerResp = await fetch(tickerUrl);
        if (!tickerResp.ok) return;
        const tickerJson = await tickerResp.json();
        const p = Number(tickerJson?.price || 0);
        if (p > 0) bySymbol[symbol] = p;
      } catch (_error) {
        // Ignore fallback errors.
      }
    }));

    return bySymbol;
  } catch (_error) {
    // If primary provider fails entirely, fallback to Binance ticker by symbol.
    const out = {};
    const binancePairBySymbol = {
      ETH: "ETHUSDT",
      BNB: "BNBUSDT",
      MATIC: "POLUSDT",
      POL: "POLUSDT"
    };
    await Promise.all(symbols.map(async (symbolRaw) => {
      const symbol = String(symbolRaw || "").toUpperCase();
      const pair = binancePairBySymbol[symbol];
      if (!pair) return;
      try {
        const tickerUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${pair}`;
        const tickerResp = await fetch(tickerUrl);
        if (!tickerResp.ok) return;
        const tickerJson = await tickerResp.json();
        const p = Number(tickerJson?.price || 0);
        if (p > 0) out[symbol] = p;
      } catch (_error2) {
        // Ignore fallback errors.
      }
    }));
    return out;
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

async function buildSafetyLookup(tokens) {
  const byChain = {};
  const nativeSymbols = new Set();
  const nativeChains = new Set();
  tokens.forEach((token) => {
    const chain = String(token.chain || "").toLowerCase();
    const address = String(token.token_address || "").toLowerCase();
    if (isNativePlaceholder(address)) {
      nativeSymbols.add(String(token.symbol || "").toUpperCase());
      nativeChains.add(chain);
    }
    if (!isValidContractAddress(address)) return;
    if (!byChain[chain]) byChain[chain] = new Set();
    byChain[chain].add(address);
  });

  const cgByChain = {};
  const gpByChain = {};
  await Promise.all(Object.entries(byChain).map(async ([chain, set]) => {
    const addresses = [...set];
    const [cg, gp] = await Promise.all([
      fetchCoinGeckoByContracts(chain, addresses),
      fetchGoPlusSecurity(chain, addresses)
    ]);
    cgByChain[chain] = cg;
    gpByChain[chain] = gp;
  }));

  const allAddresses = Object.values(byChain).flatMap((set) => [...set]);
  const dexByAddress = {};
  const dexResults = await mapWithConcurrency(allAddresses, 12, async (address) => {
    const value = await fetchDexData(address);
    return { address, value };
  });
  dexResults.forEach((entry) => {
    if (!entry) return;
    dexByAddress[entry.address] = entry.value;
  });

  const nativePriceBySymbol = await fetchNativeSymbolPrices([...nativeSymbols]);
  const nativePriceByChain = await fetchNativeChainPrices([...nativeChains]);

  return { cgByChain, gpByChain, dexByAddress, nativePriceBySymbol, nativePriceByChain };
}

async function enrichValues(data) {
  const allTokens = data.wallets.flatMap((w) => w.tokens || []);
  const safetyLookup = await buildSafetyLookup(allTokens);

  stats = {
    totalTokens: 0,
    safeTokens: 0
  };

  const snapshotValueById = new Map();
  let aggregateValue = 0;

  data.wallets.forEach((wallet) => {
    let walletValue = 0;

    (wallet.tokens || []).forEach((token) => {
      stats.totalTokens += 1;

      const chain = String(token.chain || "").toLowerCase();
      const address = String(token.token_address || "").toLowerCase();
      const balance = Number(token.balance || 0);
      const symbol = String(token.symbol || "").toUpperCase();

      if (isNativePlaceholder(address)) {
        const chainNativePrice = Number(safetyLookup.nativePriceByChain?.[chain] || 0);
        const symbolNativePrice = Number(safetyLookup.nativePriceBySymbol?.[symbol] || 0);
        const nativePrice = chainNativePrice > 0 ? chainNativePrice : symbolNativePrice;
        token.price = nativePrice;
        token.balance = balance;
        token.value = nativePrice > 0 ? balance * nativePrice : 0;
        token.token_status = "REAL / SAFE";
        token.holders = 0;
        token.liquidity = 0;
        token.market_cap = 0;
        walletValue += token.value;
        stats.safeTokens += 1;
        return;
      }

      const validAddress = isValidContractAddress(address);
      const cg = safetyLookup.cgByChain?.[chain]?.[address];
      const gp = safetyLookup.gpByChain?.[chain]?.[address];
      const dex = safetyLookup.dexByAddress?.[address] || { liquidity: 0, price: 0 };
      const liquidity = Number(dex.liquidity || 0);

      const listedOnCoinGecko = Boolean(cg?.listedOnCoinGecko);
      const listedOnCoinMarketCap = false;
      const contractVerified = Boolean(gp?.contractVerified);
      const holders = Number(gp?.holders || 0);
      const marketCap = Number(cg?.marketCap || 0);
      const cgPrice = Number(cg?.price || 0);
      const dexPrice = Number(dex.price || 0);
      const price = cgPrice > 0 ? cgPrice : dexPrice;

      const isSafe = Boolean(
        validAddress &&
        (listedOnCoinGecko || listedOnCoinMarketCap) &&
        contractVerified &&
        holders > 500 &&
        liquidity > 50000
      );

      token.price = Number.isFinite(price) ? price : 0;
      token.balance = balance;
      token.value = token.price > 0 ? balance * token.price : 0;
      token.token_status = isSafe ? "REAL / SAFE" : "RISKY / FAKE";
      token.holders = holders;
      token.liquidity = liquidity;
      token.market_cap = marketCap;

      // Total value should reflect displayed token values, not only SAFE tokens.
      if (token.value > 0) {
        walletValue += token.value;
      }

      if (isSafe) {
        stats.safeTokens += 1;
      }
    });

    wallet.tokens.sort((a, b) => {
      const aSafe = a.token_status === "REAL / SAFE" ? 1 : 0;
      const bSafe = b.token_status === "REAL / SAFE" ? 1 : 0;
      if (aSafe !== bSafe) return bSafe - aSafe;
      return Number(b.value || 0) - Number(a.value || 0);
    });
    wallet.token_count = (wallet.tokens || []).length;
    wallet.total_value = walletValue;

    snapshotValueById.set(Number(wallet.snapshot_id), walletValue);
    aggregateValue += walletValue;
  });

  data.snapshots.forEach((snapshot) => {
    const knownValue = snapshotValueById.get(Number(snapshot.id));
    snapshot.total_value = typeof knownValue === "number" ? knownValue : Number(snapshot.total_balance || 0);
  });

  data.summary.aggregate_value = aggregateValue;
  data.summary.token_rows_count = stats.totalTokens;
}

function downloadCsv(filename, columns, rows) {
  const escape = (value) => {
    const cell = String(value ?? "");
    if (cell.includes(",") || cell.includes("\"") || cell.includes("\n")) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    return cell;
  };

  const lines = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => escape(row[column])).join(","))
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function renderSummary(summary) {
  walletsCountEl.textContent = fmtNumber(summary.wallets_count, 0);
  snapshotsCountEl.textContent = fmtNumber(summary.snapshots_count, 0);
  tokenRowsCountEl.textContent = fmtNumber(summary.token_rows_count, 0);
  aggregateBalanceEl.textContent = `$${fmtNumber(summary.aggregate_value, 2)}`;
}

function renderWalletTable(wallets) {
  walletTableBodyEl.innerHTML = "";
  if (!wallets.length) {
    const tr = document.createElement("tr");
    const td = createCell("No wallet data available.", "empty-cell");
    td.colSpan = 5;
    tr.appendChild(td);
    walletTableBodyEl.appendChild(tr);
    return;
  }

  wallets.forEach((wallet) => {
    const tr = document.createElement("tr");
    tr.dataset.wallet = wallet.wallet_address;

    const walletTd = document.createElement("td");
    walletTd.innerHTML = `
      <div class="wallet-main">${wallet.wallet_address}</div>
      <div class="wallet-meta">Snapshot #${wallet.snapshot_id}</div>
    `;
    tr.appendChild(walletTd);
    tr.appendChild(createCell(fmtDate(wallet.snapshot_at)));
    tr.appendChild(createCell(fmtNumber(wallet.token_count, 0)));
    tr.appendChild(createCell(`$${fmtNumber(wallet.total_value, 2)}`, "balance"));

    const actionsTd = document.createElement("td");
    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "btn btn-ghost btn-small";
    viewBtn.textContent = "View Tokens";
    viewBtn.addEventListener("click", () => toggleWalletTokens(tr, wallet));

    const deleteWalletBtn = document.createElement("button");
    deleteWalletBtn.type = "button";
    deleteWalletBtn.className = "btn btn-danger btn-small";
    deleteWalletBtn.textContent = "Delete User Data";
    deleteWalletBtn.addEventListener("click", () => deleteWallet(wallet.wallet_address));

    actionsTd.appendChild(viewBtn);
    actionsTd.appendChild(document.createTextNode(" "));
    actionsTd.appendChild(deleteWalletBtn);
    tr.appendChild(actionsTd);
    walletTableBodyEl.appendChild(tr);
  });
}

function toggleWalletTokens(mainRow, wallet) {
  const nextRow = mainRow.nextElementSibling;
  if (nextRow && nextRow.classList.contains("token-subtable-row")) {
    nextRow.remove();
    return;
  }

  const fragment = walletTokensTemplateEl.content.cloneNode(true);
  const subRow = fragment.querySelector(".token-subtable-row");
  const body = fragment.querySelector(".inner-token-body");

  (wallet.tokens || []).forEach((token) => {
    const tokenRow = document.createElement("tr");
    tokenRow.appendChild(createCell(String(token.chain || "-").toUpperCase()));
    tokenRow.appendChild(createCell(token.symbol || "-"));
    tokenRow.appendChild(createCell(token.token_address || "-"));
    tokenRow.appendChild(createCell(fmtNumber(token.balance, 8)));
    tokenRow.appendChild(createCell(`$${fmtNumber(token.value, 2)}`));
    tokenRow.appendChild(createCell(token.token_status || "RISKY / FAKE"));
    body.appendChild(tokenRow);
  });

  if (!wallet.tokens || wallet.tokens.length === 0) {
    const tokenRow = document.createElement("tr");
    const td = createCell("No tokens in latest snapshot.", "empty-cell");
    td.colSpan = 6;
    tokenRow.appendChild(td);
    body.appendChild(tokenRow);
  }

  mainRow.insertAdjacentElement("afterend", subRow);
}

function renderTokenTable() {
  tokenTableBodyEl.innerHTML = "";
  const rows = rowsForTokenReport();
  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = createCell("No token rows available.", "empty-cell");
    td.colSpan = 8;
    tr.appendChild(td);
    tokenTableBodyEl.appendChild(tr);
    return;
  }

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.appendChild(createCell(row.wallet_address));
    tr.appendChild(createCell(String(row.chain || "-").toUpperCase()));
    tr.appendChild(createCell(row.symbol || "-"));
    tr.appendChild(createCell(row.token_address || "-"));
    tr.appendChild(createCell(fmtNumber(row.balance, 8), "balance"));
    tr.appendChild(createCell(`$${fmtNumber(row.value, 2)}`, "balance"));
    const status = row.token_status || "RISKY / FAKE";
    const isSafe = status === "REAL / SAFE";
    tr.appendChild(createCell(status, `status-pill ${isSafe ? "safe" : "risky"}`));
    tr.appendChild(createCell(String(row.snapshot_id)));
    tokenTableBodyEl.appendChild(tr);
  });
}

function renderSnapshotTable(snapshots) {
  snapshotTableBodyEl.innerHTML = "";
  if (!snapshots.length) {
    const tr = document.createElement("tr");
    const td = createCell("No snapshots available.", "empty-cell");
    td.colSpan = 6;
    tr.appendChild(td);
    snapshotTableBodyEl.appendChild(tr);
    return;
  }

  snapshots.forEach((snapshot) => {
    const tr = document.createElement("tr");
    tr.appendChild(createCell(String(snapshot.id)));
    tr.appendChild(createCell(snapshot.wallet_address));
    tr.appendChild(createCell(fmtDate(snapshot.created_at)));
    tr.appendChild(createCell(fmtNumber(snapshot.token_count, 0)));
    tr.appendChild(createCell(`$${fmtNumber(snapshot.total_value, 2)}`, "balance"));

    const actionTd = document.createElement("td");
    const deleteSnapshotBtn = document.createElement("button");
    deleteSnapshotBtn.type = "button";
    deleteSnapshotBtn.className = "btn btn-danger btn-small";
    deleteSnapshotBtn.textContent = "Delete Snapshot";
    deleteSnapshotBtn.addEventListener("click", () => deleteSnapshot(snapshot.id));
    actionTd.appendChild(deleteSnapshotBtn);
    tr.appendChild(actionTd);

    snapshotTableBodyEl.appendChild(tr);
  });
}

function applyWalletFilter() {
  const query = String(walletFilterInputEl.value || "").trim().toLowerCase();
  if (!query) {
    renderWalletTable(adminData.wallets);
    return;
  }
  const filtered = adminData.wallets.filter((wallet) => wallet.wallet_address.includes(query));
  renderWalletTable(filtered);
}

async function loadOverview() {
  setStatus("Refreshing database data...");
  try {
    const response = await fetch(`${API_BASE}/admin_overview.php`);
    const json = await response.json();

    if (!response.ok || !json?.success) {
      const err = json?.error || `request_failed_${response.status}`;
      throw new Error(err);
    }

    adminData = {
      summary: json.summary || adminData.summary,
      wallets: Array.isArray(json.wallets) ? json.wallets : [],
      snapshots: Array.isArray(json.snapshots) ? json.snapshots : []
    };
    const fingerprint = getOverviewFingerprint(adminData);
    const cached = readEnrichCache(fingerprint);
    if (cached) {
      adminData = cached.adminData;
      stats = cached.stats;
      renderSummary(adminData.summary);
      applyWalletFilter();
      renderTokenTable();
      renderSnapshotTable(adminData.snapshots);
      setStatus(`Database synced at ${new Date().toLocaleString()} | SAFE ${stats.safeTokens}/${stats.totalTokens} (cached)`);
      return;
    }

    await enrichValues(adminData);
    writeEnrichCache(fingerprint, adminData, stats);
    renderSummary(adminData.summary);
    applyWalletFilter();
    renderTokenTable();
    renderSnapshotTable(adminData.snapshots);
    setStatus(`Database synced at ${new Date().toLocaleString()} | SAFE ${stats.safeTokens}/${stats.totalTokens}`);
  } catch (error) {
    setStatus(`Failed to load data: ${error.message}`, true);
  }
}

async function deleteWallet(walletAddress) {
  const yes = window.confirm(`Delete all snapshots and tokens for wallet ${walletAddress}?`);
  if (!yes) return;

  try {
    const response = await fetch(`${API_BASE}/admin_delete_wallet.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ wallet_address: walletAddress })
    });
    const json = await response.json();
    if (!response.ok || !json?.success) {
      throw new Error(json?.error || `request_failed_${response.status}`);
    }
    setStatus(`Deleted ${json.deleted_snapshots} snapshots for ${walletAddress}.`);
    await loadOverview();
  } catch (error) {
    setStatus(`Delete failed: ${error.message}`, true);
  }
}

async function deleteSnapshot(snapshotId) {
  const yes = window.confirm(`Delete snapshot #${snapshotId}?`);
  if (!yes) return;

  try {
    const response = await fetch(`${API_BASE}/admin_delete_snapshot.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ snapshot_id: snapshotId })
    });
    const json = await response.json();
    if (!response.ok || !json?.success) {
      throw new Error(json?.error || `request_failed_${response.status}`);
    }
    setStatus(`Deleted snapshot #${snapshotId}.`);
    await loadOverview();
  } catch (error) {
    setStatus(`Delete failed: ${error.message}`, true);
  }
}

function generateUserSummaryReport() {
  const rows = adminData.wallets.map((wallet) => ({
    wallet_address: wallet.wallet_address,
    snapshot_id: wallet.snapshot_id,
    snapshot_at: wallet.snapshot_at,
    token_count: wallet.token_count,
    total_value_usd: Number(wallet.total_value || 0).toFixed(2)
  }));

  downloadCsv(
    `user_summary_report_${Date.now()}.csv`,
    ["wallet_address", "snapshot_id", "snapshot_at", "token_count", "total_value_usd"],
    rows
  );
}

function generateTokenValueReport() {
  const rows = rowsForTokenReport().map((row) => ({
    wallet_address: row.wallet_address,
    snapshot_id: row.snapshot_id,
    snapshot_at: row.snapshot_at,
    chain: row.chain,
    symbol: row.symbol,
    token_address: row.token_address,
    balance: Number(row.balance || 0).toFixed(10),
    value_usd: Number(row.value || 0).toFixed(2),
    token_status: row.token_status || "RISKY / FAKE"
  }));

  downloadCsv(
    `token_value_report_${Date.now()}.csv`,
    ["wallet_address", "snapshot_id", "snapshot_at", "chain", "symbol", "token_address", "balance", "value_usd", "token_status"],
    rows
  );
}

walletFilterInputEl.addEventListener("input", applyWalletFilter);
refreshBtnEl.addEventListener("click", loadOverview);
userReportBtnEl.addEventListener("click", generateUserSummaryReport);
tokenReportBtnEl.addEventListener("click", generateTokenValueReport);

loadOverview();
