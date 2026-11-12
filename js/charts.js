/**
 * LabSentry AI - Chart.js Visual Analytics & Dashboard Charts
 * 
 * DISCLAIMER: Educational prototype using synthetic demo data only.
 */

const DashboardCharts = {
  instances: {},

  init() {
    this.renderAllCharts();
  },

  destroyChart(id) {
    if (this.instances[id]) {
      this.instances[id].destroy();
      delete this.instances[id];
    }
  },

  renderAllCharts() {
    const stats = window.StorageService ? window.StorageService.getStatistics() : null;
    if (!stats) return;

    this.renderOutcomeDoughnut(stats);
    this.renderDiscrepancyBar(stats);
    this.renderDepartmentBar(stats);
    this.renderTubeDistributionChart(stats);
  },

  /**
   * 1. Doughnut Chart: Pre-Check Outcome Distribution
   */
  renderOutcomeDoughnut(stats) {
    const canvas = document.getElementById('chartOutcomeDoughnut');
    if (!canvas) return;
    this.destroyChart('outcomeDoughnut');

    if (typeof Chart === 'undefined') {
      this.renderFallbackDoughnut(canvas, stats);
      return;
    }

    const ctx = canvas.getContext('2d');
    this.instances.outcomeDoughnut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['No Mismatch Found', 'Review Required', 'Mismatch Detected'],
        datasets: [{
          data: [
            stats.noMismatchCount,
            stats.reviewRequiredCount,
            stats.mismatchCount
          ],
          backgroundColor: [
            '#10b981', // emerald
            '#f59e0b', // amber
            '#ef4444'  // rose
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 14,
              font: {
                family: 'Segoe UI, system-ui, sans-serif',
                size: 12,
                weight: '500'
              }
            }
          },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                const total = stats.total || 1;
                const value = context.parsed;
                const pct = Math.round((value / total) * 100);
                return ` ${context.label}: ${value} samples (${pct}%)`;
              }
            }
          }
        }
      }
    });
  },

  /**
   * 2. Horizontal Bar Chart: Discrepancy Breakdown by Category
   */
  renderDiscrepancyBar(stats) {
    const canvas = document.getElementById('chartDiscrepancyBar');
    if (!canvas) return;
    this.destroyChart('discrepancyBar');

    if (typeof Chart === 'undefined') {
      return;
    }

    const ctx = canvas.getContext('2d');
    const disc = stats.discrepancyCounts || {
      tubeMismatch: 0,
      volumeCritical: 0,
      volumeWarning: 0,
      idMismatch: 0,
      ocrReview: 0
    };

    this.instances.discrepancyBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Tube Additive Mismatch',
          'Critical Underfill (<90%/25%)',
          'Sub-Optimal Fill (Review)',
          'ID Barcode Discrepancy',
          'Low OCR Fidelity / Override'
        ],
        datasets: [{
          label: 'Flagged Pre-Checks',
          data: [
            disc.tubeMismatch,
            disc.volumeCritical,
            disc.volumeWarning,
            disc.idMismatch,
            disc.ocrReview
          ],
          backgroundColor: [
            '#ef4444',
            '#f97316',
            '#eab308',
            '#8b5cf6',
            '#06b6d4'
          ],
          borderRadius: 6,
          barThickness: 20
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: '#f1f5f9' }
          },
          y: {
            grid: { display: false },
            ticks: {
              font: {
                family: 'Segoe UI, system-ui, sans-serif',
                size: 11
              }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            cornerRadius: 8
          }
        }
      }
    });
  },

  /**
   * 3. Bar Chart: Pre-Check Throughput by Department
   */
  renderDepartmentBar(stats) {
    const canvas = document.getElementById('chartDepartmentBar');
    if (!canvas) return;
    this.destroyChart('departmentBar');

    if (typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const deptData = stats.departmentCounts || {};
    const labels = Object.keys(deptData);
    const data = Object.values(deptData);

    this.instances.departmentBar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.length ? labels : ['Hematology', 'Chemistry', 'Coagulation', 'STAT / Tox'],
        datasets: [{
          label: 'Specimens Processed',
          data: data.length ? data : [4, 4, 3, 1],
          backgroundColor: '#3b82f6',
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: '#f1f5f9' }
          },
          x: {
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            cornerRadius: 8
          }
        }
      }
    });
  },

  /**
   * 4. Polar Area / Bar Chart: Tube Color Distribution
   */
  renderTubeDistributionChart(stats) {
    const canvas = document.getElementById('chartTubeDistribution');
    if (!canvas) return;
    this.destroyChart('tubeDistribution');

    if (typeof Chart === 'undefined') return;

    const ctx = canvas.getContext('2d');
    const tubeData = stats.tubeCounts || {};
    const labels = Object.keys(tubeData);
    const data = Object.values(tubeData);

    const tubeColors = {
      'K2 / K3 EDTA': '#8a2be2',
      'Sodium Citrate 3.2%': '#0ea5e9',
      'Serum Separator SST': '#eab308',
      'Lithium / Sodium Heparin': '#22c55e',
      'Sodium Fluoride / Potassium Oxalate': '#64748b',
      'Trace Element Tube': '#1d4ed8'
    };

    const backgroundColors = labels.map(l => tubeColors[l] || '#94a3b8');

    this.instances.tubeDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['Lavender EDTA', 'Light Blue Citrate', 'Gold SST', 'Green Heparin', 'Gray Fluoride'],
        datasets: [{
          data: data.length ? data : [4, 3, 3, 1, 1],
          backgroundColor: backgroundColors.length ? backgroundColors : ['#8a2be2', '#0ea5e9', '#eab308', '#22c55e', '#64748b'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 10,
              font: { size: 11 }
            }
          }
        }
      }
    });
  },

  /**
   * Fallback visual SVG if Chart.js is completely unavailable
   */
  renderFallbackDoughnut(canvas, stats) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Pass: ${stats.noMismatchCount} | Review: ${stats.reviewRequiredCount} | Mismatch: ${stats.mismatchCount}`, canvas.width / 2, canvas.height / 2);
  }
};

if (typeof window !== 'undefined') {
  window.DashboardCharts = DashboardCharts;
}

