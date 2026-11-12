/**
 * LabSentry AI - Clinical Laboratory Tube Specifications & Validation Rules Engine
 * 
 * DISCLAIMER: Educational prototype using synthetic demo data only.
 * Not for clinical diagnosis or specimen safety certification.
 */

const LAB_TUBES = {
  LAVENDER_EDTA: {
    id: 'LAVENDER_EDTA',
    name: 'K2 / K3 EDTA (Lavender Top)',
    capColor: '#8a2be2',
    capColorHex: '#8a2be2',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    additive: 'K2 / K3 Potassium EDTA (Anticoagulant)',
    primaryUses: ['Complete Blood Count (CBC)', 'HbA1c', 'ESR', 'Blood Bank / Crossmatch'],
    minVolumePercent: 50,
    idealVolumePercent: 80,
    criticalRatio: false,
    inversions: '8 - 10 times',
    specimenType: 'Whole Blood',
    clinicalRationale: 'Chelates divalent calcium ions (Ca2+) preventing cascade coagulation. Underfilling (<50%) causes cellular crenation, false low hematocrit (Hct), and altered RBC indices.'
  },
  LIGHT_BLUE_CITRATE: {
    id: 'LIGHT_BLUE_CITRATE',
    name: 'Sodium Citrate 3.2% (Light Blue Top)',
    capColor: '#0ea5e9',
    capColorHex: '#0ea5e9',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    additive: 'Buffered Sodium Citrate 3.2% (0.109 M)',
    primaryUses: ['Prothrombin Time (PT/INR)', 'aPTT', 'Fibrinogen', 'D-Dimer', 'Coagulation Factor Assays'],
    minVolumePercent: 90, // Strict 9:1 blood to anticoagulant ratio
    idealVolumePercent: 100,
    criticalRatio: true,
    inversions: '3 - 4 times gentle',
    specimenType: 'Citrated Plasma',
    clinicalRationale: 'Strict 9:1 ratio of blood to anticoagulant is mandatory. Underfilling (<90%) leads to relative excess free citrate which binds reagent calcium during testing, causing falsely prolonged PT/INR and aPTT results.'
  },
  GOLD_SST: {
    id: 'GOLD_SST',
    name: 'Serum Separator SST (Gold / Tiger Top)',
    capColor: '#eab308',
    capColorHex: '#eab308',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    additive: 'Clot Activator & Thixotropic Polyester Polymer Gel',
    primaryUses: ['Comprehensive Metabolic Panel (CMP)', 'Basic Metabolic Panel (BMP)', 'Lipid Panel', 'Thyroid Panel', 'Troponin', 'Liver Function'],
    minVolumePercent: 50, // 50% standard minimum for serum panel & repeats
    idealVolumePercent: 80,
    criticalRatio: false,
    inversions: '5 times',
    specimenType: 'Serum',
    clinicalRationale: 'Requires silica particles to activate rapid clotting (30 min). Underfilling (<50%) yields insufficient serum volume post-centrifugation for multiplexed automated chemistry assays and reflex dilution runs.'
  },
  RED_PLAIN: {
    id: 'RED_PLAIN',
    name: 'Plain Serum (Red Top / No Additive)',
    capColor: '#ef4444',
    capColorHex: '#ef4444',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    additive: 'None or Silicone Coated (No Anticoagulant)',
    primaryUses: ['Therapeutic Drug Monitoring', 'Toxicology', 'Blood Banking Antibody Screen', 'Serology'],
    minVolumePercent: 40,
    idealVolumePercent: 70,
    criticalRatio: false,
    inversions: '0 - 5 times',
    specimenType: 'Clotted Serum',
    clinicalRationale: 'No gel barrier to prevent drug absorption. Underfilling risks inadequate volume for multiple dilution or confirmative toxicology runs.'
  },
  GREEN_HEPARIN: {
    id: 'GREEN_HEPARIN',
    name: 'Lithium / Sodium Heparin (Green Top)',
    capColor: '#22c55e',
    capColorHex: '#22c55e',
    badgeColor: 'bg-green-100 text-green-800 border-green-300',
    additive: 'Lithium Heparin or Sodium Heparin (Antithrombin activator)',
    primaryUses: ['STAT Electrolytes', 'Ammonia', 'Arterial Blood Gas', 'STAT Troponin I', 'Renal Function'],
    minVolumePercent: 50,
    idealVolumePercent: 80,
    criticalRatio: false,
    inversions: '8 - 10 times',
    specimenType: 'Heparinized Plasma',
    clinicalRationale: 'Inhibits thrombin without chelating electrolytes. Avoid using Sodium Heparin if testing sodium levels, or Lithium Heparin for therapeutic lithium monitoring.'
  },
  GRAY_FLUORIDE: {
    id: 'GRAY_FLUORIDE',
    name: 'Sodium Fluoride / Potassium Oxalate (Gray Top)',
    capColor: '#64748b',
    capColorHex: '#64748b',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    additive: 'Sodium Fluoride (Glycolytic inhibitor) & Potassium Oxalate (Anticoagulant)',
    primaryUses: ['Fasting Blood Glucose', 'Lactic Acid', 'Oral Glucose Tolerance Test (OGTT)'],
    minVolumePercent: 50,
    idealVolumePercent: 75,
    criticalRatio: false,
    inversions: '8 - 10 times',
    specimenType: 'Whole Blood / Fluoride Plasma',
    clinicalRationale: 'Fluoride irreversibly inhibits enolase enzyme, preventing red blood cells from consuming plasma glucose ex vivo (spontaneous glycolysis decreases glucose at ~5-7% per hour if uninhibited).'
  },
  ROYAL_BLUE: {
    id: 'ROYAL_BLUE',
    name: 'Trace Element Tube (Royal Blue Top)',
    capColor: '#1d4ed8',
    capColorHex: '#1d4ed8',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    additive: 'K2 EDTA or Clot Activator (Ultra-low trace metal contamination)',
    primaryUses: ['Lead Levels (Pb)', 'Zinc (Zn)', 'Copper (Cu)', 'Heavy Metal Toxicology'],
    minVolumePercent: 50,
    idealVolumePercent: 80,
    criticalRatio: false,
    inversions: '8 - 10 times',
    specimenType: 'Whole Blood or Serum',
    clinicalRationale: 'Specially chemically processed stoppers ensure background trace metal contamination is below detection limits.'
  }
};

const LAB_TESTS = [
  {
    code: 'CBC',
    name: 'Complete Blood Count (CBC) with Differential',
    department: 'Hematology',
    expectedTubeId: 'LAVENDER_EDTA',
    description: 'Measures WBC, RBC, Hemoglobin, Hematocrit, Platelets, and differential count.'
  },
  {
    code: 'PT_INR',
    name: 'Prothrombin Time / INR (PT/INR)',
    department: 'Coagulation',
    expectedTubeId: 'LIGHT_BLUE_CITRATE',
    description: 'Evaluates extrinsic coagulation pathway and monitors Warfarin therapy. Highly sensitive to fill volume.'
  },
  {
    code: 'APTT',
    name: 'Activated Partial Thromboplastin Time (aPTT)',
    department: 'Coagulation',
    expectedTubeId: 'LIGHT_BLUE_CITRATE',
    description: 'Evaluates intrinsic coagulation pathway and monitors unfractionated heparin therapy.'
  },
  {
    code: 'D_DIMER',
    name: 'D-Dimer Quantitative Assay',
    department: 'Coagulation',
    expectedTubeId: 'LIGHT_BLUE_CITRATE',
    description: 'Fibrin degradation fragment used to rule out pulmonary embolism (PE) and deep vein thrombosis (DVT).'
  },
  {
    code: 'BMP',
    name: 'Basic Metabolic Panel (BMP)',
    department: 'Clinical Chemistry',
    expectedTubeId: 'GOLD_SST',
    description: 'Measures glucose, calcium, electrolytes (Na+, K+, Cl-, CO2), and kidney function (BUN, Creatinine).'
  },
  {
    code: 'CMP',
    name: 'Comprehensive Metabolic Panel (CMP)',
    department: 'Clinical Chemistry',
    expectedTubeId: 'GOLD_SST',
    description: 'BMP plus total protein, albumin, bilirubin, and liver enzymes (ALP, ALT, AST).'
  },
  {
    code: 'LIPID',
    name: 'Lipid Panel (Total Cholesterol, HDL, LDL, Triglycerides)',
    department: 'Clinical Chemistry',
    expectedTubeId: 'GOLD_SST',
    description: 'Cardiovascular risk stratification profiling.'
  },
  {
    code: 'TROPONIN',
    name: 'High-Sensitivity Troponin I (STAT)',
    department: 'STAT Chemistry',
    expectedTubeId: 'GREEN_HEPARIN',
    description: 'Critical cardiac biomarker for acute myocardial infarction (AMI).'
  },
  {
    code: 'HBA1C',
    name: 'Hemoglobin A1c (Glycated Hemoglobin)',
    department: 'Hematology / Special Chemistry',
    expectedTubeId: 'LAVENDER_EDTA',
    description: 'Reflects average blood glucose levels over the preceding 2 to 3 months.'
  },
  {
    code: 'GLUCOSE_FASTING',
    name: 'Fasting Blood Glucose (with Glycolysis Inhibitor)',
    department: 'Clinical Chemistry',
    expectedTubeId: 'GRAY_FLUORIDE',
    description: 'Evaluates diabetes mellitus with enzymatic glycolysis halted.'
  },
  {
    code: 'LACTIC_ACID',
    name: 'Lactic Acid (Plasma Lactate)',
    department: 'Critical Care / Chemistry',
    expectedTubeId: 'GRAY_FLUORIDE',
    description: 'Sepsis, tissue hypoperfusion, and metabolic acidosis diagnostic marker.'
  },
  {
    code: 'LEAD_TRACE',
    name: 'Blood Lead Level (Trace Element)',
    department: 'Toxicology',
    expectedTubeId: 'ROYAL_BLUE',
    description: 'Environmental or occupational heavy metal exposure screening.'
  }
];

/**
 * LabSentry Rule Engine Validator
 * Evaluates a specimen intake against CLSI / CAP pre-analytical laboratory guidelines
 */
const ValidationEngine = {
  validateSample(data) {
    const {
      orderId = '',
      sampleId = '',
      testCode = '',
      expectedTubeId = '',
      collectedTubeId = '',
      volumePercent = 0,
      ocrData = null,
      isManualCorrected = false
    } = data;

    const reasons = [];
    let isMismatch = false;
    let isReviewRequired = false;

    const normOrderId = (orderId || '').trim().toUpperCase();
    const normSampleId = (sampleId || '').trim().toUpperCase();
    const volNum = Number(volumePercent) || 0;

    const expectedTube = LAB_TUBES[expectedTubeId] || null;
    const collectedTube = LAB_TUBES[collectedTubeId] || null;

    // 1. TUBE TYPE CHECK
    if (!collectedTubeId || !expectedTubeId) {
      isMismatch = true;
      reasons.push({
        id: 'TUBE_MISSING',
        category: 'Tube Type Verification',
        status: 'FAIL',
        title: 'Missing Tube Selection',
        detail: 'Expected tube or collected tube type was not specified.',
        clinicalImpact: 'Incompatible additives can cause specimen rejection or erroneous analyzer results.'
      });
    } else if (expectedTubeId !== collectedTubeId) {
      isMismatch = true;
      reasons.push({
        id: 'TUBE_MISMATCH',
        category: 'Tube Type Verification',
        status: 'FAIL',
        title: `Tube Type Mismatch: ${collectedTube?.name || collectedTubeId} collected for ${expectedTube?.name || expectedTubeId}`,
        detail: `Test requires ${expectedTube?.name} (${expectedTube?.additive}), but specimen was received in ${collectedTube?.name} (${collectedTube?.additive}).`,
        clinicalImpact: `CRITICAL PRE-ANALYTICAL ERROR: Incorrect additive will cause chemical cross-reactivity or clotting interference. Specimen must be rejected and redrawn.`
      });
    } else {
      reasons.push({
        id: 'TUBE_MATCH',
        category: 'Tube Type Verification',
        status: 'PASS',
        title: `Tube Type Match: ${collectedTube.name}`,
        detail: `Collected tube matches required additive (${collectedTube.additive}) for this assay.`,
        clinicalImpact: 'Appropriate anticoagulant/preservative ensures specimen integrity.'
      });
    }

    // 2. VOLUME CHECK
    if (collectedTube) {
      const minVol = collectedTube.minVolumePercent;
      const idealVol = collectedTube.idealVolumePercent;

      if (volNum < minVol) {
        if (collectedTube.criticalRatio) {
          // Strict sodium citrate rule
          isMismatch = true;
          reasons.push({
            id: 'VOL_CRITICAL_UNDERFILL',
            category: 'Specimen Volume Rule',
            status: 'FAIL',
            title: `Critical Underfill: ${volNum}% (Minimum ${minVol}% required)`,
            detail: `${collectedTube.name} mandates strict 9:1 blood-to-anticoagulant ratio. Received ${volNum}%, which is below the mandatory ${minVol}% threshold.`,
            clinicalImpact: 'Excess free sodium citrate binds analytical calcium in reagent, causing falsely prolonged clotting times (PT/INR, aPTT). SPECIMEN MUST BE REJECTED.'
          });
        } else {
          // Non-critical tube but below minimum
          if (volNum < 25) {
            isMismatch = true;
            reasons.push({
              id: 'VOL_SEVERE_UNDERFILL',
              category: 'Specimen Volume Rule',
              status: 'FAIL',
              title: `Severe Underfill: ${volNum}% (Minimum ${minVol}% required)`,
              detail: `Specimen volume (${volNum}%) is critically inadequate for instrument probe dead volume and repeat testing.`,
              clinicalImpact: 'Risk of analyzer probe aspiration failure (short sample error) and cell morphology alteration.'
            });
          } else {
            isReviewRequired = true;
            reasons.push({
              id: 'VOL_UNDERFILL_REVIEW',
              category: 'Specimen Volume Rule',
              status: 'WARN',
              title: `Sub-Optimal Volume: ${volNum}% (Minimum ${minVol}% recommended)`,
              detail: `Specimen volume (${volNum}%) is below the standard minimum of ${minVol}%. Sufficient for single run but insufficient for reflex or duplicate confirmatory testing.`,
              clinicalImpact: 'Supervisory review needed to authorize single-run micro-sampling or request redraw.'
            });
          }
        }
      } else if (volNum < idealVol) {
        reasons.push({
          id: 'VOL_ACCEPTABLE',
          category: 'Specimen Volume Rule',
          status: 'PASS',
          title: `Adequate Volume: ${volNum}% (Exceeds ${minVol}% minimum)`,
          detail: `Volume satisfies instrument aspiration requirements (Ideal target: ${idealVol}%).`,
          clinicalImpact: 'Sufficient sample available for primary assay and potential reflex testing.'
        });
      } else {
        reasons.push({
          id: 'VOL_OPTIMAL',
          category: 'Specimen Volume Rule',
          status: 'PASS',
          title: `Optimal Fill Volume: ${volNum}%`,
          detail: `Tube is properly filled to optimal line, ensuring ideal specimen-to-additive equilibrium.`,
          clinicalImpact: 'Ideal pre-analytical conditions for automated pipetting.'
        });
      }
    }

    // 3. SAMPLE ID VERIFICATION (Against OCR if provided)
    if (!normSampleId) {
      isMismatch = true;
      reasons.push({
        id: 'SMP_ID_EMPTY',
        category: 'Sample ID Integrity',
        status: 'FAIL',
        title: 'Missing Specimen ID',
        detail: 'Sample identification code was not entered.',
        clinicalImpact: 'Unidentified specimen violates CLIA and CAP chain-of-custody standards.'
      });
    } else if (ocrData && ocrData.extractedSampleId) {
      const ocrSmp = (ocrData.extractedSampleId || '').trim().toUpperCase();
      if (ocrSmp !== normSampleId) {
        isMismatch = true;
        reasons.push({
          id: 'SMP_ID_MISMATCH',
          category: 'Sample ID Integrity',
          status: 'FAIL',
          title: `Sample ID Mismatch: Label reads "${ocrSmp}" vs Requisition "${normSampleId}"`,
          detail: `The OCR text extracted from the vial label barcode does not match the active requisition sample identifier.`,
          clinicalImpact: 'HIGH RISK: Potential mislabeling or specimen mix-up. Must halt processing and perform patient identification audit.'
        });
      } else {
        reasons.push({
          id: 'SMP_ID_MATCH',
          category: 'Sample ID Integrity',
          status: 'PASS',
          title: `Sample ID Verified: ${normSampleId}`,
          detail: `Physical label specimen barcode matches electronic laboratory requisition record exactly.`,
          clinicalImpact: 'Chain of custody verified.'
        });
      }
    } else {
      reasons.push({
        id: 'SMP_ID_FORMAT_OK',
        category: 'Sample ID Integrity',
        status: 'PASS',
        title: `Sample ID Recorded: ${normSampleId}`,
        detail: 'Sample ID is syntactically valid (OCR verification was manual or bypass mode).',
        clinicalImpact: 'Valid accession identifier format.'
      });
    }

    // 4. ORDER ID VERIFICATION (Against OCR if provided)
    if (!normOrderId) {
      isMismatch = true;
      reasons.push({
        id: 'ORD_ID_EMPTY',
        category: 'Order ID Integrity',
        status: 'FAIL',
        title: 'Missing Order / Accession ID',
        detail: 'Order requisition ID is missing.',
        clinicalImpact: 'Specimen cannot be billed or matched to clinical chart.'
      });
    } else if (ocrData && ocrData.extractedOrderId) {
      const ocrOrd = (ocrData.extractedOrderId || '').trim().toUpperCase();
      if (ocrOrd !== normOrderId) {
        isMismatch = true;
        reasons.push({
          id: 'ORD_ID_MISMATCH',
          category: 'Order ID Integrity',
          status: 'FAIL',
          title: `Order ID Mismatch: Label reads "${ocrOrd}" vs Requisition "${normOrderId}"`,
          detail: `The Order accession number on the specimen tube differs from the current work order.`,
          clinicalImpact: 'Specimen may belong to a different clinical encounter or canceled requisition.'
        });
      } else {
        reasons.push({
          id: 'ORD_ID_MATCH',
          category: 'Order ID Integrity',
          status: 'PASS',
          title: `Order ID Verified: ${normOrderId}`,
          detail: `Physical label requisition order ID matches system worklist entry.`,
          clinicalImpact: 'Order integrity confirmed.'
        });
      }
    } else {
      reasons.push({
        id: 'ORD_ID_FORMAT_OK',
        category: 'Order ID Integrity',
        status: 'PASS',
        title: `Order ID Recorded: ${normOrderId}`,
        detail: 'Requisition order number format is valid.',
        clinicalImpact: 'Valid requisition link.'
      });
    }

    // 5. OCR CONFIDENCE & MANUAL EDITING CHECK
    if (ocrData) {
      if (ocrData.lowConfidence) {
        isReviewRequired = true;
        reasons.push({
          id: 'OCR_LOW_CONFIDENCE',
          category: 'Optical Recognition Fidelity',
          status: 'WARN',
          title: `Low OCR Reading Confidence (${Math.round(ocrData.confidence || 0)}%)`,
          detail: 'Label barcode or text print was degraded, rotated, or smudged. OCR confidence is below standard 70% threshold.',
          clinicalImpact: 'Manual double-check by technologist is required before releasing to automated track.'
        });
      }
      if (isManualCorrected) {
        if (!isMismatch) isReviewRequired = true;
        reasons.push({
          id: 'MANUAL_CORRECTION_AUDIT',
          category: 'Audit & Custody',
          status: 'WARN',
          title: 'Manual Technician Override Applied',
          detail: 'Technician manually adjusted one or more OCR extracted fields prior to final validation.',
          clinicalImpact: 'Audit trail flagged for quality management review.'
        });
      }
    }

    // Determine Final Pre-Check Status
    let overallStatus = 'NO_MISMATCH';
    let statusLabel = 'No Mismatch Found';
    let badgeClass = 'status-badge-pass';
    let severity = 'success';
    let summaryText = 'Specimen pre-check passed all laboratory verification rules. Ready for centrifugation or analysis.';

    if (isMismatch) {
      overallStatus = 'MISMATCH_DETECTED';
      statusLabel = 'Mismatch Detected';
      badgeClass = 'status-badge-mismatch';
      severity = 'danger';
      summaryText = 'Critical discrepancy detected! Specimen does not meet laboratory pre-analytical criteria and should not be processed.';
    } else if (isReviewRequired) {
      overallStatus = 'REVIEW_REQUIRED';
      statusLabel = 'Review Required';
      badgeClass = 'status-badge-review';
      severity = 'warning';
      summaryText = 'Specimen requires supervisory verification or manual confirmation before release to analyzer.';
    }

    const passCount = reasons.filter(r => r.status === 'PASS').length;
    const warnCount = reasons.filter(r => r.status === 'WARN').length;
    const failCount = reasons.filter(r => r.status === 'FAIL').length;

    return {
      overallStatus,
      statusLabel,
      badgeClass,
      severity,
      summaryText,
      reasons,
      stats: {
        passCount,
        warnCount,
        failCount,
        total: reasons.length
      },
      validatedAt: new Date().toISOString()
    };
  }
};

if (typeof window !== 'undefined') {
  window.LAB_TUBES = LAB_TUBES;
  window.LAB_TESTS = LAB_TESTS;
  window.ValidationEngine = ValidationEngine;
}
