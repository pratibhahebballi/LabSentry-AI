/**
 * LabSentry AI - Synthetic Vial Barcode Label Studio & Realistic Presets
 * 
 * DISCLAIMER: Educational prototype using synthetic demo data only.
 */

const PRESET_LABELS = [
  {
    id: 'preset-clean-cbc',
    title: 'Clean Pass: Complete Blood Count',
    subtitle: 'Matching EDTA Lavender tube, optimal volume (85%)',
    badge: 'Expected: No Mismatch',
    badgeType: 'pass',
    orderId: 'ORD-9021',
    sampleId: 'SMP-2024-8801',
    patientName: 'Eleanor Vance',
    patientDob: '1984-06-14',
    testCode: 'CBC',
    testName: 'Complete Blood Count (CBC)',
    expectedTubeId: 'LAVENDER_EDTA',
    collectedTubeId: 'LAVENDER_EDTA',
    volumePercent: 85,
    phlebotomistId: 'PHL-402 (Nurse Sarah)'
  },
  {
    id: 'preset-tube-mismatch',
    title: 'Mismatch: Wrong Tube Additive',
    subtitle: 'PT/INR requisition with Lavender EDTA collected instead of Citrate',
    badge: 'Expected: Mismatch Detected',
    badgeType: 'mismatch',
    orderId: 'ORD-9022',
    sampleId: 'SMP-2024-8802',
    patientName: 'Marcus Holloway',
    patientDob: '1972-11-03',
    testCode: 'PT_INR',
    testName: 'Prothrombin Time / INR (PT/INR)',
    expectedTubeId: 'LIGHT_BLUE_CITRATE',
    collectedTubeId: 'LAVENDER_EDTA', // DISCREPANCY
    volumePercent: 90,
    phlebotomistId: 'PHL-119 (David K.)'
  },
  {
    id: 'preset-critical-underfill',
    title: 'Mismatch: Critical Citrate Underfill',
    subtitle: 'Sodium Citrate tube at 58% (violates mandatory 90% fill ratio)',
    badge: 'Expected: Mismatch Detected',
    badgeType: 'mismatch',
    orderId: 'ORD-9023',
    sampleId: 'SMP-2024-8803',
    patientName: 'Claire Redfield',
    patientDob: '1990-03-29',
    testCode: 'PT_INR',
    testName: 'Prothrombin Time / INR (PT/INR)',
    expectedTubeId: 'LIGHT_BLUE_CITRATE',
    collectedTubeId: 'LIGHT_BLUE_CITRATE',
    volumePercent: 58, // CRITICAL UNDERFILL
    phlebotomistId: 'PHL-305 (Rachel T.)'
  },
  {
    id: 'preset-sample-id-mismatch',
    title: 'Mismatch: Barcode Specimen ID Mix-Up',
    subtitle: 'Physical vial label reads SMP-2024-9999 instead of SMP-2024-8804',
    badge: 'Expected: Mismatch Detected',
    badgeType: 'mismatch',
    orderId: 'ORD-9024',
    sampleId: 'SMP-2024-9999', // MISMATCH VS REQUISITION SMP-2024-8804
    patientName: 'Jonathan Joestar',
    patientDob: '1968-04-04',
    testCode: 'BMP',
    testName: 'Basic Metabolic Panel (BMP)',
    expectedTubeId: 'GOLD_SST',
    collectedTubeId: 'GOLD_SST',
    volumePercent: 80,
    phlebotomistId: 'PHL-208 (Kenji S.)',
    requisitionSampleIdOverride: 'SMP-2024-8804'
  },
  {
    id: 'preset-suboptimal-volume',
    title: 'Review Required: Sub-Optimal Serum Volume',
    subtitle: 'SST Gel tube filled to 42% (near 40% minimum threshold)',
    badge: 'Expected: Review Required',
    badgeType: 'review',
    orderId: 'ORD-9025',
    sampleId: 'SMP-2024-8805',
    patientName: 'Amara Okafor',
    patientDob: '1995-12-19',
    testCode: 'CMP',
    testName: 'Comprehensive Metabolic Panel (CMP)',
    expectedTubeId: 'GOLD_SST',
    collectedTubeId: 'GOLD_SST',
    volumePercent: 42, // REVIEW REQUIRED
    phlebotomistId: 'PHL-208 (Kenji S.)'
  },
  {
    id: 'preset-stat-troponin',
    title: 'Clean Pass: STAT Cardiac Troponin',
    subtitle: 'STAT Lithium Heparin Green tube, 88% volume',
    badge: 'Expected: No Mismatch',
    badgeType: 'pass',
    orderId: 'ORD-9027',
    sampleId: 'SMP-2024-8807',
    patientName: 'Elena Rostova',
    patientDob: '1963-02-17',
    testCode: 'TROPONIN',
    testName: 'High-Sensitivity Troponin I (STAT)',
    expectedTubeId: 'GREEN_HEPARIN',
    collectedTubeId: 'GREEN_HEPARIN',
    volumePercent: 88,
    phlebotomistId: 'PHL-901 (ER STAT Phlebotomy)'
  }
];

const LabelStudio = {
  /**
   * Draw a realistic hospital specimen barcode label onto a canvas
   */
  renderLabelToCanvas(canvas, labelData) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Label standard dimensions: 600 x 320 px (sharp clinical aspect ratio)
    canvas.width = 600;
    canvas.height = 320;

    const tubeInfo = window.LAB_TUBES ? window.LAB_TUBES[labelData.collectedTubeId] : null;
    const tubeColor = tubeInfo ? tubeInfo.capColor : '#64748b';

    // 1. Label Background (Clean clinical white with subtle adhesive border)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 320);

    // Label border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 592, 312);

    // 2. Color Indicator Stripe (Matches tube cap color on left margin)
    ctx.fillStyle = tubeColor;
    ctx.fillRect(4, 4, 18, 312);

    // 3. Hospital Header Bar
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('ST. JUDE CLINICAL LABORATORIES', 36, 32);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('SPECIMEN ACCESSION & CHAIN OF CUSTODY', 36, 50);

    // Header divider line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(36, 58);
    ctx.lineTo(580, 58);
    ctx.stroke();

    // 4. Barcode Simulation (Code 128 visual rendering)
    const barcodeX = 36;
    const barcodeY = 70;
    const barcodeWidth = 320;
    const barcodeHeight = 65;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(barcodeX, barcodeY, barcodeWidth, barcodeHeight);

    // Generate pseudo-deterministic Code 128 bar pattern based on sample ID string
    ctx.fillStyle = '#000000';
    const sampleStr = labelData.sampleId || 'SMP-2024-0000';
    let currentX = barcodeX + 10;
    const barEnd = barcodeX + barcodeWidth - 10;

    // Start guard bars
    ctx.fillRect(currentX, barcodeY, 3, barcodeHeight); currentX += 5;
    ctx.fillRect(currentX, barcodeY, 2, barcodeHeight); currentX += 4;

    for (let i = 0; i < sampleStr.length && currentX < barEnd - 20; i++) {
      const charCode = sampleStr.charCodeAt(i);
      const w1 = ((charCode % 3) + 1.5);
      const gap = ((charCode % 2) + 2);
      const w2 = (((charCode >> 1) % 3) + 1.2);
      
      ctx.fillRect(currentX, barcodeY, w1, barcodeHeight);
      currentX += w1 + gap;
      ctx.fillRect(currentX, barcodeY, w2, barcodeHeight);
      currentX += w2 + gap;
    }

    // Stop guard bars
    ctx.fillRect(barEnd - 8, barcodeY, 3, barcodeHeight);
    ctx.fillRect(barEnd - 3, barcodeY, 2, barcodeHeight);

    // 5. Specimen and Order Identifiers (Large high-contrast text below barcode)
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText(`*${labelData.sampleId}*`, 36, 155);

    // Requisition Order badge
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(36, 168, 220, 26);
    ctx.strokeStyle = '#cbd5e1';
    ctx.strokeRect(36, 168, 220, 26);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 14px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`ORDER: ${labelData.orderId}`, 46, 186);

    // 6. Right Side: Patient & Collection Details
    const rightColX = 370;

    // Patient Name
    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('PATIENT NAME:', rightColX, 82);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(labelData.patientName || 'PATIENT, UNKNOWN', rightColX, 100);

    // DOB
    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('DOB / AGE:', rightColX, 122);

    ctx.fillStyle = '#334155';
    ctx.font = '13px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(labelData.patientDob || '1985-01-01', rightColX, 138);

    // Test Requested
    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('TEST ORDERED:', rightColX, 162);

    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 13px "Segoe UI", Roboto, sans-serif';
    const testDisplay = (labelData.testName || labelData.testCode || 'LAB TEST').substring(0, 28);
    ctx.fillText(testDisplay, rightColX, 178);

    // Divider before lower meta
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(36, 206);
    ctx.lineTo(580, 206);
    ctx.stroke();

    // 7. Lower Metadata: Tube Type & Additive + Phlebotomist + Timestamp
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`TUBE: ${tubeInfo ? tubeInfo.name : labelData.collectedTubeId}`, 36, 230);

    ctx.fillStyle = '#475569';
    ctx.font = '12px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`ADDITIVE: ${tubeInfo ? tubeInfo.additive : 'Standard'}`, 36, 250);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`COLLECTED: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 36, 275);
    ctx.fillText(`COLLECTOR: ${labelData.phlebotomistId || 'PHL-STANDARD'}`, 36, 292);

    // Volume fill indicator badge on bottom right
    const vol = Number(labelData.volumePercent) || 0;
    const volBoxX = 430;
    const volBoxY = 224;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(volBoxX, volBoxY, 150, 72);
    ctx.strokeStyle = '#e2e8f0';
    ctx.strokeRect(volBoxX, volBoxY, 150, 72);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px "Segoe UI", Roboto, sans-serif';
    ctx.fillText('COLLECTED VOLUME', volBoxX + 12, volBoxY + 22);

    ctx.fillStyle = vol < (tubeInfo?.minVolumePercent || 50) ? '#dc2626' : '#16a34a';
    ctx.font = 'bold 22px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`${vol}%`, volBoxX + 12, volBoxY + 52);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`Req: ≥${tubeInfo?.minVolumePercent || 50}%`, volBoxX + 75, volBoxY + 52);

    // Store in global window for OCR carrier reference
    if (typeof window !== 'undefined') {
      window.__lastGeneratedPresetLabel = labelData;
    }

    return canvas.toDataURL('image/png');
  }
};

if (typeof window !== 'undefined') {
  window.PRESET_LABELS = PRESET_LABELS;
  window.LabelStudio = LabelStudio;
}

