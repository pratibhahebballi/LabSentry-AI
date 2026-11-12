/**
 * Automated Test Suite for LabSentry AI Logic and Rules
 */

// Mock window and localStorage
global.window = global;

const localStorageStore = {};
global.localStorage = {
  getItem: (key) => localStorageStore[key] || null,
  setItem: (key, val) => { localStorageStore[key] = String(val); },
  removeItem: (key) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach(k => delete localStorageStore[k]); }
};

// Load modules
require('./js/rules.js');
require('./js/storage.js');
require('./js/ocr.js');
require('./js/labelStudio.js');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failCount++;
  }
}

console.log('=== TEST SUITE: LabSentry AI Rules & Validation Engine ===');

// 1. Check Data Structures
assert(Object.keys(window.LAB_TUBES).length >= 6, 'Loaded all standard laboratory tube types');
assert(window.LAB_TESTS.length >= 8, 'Loaded standard laboratory assay catalogue');
assert(window.LAB_TUBES.LIGHT_BLUE_CITRATE.minVolumePercent === 90, 'Citrate tube enforces 90% strict minimum rule');

// 2. Scenario A: Clean CBC Pass
const cleanCbc = window.ValidationEngine.validateSample({
  orderId: 'ORD-9021',
  sampleId: 'SMP-2024-8801',
  testCode: 'CBC',
  expectedTubeId: 'LAVENDER_EDTA',
  collectedTubeId: 'LAVENDER_EDTA',
  volumePercent: 85,
  ocrData: {
    extractedOrderId: 'ORD-9021',
    extractedSampleId: 'SMP-2024-8801',
    confidence: 98
  }
});

assert(cleanCbc.overallStatus === 'NO_MISMATCH', 'Clean CBC yields NO_MISMATCH status');
assert(cleanCbc.statusLabel === 'No Mismatch Found', 'Status label matches "No Mismatch Found"');
assert(cleanCbc.severity === 'success', 'Clean CBC severity is "success"');
assert(cleanCbc.reasons.length >= 4, 'Includes detailed reasons for all criteria');

// 3. Scenario B: Tube Additive Mismatch (PT/INR in EDTA)
const tubeMismatch = window.ValidationEngine.validateSample({
  orderId: 'ORD-9022',
  sampleId: 'SMP-2024-8802',
  testCode: 'PT_INR',
  expectedTubeId: 'LIGHT_BLUE_CITRATE',
  collectedTubeId: 'LAVENDER_EDTA',
  volumePercent: 90
});

assert(tubeMismatch.overallStatus === 'MISMATCH_DETECTED', 'Tube additive mismatch yields MISMATCH_DETECTED');
assert(tubeMismatch.statusLabel === 'Mismatch Detected', 'Status label is "Mismatch Detected"');
assert(tubeMismatch.reasons.some(r => r.id === 'TUBE_MISMATCH'), 'Identifies TUBE_MISMATCH in checklist');
assert(tubeMismatch.reasons.some(r => r.status === 'FAIL'), 'Contains FAIL reason for incorrect tube');

// 4. Scenario C: Critical Underfill in Citrate Tube (58% < 90%)
const citrateUnderfill = window.ValidationEngine.validateSample({
  orderId: 'ORD-9023',
  sampleId: 'SMP-2024-8803',
  testCode: 'PT_INR',
  expectedTubeId: 'LIGHT_BLUE_CITRATE',
  collectedTubeId: 'LIGHT_BLUE_CITRATE',
  volumePercent: 58
});

assert(citrateUnderfill.overallStatus === 'MISMATCH_DETECTED', 'Citrate underfill (<90%) triggers MISMATCH_DETECTED');
assert(citrateUnderfill.reasons.some(r => r.id === 'VOL_CRITICAL_UNDERFILL'), 'Flags VOL_CRITICAL_UNDERFILL reason');

// 5. Scenario D: Sample ID Barcode Mismatch
const smpMismatch = window.ValidationEngine.validateSample({
  orderId: 'ORD-9024',
  sampleId: 'SMP-2024-8804',
  testCode: 'BMP',
  expectedTubeId: 'GOLD_SST',
  collectedTubeId: 'GOLD_SST',
  volumePercent: 80,
  ocrData: {
    extractedOrderId: 'ORD-9024',
    extractedSampleId: 'SMP-2024-9999' // Barcode differs from Requisition
  }
});

assert(smpMismatch.overallStatus === 'MISMATCH_DETECTED', 'Mismatched barcode triggers MISMATCH_DETECTED');
assert(smpMismatch.reasons.some(r => r.id === 'SMP_ID_MISMATCH'), 'Identifies SMP_ID_MISMATCH');

// 6. Scenario E: Sub-optimal Volume (Review Required)
const subOptimal = window.ValidationEngine.validateSample({
  orderId: 'ORD-9025',
  sampleId: 'SMP-2024-8805',
  testCode: 'CMP',
  expectedTubeId: 'GOLD_SST',
  collectedTubeId: 'GOLD_SST',
  volumePercent: 42 // Near 40% threshold for SST
});

assert(subOptimal.overallStatus === 'REVIEW_REQUIRED', 'Near-minimum SST volume triggers REVIEW_REQUIRED');
assert(subOptimal.statusLabel === 'Review Required', 'Status label is "Review Required"');
assert(subOptimal.reasons.some(r => r.status === 'WARN'), 'Contains WARN severity for supervisor review');

// 7. Scenario F: Technician Manual Correction Override
const manualOverride = window.ValidationEngine.validateSample({
  orderId: 'ORD-9026',
  sampleId: 'SMP-2024-8806',
  testCode: 'HBA1C',
  expectedTubeId: 'LAVENDER_EDTA',
  collectedTubeId: 'LAVENDER_EDTA',
  volumePercent: 80,
  ocrData: { confidence: 80 },
  isManualCorrected: true
});

assert(manualOverride.overallStatus === 'REVIEW_REQUIRED', 'Manual technician edit logs REVIEW_REQUIRED audit state');
assert(manualOverride.reasons.some(r => r.id === 'MANUAL_CORRECTION_AUDIT'), 'Flags MANUAL_CORRECTION_AUDIT in quality log');

console.log('\n=== TEST SUITE: LocalStorage & Statistics Service ===');

// Reset demo data
window.StorageService.resetDemoData();
const samples = window.StorageService.getSamples();
assert(samples.length === 12, 'Default seed dataset has exactly 12 clinical records');

// Save a new record
const newSample = {
  id: 'SMP-TEST-999',
  orderId: 'ORD-TEST-999',
  patientName: 'Unit Test Patient',
  testCode: 'CBC',
  expectedTubeId: 'LAVENDER_EDTA',
  collectedTubeId: 'LAVENDER_EDTA',
  volumePercent: 85,
  overallStatus: 'NO_MISMATCH',
  statusLabel: 'No Mismatch Found',
  reasons: []
};
window.StorageService.saveSample(newSample);
assert(window.StorageService.getSamples().length === 13, 'saveSample increments records to 13');
assert(window.StorageService.getSampleById('SMP-TEST-999') !== null, 'getSampleById retrieves new sample');

// Delete sample
window.StorageService.deleteSample('SMP-TEST-999');
assert(window.StorageService.getSamples().length === 12, 'deleteSample decrements records back to 12');

// Statistics calculations
const stats = window.StorageService.getStatistics();
assert(stats.total === 12, 'Calculates total sample count (12)');
assert(stats.noMismatchCount > 0, `Computed clean pass count: ${stats.noMismatchCount}`);
assert(stats.reviewRequiredCount > 0, `Computed review count: ${stats.reviewRequiredCount}`);
assert(stats.mismatchCount > 0, `Computed mismatch count: ${stats.mismatchCount}`);
assert(stats.volumeComplianceRate > 0, `Computed volume compliance rate: ${stats.volumeComplianceRate}%`);
assert(stats.discrepancyCounts.tubeMismatch >= 2, 'Counts tube mismatch discrepancies');
assert(stats.discrepancyCounts.volumeCritical >= 1, 'Counts volume critical discrepancies');

console.log('\n=== TEST SUITE: OCR Entity Extraction Engine ===');

const mockRawText = `
ST. JUDE CLINICAL LABORATORIES
SPECIMEN ACCESSION & CHAIN OF CUSTODY
ORDER: ORD-2024-7711
SAMPLE: SMP-9912-A
PATIENT: Vance, Eleanor
DOB: 1984-06-14
TEST: Complete Blood Count (CBC)
TUBE: K2 EDTA Lavender
VOLUME: 85%
`;

const extracted = window.OCREngine.extractLaboratoryEntities(mockRawText, 95);
assert(extracted.extractedOrderId === 'ORD-2024-7711', `Extracted Order ID: ${extracted.extractedOrderId}`);
assert(extracted.extractedSampleId === 'SMP-9912-A', `Extracted Sample ID: ${extracted.extractedSampleId}`);
assert(extracted.extractedPatientName.includes('Vance'), `Extracted Patient Name: ${extracted.extractedPatientName}`);
assert(extracted.extractedTest === 'CBC', `Extracted Test Code: ${extracted.extractedTest}`);
assert(extracted.extractedTube === 'LAVENDER_EDTA', `Extracted Tube Type: ${extracted.extractedTube}`);
assert(!extracted.lowConfidence, 'High confidence flag set correctly');

console.log('\n=== TEST SUITE: Preset Test Scenarios ===');
assert(window.PRESET_LABELS.length === 6, 'Contains 6 diverse clinical preset test scenarios');
const preset1 = window.PRESET_LABELS[0];
assert(preset1.expectedTubeId === preset1.collectedTubeId, 'Preset 1 is clean matching tube');
const preset2 = window.PRESET_LABELS[1];
assert(preset2.expectedTubeId !== preset2.collectedTubeId, 'Preset 2 is tube color discrepancy');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`========================================`);

if (failCount > 0) {
  process.exit(1);
}

