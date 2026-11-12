/**
 * LabSentry AI - Main UI Controller & Application Orchestration
 * 
 * DISCLAIMER: Educational prototype using synthetic demo data only.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  currentTab: 'precheck',
  activeOCRResult: null,
  isOcrModified: false,
  selectedSampleDetail: null,

  init() {
    this.bindNavigation();
    this.populateTestDropdowns();
    this.populateTubeDropdowns();
    this.bindPreCheckForm();
    this.bindOCRControls();
    this.bindHistoryControls();
    this.bindLabelStudio();
    this.bindModals();
    
    // Initial Render
    this.refreshDashboardStats();
    this.renderHistoryTable();
    this.renderRulesReference();
    this.initLabelStudioCanvas();
    
    // Show Pre-Check tab by default for immediate hands-on testing
    this.switchTab('precheck');

    // Auto-select first preset for instant discovery
    this.loadPresetIntoForm(window.PRESET_LABELS[0]);
  },

  /* -------------------------------------------------------------
   * NAVIGATION & TAB SWITCHING
   * ------------------------------------------------------------- */
  bindNavigation() {
    const navButtons = document.querySelectorAll('[data-nav-target]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-nav-target');
        this.switchTab(target);
      });
    });

    // Reset Demo Data trigger from header
    const btnResetHeader = document.getElementById('btnResetDemoData');
    if (btnResetHeader) {
      btnResetHeader.addEventListener('click', () => {
        this.openModal('modalResetConfirm');
      });
    }

    // New Pre-Check quick action
    const btnNewPreCheck = document.getElementById('btnNewPreCheck');
    if (btnNewPreCheck) {
      btnNewPreCheck.addEventListener('click', () => {
        this.resetPreCheckForm();
        this.switchTab('precheck');
      });
    }
  },

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update active nav styling
    document.querySelectorAll('[data-nav-target]').forEach(btn => {
      if (btn.getAttribute('data-nav-target') === tabId) {
        btn.classList.add('nav-link-active');
      } else {
        btn.classList.remove('nav-link-active');
      }
    });

    // Toggle view containers
    document.querySelectorAll('.view-panel').forEach(panel => {
      if (panel.id === `view-${tabId}`) {
        panel.classList.remove('hidden');
      } else {
        panel.classList.add('hidden');
      }
    });

    // Refresh charts if entering dashboard
    if (tabId === 'dashboard') {
      this.refreshDashboardStats();
      setTimeout(() => {
        if (window.DashboardCharts) {
          window.DashboardCharts.renderAllCharts();
        }
      }, 50);
    }

    // Refresh history if entering history
    if (tabId === 'history') {
      this.renderHistoryTable();
    }
  },

  /* -------------------------------------------------------------
   * FORM DROPDOWNS & DYNAMIC TUBE MAPPINGS
   * ------------------------------------------------------------- */
  populateTestDropdowns() {
    const select = document.getElementById('inputTestCode');
    if (!select || !window.LAB_TESTS) return;

    select.innerHTML = '<option value="">-- Select Laboratory Assay --</option>';
    window.LAB_TESTS.forEach(test => {
      const opt = document.createElement('option');
      opt.value = test.code;
      opt.textContent = `[${test.department}] ${test.name}`;
      select.appendChild(opt);
    });

    // History filter dropdown
    const historyTestFilter = document.getElementById('filterHistoryTest');
    if (historyTestFilter) {
      historyTestFilter.innerHTML = '<option value="">All Tests & Departments</option>';
      window.LAB_TESTS.forEach(test => {
        const opt = document.createElement('option');
        opt.value = test.code;
        opt.textContent = test.name;
        historyTestFilter.appendChild(opt);
      });
    }
  },

  populateTubeDropdowns() {
    const selectExpected = document.getElementById('inputExpectedTube');
    const selectCollected = document.getElementById('inputCollectedTube');
    if (!window.LAB_TUBES) return;

    const tubes = Object.values(window.LAB_TUBES);

    const buildOptions = () => {
      return '<option value="">-- Select Tube Type & Additive --</option>' +
        tubes.map(t => `<option value="${t.id}">${t.name} (Min: ${t.minVolumePercent}%)</option>`).join('');
    };

    if (selectExpected) selectExpected.innerHTML = buildOptions();
    if (selectCollected) selectCollected.innerHTML = buildOptions();
  },

  /* -------------------------------------------------------------
   * PRE-CHECK FORM INTERACTION & DYNAMICS
   * ------------------------------------------------------------- */
  bindPreCheckForm() {
    const testSelect = document.getElementById('inputTestCode');
    const expectedSelect = document.getElementById('inputExpectedTube');
    const collectedSelect = document.getElementById('inputCollectedTube');
    const volSlider = document.getElementById('inputVolumePercent');
    const volDisplay = document.getElementById('volumeDisplayValue');
    const volTubeFill = document.getElementById('vialLiquidFill');
    const volFeedbackBadge = document.getElementById('volumeFeedbackBadge');

    // Auto-select Expected Tube when test changes
    if (testSelect) {
      testSelect.addEventListener('change', () => {
        const code = testSelect.value;
        const test = window.LAB_TESTS.find(t => t.code === code);
        if (test && test.expectedTubeId) {
          if (expectedSelect) {
            expectedSelect.value = test.expectedTubeId;
            this.updateTubePreviewBadge('expectedTubePreview', test.expectedTubeId);
          }
        }
        this.updateVolumeGuidance();
      });
    }

    if (expectedSelect) {
      expectedSelect.addEventListener('change', () => {
        this.updateTubePreviewBadge('expectedTubePreview', expectedSelect.value);
      });
    }

    if (collectedSelect) {
      collectedSelect.addEventListener('change', () => {
        this.updateTubePreviewBadge('collectedTubePreview', collectedSelect.value);
        this.updateVolumeGuidance();
      });
    }

    // Volume Slider Dynamic Updates
    if (volSlider && volDisplay) {
      volSlider.addEventListener('input', () => {
        const val = Number(volSlider.value);
        volDisplay.textContent = `${val}%`;
        if (volTubeFill) {
          volTubeFill.style.height = `${val}%`;
        }
        this.updateVolumeGuidance();
      });
    }

    // Validation Action Button
    const btnValidate = document.getElementById('btnRunValidation');
    if (btnValidate) {
      btnValidate.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleRunValidation();
      });
    }

    // Clear form button
    const btnClear = document.getElementById('btnClearForm');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.resetPreCheckForm();
      });
    }

    // Presets Row in PreCheck Tab
    document.querySelectorAll('[data-load-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const presetId = btn.getAttribute('data-load-preset');
        const preset = window.PRESET_LABELS.find(p => p.id === presetId);
        if (preset) {
          this.loadPresetIntoForm(preset);
          this.showToast(`Loaded test scenario: "${preset.title}"`, 'info');
        }
      });
    });
  },

  updateTubePreviewBadge(elementId, tubeId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const tube = window.LAB_TUBES[tubeId];
    if (!tube) {
      el.innerHTML = '<span class="text-xs text-slate-400">None selected</span>';
      return;
    }
    el.innerHTML = `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold" style="background-color: ${tube.capColor}20; color: ${tube.capColor}; border: 1px solid ${tube.capColor}50;">
        <span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: ${tube.capColor}"></span>
        ${tube.name}
      </span>
    `;
  },

  updateVolumeGuidance() {
    const collectedTubeId = document.getElementById('inputCollectedTube')?.value;
    const volNum = Number(document.getElementById('inputVolumePercent')?.value || 0);
    const feedback = document.getElementById('volumeFeedbackBadge');
    const tubeFill = document.getElementById('vialLiquidFill');
    if (!feedback) return;

    const tube = window.LAB_TUBES[collectedTubeId];
    if (!tube) {
      feedback.textContent = `Volume: ${volNum}% (Select a tube to see rule compliance)`;
      feedback.className = 'text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700';
      if (tubeFill) tubeFill.style.backgroundColor = '#94a3b8';
      return;
    }

    const min = tube.minVolumePercent;
    if (volNum < min) {
      if (tube.criticalRatio) {
        feedback.textContent = `CRITICAL UNDERFILL: ${volNum}% < Required ${min}% (9:1 ratio failed)`;
        feedback.className = 'text-xs px-2.5 py-1 rounded font-bold bg-red-100 text-red-700 border border-red-300';
        if (tubeFill) tubeFill.style.backgroundColor = '#ef4444';
      } else {
        feedback.textContent = `Below Minimum: ${volNum}% (Minimum ${min}% required)`;
        feedback.className = 'text-xs px-2.5 py-1 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-300';
        if (tubeFill) tubeFill.style.backgroundColor = '#f59e0b';
      }
    } else {
      feedback.textContent = `Compliant: ${volNum}% satisfies ${min}% threshold (Target: ${tube.idealVolumePercent}%)`;
      feedback.className = 'text-xs px-2.5 py-1 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300';
      if (tubeFill) tubeFill.style.backgroundColor = '#10b981';
    }
  },

  loadPresetIntoForm(preset) {
    if (!preset) return;

    // Fill requisition form fields
    document.getElementById('inputOrderId').value = preset.orderId;
    document.getElementById('inputSampleId').value = preset.requisitionSampleIdOverride || preset.sampleId;
    document.getElementById('inputPatientName').value = preset.patientName;
    document.getElementById('inputPatientDob').value = preset.patientDob;
    document.getElementById('inputTestCode').value = preset.testCode;
    document.getElementById('inputExpectedTube').value = preset.expectedTubeId;
    document.getElementById('inputCollectedTube').value = preset.collectedTubeId;
    
    const volSlider = document.getElementById('inputVolumePercent');
    volSlider.value = preset.volumePercent;
    document.getElementById('volumeDisplayValue').textContent = `${preset.volumePercent}%`;
    document.getElementById('vialLiquidFill').style.height = `${preset.volumePercent}%`;

    this.updateTubePreviewBadge('expectedTubePreview', preset.expectedTubeId);
    this.updateTubePreviewBadge('collectedTubePreview', preset.collectedTubeId);
    this.updateVolumeGuidance();

    // Render preset label onto preview canvas
    const previewCanvas = document.getElementById('ocrLabelCanvas');
    if (previewCanvas) {
      window.LabelStudio.renderLabelToCanvas(previewCanvas, preset);
      document.getElementById('ocrLabelPreviewContainer').classList.remove('hidden');
    }

    // Auto-run OCR simulation/extraction for the loaded preset
    this.runOCROnPreset(preset);
  },

  resetPreCheckForm() {
    document.getElementById('preCheckForm').reset();
    document.getElementById('volumeDisplayValue').textContent = '75%';
    document.getElementById('vialLiquidFill').style.height = '75%';
    document.getElementById('vialLiquidFill').style.backgroundColor = '#10b981';
    this.updateTubePreviewBadge('expectedTubePreview', '');
    this.updateTubePreviewBadge('collectedTubePreview', '');
    this.updateVolumeGuidance();

    // Reset OCR panel
    document.getElementById('ocrLabelPreviewContainer')?.classList.add('hidden');
    document.getElementById('ocrReviewPanel')?.classList.add('hidden');
    document.getElementById('ocrProgressBarContainer')?.classList.add('hidden');
    document.getElementById('resultsContainer')?.classList.add('hidden');
    this.activeOCRResult = null;
    this.isOcrModified = false;
  },

  /* -------------------------------------------------------------
   * OCR PROCESSING & REVIEW DRAWER (Features 3 & 4)
   * ------------------------------------------------------------- */
  bindOCRControls() {
    const fileInput = document.getElementById('inputLabelFile');
    const dropZone = document.getElementById('ocrDropZone');
    const previewCanvas = document.getElementById('ocrLabelCanvas');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.handleImageFile(file);
        }
      });
    }

    if (dropZone) {
      ['dragenter', 'dragover'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
          e.preventDefault();
          dropZone.classList.add('dropzone-active');
        });
      });

      ['dragleave', 'drop'].forEach(name => {
        dropZone.addEventListener(name, (e) => {
          e.preventDefault();
          dropZone.classList.remove('dropzone-active');
        });
      });

      dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          this.handleImageFile(files[0]);
        }
      });
    }

    // Accept & Apply Extracted Data Button
    const btnApplyOcr = document.getElementById('btnApplyExtractedText');
    if (btnApplyOcr) {
      btnApplyOcr.addEventListener('click', () => {
        this.applyExtractedTextToForm();
      });
    }

    // Flag changes made in the Review panel
    ['reviewOrderId', 'reviewSampleId', 'reviewTube', 'reviewPatient', 'reviewRawText'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => {
          this.isOcrModified = true;
          const badge = document.getElementById('ocrManualEditBadge');
          if (badge) badge.classList.remove('hidden');
        });
      }
    });

    // Preset selector buttons
    const selectPresetDropdown = document.getElementById('selectPresetCase');
    if (selectPresetDropdown) {
      selectPresetDropdown.addEventListener('change', (e) => {
        const presetId = e.target.value;
        if (presetId) {
          const preset = window.PRESET_LABELS.find(p => p.id === presetId);
          if (preset) this.loadPresetIntoForm(preset);
        }
      });
    }
  },

  handleImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById('ocrLabelCanvas');
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          document.getElementById('ocrLabelPreviewContainer').classList.remove('hidden');
        }
        this.executeOCR(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  runOCROnPreset(preset) {
    const canvas = document.getElementById('ocrLabelCanvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    this.executeOCR(dataUrl);
  },

  async executeOCR(imageSource) {
    const progressContainer = document.getElementById('ocrProgressBarContainer');
    const progressBar = document.getElementById('ocrProgressBar');
    const progressStatus = document.getElementById('ocrProgressStatusText');
    const reviewPanel = document.getElementById('ocrReviewPanel');

    if (progressContainer) progressContainer.classList.remove('hidden');
    if (reviewPanel) reviewPanel.classList.add('hidden');

    const result = await window.OCREngine.processLabel(imageSource, (update) => {
      if (progressBar) progressBar.style.width = `${Math.round(update.progress * 100)}%`;
      if (progressStatus) progressStatus.textContent = update.message;
    });

    this.activeOCRResult = result;
    this.isOcrModified = false;

    setTimeout(() => {
      if (progressContainer) progressContainer.classList.add('hidden');
      this.populateOCRReviewPanel(result);
    }, 300);
  },

  populateOCRReviewPanel(result) {
    const reviewPanel = document.getElementById('ocrReviewPanel');
    if (!reviewPanel) return;

    reviewPanel.classList.remove('hidden');

    document.getElementById('reviewOrderId').value = result.extractedOrderId || '';
    document.getElementById('reviewSampleId').value = result.extractedSampleId || '';
    document.getElementById('reviewTube').value = result.extractedTube || '';
    document.getElementById('reviewPatient').value = result.extractedPatientName || '';
    document.getElementById('reviewRawText').value = result.rawText || '';

    const confScore = document.getElementById('ocrConfidenceScore');
    if (confScore) {
      confScore.textContent = `${result.confidence}% Match Confidence`;
      confScore.className = result.lowConfidence 
        ? 'text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200'
        : 'text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200';
    }

    const editBadge = document.getElementById('ocrManualEditBadge');
    if (editBadge) editBadge.classList.add('hidden');
  },

  applyExtractedTextToForm() {
    const orderId = document.getElementById('reviewOrderId')?.value;
    const sampleId = document.getElementById('reviewSampleId')?.value;
    const tubeId = document.getElementById('reviewTube')?.value;
    const patientName = document.getElementById('reviewPatient')?.value;

    if (orderId) document.getElementById('inputOrderId').value = orderId;
    if (sampleId) document.getElementById('inputSampleId').value = sampleId;
    if (patientName) document.getElementById('inputPatientName').value = patientName;
    if (tubeId && window.LAB_TUBES[tubeId]) {
      document.getElementById('inputCollectedTube').value = tubeId;
      this.updateTubePreviewBadge('collectedTubePreview', tubeId);
      this.updateVolumeGuidance();
    }

    // Update activeOCRResult with any user manual corrections
    if (this.activeOCRResult) {
      this.activeOCRResult.extractedOrderId = orderId;
      this.activeOCRResult.extractedSampleId = sampleId;
      this.activeOCRResult.extractedTube = tubeId;
      this.activeOCRResult.extractedPatientName = patientName;
    }

    this.showToast('OCR extracted fields applied to requisition form.', 'success');
  },

  /* -------------------------------------------------------------
   * VALIDATION ENGINE EXECUTION & RESULTS (Features 5, 6, 7)
   * ------------------------------------------------------------- */
  handleRunValidation() {
    const orderId = document.getElementById('inputOrderId').value.trim();
    const sampleId = document.getElementById('inputSampleId').value.trim();
    const testCode = document.getElementById('inputTestCode').value;
    const expectedTubeId = document.getElementById('inputExpectedTube').value;
    const collectedTubeId = document.getElementById('inputCollectedTube').value;
    const volumePercent = Number(document.getElementById('inputVolumePercent').value || 0);
    const patientName = document.getElementById('inputPatientName').value.trim() || 'Anonymous Patient';
    const patientDob = document.getElementById('inputPatientDob').value || '1980-01-01';

    if (!orderId || !sampleId) {
      this.showToast('Please specify both Order ID and Sample ID before validation.', 'warning');
      return;
    }

    if (!testCode) {
      this.showToast('Please select a laboratory assay test.', 'warning');
      return;
    }

    const test = window.LAB_TESTS.find(t => t.code === testCode);

    // Call Validation Engine
    const validationResult = window.ValidationEngine.validateSample({
      orderId,
      sampleId,
      testCode,
      expectedTubeId,
      collectedTubeId,
      volumePercent,
      ocrData: this.activeOCRResult,
      isManualCorrected: this.isOcrModified
    });

    // Assemble complete sample record
    const sampleRecord = {
      id: sampleId,
      orderId,
      patientName,
      patientDob,
      testCode,
      testName: test ? test.name : testCode,
      expectedTubeId,
      collectedTubeId,
      volumePercent,
      timestamp: new Date().toISOString(),
      phlebotomistId: 'Technologist (Auto-Ingest)',
      overallStatus: validationResult.overallStatus,
      statusLabel: validationResult.statusLabel,
      severity: validationResult.severity,
      badgeClass: validationResult.badgeClass,
      summaryText: validationResult.summaryText,
      reasons: validationResult.reasons,
      ocrData: this.activeOCRResult
    };

    // Save record to LocalStorage
    window.StorageService.saveSample(sampleRecord);

    // Render results view
    this.renderValidationResult(sampleRecord, validationResult);

    // Update stats and charts
    this.refreshDashboardStats();
    this.renderHistoryTable();

    // Scroll to results
    document.getElementById('resultsContainer')?.scrollIntoView({ behavior: 'smooth' });

    // Toast announcement
    if (validationResult.overallStatus === 'NO_MISMATCH') {
      this.showToast('Validation Complete: No Mismatch Found!', 'success');
    } else if (validationResult.overallStatus === 'REVIEW_REQUIRED') {
      this.showToast('Validation Complete: Review Required.', 'warning');
    } else {
      this.showToast('Validation Complete: Mismatch Detected!', 'danger');
    }
  },

  renderValidationResult(sampleRecord, validation) {
    const container = document.getElementById('resultsContainer');
    if (!container) return;

    container.classList.remove('hidden');

    // Header banner with status badge
    const headerBanner = document.getElementById('resultHeaderBanner');
    const badgeEl = document.getElementById('resultStatusBadge');
    const summaryEl = document.getElementById('resultSummaryText');

    let bannerBg = 'bg-emerald-50 border-emerald-200';
    let iconSvg = '<svg class="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';

    if (validation.overallStatus === 'REVIEW_REQUIRED') {
      bannerBg = 'bg-amber-50 border-amber-200';
      iconSvg = '<svg class="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>';
    } else if (validation.overallStatus === 'MISMATCH_DETECTED') {
      bannerBg = 'bg-rose-50 border-rose-200';
      iconSvg = '<svg class="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>';
    }

    if (headerBanner) {
      headerBanner.className = `p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${bannerBg}`;
      headerBanner.innerHTML = `
        <div class="flex items-start gap-4">
          <div class="p-2 rounded-lg bg-white shadow-xs">
            ${iconSvg}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase font-bold tracking-wider text-slate-500">Inspection Outcome</span>
              <span class="text-xs text-slate-400">• ${new Date().toLocaleTimeString()}</span>
            </div>
            <h2 class="text-2xl font-black ${validation.overallStatus === 'NO_MISMATCH' ? 'text-emerald-900' : validation.overallStatus === 'REVIEW_REQUIRED' ? 'text-amber-900' : 'text-rose-900'}">
              ${validation.statusLabel}
            </h2>
            <p class="text-sm font-medium text-slate-700 mt-1">${validation.summaryText}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 self-start md:self-auto">
          <button id="btnSaveToHistoryFromResults" class="px-3.5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-xs transition">
            View in History Log
          </button>
        </div>
      `;

      // Bind button inside dynamic banner
      document.getElementById('btnSaveToHistoryFromResults')?.addEventListener('click', () => {
        this.switchTab('history');
      });
    }

    // Render Reason-by-Reason Audit Breakdown (Feature 7)
    const reasonsListEl = document.getElementById('resultReasonsList');
    if (reasonsListEl) {
      reasonsListEl.innerHTML = validation.reasons.map((r, i) => {
        let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
        let icon = '✓ PASS';
        let borderLeft = 'border-l-emerald-500';

        if (r.status === 'WARN') {
          badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
          icon = '⚠ REVIEW';
          borderLeft = 'border-l-amber-500';
        } else if (r.status === 'FAIL') {
          badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
          icon = '✕ MISMATCH';
          borderLeft = 'border-l-rose-500';
        }

        return `
          <div class="p-4 bg-white rounded-lg border border-slate-200 border-l-4 ${borderLeft} shadow-2xs">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">${r.category}</span>
              <span class="text-xs px-2 py-0.5 rounded font-black border ${badgeColor}">${icon}</span>
            </div>
            <h4 class="text-sm font-bold text-slate-900">${r.title}</h4>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">${r.detail}</p>
            <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded">
              <strong class="text-slate-700 whitespace-nowrap">Clinical Rationale:</strong>
              <span class="italic text-slate-600">${r.clinicalImpact}</span>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  /* -------------------------------------------------------------
   * DASHBOARD METRICS & KPI UPDATES (Feature 1)
   * ------------------------------------------------------------- */
  refreshDashboardStats() {
    const stats = window.StorageService ? window.StorageService.getStatistics() : null;
    if (!stats) return;

    // Update KPI numbers
    this.setText('kpiTotalChecks', stats.total);
    this.setText('kpiNoMismatch', `${stats.noMismatchCount}`);
    this.setText('kpiNoMismatchRate', `${stats.noMismatchRate}% Clean Pass Rate`);
    this.setText('kpiReviewRequired', `${stats.reviewRequiredCount}`);
    this.setText('kpiReviewRequiredRate', `${stats.reviewRequiredRate}% of intake`);
    this.setText('kpiMismatchDetected', `${stats.mismatchCount}`);
    this.setText('kpiMismatchRate', `${stats.mismatchRate}% Discrepancy Rate`);
    this.setText('kpiVolumeCompliance', `${stats.volumeComplianceRate}%`);
    this.setText('kpiAvgVolume', `Avg: ${stats.averageVolume}% Fill`);

    // Render Recent Flagged List in Dashboard
    this.renderDashboardRecentAlerts();
  },

  renderDashboardRecentAlerts() {
    const container = document.getElementById('dashboardRecentAlerts');
    if (!container) return;

    const samples = window.StorageService.getSamples();
    const flagged = samples.filter(s => s.overallStatus !== 'NO_MISMATCH').slice(0, 5);

    if (flagged.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-slate-400 text-sm">
          No active flagged specimens. All recent pre-checks passed validation!
        </div>
      `;
      return;
    }

    container.innerHTML = flagged.map(s => {
      const isMismatch = s.overallStatus === 'MISMATCH_DETECTED';
      const badgeCls = isMismatch ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800';
      const label = isMismatch ? 'Mismatch' : 'Review';

      return `
        <div class="p-3.5 hover:bg-slate-50 transition border-b border-slate-100 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-mono text-xs font-bold text-slate-900">${s.id}</span>
              <span class="text-xs px-2 py-0.5 rounded font-bold ${badgeCls}">${label}</span>
              <span class="text-xs text-slate-400 hidden sm:inline">• ${s.testName}</span>
            </div>
            <p class="text-xs text-slate-600 truncate mt-0.5">${s.summaryText}</p>
          </div>
          <button data-audit-sample="${s.id}" class="text-xs font-semibold text-sky-600 hover:text-sky-800 whitespace-nowrap">
            Audit Details →
          </button>
        </div>
      `;
    }).join('');

    // Bind audit clicks
    container.querySelectorAll('[data-audit-sample]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-audit-sample');
        this.openSampleDetailModal(id);
      });
    });
  },

  /* -------------------------------------------------------------
   * SAMPLE HISTORY TABLE & FILTERS (Feature 8)
   * ------------------------------------------------------------- */
  bindHistoryControls() {
    const searchInput = document.getElementById('inputHistorySearch');
    const statusFilter = document.getElementById('filterHistoryStatus');
    const testFilter = document.getElementById('filterHistoryTest');
    const sortSelect = document.getElementById('filterHistorySort');
    const btnExportCsv = document.getElementById('btnExportCsv');
    const btnExportJson = document.getElementById('btnExportJson');

    const triggerRefresh = () => this.renderHistoryTable();

    if (searchInput) searchInput.addEventListener('input', triggerRefresh);
    if (statusFilter) statusFilter.addEventListener('change', triggerRefresh);
    if (testFilter) testFilter.addEventListener('change', triggerRefresh);
    if (sortSelect) sortSelect.addEventListener('change', triggerRefresh);

    if (btnExportCsv) {
      btnExportCsv.addEventListener('click', () => this.exportHistoryToCsv());
    }

    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => this.exportHistoryToJson());
    }
  },

  getFilteredHistorySamples() {
    let samples = window.StorageService ? window.StorageService.getSamples() : [];

    const searchQuery = (document.getElementById('inputHistorySearch')?.value || '').trim().toLowerCase();
    const statusFilter = document.getElementById('filterHistoryStatus')?.value || '';
    const testFilter = document.getElementById('filterHistoryTest')?.value || '';
    const sortOrder = document.getElementById('filterHistorySort')?.value || 'newest';

    // Filter by Search Query
    if (searchQuery) {
      samples = samples.filter(s => {
        return (s.id && s.id.toLowerCase().includes(searchQuery)) ||
               (s.orderId && s.orderId.toLowerCase().includes(searchQuery)) ||
               (s.patientName && s.patientName.toLowerCase().includes(searchQuery)) ||
               (s.testName && s.testName.toLowerCase().includes(searchQuery));
      });
    }

    // Filter by Status
    if (statusFilter) {
      samples = samples.filter(s => s.overallStatus === statusFilter);
    }

    // Filter by Test
    if (testFilter) {
      samples = samples.filter(s => s.testCode === testFilter);
    }

    // Sorting
    samples.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortOrder === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
      if (sortOrder === 'volume_desc') return (b.volumePercent || 0) - (a.volumePercent || 0);
      if (sortOrder === 'volume_asc') return (a.volumePercent || 0) - (b.volumePercent || 0);
      return 0;
    });

    return samples;
  },

  renderHistoryTable() {
    const tableBody = document.getElementById('historyTableBody');
    const recordsCount = document.getElementById('historyRecordsCount');
    if (!tableBody) return;

    const filtered = this.getFilteredHistorySamples();

    if (recordsCount) {
      recordsCount.textContent = `Showing ${filtered.length} specimen records`;
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-12 text-slate-400 text-sm">
            No specimens match current search or filter criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = filtered.map(s => {
      const dateStr = s.timestamp ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'STAT';
      const expectedTube = window.LAB_TUBES[s.expectedTubeId];
      const collectedTube = window.LAB_TUBES[s.collectedTubeId];

      let statusBadge = '<span class="status-badge-pass text-xs px-2.5 py-1 rounded-full font-bold">No Mismatch Found</span>';
      if (s.overallStatus === 'REVIEW_REQUIRED') {
        statusBadge = '<span class="status-badge-review text-xs px-2.5 py-1 rounded-full font-bold">Review Required</span>';
      } else if (s.overallStatus === 'MISMATCH_DETECTED') {
        statusBadge = '<span class="status-badge-mismatch text-xs px-2.5 py-1 rounded-full font-bold">Mismatch Detected</span>';
      }

      // Volume color
      const volNum = Number(s.volumePercent) || 0;
      let volClass = 'text-emerald-700 bg-emerald-50';
      if (volNum < (collectedTube?.minVolumePercent || 50)) {
        volClass = collectedTube?.criticalRatio ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50';
      }

      const tubeMatch = s.expectedTubeId === s.collectedTubeId;

      return `
        <tr class="hover:bg-slate-50 border-b border-slate-100 transition">
          <td class="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">${dateStr}</td>
          <td class="px-4 py-3">
            <span class="font-mono text-xs font-bold text-slate-900 block">${s.id}</span>
            <span class="text-3xs text-slate-400 block">${s.orderId}</span>
          </td>
          <td class="px-4 py-3">
            <span class="text-xs font-semibold text-slate-900 block truncate max-w-[140px]">${s.patientName}</span>
            <span class="text-3xs text-slate-500 block truncate max-w-[140px]">${s.testName}</span>
          </td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${collectedTube?.capColor || '#94a3b8'}"></span>
              <span class="text-xs font-medium text-slate-700 truncate max-w-[110px]">${collectedTube?.name ? collectedTube.name.split('(')[0] : s.collectedTubeId}</span>
            </div>
            ${!tubeMatch ? `<span class="text-3xs text-rose-600 font-bold block">Exp: ${expectedTube?.name ? expectedTube.name.split('(')[0] : s.expectedTubeId}</span>` : ''}
          </td>
          <td class="px-4 py-3 whitespace-nowrap">
            <span class="text-xs font-bold px-2 py-0.5 rounded-sm ${volClass}">${volNum}%</span>
          </td>
          <td class="px-4 py-3 whitespace-nowrap">${statusBadge}</td>
          <td class="px-4 py-3 text-xs text-slate-600 max-w-[200px] truncate" title="${s.summaryText}">${s.summaryText}</td>
          <td class="px-4 py-3 text-right whitespace-nowrap">
            <button data-view-sample="${s.id}" class="text-xs px-2.5 py-1 font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded mr-1 transition">
              Audit
            </button>
            <button data-delete-sample="${s.id}" class="text-xs px-2 py-1 font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded transition" title="Delete record">
              ✕
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Bind action buttons
    tableBody.querySelectorAll('[data-view-sample]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-view-sample');
        this.openSampleDetailModal(id);
      });
    });

    tableBody.querySelectorAll('[data-delete-sample]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-delete-sample');
        if (confirm(`Remove specimen record ${id} from history?`)) {
          window.StorageService.deleteSample(id);
          this.refreshDashboardStats();
          this.renderHistoryTable();
          this.showToast(`Deleted specimen ${id}`, 'info');
        }
      });
    });
  },

  exportHistoryToCsv() {
    const samples = this.getFilteredHistorySamples();
    if (samples.length === 0) {
      this.showToast('No records to export.', 'warning');
      return;
    }

    const headers = ['Sample ID', 'Order ID', 'Patient Name', 'DOB', 'Test Code', 'Test Name', 'Expected Tube', 'Collected Tube', 'Volume %', 'Pre-Check Outcome', 'Timestamp', 'Summary Reason'];
    const rows = samples.map(s => [
      `"${s.id || ''}"`,
      `"${s.orderId || ''}"`,
      `"${s.patientName || ''}"`,
      `"${s.patientDob || ''}"`,
      `"${s.testCode || ''}"`,
      `"${s.testName || ''}"`,
      `"${s.expectedTubeId || ''}"`,
      `"${s.collectedTubeId || ''}"`,
      s.volumePercent || 0,
      `"${s.statusLabel || ''}"`,
      `"${s.timestamp || ''}"`,
      `"${(s.summaryText || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LabSentry_PreCheck_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Exported CSV audit ledger.', 'success');
  },

  exportHistoryToJson() {
    const samples = this.getFilteredHistorySamples();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(samples, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `LabSentry_AuditLedger_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast('Exported JSON audit ledger.', 'success');
  },

  /* -------------------------------------------------------------
   * SAMPLE AUDIT MODAL
   * ------------------------------------------------------------- */
  openSampleDetailModal(sampleId) {
    const sample = window.StorageService.getSampleById(sampleId);
    if (!sample) return;

    this.selectedSampleDetail = sample;
    const modal = document.getElementById('modalSampleDetail');
    if (!modal) return;

    document.getElementById('modalDetailSampleId').textContent = sample.id;
    document.getElementById('modalDetailOrderId').textContent = sample.orderId;
    document.getElementById('modalDetailPatient').textContent = `${sample.patientName} (DOB: ${sample.patientDob || 'N/A'})`;
    document.getElementById('modalDetailTest').textContent = sample.testName;
    document.getElementById('modalDetailTimestamp').textContent = new Date(sample.timestamp).toLocaleString();
    document.getElementById('modalDetailPhleb').textContent = sample.phlebotomistId || 'Technologist';

    // Status banner
    const statusBox = document.getElementById('modalDetailStatusBox');
    let colorClass = 'bg-emerald-50 text-emerald-900 border-emerald-200';
    if (sample.overallStatus === 'REVIEW_REQUIRED') colorClass = 'bg-amber-50 text-amber-900 border-amber-200';
    if (sample.overallStatus === 'MISMATCH_DETECTED') colorClass = 'bg-rose-50 text-rose-900 border-rose-200';

    statusBox.className = `p-4 rounded-xl border mb-4 ${colorClass}`;
    statusBox.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-xs uppercase font-bold tracking-wider">Verification Status</span>
        <span class="text-xs font-mono font-bold">${sample.statusLabel}</span>
      </div>
      <p class="text-sm font-semibold mt-1">${sample.summaryText}</p>
    `;

    // Tubes & Volume
    const expTube = window.LAB_TUBES[sample.expectedTubeId];
    const colTube = window.LAB_TUBES[sample.collectedTubeId];
    document.getElementById('modalDetailExpectedTube').textContent = expTube ? expTube.name : sample.expectedTubeId;
    document.getElementById('modalDetailCollectedTube').textContent = colTube ? colTube.name : sample.collectedTubeId;
    document.getElementById('modalDetailVolume').textContent = `${sample.volumePercent}% (Min Rule: ${colTube ? colTube.minVolumePercent : 50}%)`;

    // Reasons list
    const reasonsContainer = document.getElementById('modalDetailReasons');
    if (reasonsContainer && sample.reasons) {
      reasonsContainer.innerHTML = sample.reasons.map(r => `
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div class="flex items-center justify-between font-bold text-slate-800">
            <span>${r.category}</span>
            <span class="${r.status === 'PASS' ? 'text-emerald-600' : r.status === 'WARN' ? 'text-amber-600' : 'text-rose-600'}">${r.status}</span>
          </div>
          <p class="text-slate-700 mt-1">${r.detail}</p>
          <p class="text-slate-500 italic mt-1">Impact: ${r.clinicalImpact}</p>
        </div>
      `).join('');
    }

    // Raw OCR Text if present
    const ocrBox = document.getElementById('modalDetailOcrRaw');
    if (ocrBox) {
      ocrBox.textContent = sample.ocrData ? (sample.ocrData.rawText || 'OCR data recorded.') : 'Manual intake (No OCR raw text).';
    }

    this.openModal('modalSampleDetail');
  },

  /* -------------------------------------------------------------
   * TUBE & VOLUME RULES REFERENCE TAB
   * ------------------------------------------------------------- */
  renderRulesReference() {
    const container = document.getElementById('rulesGridContainer');
    if (!container || !window.LAB_TUBES) return;

    const tubes = Object.values(window.LAB_TUBES);
    container.innerHTML = tubes.map(t => `
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition">
        <div class="h-3" style="background-color: ${t.capColor}"></div>
        <div class="p-5">
          <div class="flex items-start justify-between gap-2">
            <h3 class="text-base font-bold text-slate-900">${t.name}</h3>
            <span class="text-xs px-2 py-0.5 rounded font-bold ${t.criticalRatio ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}">
              ${t.criticalRatio ? 'Critical 9:1 Ratio' : 'Standard Tube'}
            </span>
          </div>
          <p class="text-xs font-semibold text-slate-500 mt-1">${t.additive}</p>
          
          <div class="grid grid-cols-2 gap-2 my-3 py-2 border-y border-slate-100 text-xs">
            <div>
              <span class="text-slate-400 block text-3xs">MINIMUM VOLUME</span>
              <strong class="text-slate-800 text-sm">${t.minVolumePercent}%</strong>
            </div>
            <div>
              <span class="text-slate-400 block text-3xs">IDEAL TARGET</span>
              <strong class="text-emerald-700 text-sm">${t.idealVolumePercent}%</strong>
            </div>
            <div>
              <span class="text-slate-400 block text-3xs">INVERSIONS</span>
              <span class="text-slate-700 font-medium">${t.inversions}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-3xs">SPECIMEN</span>
              <span class="text-slate-700 font-medium">${t.specimenType}</span>
            </div>
          </div>

          <div class="text-xs">
            <span class="font-bold text-slate-700 block mb-1">Common Tests:</span>
            <div class="flex flex-wrap gap-1">
              ${t.primaryUses.map(u => `<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-3xs font-medium">${u}</span>`).join('')}
            </div>
          </div>

          <div class="mt-3 p-2.5 rounded bg-slate-50 text-xs text-slate-600 border border-slate-100">
            <strong class="text-slate-800 block text-3xs uppercase">Clinical Rationale & Underfill Risk:</strong>
            ${t.clinicalRationale}
          </div>
        </div>
      </div>
    `).join('');
  },

  /* -------------------------------------------------------------
   * SYNTHETIC LABEL STUDIO CONTROLS
   * ------------------------------------------------------------- */
  bindLabelStudio() {
    const canvas = document.getElementById('studioCanvas');
    const btnRender = document.getElementById('btnStudioRender');
    const btnDownload = document.getElementById('btnStudioDownload');
    const btnSendToOcr = document.getElementById('btnStudioSendToOcr');
    const selectPreset = document.getElementById('studioPresetSelect');

    if (selectPreset) {
      selectPreset.innerHTML = '<option value="">-- Choose a Clinical Test Scenario --</option>' +
        window.PRESET_LABELS.map(p => `<option value="${p.id}">${p.title} (${p.badge})</option>`).join('');

      selectPreset.addEventListener('change', (e) => {
        const preset = window.PRESET_LABELS.find(p => p.id === e.target.value);
        if (preset) {
          document.getElementById('studioOrderId').value = preset.orderId;
          document.getElementById('studioSampleId').value = preset.sampleId;
          document.getElementById('studioPatient').value = preset.patientName;
          document.getElementById('studioDob').value = preset.patientDob;
          document.getElementById('studioTest').value = preset.testName;
          document.getElementById('studioTube').value = preset.collectedTubeId;
          document.getElementById('studioVolume').value = preset.volumePercent;
          this.renderStudioLabel();
        }
      });
    }

    if (btnRender) {
      btnRender.addEventListener('click', () => this.renderStudioLabel());
    }

    if (btnDownload) {
      btnDownload.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `Vial_Label_${document.getElementById('studioSampleId').value || 'SAMPLE'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        this.showToast('Downloaded synthetic label PNG.', 'success');
      });
    }

    if (btnSendToOcr) {
      btnSendToOcr.addEventListener('click', () => {
        const dataUrl = canvas.toDataURL('image/png');
        this.switchTab('precheck');

        // Copy canvas onto Pre-check preview canvas
        const precheckCanvas = document.getElementById('ocrLabelCanvas');
        const img = new Image();
        img.onload = () => {
          precheckCanvas.width = img.width;
          precheckCanvas.height = img.height;
          precheckCanvas.getContext('2d').drawImage(img, 0, 0);
          document.getElementById('ocrLabelPreviewContainer').classList.remove('hidden');
          this.executeOCR(dataUrl);
        };
        img.src = dataUrl;

        this.showToast('Transferred synthetic label to OCR pre-check scanner!', 'info');
      });
    }
  },

  initLabelStudioCanvas() {
    const canvas = document.getElementById('studioCanvas');
    if (!canvas) return;
    const defaultData = window.PRESET_LABELS[0];
    window.LabelStudio.renderLabelToCanvas(canvas, defaultData);
  },

  renderStudioLabel() {
    const canvas = document.getElementById('studioCanvas');
    if (!canvas) return;

    const labelData = {
      orderId: document.getElementById('studioOrderId').value || 'ORD-9000',
      sampleId: document.getElementById('studioSampleId').value || 'SMP-2024-9000',
      patientName: document.getElementById('studioPatient').value || 'TEST PATIENT',
      patientDob: document.getElementById('studioDob').value || '1985-01-01',
      testName: document.getElementById('studioTest').value || 'Complete Blood Count',
      collectedTubeId: document.getElementById('studioTube').value || 'LAVENDER_EDTA',
      volumePercent: Number(document.getElementById('studioVolume').value || 80),
      phlebotomistId: 'PHL-STUDIO'
    };

    window.LabelStudio.renderLabelToCanvas(canvas, labelData);
    this.showToast('Label re-rendered.', 'info');
  },

  /* -------------------------------------------------------------
   * MODALS & RESET DEMO DATA (Feature 10)
   * ------------------------------------------------------------- */
  bindModals() {
    // Universal close button for modals
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        this.closeModal(modalId);
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          backdrop.classList.add('hidden');
        }
      });
    });

    // Confirm Reset Demo Data
    const btnConfirmReset = document.getElementById('btnConfirmResetDemo');
    if (btnConfirmReset) {
      btnConfirmReset.addEventListener('click', () => {
        window.StorageService.resetDemoData();
        this.closeModal('modalResetConfirm');
        this.refreshDashboardStats();
        this.renderHistoryTable();
        if (window.DashboardCharts) window.DashboardCharts.renderAllCharts();
        this.showToast('Demo data successfully restored to default clinical records.', 'success');
      });
    }

    // Disclaimer modal open button
    document.querySelectorAll('[data-open-disclaimer]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.openModal('modalDisclaimer');
      });
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  },

  /* -------------------------------------------------------------
   * TOAST NOTIFICATIONS
   * ------------------------------------------------------------- */
  showToast(message, type = 'info') {
    const toast = document.getElementById('appToast');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = message;

    let bg = 'bg-slate-900 text-white';
    let icon = 'ℹ️';

    if (type === 'success') {
      bg = 'bg-emerald-900 text-emerald-100 border border-emerald-700';
      icon = '✓';
    } else if (type === 'warning') {
      bg = 'bg-amber-900 text-amber-100 border border-amber-700';
      icon = '⚠️';
    } else if (type === 'danger') {
      bg = 'bg-rose-900 text-rose-100 border border-rose-700';
      icon = '✕';
    }

    toast.className = `fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 opacity-100 ${bg}`;
    if (toastIcon) toastIcon.textContent = icon;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.add('translate-y-10', 'opacity-0');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
  },

  setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }
};

window.App = App;

