const snapshots = {
  "1d": {
    total: "$126,428.91",
    totalDelta: "+6.24% today",
    pnl: "$4,882.44",
    pnlDelta: "+$392.88 unrealized",
    ticker: ["BTC +2.1%", "ETH +1.4%", "SOL +3.8%", "ARB -0.7%"],
    rows: ["$12,900", "$3,440", "$2,180"]
  },
  "7d": {
    total: "$119,286.03",
    totalDelta: "+12.08% this week",
    pnl: "$11,246.51",
    pnlDelta: "+$1,420.11 unrealized",
    ticker: ["BTC +5.6%", "ETH +4.2%", "SOL +9.3%", "ARB +1.8%"],
    rows: ["$9,680", "$2,910", "$1,940"]
  },
  "30d": {
    total: "$104,992.67",
    totalDelta: "+18.90% this month",
    pnl: "$16,714.10",
    pnlDelta: "+$2,988.72 unrealized",
    ticker: ["BTC +10.4%", "ETH +8.7%", "SOL +14.2%", "ARB +6.1%"],
    rows: ["$8,210", "$2,430", "$1,510"]
  }
};

const totalEl = document.getElementById("metricTotal");
const totalDeltaEl = document.getElementById("metricTotalDelta");
const pnlEl = document.getElementById("metricPnl");
const pnlDeltaEl = document.getElementById("metricPnlDelta");
const tickerEl = document.getElementById("heroTicker");
const row1El = document.getElementById("row1Value");
const row2El = document.getElementById("row2Value");
const row3El = document.getElementById("row3Value");

function renderRange(range) {
  const data = snapshots[range];
  if (!data) return;

  totalEl.textContent = data.total;
  totalDeltaEl.textContent = data.totalDelta;
  pnlEl.textContent = data.pnl;
  pnlDeltaEl.textContent = data.pnlDelta;

  tickerEl.innerHTML = "";
  data.ticker.forEach((item) => {
    const chip = document.createElement("span");
    chip.textContent = item;
    tickerEl.appendChild(chip);
  });

  row1El.textContent = data.rows[0];
  row2El.textContent = data.rows[1];
  row3El.textContent = data.rows[2];
}

document.querySelectorAll(".seg-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((item) => {
      item.classList.remove("is-active");
    });
    button.classList.add("is-active");
    renderRange(button.dataset.range);
  });
});

const cycle = ["1d", "7d", "30d"];
let index = 0;
setInterval(() => {
  index = (index + 1) % cycle.length;
  const nextRange = cycle[index];
  const nextButton = document.querySelector(`[data-range="${nextRange}"]`);
  if (!nextButton) return;

  document.querySelectorAll(".seg-btn").forEach((item) => {
    item.classList.remove("is-active");
  });
  nextButton.classList.add("is-active");
  renderRange(nextRange);
}, 3000);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.18
  }
);

document.querySelectorAll(".reveal-on-scroll").forEach((node) => {
  observer.observe(node);
});
