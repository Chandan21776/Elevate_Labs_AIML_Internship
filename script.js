// ========== Tab Navigation ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeDemo();
});

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// ========== Demo Functionality ==========
let originalDataset = [];
let cleanedDataset = [];
let missingChart = null;

function initializeDemo() {
    const generateBtn = document.getElementById('generateData');
    const analyzeBtn = document.getElementById('analyzeData');
    const cleanBtn = document.getElementById('cleanData');
    const resetBtn = document.getElementById('resetDemo');

    generateBtn.addEventListener('click', generateSampleData);
    analyzeBtn.addEventListener('click', analyzeMissingValues);
    cleanBtn.addEventListener('click', cleanDataset);
    resetBtn.addEventListener('click', resetDemo);
}

// ========== Generate Sample Dataset ==========
function generateSampleData() {
    const n = 50; // Number of rows
    originalDataset = [];

    // Departments and cities for categorical data
    const departments = ['Sales', 'IT', 'HR', 'Marketing', 'Finance'];
    const cities = ['New York', 'London', 'Tokyo', 'Mumbai', 'Berlin'];
    const education = ['High School', 'Bachelor', 'Master', 'PhD'];

    for (let i = 0; i < n; i++) {
        originalDataset.push({
            id: i + 1,
            age: randomNormal(35, 10),
            salary: randomExponential(50000),
            experience: randomNormal(10, 5),
            department: randomChoice(departments),
            city: randomChoice(cities),
            performance: randomUniform(1, 10),
            education: randomChoice(education)
        });
    }

    // Introduce missing values
    introduceMissingValues(originalDataset, 'age', 0.15);
    introduceMissingValues(originalDataset, 'salary', 0.20);
    introduceMissingValues(originalDataset, 'experience', 0.10);
    introduceMissingValues(originalDataset, 'department', 0.25);
    introduceMissingValues(originalDataset, 'city', 0.30);
    introduceMissingValues(originalDataset, 'performance', 0.60); // High missing
    introduceMissingValues(originalDataset, 'education', 0.12);

    displayDataTable(originalDataset, 'originalData');
    
    // Enable analyze button
    document.getElementById('analyzeData').disabled = false;
    document.getElementById('cleanData').disabled = false;
    
    // Clear previous analysis
    document.getElementById('missingAnalysis').innerHTML = '<canvas id="missingChart"></canvas>';
    document.getElementById('cleanedData').innerHTML = '<p class="placeholder">Clean the dataset to see results</p>';
    document.getElementById('comparisonStats').innerHTML = '';
}

// ========== Random Number Generators ==========
function randomNormal(mean, stdDev) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.max(0, mean + z0 * stdDev);
}

function randomExponential(lambda) {
    return -lambda * Math.log(Math.random());
}

function randomUniform(min, max) {
    return Math.random() * (max - min) + min;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function introduceMissingValues(data, column, percentage) {
    const numMissing = Math.floor(data.length * percentage);
    const indices = [];
    
    while (indices.length < numMissing) {
        const idx = Math.floor(Math.random() * data.length);
        if (!indices.includes(idx)) {
            indices.push(idx);
            data[idx][column] = null;
        }
    }
}

// ========== Display Data Table ==========
function displayDataTable(data, containerId) {
    const container = document.getElementById(containerId);
    
    if (data.length === 0) {
        container.innerHTML = '<p class="placeholder">No data available</p>';
        return;
    }

    const columns = Object.keys(data[0]);
    
    let html = '<table class="data-table"><thead><tr>';
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    data.forEach(row => {
        html += '<tr>';
        columns.forEach(col => {
            const value = row[col];
            const cellClass = value === null ? 'missing' : '';
            const displayValue = value === null ? 'NULL' : 
                               typeof value === 'number' ? value.toFixed(2) : value;
            html += `<td class="${cellClass}">${displayValue}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ========== Analyze Missing Values ==========
function analyzeMissingValues() {
    const missingCounts = {};
    const columns = Object.keys(originalDataset[0]);
    
    columns.forEach(col => {
        missingCounts[col] = 0;
    });

    originalDataset.forEach(row => {
        columns.forEach(col => {
            if (row[col] === null) {
                missingCounts[col]++;
            }
        });
    });

    const missingPercentages = {};
    const totalRows = originalDataset.length;
    
    columns.forEach(col => {
        missingPercentages[col] = (missingCounts[col] / totalRows * 100).toFixed(1);
    });

    visualizeMissingData(missingPercentages);
}

// ========== Visualize Missing Data ==========
function visualizeMissingData(missingPercentages) {
    const ctx = document.getElementById('missingChart');
    
    if (!ctx) return;

    // Destroy previous chart if exists
    if (missingChart) {
        missingChart.destroy();
    }

    const labels = Object.keys(missingPercentages);
    const data = Object.values(missingPercentages).map(v => parseFloat(v));

    missingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Missing Percentage (%)',
                data: data,
                backgroundColor: data.map(v => {
                    if (v > 50) return 'rgba(239, 68, 68, 0.7)'; // Red for >50%
                    if (v > 20) return 'rgba(245, 158, 11, 0.7)'; // Orange for >20%
                    return 'rgba(16, 185, 129, 0.7)'; // Green for <=20%
                }),
                borderColor: data.map(v => {
                    if (v > 50) return 'rgba(239, 68, 68, 1)';
                    if (v > 20) return 'rgba(245, 158, 11, 1)';
                    return 'rgba(16, 185, 129, 1)';
                }),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Missing Data by Column',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Missing: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Percentage Missing (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Columns'
                    }
                }
            }
        }
    });
}

// ========== Clean Dataset ==========
function cleanDataset() {
    cleanedDataset = JSON.parse(JSON.stringify(originalDataset)); // Deep copy
    
    const columns = Object.keys(cleanedDataset[0]);
    const threshold = 0.5; // 50% threshold for dropping columns
    
    // Step 1: Identify columns to drop (>50% missing)
    const columnsToRemove = [];
    columns.forEach(col => {
        const missingCount = cleanedDataset.filter(row => row[col] === null).length;
        const missingPercentage = missingCount / cleanedDataset.length;
        
        if (missingPercentage > threshold) {
            columnsToRemove.push(col);
        }
    });

    // Remove high-missing columns
    if (columnsToRemove.length > 0) {
        cleanedDataset.forEach(row => {
            columnsToRemove.forEach(col => {
                delete row[col];
            });
        });
    }

    // Step 2: Get remaining columns
    const remainingColumns = Object.keys(cleanedDataset[0]);

    // Step 3: Identify numerical vs categorical columns
    const numericalCols = ['age', 'salary', 'experience', 'performance'].filter(col => 
        remainingColumns.includes(col)
    );
    const categoricalCols = ['department', 'city', 'education'].filter(col => 
        remainingColumns.includes(col)
    );

    // Step 4: Impute numerical columns
    numericalCols.forEach(col => {
        const values = cleanedDataset
            .map(row => row[col])
            .filter(val => val !== null);
        
        if (values.length > 0) {
            // Calculate skewness to decide mean vs median
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const sortedValues = [...values].sort((a, b) => a - b);
            const median = sortedValues[Math.floor(sortedValues.length / 2)];
            
            // Use median for skewed data (simple heuristic)
            const imputeValue = median;
            
            cleanedDataset.forEach(row => {
                if (row[col] === null) {
                    row[col] = imputeValue;
                }
            });
        }
    });

    // Step 5: Impute categorical columns (mode)
    categoricalCols.forEach(col => {
        const values = cleanedDataset
            .map(row => row[col])
            .filter(val => val !== null);
        
        if (values.length > 0) {
            // Find mode (most frequent value)
            const frequency = {};
            values.forEach(val => {
                frequency[val] = (frequency[val] || 0) + 1;
            });
            
            const mode = Object.keys(frequency).reduce((a, b) => 
                frequency[a] > frequency[b] ? a : b
            );
            
            cleanedDataset.forEach(row => {
                if (row[col] === null) {
                    row[col] = mode;
                }
            });
        }
    });

    // Step 6: Remove duplicates (simple check)
    const uniqueDataset = [];
    const seen = new Set();
    
    cleanedDataset.forEach(row => {
        const rowString = JSON.stringify(row);
        if (!seen.has(rowString)) {
            seen.add(rowString);
            uniqueDataset.push(row);
        }
    });
    
    cleanedDataset = uniqueDataset;

    // Display cleaned dataset
    displayDataTable(cleanedDataset, 'cleanedData');
    
    // Show comparison
    displayComparison(columnsToRemove);
}

// ========== Display Comparison ==========
function displayComparison(droppedColumns) {
    const originalRows = originalDataset.length;
    const cleanedRows = cleanedDataset.length;
    const originalCols = Object.keys(originalDataset[0]).length;
    const cleanedCols = Object.keys(cleanedDataset[0]).length;
    
    // Calculate original missing values
    let originalMissing = 0;
    originalDataset.forEach(row => {
        Object.values(row).forEach(val => {
            if (val === null) originalMissing++;
        });
    });
    
    // Calculate cleaned missing values
    let cleanedMissing = 0;
    cleanedDataset.forEach(row => {
        Object.values(row).forEach(val => {
            if (val === null) cleanedMissing++;
        });
    });

    const originalCompleteness = ((1 - originalMissing / (originalRows * originalCols)) * 100).toFixed(1);
    const cleanedCompleteness = ((1 - cleanedMissing / (cleanedRows * cleanedCols)) * 100).toFixed(1);

    const html = `
        <div class="stat-card">
            <span class="stat-value">${originalRows} → ${cleanedRows}</span>
            <span class="stat-label">Rows (Removed: ${originalRows - cleanedRows})</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${originalCols} → ${cleanedCols}</span>
            <span class="stat-label">Columns (Removed: ${originalCols - cleanedCols})</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${originalCompleteness}% → ${cleanedCompleteness}%</span>
            <span class="stat-label">Data Completeness</span>
        </div>
        <div class="stat-card">
            <span class="stat-value">${originalMissing} → ${cleanedMissing}</span>
            <span class="stat-label">Missing Values</span>
        </div>
        ${droppedColumns.length > 0 ? `
        <div class="stat-card" style="grid-column: 1 / -1;">
            <span class="stat-value">${droppedColumns.join(', ')}</span>
            <span class="stat-label">Dropped Columns (>50% missing)</span>
        </div>
        ` : ''}
    `;

    document.getElementById('comparisonStats').innerHTML = html;
}

// ========== Reset Demo ==========
function resetDemo() {
    originalDataset = [];
    cleanedDataset = [];
    
    document.getElementById('originalData').innerHTML = '<p class="placeholder">Click "Generate Sample Dataset" to begin</p>';
    document.getElementById('missingAnalysis').innerHTML = '<canvas id="missingChart"></canvas>';
    document.getElementById('cleanedData').innerHTML = '<p class="placeholder">Clean the dataset to see results</p>';
    document.getElementById('comparisonStats').innerHTML = '';
    
    document.getElementById('analyzeData').disabled = true;
    document.getElementById('cleanData').disabled = true;
    
    if (missingChart) {
        missingChart.destroy();
        missingChart = null;
    }
}

// ========== Download Functionality (Optional Enhancement) ==========
function downloadCSV(data, filename) {
    if (data.length === 0) return;
    
    const columns = Object.keys(data[0]);
    let csv = columns.join(',') + '\n';
    
    data.forEach(row => {
        const values = columns.map(col => {
            const val = row[col];
            return val === null ? '' : val;
        });
        csv += values.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ========== Smooth Scroll Enhancement ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});