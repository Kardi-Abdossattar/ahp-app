// Simple chart rendering using Chart.js from CDN
class AHPResultsRenderer {
  constructor() {
    this.data = null;
  }

  async loadData(jsonPath) {
    try {
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      this.data = await response.json();
      return this.data;
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Attempted to load:', jsonPath);
      throw error;
    }
  }

  loadDataFromObject(dataObject) {
    this.data = dataObject;
    return this.data;
  }

  formatPercent(value) {
    return (value * 100).toFixed(1) + '%';
  }

  formatScore(value) {
    return value.toFixed(4);
  }

  renderProjectInfo(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.data) return;

    container.innerHTML = `
      <div class="project-info">
        <h1>${this.data.title}</h1>
        <p class="description">${this.data.description}</p>
        <p class="goal"><strong>Goal:</strong> ${this.data.goal}</p>
        <div class="stats">
          <span class="stat">📊 ${this.data.criteriaCount} Criteria</span>
          <span class="stat">🔍 ${this.data.alternativesCount} Alternatives</span>
          <span class="stat">✅ Consistency: ${this.data.results.overallConsistency.isConsistent ? 'Good' : 'Poor'}</span>
        </div>
      </div>
    `;
  }

  renderFinalScoresTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.data) return;

    const scores = this.data.results.finalScores;
    let html = `
      <h2>🏆 Final Rankings</h2>
      <table class="results-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Alternative</th>
            <th>Score</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
    `;

    scores.forEach((alt, index) => {
      const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : '';
      html += `
        <tr class="${rankClass}">
          <td>${index + 1}</td>
          <td>${alt.name}</td>
          <td>${this.formatScore(alt.score)}</td>
          <td>${this.formatPercent(alt.score)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  }

  renderCriteriaWeightsTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.data) return;

    const weights = this.data.results.criteriaWeights;
    let html = `
      <h2>⚖️ Criteria Weights</h2>
      <table class="results-table">
        <thead>
          <tr>
            <th>Criterion</th>
            <th>Weight</th>
            <th>Percentage</th>
            <th>Consistency</th>
          </tr>
        </thead>
        <tbody>
    `;

    weights.forEach(criterion => {
      const consistencyClass = criterion.consistencyRatio <= 0.1 ? 'good-consistency' : 'poor-consistency';
      html += `
        <tr>
          <td>${criterion.name}</td>
          <td>${this.formatScore(criterion.weight)}</td>
          <td>${this.formatPercent(criterion.weight)}</td>
          <td class="${consistencyClass}">${this.formatScore(criterion.consistencyRatio)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  }

  renderCriteriaChart(canvasId) {
    if (!this.data || !window.Chart) return;

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const weights = this.data.results.criteriaWeights;
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: weights.map(w => w.name),
        datasets: [{
          label: 'Weight',
          data: weights.map(w => w.weight),
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Criteria Weights'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            ticks: {
              callback: function(value) {
                return (value * 100).toFixed(0) + '%';
              }
            }
          }
        }
      }
    });
  }

  renderAlternativesChart(canvasId) {
    if (!this.data || !window.Chart) return;

    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    const scores = this.data.results.finalScores;
    
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: scores.map(s => s.name),
        datasets: [{
          data: scores.map(s => s.score),
          backgroundColor: [
            'rgba(255, 206, 84, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: [
            'rgba(255, 206, 84, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Final Scores Distribution'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const percentage = (context.parsed * 100).toFixed(1);
                return context.label + ': ' + percentage + '%';
              }
            }
          }
        }
      }
    });
  }

  renderAlternativesBycriteriaTable(containerId) {
    const container = document.getElementById(containerId);
    if (!container || !this.data) return;

    const criteria = this.data.results.criteriaWeights;
    const altScores = this.data.results.alternativeScores;

    let html = '<h2>📋 Alternatives by Criteria</h2>';

    criteria.forEach(criterion => {
      const scores = altScores[criterion.id] || [];
      html += `
        <h3>${criterion.name}</h3>
        <table class="results-table">
          <thead>
            <tr>
              <th>Alternative</th>
              <th>Score</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
      `;

      scores.forEach(alt => {
        html += `
          <tr>
            <td>${alt.name}</td>
            <td>${this.formatScore(alt.score)}</td>
            <td>${this.formatPercent(alt.score)}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;
    });

    container.innerHTML = html;
  }

  renderAll() {
    this.renderProjectInfo('project-info');
    this.renderFinalScoresTable('final-scores');
    this.renderCriteriaWeightsTable('criteria-weights');
    this.renderAlternativesBycriteriaTable('alternatives-by-criteria');
    
    // Render charts after a short delay to ensure DOM is ready
    setTimeout(() => {
      this.renderCriteriaChart('criteria-chart');
      this.renderAlternativesChart('alternatives-chart');
    }, 100);
  }
}

// Global function to initialize results
async function initializeResults(jsonPath) {
  try {
    const renderer = new AHPResultsRenderer();
    await renderer.loadData(jsonPath);
    renderer.renderAll();
  } catch (error) {
    console.error('Failed to initialize results:', error);
    document.body.innerHTML = `
      <div class="error">
        <h1>Error Loading Results</h1>
        <p>Failed to load data from ${jsonPath}</p>
        <p>Error: ${error.message}</p>
        <p>This might be a CORS issue or the file path is incorrect.</p>
        <p>For GitHub Pages, make sure the JSON files are in the correct location.</p>
      </div>
    `;
  }
}

// Global function to initialize results from embedded data
function initializeResultsFromData(dataObject) {
  try {
    const renderer = new AHPResultsRenderer();
    renderer.loadDataFromObject(dataObject);
    renderer.renderAll();
  } catch (error) {
    console.error('Failed to initialize results from data:', error);
    document.body.innerHTML = `
      <div class="error">
        <h1>Error Loading Results</h1>
        <p>Failed to process embedded data</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
  }
}
