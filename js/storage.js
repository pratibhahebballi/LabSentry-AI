/**
 * LabSentry AI - LocalStorage Management & Seed Data Provider
 * 
 * DISCLAIMER: Educational prototype using synthetic demo data only.
 */

const STORAGE_KEYS = {
  SAMPLES: 'labsentry_samples_v1',
  INITIALIZED: 'labsentry_initialized_v1'
};

const SEED_SAMPLES = [
  {
    id: 'SMP-2024-8801',
    orderId: 'ORD-9021',
    patientName: 'Eleanor Vance',
    patientDob: '1984-06-14',
    testCode: 'CBC',
    testName: 'Complete Blood Count (CBC) with Differential',
    expectedTubeId: 'LAVENDER_EDTA',
    collectedTubeId: 'LAVENDER_EDTA',
    volumePercent: 85,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    phlebotomistId: 'PHL-402 (Nurse Sarah)',
    overallStatus: 'NO_MISMATCH',
    statusLabel: 'No Mismatch Found',
    severity: 'success',
    badgeClass: 'status-badge-pass',
    summaryText: 'Specimen pre-check passed all laboratory verification rules. Ready for hematology analysis.',
    reasons: [
      {
        id: 'TUBE_MATCH',
        category: 'Tube Type Verification',
        status: 'PASS',
        title: 'Tube Type Match: K2 / K3 EDTA (Lavender Top)',
        detail: 'Collected tube matches required K2 EDTA additive for whole blood cell morphology.',
        clinicalImpact: 'Appropriate anticoagulant prevents in-vitro platelet clumping.'
      },
      {
        id: 'VOL_OPTIMAL',
        category: 'Specimen Volume Rule',
        status: 'PASS',
        title: 'Optimal Fill Volume: 85%',
        detail: 'Volume satisfies hematology analyzer aspiration requirements (min 50%).',
        clinicalImpact: 'Accurate hematocrit and cell sizing indices guaranteed.'
      },
      {
        id: 'SMP_ID_MATCH',
        category: 'Sample ID Integrity',
        status: 'PASS',
        title: 'Sample ID Verified: SMP-2024-8801',
        detail: 'Vial label barcode matched accession worklist entry with 99.4% confidence.',
        clinicalImpact: 'Positive patient identification confirmed.'
      },
      {
        id: 'ORD_ID_MATCH',
        category: 'Order ID Integrity',
        status: 'PASS',
        title: 'Order ID Verified: ORD-9021',
        detail: 'Requisition order corresponds to inpatient order record.',
        clinicalImpact: 'Order integrity confirmed.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9021',
      extractedSampleId: 'SMP-2024-8801',
      extractedTube: 'LAVENDER',
      confidence: 98.6
    }
  },
  {
    id: 'SMP-2024-8802',
    orderId: 'ORD-9022',
    patientName: 'Marcus Holloway',
    patientDob: '1972-11-03',
    testCode: 'PT_INR',
    testName: 'Prothrombin Time / INR (PT/INR)',
    expectedTubeId: 'LIGHT_BLUE_CITRATE',
    collectedTubeId: 'LAVENDER_EDTA', // CRITICAL MISMATCH
    volumePercent: 90,
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(), // 42 mins ago
    phlebotomistId: 'PHL-119 (David K.)',
    overallStatus: 'MISMATCH_DETECTED',
    statusLabel: 'Mismatch Detected',
    severity: 'danger',
    badgeClass: 'status-badge-mismatch',
    summaryText: 'Critical tube discrepancy detected! Coagulation assay collected in EDTA instead of Sodium Citrate.',
    reasons: [
      {
        id: 'TUBE_MISMATCH',
        category: 'Tube Type Verification',
        status: 'FAIL',
        title: 'Tube Type Mismatch: K2 / K3 EDTA collected for Sodium Citrate 3.2%',
        detail: 'Coagulation tests (PT/INR) require 3.2% Sodium Citrate. EDTA irreversibly binds divalent calcium cations required for thromboplastin activation.',
        clinicalImpact: 'CRITICAL ERROR: Processing will yield uncoagulable test or completely false unmeasurable INR. SPECIMEN MUST BE REJECTED AND REDRAWN.'
      },
      {
        id: 'VOL_OPTIMAL',
        category: 'Specimen Volume Rule',
        status: 'PASS',
        title: 'Optimal Fill Volume: 90%',
        detail: 'Volume percentage meets minimum threshold.',
        clinicalImpact: 'Adequate sample quantity.'
      },
      {
        id: 'SMP_ID_MATCH',
        category: 'Sample ID Integrity',
        status: 'PASS',
        title: 'Sample ID Verified: SMP-2024-8802',
        detail: 'Physical label matches requisition order.',
        clinicalImpact: 'Specimen ID matches.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9022',
      extractedSampleId: 'SMP-2024-8802',
      extractedTube: 'EDTA',
      confidence: 96.1
    }
  },
  {
    id: 'SMP-2024-8803',
    orderId: 'ORD-9023',
    patientName: 'Claire Redfield',
    patientDob: '1990-03-29',
    testCode: 'PT_INR',
    testName: 'Prothrombin Time / INR (PT/INR)',
    expectedTubeId: 'LIGHT_BLUE_CITRATE',
    collectedTubeId: 'LIGHT_BLUE_CITRATE',
    volumePercent: 62, // CRITICAL CITRATE UNDERFILL (<90%)
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    phlebotomistId: 'PHL-305 (Rachel T.)',
    overallStatus: 'MISMATCH_DETECTED',
    statusLabel: 'Mismatch Detected',
    severity: 'danger',
    badgeClass: 'status-badge-mismatch',
    summaryText: 'Critical volume shortage in Sodium Citrate tube. Strict 9:1 blood-to-anticoagulant ratio violated.',
    reasons: [
      {
        id: 'TUBE_MATCH',
        category: 'Tube Type Verification',
        status: 'PASS',
        title: 'Tube Type Match: Sodium Citrate 3.2% (Light Blue Top)',
        detail: 'Correct anticoagulant collected for coagulation study.',
        clinicalImpact: 'Anticoagulant type compliant.'
      },
      {
        id: 'VOL_CRITICAL_UNDERFILL',
        category: 'Specimen Volume Rule',
        status: 'FAIL',
        title: 'Critical Underfill: 62% (Mandatory Minimum 90%)',
        detail: 'Sodium Citrate tubes require a strict 9:1 blood to liquid anticoagulant ratio. A 62% fill results in excess liquid citrate in the plasma.',
        clinicalImpact: 'Excess free citrate binds reagent calcium during testing, causing artifactual false prolongation of PT and aPTT results. MUST BE REJECTED.'
      },
      {
        id: 'SMP_ID_MATCH',
        category: 'Sample ID Integrity',
        status: 'PASS',
        title: 'Sample ID Verified: SMP-2024-8803',
        detail: 'Label matches worklist accession.',
        clinicalImpact: 'ID confirmed.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9023',
      extractedSampleId: 'SMP-2024-8803',
      extractedTube: 'CITRATE',
      confidence: 97.4
    }
  },
  {
    id: 'SMP-2024-8804',
    orderId: 'ORD-9024',
    patientName: 'Jonathan Joestar',
    patientDob: '1968-04-04',
    testCode: 'BMP',
    testName: 'Basic Metabolic Panel (BMP)',
    expectedTubeId: 'GOLD_SST',
    collectedTubeId: 'GOLD_SST',
    volumePercent: 42, // Sub-optimal volume (Min is 50%, ideal is 80%)
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    phlebotomistId: 'PHL-402 (Nurse Sarah)',
    overallStatus: 'REVIEW_REQUIRED',
    statusLabel: 'Review Required',
    severity: 'warning',
    badgeClass: 'status-badge-review',
    summaryText: 'Sub-optimal serum volume. Sufficient for single automated run, but insufficient for reflex repeats.',
    reasons: [
      {
        id: 'TUBE_MATCH',
        category: 'Tube Type Verification',
        status: 'PASS',
        title: 'Tube Type Match: Serum Separator SST (Gold / Tiger Top)',
        detail: 'SST gel tube appropriate for automated clinical chemistry.',
        clinicalImpact: 'Clot activator facilitates serum harvesting.'
      },
      {
        id: 'VOL_UNDERFILL_REVIEW',
        category: 'Specimen Volume Rule',
        status: 'WARN',
        title: 'Sub-Optimal Volume: 42% (Minimum 50% threshold)',
        detail: 'Specimen volume is near the lower limit. Serum yield post-centrifugation (~0.8 mL) satisfies primary panel but limits rerun capacity.',
        clinicalImpact: 'Supervisory review recommended to approve single-run protocol without automatic repeat on out-of-range flags.'
      },
      {
        id: 'SMP_ID_MATCH',
        category: 'Sample ID Integrity',
        status: 'PASS',
        title: 'Sample ID Verified: SMP-2024-8804',
        detail: 'Label barcode verified with 95.8% match.',
        clinicalImpact: 'Patient identity matched.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9024',
      extractedSampleId: 'SMP-2024-8804',
      extractedTube: 'SST',
      confidence: 94.2
    }
  },
  {
    id: 'SMP-2024-8805',
    orderId: 'ORD-9025',
    patientName: 'Amara Okafor',
    patientDob: '1995-12-19',
    testCode: 'CMP',
    testName: 'Comprehensive Metabolic Panel (CMP)',
    expectedTubeId: 'GOLD_SST',
    collectedTubeId: 'GOLD_SST',
    volumePercent: 90,
    timestamp: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    phlebotomistId: 'PHL-208 (Kenji S.)',
    overallStatus: 'NO_MISMATCH',
    statusLabel: 'No Mismatch Found',
    severity: 'success',
    badgeClass: 'status-badge-pass',
    summaryText: 'All pre-analytical criteria satisfied. Specimen queued for automated centrifuge.',
    reasons: [
      {
        id: 'TUBE_MATCH',
        category: 'Tube Type Verification',
        status: 'PASS',
        title: 'Tube Type Match: Serum Separator SST (Gold / Tiger Top)',
        detail: 'Correct tube with gel separator.',
        clinicalImpact: 'Ready for centrifugation.'
      },
      {
        id: 'VOL_OPTIMAL',
        category: 'Specimen Volume Rule',
        status: 'PASS',
        title: 'Optimal Fill Volume: 90%',
        detail: 'Generous volume allows for comprehensive testing and reflex enzyme dilutions.',
        clinicalImpact: 'High diagnostic yield.'
      },
      {
        id: 'SMP_ID_MATCH',
        category: 'Sample ID Integrity',
        status: 'PASS',
        title: 'Sample ID Verified: SMP-2024-8805',
        detail: 'Identifier verified against order.',
        clinicalImpact: 'ID confirmed.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9025',
      extractedSampleId: 'SMP-2024-8805',
      extractedTube: 'SST',
      confidence: 99.1
    }
  },
  {
    id: 'SMP-2024-8806',
    orderId: 'ORD-9026',
    patientName: 'Devon Miller',
    patientDob: '1981-08-09',
    testCode: 'HBA1C',
    testName: 'Hemoglobin A1c (Glycated Hemoglobin)',
    expectedTubeId: 'LAVENDER_EDTA',
    collectedTubeId: 'LAVENDER_EDTA',
    volumePercent: 78,
    timestamp: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    phlebotomistId: 'PHL-402 (Nurse Sarah)',
    overallStatus: 'REVIEW_REQUIRED',
    statusLabel: 'Review Required',
    severity: 'warning',
    badgeClass: 'status-badge-review',
    summaryText: 'Technician corrected smudged barcode character on accession label before validation.',
    reasons: [
      {
        id: 'TUBE_MATCH',
        category: 'Tube Type Verification',
        status: 'PASS',
        title: 'Tube Type Match: K2 / K3 EDTA (Lavender Top)',
        detail: 'Whole blood EDTA is standard for HPLC HbA1c testing.',
        clinicalImpact: 'Valid sample condition.'
      },
      {
        id: 'VOL_OPTIMAL',
        category: 'Specimen Volume Rule',
        status: 'PASS',
        title: 'Optimal Fill Volume: 78%',
        detail: 'Sufficient sample volume.',
        clinicalImpact: 'Acceptable volume.'
      },
      {
        id: 'MANUAL_CORRECTION_AUDIT',
        category: 'Audit & Custody',
        status: 'WARN',
        title: 'Manual Technician Override Applied',
        detail: 'Barcode label had thermal printer smudge; technician manually confirmed sample ID "SMP-2024-8806".',
        clinicalImpact: 'Logged in quality management review track.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9026',
      extractedSampleId: 'SMP-2024-8806',
      extractedTube: 'LAVENDER',
      confidence: 74.3,
      lowConfidence: true
    }
  },
  {
    id: 'SMP-2024-8807',
    orderId: 'ORD-9027',
    patientName: 'Elena Rostova',
    patientDob: '1963-02-17',
    testCode: 'TROPONIN',
    testName: 'High-Sensitivity Troponin I (STAT)',
    expectedTubeId: 'GREEN_HEPARIN',
    collectedTubeId: 'GREEN_HEPARIN',
    volumePercent: 88,
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    phlebotomistId: 'PHL-901 (ER STAT Phlebotomy)',
    overallStatus: 'NO_MISMATCH',
    statusLabel: 'No Mismatch Found',
    severity: 'success',
    badgeClass: 'status-badge-pass',
    summaryText: 'STAT cardiac biomarker draw verified. Expedited processing approved.',
    reasons: [
      {
        id: 'TUBE_MATCH',
        category: 'Tube Type Verification',
        status: 'PASS',
        title: 'Tube Type Match: Lithium / Sodium Heparin (Green Top)',
        detail: 'Lithium heparin plasma eliminates 30-minute clotting delay required by serum.',
        clinicalImpact: 'Enables rapid 15-minute turnaround time for critical emergency troponin.'
      },
      {
        id: 'VOL_OPTIMAL',
        category: 'Specimen Volume Rule',
        status: 'PASS',
        title: 'Optimal Fill Volume: 88%',
        detail: 'Well above 50% minimum.',
        clinicalImpact: 'Adequate plasma volume.'
      },
      {
        id: 'SMP_ID_MATCH',
        category: 'Sample ID Integrity',
        status: 'PASS',
        title: 'Sample ID Verified: SMP-2024-8807',
        detail: 'Positive barcode scan confirmed.',
        clinicalImpact: 'Chain of custody maintained.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9027',
      extractedSampleId: 'SMP-2024-8807',
      extractedTube: 'HEPARIN',
      confidence: 98.8
    }
  },
  {
    id: 'SMP-2024-8808',
    orderId: 'ORD-9028',
    patientName: 'Lucas Vance',
    patientDob: '2001-07-22',
    testCode: 'GLUCOSE_FASTING',
    testName: 'Fasting Blood Glucose (with Glycolysis Inhibitor)',
    expectedTubeId: 'GRAY_FLUORIDE',
    collectedTubeId: 'GOLD_SST', // WRONG TUBE
    volumePercent: 80,
    timestamp: new Date(Date.now() - 1000 * 60 * 310).toISOString(),
    phlebotomistId: 'PHL-119 (David K.)',
    overallStatus: 'MISMATCH_DETECTED',
    statusLabel: 'Mismatch Detected',
    severity: 'danger',
    badgeClass: 'status-badge-mismatch',
    summaryText: 'Tube mismatch: Glucose ordered with fluoride glycolysis inhibitor, but received in SST gel tube.',
    reasons: [
      {
        id: 'TUBE_MISMATCH',
        category: 'Tube Type Verification',
        status: 'FAIL',
        title: 'Tube Type Mismatch: Serum Separator SST collected for Sodium Fluoride / Oxalate',
        detail: 'Requisition specifies Sodium Fluoride (Gray Top) to immediately halt in-vitro glycolysis. SST tube contains no glycolytic inhibitor.',
        clinicalImpact: 'Red blood cells will continue consuming glucose at 5-7% per hour, causing falsely low glucose measurement. Redraw required in Gray Top.'
      },
      {
        id: 'VOL_OPTIMAL',
        category: 'Specimen Volume Rule',
        status: 'PASS',
        title: 'Optimal Fill Volume: 80%',
        detail: 'Volume percentage adequate.',
        clinicalImpact: 'Volume satisfactory.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9028',
      extractedSampleId: 'SMP-2024-8808',
      extractedTube: 'SST',
      confidence: 96.0
    }
  },
  {
    id: 'SMP-2024-8809',
    orderId: 'ORD-9029',
    patientName: 'Sophia Chen',
    patientDob: '1998-09-05',
    testCode: 'D_DIMER',
    testName: 'D-Dimer Quantitative Assay',
    expectedTubeId: 'LIGHT_BLUE_CITRATE',
    collectedTubeId: 'LIGHT_BLUE_CITRATE',
    volumePercent: 95,
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    phlebotomistId: 'PHL-305 (Rachel T.)',
    overallStatus: 'NO_MISMATCH',
    statusLabel: 'No Mismatch Found',
    severity: 'success',
    badgeClass: 'status-badge-pass',
    summaryText: 'Clean pre-check. Strict 9:1 blood to citrate ratio achieved.',
    reasons: [
      {
        id: 'TUBE_MATCH',
        category: 'Tube Type Verification',
        status: 'PASS',
        title: 'Tube Type Match: Sodium Citrate 3.2% (Light Blue Top)',
        detail: 'Correct anticoagulant collected.',
        clinicalImpact: 'Accurate D-Dimer turbidity assay ensured.'
      },
      {
        id: 'VOL_OPTIMAL',
        category: 'Specimen Volume Rule',
        status: 'PASS',
        title: 'Optimal Fill Volume: 95%',
        detail: 'Ideal 9:1 ratio satisfied.',
        clinicalImpact: 'Exceeds 90% threshold for critical coagulation assays.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9029',
      extractedSampleId: 'SMP-2024-8809',
      extractedTube: 'CITRATE',
      confidence: 99.5
    }
  },
  {
    id: 'SMP-2024-8810',
    orderId: 'ORD-9030',
    patientName: 'Robert Langdon',
    patientDob: '1964-06-22',
    testCode: 'LIPID',
    testName: 'Lipid Panel (Total Cholesterol, HDL, LDL, Triglycerides)',
    expectedTubeId: 'GOLD_SST',
    collectedTubeId: 'GOLD_SST',
    volumePercent: 75,
    timestamp: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    phlebotomistId: 'PHL-208 (Kenji S.)',
    overallStatus: 'NO_MISMATCH',
    statusLabel: 'No Mismatch Found',
    severity: 'success',
    badgeClass: 'status-badge-pass',
    summaryText: 'Specimen passed all verification criteria. Serum separator barrier confirmed.',
    reasons: [
      {
        id: 'TUBE_MATCH',
        category: 'Tube Type Verification',
        status: 'PASS',
        title: 'Tube Type Match: Serum Separator SST (Gold / Tiger Top)',
        detail: 'Appropriate clot activator and gel separator.',
        clinicalImpact: 'No anticoagulant interference with enzymatic cholesterol assays.'
      },
      {
        id: 'VOL_OPTIMAL',
        category: 'Specimen Volume Rule',
        status: 'PASS',
        title: 'Optimal Fill Volume: 75%',
        detail: 'Adequate sample volume for full lipid panel.',
        clinicalImpact: 'Ideal volume.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9030',
      extractedSampleId: 'SMP-2024-8810',
      extractedTube: 'SST',
      confidence: 97.2
    }
  },
  {
    id: 'SMP-2024-8811',
    orderId: 'ORD-9031',
    patientName: 'Kavita Patel',
    patientDob: '1987-10-11',
    testCode: 'CBC',
    testName: 'Complete Blood Count (CBC) with Differential',
    expectedTubeId: 'LAVENDER_EDTA',
    collectedTubeId: 'LAVENDER_EDTA',
    volumePercent: 18, // SEVERE UNDERFILL (<25%)
    timestamp: new Date(Date.now() - 1000 * 60 * 490).toISOString(),
    phlebotomistId: 'PHL-119 (David K.)',
    overallStatus: 'MISMATCH_DETECTED',
    statusLabel: 'Mismatch Detected',
    severity: 'danger',
    badgeClass: 'status-badge-mismatch',
    summaryText: 'Severe specimen underfill (<20%). Analyzer probe will aspirate air.',
    reasons: [
      {
        id: 'TUBE_MATCH',
        category: 'Tube Type Verification',
        status: 'PASS',
        title: 'Tube Type Match: K2 / K3 EDTA (Lavender Top)',
        detail: 'Tube type is correct for hematology.',
        clinicalImpact: 'Additive is appropriate.'
      },
      {
        id: 'VOL_SEVERE_UNDERFILL',
        category: 'Specimen Volume Rule',
        status: 'FAIL',
        title: 'Severe Underfill: 18% (Minimum 50% required)',
        detail: 'Volume is below automated instrument dead-space threshold. Excess liquid EDTA relative to minute blood volume causes red cell hypertonicity and shrinkage.',
        clinicalImpact: 'Falsely depressed hematocrit and MCV. Analyzer sample probe risk. Redraw required.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9031',
      extractedSampleId: 'SMP-2024-8811',
      extractedTube: 'LAVENDER',
      confidence: 96.8
    }
  },
  {
    id: 'SMP-2024-8812',
    orderId: 'ORD-9032',
    patientName: 'Liam O\'Connor',
    patientDob: '1992-01-30',
    testCode: 'LEAD_TRACE',
    testName: 'Blood Lead Level (Trace Element)',
    expectedTubeId: 'ROYAL_BLUE',
    collectedTubeId: 'LAVENDER_EDTA', // WRONG TUBE (Regular EDTA has background lead contamination)
    volumePercent: 70,
    timestamp: new Date(Date.now() - 1000 * 60 * 560).toISOString(),
    phlebotomistId: 'PHL-402 (Nurse Sarah)',
    overallStatus: 'MISMATCH_DETECTED',
    statusLabel: 'Mismatch Detected',
    severity: 'danger',
    badgeClass: 'status-badge-mismatch',
    summaryText: 'Trace element assay collected in standard Lavender EDTA rather than Royal Blue certified low-lead tube.',
    reasons: [
      {
        id: 'TUBE_MISMATCH',
        category: 'Tube Type Verification',
        status: 'FAIL',
        title: 'Tube Type Mismatch: Lavender EDTA collected for Royal Blue Trace Element',
        detail: 'Blood lead and trace metal testing requires specialized Royal Blue tubes manufactured with certified ultra-low background metals.',
        clinicalImpact: 'Standard tube rubber stoppers leach zinc, lead, and aluminum, resulting in severe false positive heavy metal toxicities. Specimen rejected.'
      },
      {
        id: 'VOL_OPTIMAL',
        category: 'Specimen Volume Rule',
        status: 'PASS',
        title: 'Optimal Fill Volume: 70%',
        detail: 'Volume is adequate.',
        clinicalImpact: 'Volume acceptable.'
      }
    ],
    ocrData: {
      extractedOrderId: 'ORD-9032',
      extractedSampleId: 'SMP-2024-8812',
      extractedTube: 'LAVENDER',
      confidence: 98.0
    }
  }
];

const StorageService = {
  getSamples() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAMPLES);
      if (!data) {
        this.resetDemoData();
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SAMPLES) || '[]');
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to read samples from LocalStorage:', e);
      return SEED_SAMPLES;
    }
  },

  saveSample(sample) {
    try {
      const samples = this.getSamples();
      const existingIdx = samples.findIndex(s => s.id === sample.id);
      if (existingIdx >= 0) {
        samples[existingIdx] = sample;
      } else {
        samples.unshift(sample);
      }
      localStorage.setItem(STORAGE_KEYS.SAMPLES, JSON.stringify(samples));
      return sample;
    } catch (e) {
      console.error('Failed to save sample to LocalStorage:', e);
      return sample;
    }
  },

  deleteSample(id) {
    try {
      const samples = this.getSamples();
      const filtered = samples.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SAMPLES, JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error('Failed to delete sample from LocalStorage:', e);
      return false;
    }
  },

  getSampleById(id) {
    const samples = this.getSamples();
    return samples.find(s => s.id === id) || null;
  },

  resetDemoData() {
    try {
      localStorage.setItem(STORAGE_KEYS.SAMPLES, JSON.stringify(SEED_SAMPLES));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      return SEED_SAMPLES;
    } catch (e) {
      console.error('Failed to reset demo data in LocalStorage:', e);
      return SEED_SAMPLES;
    }
  },

  getStatistics() {
    const samples = this.getSamples();
    const total = samples.length;

    if (total === 0) {
      return {
        total: 0,
        noMismatchCount: 0,
        noMismatchRate: 0,
        reviewRequiredCount: 0,
        reviewRequiredRate: 0,
        mismatchCount: 0,
        mismatchRate: 0,
        volumeComplianceRate: 0,
        averageVolume: 0,
        discrepancyCounts: {
          tubeMismatch: 0,
          volumeCritical: 0,
          volumeWarning: 0,
          idMismatch: 0,
          ocrReview: 0
        },
        departmentCounts: {},
        tubeCounts: {}
      };
    }

    let noMismatchCount = 0;
    let reviewRequiredCount = 0;
    let mismatchCount = 0;
    let compliantVolumeCount = 0;
    let totalVolume = 0;

    const discrepancyCounts = {
      tubeMismatch: 0,
      volumeCritical: 0,
      volumeWarning: 0,
      idMismatch: 0,
      ocrReview: 0
    };

    const departmentCounts = {};
    const tubeCounts = {};

    samples.forEach(s => {
      // Overall status
      if (s.overallStatus === 'NO_MISMATCH') noMismatchCount++;
      else if (s.overallStatus === 'REVIEW_REQUIRED') reviewRequiredCount++;
      else if (s.overallStatus === 'MISMATCH_DETECTED') mismatchCount++;

      // Volume stats
      const vol = Number(s.volumePercent) || 0;
      totalVolume += vol;
      
      const tubeInfo = window.LAB_TUBES ? window.LAB_TUBES[s.collectedTubeId] : null;
      const minRequired = tubeInfo ? tubeInfo.minVolumePercent : 50;
      if (vol >= minRequired) {
        compliantVolumeCount++;
      }

      // Discrepancy analysis from reasons
      if (s.reasons && Array.isArray(s.reasons)) {
        s.reasons.forEach(r => {
          if (r.id === 'TUBE_MISMATCH' || (r.title && r.title.toLowerCase().includes('tube type mismatch'))) {
            discrepancyCounts.tubeMismatch++;
          }
          if (r.id === 'VOL_CRITICAL_UNDERFILL' || r.id === 'VOL_SEVERE_UNDERFILL' || (r.title && r.title.toLowerCase().includes('underfill') && r.status === 'FAIL')) {
            discrepancyCounts.volumeCritical++;
          }
          if (r.id === 'VOL_UNDERFILL_REVIEW' || (r.title && r.title.toLowerCase().includes('sub-optimal volume'))) {
            discrepancyCounts.volumeWarning++;
          }
          if (r.id === 'SMP_ID_MISMATCH' || r.id === 'ORD_ID_MISMATCH' || (r.title && r.title.toLowerCase().includes('id mismatch'))) {
            discrepancyCounts.idMismatch++;
          }
          if (r.id === 'OCR_LOW_CONFIDENCE' || r.id === 'MANUAL_CORRECTION_AUDIT') {
            discrepancyCounts.ocrReview++;
          }
        });
      }

      // Department & Tube counts
      const test = window.LAB_TESTS ? window.LAB_TESTS.find(t => t.code === s.testCode) : null;
      const dept = test ? test.department : 'General';
      departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

      const tubeName = tubeInfo ? tubeInfo.name.split('(')[0].trim() : s.collectedTubeId;
      tubeCounts[tubeName] = (tubeCounts[tubeName] || 0) + 1;
    });

    return {
      total,
      noMismatchCount,
      noMismatchRate: Math.round((noMismatchCount / total) * 100),
      reviewRequiredCount,
      reviewRequiredRate: Math.round((reviewRequiredCount / total) * 100),
      mismatchCount,
      mismatchRate: Math.round((mismatchCount / total) * 100),
      volumeComplianceRate: Math.round((compliantVolumeCount / total) * 100),
      averageVolume: Math.round(totalVolume / total),
      discrepancyCounts,
      departmentCounts,
      tubeCounts
    };
  }
};

if (typeof window !== 'undefined') {
  window.StorageService = StorageService;
  if (!localStorage.getItem(STORAGE_KEYS.SAMPLES)) {
    StorageService.resetDemoData();
  }
}
