let rawData = [];
let headers = [];
let cleanedData = [];

document.getElementById("upload").addEventListener("change", function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    const rows = event.target.result.split("\n");
    headers = rows[0].split(",");
    rawData = rows.slice(1).map(r => r.split(","));
  };
  reader.readAsText(file);
});

function processData() {
  let missingCount = {};
  headers.forEach(h => missingCount[h] = 0);

  rawData.forEach(row => {
    row.forEach((val, i) => {
      if (val === "" || val === null) {
        missingCount[headers[i]]++;
      }
    });
  });

  drawChart(missingCount);
  cleanedData = imputeMissingValues();
  showComparison();
}

function imputeMissingValues() {
  let result = JSON.parse(JSON.stringify(rawData));

  headers.forEach((header, colIndex) => {
    let column = rawData.map(r => r[colIndex]).filter(v => v !== "");

    if (isNumeric(column)) {
      let mean = column.reduce((a,b)=>+a+ +b,0) / column.length;
      result.forEach(r => {
        if (r[colIndex] === "") r[colIndex] = mean.toFixed(2);
      });
    } else {
      let mode = column.sort((a,b)=>
        column.filter(v=>v===a).length -
        column.filter(v=>v===b).length
      ).pop();
      result.forEach(r => {
        if (r[colIndex] === "") r[colIndex] = mode;
      });
    }
  });

  return result;
}

function isNumeric(arr) {
  return arr.every(v => !isNaN(v));
}

function drawChart(data) {
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  canvas.width = 600;
  canvas.height = 300;

  let keys = Object.keys(data);
  let values = Object.values(data);
  let max = Math.max(...values);

  ctx.clearRect(0,0,600,300);

  keys.forEach((key, i) => {
    let height = (values[i] / max) * 200;
    ctx.fillStyle = "#e74c3c";
    ctx.fillRect(i * 60 + 30, 250 - height, 40, height);
    ctx.fillStyle = "#000";
    ctx.fillText(key, i * 60 + 30, 270);
  });
}

function showComparison() {
  document.getElementById("comparison").innerText =
    `Rows Before Cleaning: ${rawData.length} | Rows After Cleaning: ${cleanedData.length}`;
}

function downloadCSV() {
  let csv = headers.join(",") + "\n";
  cleanedData.forEach(r => csv += r.join(",") + "\n");

  let blob = new Blob([csv], { type: "text/csv" });
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");
  a.href = url;
  a.download = "cleaned_dataset.csv";
  a.click();
}
