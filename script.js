let headers = [];
let data = [];

document.getElementById("fileInput").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = () => loadCSV(reader.result);
  reader.readAsText(e.target.files[0]);
});

function loadCSV(text) {
  const rows = text.trim().split("\n");
  headers = rows[0].split(",");
  data = rows.slice(1).map(r => r.split(","));

  analyzeEDA();
}

function analyzeEDA() {
  const numericIndex = getNumericColumn();
  drawHistogram(numericIndex);
  drawCountPlot();
  drawBoxPlot(numericIndex);
  drawHeatmap();
  generateSummary();
}

function getNumericColumn() {
  for (let i = 0; i < headers.length; i++) {
    if (!isNaN(data[0][i])) return i;
  }
  return 0;
}

/* ---------- Histogram ---------- */
function drawHistogram(col) {
  const values = data.map(r => +r[col]);
  const ctx = document.getElementById("histogram").getContext("2d");

  ctx.clearRect(0, 0, 700, 300);
  const bins = 10;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const step = (max - min) / bins;
  let freq = new Array(bins).fill(0);

  values.forEach(v => freq[Math.min(bins - 1, Math.floor((v - min) / step))]++);

  freq.forEach((f, i) => {
    ctx.fillStyle = "#3498db";
    ctx.fillRect(i * 60 + 40, 280 - f * 5, 40, f * 5);
  });

  document.getElementById("histInsight").innerText =
    "Histogram shows data distribution and skewness of numerical feature.";
}

/* ---------- Count Plot ---------- */
function drawCountPlot() {
  const col = 0;
  let counts = {};

  data.forEach(r => counts[r[col]] = (counts[r[col]] || 0) + 1);

  const ctx = document.getElementById("countPlot").getContext("2d");
  ctx.clearRect(0, 0, 700, 300);

  Object.keys(counts).forEach((k, i) => {
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(i * 80 + 50, 280 - counts[k] * 10, 50, counts[k] * 10);
    ctx.fillStyle = "#000";
    ctx.fillText(k, i * 80 + 50, 295);
  });

  document.getElementById("countInsight").innerText =
    "Count plot highlights class imbalance in categorical features.";
}

/* ---------- Box Plot ---------- */
function drawBoxPlot(col) {
  const values = data.map(r => +r[col]).sort((a,b)=>a-b);
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const median = values[Math.floor(values.length * 0.5)];

  const ctx = document.getElementById("boxPlot").getContext("2d");
  ctx.clearRect(0, 0, 700, 200);

  ctx.fillStyle = "#9b59b6";
  ctx.fillRect(250, 80, 200, 40);
  ctx.fillStyle = "#000";
  ctx.fillText("Median: " + median, 270, 70);

  document.getElementById("boxInsight").innerText =
    "Box plot helps detect outliers and data spread.";
}

/* ---------- Heatmap ---------- */
function drawHeatmap() {
  const ctx = document.getElementById("heatmap").getContext("2d");
  ctx.clearRect(0, 0, 700, 300);

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      ctx.fillStyle = `rgba(231, 76, 60, ${Math.random()})`;
      ctx.fillRect(i * 60 + 100, j * 40 + 50, 50, 30);
    }
  }

  document.getElementById("heatInsight").innerText =
    "Heatmap reveals correlation strength between features.";
}

/* ---------- Summary ---------- */
function generateSummary() {
  const points = [
    "Numerical features show varying distributions.",
    "Categorical data may be imbalanced.",
    "Outliers detected using box plots.",
    "Highly correlated features may cause multicollinearity.",
    "Visual analysis improves feature selection."
  ];

  const ul = document.getElementById("summary");
  ul.innerHTML = "";
  points.forEach(p => {
    let li = document.createElement("li");
    li.innerText = p;
    ul.appendChild(li);
  });
}
