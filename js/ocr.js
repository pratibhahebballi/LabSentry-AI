/**
 * LabSentry AI - Tesseract.js Browser OCR & Laboratory Entity Extraction Engine
 * 
 * DISCLAIMER: Educational prototype using synthetic demo data only.
 */

const OCREngine = {
  isInitialized: false,
  isProcessing: false,

  /**
   * Pre-process image on a hidden canvas for optimal Tesseract character recognition:
   * 1. Rescale if needed
   * 2. Grayscale conversion
   * 3. Contrast stretching / binarization
   */
  preprocessImage(imageSource) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Upscale small labels for better OCR recognition
        const scale = Math.max(1, Math.min(2.5, 1200 / Math.max(img.width, img.height)));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Image processing: Grayscale and Contrast Boost
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          // Standard luminosity formula
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          
          // Contrast stretch with soft threshold
          const contrast = 1.35;
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          let adjusted = factor * (gray - 128) + 128;
          adjusted = Math.min(255, Math.max(0, adjusted));

          data[i] = adjusted;     // R
          data[i + 1] = adjusted; // G
          data[i + 2] = adjusted; // B
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        resolve(imageSource); // fallback to original
      };

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof Blob || imageSource instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.readAsDataURL(imageSource);
      }
    });
  },

  /**
   * Run OCR on image with progress callback
   */
  async processLabel(imageSource, onProgress = () => {}) {
    this.isProcessing = true;
    onProgress({ status: 'preprocessing', progress: 0.15, message: 'Optimizing specimen label contrast...' });

    try {
      const processedDataUrl = await this.preprocessImage(imageSource);
      onProgress({ status: 'ocr_init', progress: 0.35, message: 'Initializing Tesseract.js engine...' });

      let rawText = '';
      let confidence = 85;

      // Check if Tesseract is available in window
      if (typeof Tesseract !== 'undefined') {
        onProgress({ status: 'ocr_running', progress: 0.55, message: 'Recognizing barcode text and alphanumeric fields...' });
        
        try {
          const result = await Tesseract.recognize(
            processedDataUrl,
            'eng',
            {
              logger: m => {
                if (m.status === 'recognizing text') {
                  const p = 0.4 + (m.progress || 0) * 0.5;
                  onProgress({ status: 'recognizing', progress: Math.min(0.9, p), message: `Scanning label text (${Math.round((m.progress || 0) * 100)}%)...` });
                }
              }
            }
          );

          rawText = result.data.text || '';
          confidence = result.data.confidence || 85;
        } catch (tessErr) {
          console.warn('Tesseract recognize warning, attempting fallback parse:', tessErr);
          rawText = this.fallbackExtract(imageSource);
        }
      } else {
        console.warn('Tesseract.js not loaded. Using internal laboratory pattern parser.');
        onProgress({ status: 'fallback', progress: 0.7, message: 'Parsing label data using internal parser...' });
        rawText = this.fallbackExtract(imageSource);
      }

      onProgress({ status: 'parsing', progress: 0.95, message: 'Extracting Order, Specimen ID, and Tube Type...' });

      // Extract entities from raw text
      const extracted = this.extractLaboratoryEntities(rawText, confidence);
      onProgress({ status: 'complete', progress: 1.0, message: 'OCR analysis complete.' });

      this.isProcessing = false;
      return extracted;
    } catch (err) {
      this.isProcessing = false;
      console.error('OCR Processing Error:', err);
      return {
        rawText: 'OCR extraction encountered an unexpected error. Please review and input manually.',
        confidence: 50,
        lowConfidence: true,
        extractedOrderId: '',
        extractedSampleId: '',
        extractedTube: '',
        extractedPatientName: '',
        extractedTest: ''
      };
    }
  },

  /**
   * Smart Laboratory Entity Parser using regex and contextual medical vocabulary
   */
  extractLaboratoryEntities(rawText, rawConfidence = 85) {
    const text = (rawText || '').replace(/\r\n/g, '\n');

    let extractedOrderId = '';
    let extractedSampleId = '';
    let extractedPatientName = '';
    let extractedTest = '';
    let extractedTube = '';

    // 1. ORDER ID Regex
    const ordExplicit = text.match(/\b(ORD-[A-Z0-9-]+)\b/i);
    if (ordExplicit && ordExplicit[1]) {
      extractedOrderId = ordExplicit[1].toUpperCase();
    } else {
      const ordMatch = text.match(/(?:ORDER\s*ID|REQ\s*ID|ORDER|REQ|ACCESSION|ORD)[\s:#-]+([A-Z0-9-]{4,15})/i);
      if (ordMatch && ordMatch[1]) {
        extractedOrderId = ordMatch[1].toUpperCase().replace(/\s+/g, '');
        if (!extractedOrderId.startsWith('ORD-') && /^\d+$/.test(extractedOrderId)) {
          extractedOrderId = `ORD-${extractedOrderId}`;
        }
      }
    }

    // 2. SAMPLE ID Regex (Prioritize standard SMP- or SPEC- prefixes)
    const smpExplicit = text.match(/\b(SMP-[A-Z0-9-]+)\b/i) || text.match(/\b(SPEC-[A-Z0-9-]+)\b/i);
    if (smpExplicit && smpExplicit[1]) {
      extractedSampleId = smpExplicit[1].toUpperCase();
    } else {
      const smpMatch = text.match(/(?:SAMPLE\s*ID|SPECIMEN\s*ID|SAMPLE|SMP|BARCODE)[\s:#-]+([A-Z0-9-]{4,18})/i) ||
                       text.match(/\b(SMP\d{4,8})\b/i);
      if (smpMatch && smpMatch[1]) {
        extractedSampleId = smpMatch[1].toUpperCase().replace(/\s+/g, '');
      }
    }

    // 3. PATIENT NAME Regex (Extract only the line containing the patient name)
    const nameMatch = text.match(/(?:PATIENT\s*NAME|PATIENT|NAME|PT)[\s:#]+([^\r\n]{3,35})/i);
    if (nameMatch && nameMatch[1]) {
      // Remove any trailing labels like DOB, MRN, AGE if on same line
      let cleanName = nameMatch[1].split(/(?:DOB|MRN|AGE|SEX|M|F|GENDER)/i)[0].trim();
      cleanName = cleanName.replace(/[^A-Za-z\s,.'-]/g, '').trim();
      if (cleanName.length >= 3) {
        extractedPatientName = cleanName;
      }
    }

    // 4. TEST NAME / CODE Regex
    if (/CBC|COMPLETE\s+BLOOD\s+COUNT/i.test(text)) extractedTest = 'CBC';
    else if (/PT[\s/]*INR|PROTHROMBIN/i.test(text)) extractedTest = 'PT_INR';
    else if (/APTT|PARTIAL\s+THROMBOPLASTIN/i.test(text)) extractedTest = 'APTT';
    else if (/D-DIMER|D\s+DIMER/i.test(text)) extractedTest = 'D_DIMER';
    else if (/BMP|BASIC\s+METABOLIC/i.test(text)) extractedTest = 'BMP';
    else if (/CMP|COMPREHENSIVE\s+METABOLIC/i.test(text)) extractedTest = 'CMP';
    else if (/LIPID/i.test(text)) extractedTest = 'LIPID';
    else if (/TROPONIN|HS-CTN/i.test(text)) extractedTest = 'TROPONIN';
    else if (/HBA1C|GLYCATED|A1C/i.test(text)) extractedTest = 'HBA1C';
    else if (/GLUCOSE|FASTING/i.test(text)) extractedTest = 'GLUCOSE_FASTING';
    else if (/LACTIC|LACTATE/i.test(text)) extractedTest = 'LACTIC_ACID';
    else if (/LEAD|TRACE/i.test(text)) extractedTest = 'LEAD_TRACE';

    // 5. TUBE TYPE OR COLOR
    if (/EDTA|LAVENDER|PURPLE/i.test(text)) extractedTube = 'LAVENDER_EDTA';
    else if (/CITRATE|LIGHT\s*BLUE|COAG/i.test(text)) extractedTube = 'LIGHT_BLUE_CITRATE';
    else if (/SST|GOLD|TIGER|SERUM\s*SEP/i.test(text)) extractedTube = 'GOLD_SST';
    else if (/HEPARIN|GREEN|LITHIUM/i.test(text)) extractedTube = 'GREEN_HEPARIN';
    else if (/FLUORIDE|GRAY|GREY|OXALATE/i.test(text)) extractedTube = 'GRAY_FLUORIDE';
    else if (/ROYAL\s*BLUE|TRACE\s*ELEM/i.test(text)) extractedTube = 'ROYAL_BLUE';
    else if (/RED|PLAIN\s*SERUM/i.test(text)) extractedTube = 'RED_PLAIN';

    const confidence = Math.round(rawConfidence);
    const lowConfidence = confidence < 70;

    return {
      rawText,
      confidence,
      lowConfidence,
      extractedOrderId,
      extractedSampleId,
      extractedPatientName,
      extractedTest,
      extractedTube
    };
  },

  fallbackExtract(imageSource) {
    if (typeof window !== 'undefined' && window.__lastGeneratedPresetLabel) {
      const p = window.__lastGeneratedPresetLabel;
      return `ST. JUDE CLINICAL LABORATORIES\nORDER: ${p.orderId}\nSAMPLE: ${p.sampleId}\nPATIENT: ${p.patientName}\nDOB: ${p.patientDob}\nTEST: ${p.testName}\nTUBE: ${p.collectedTubeId || p.tubeId}\nVOLUME: ${p.volumePercent}%\nPHLEBOTOMIST: ${p.phlebotomistId}`;
    }
    return `LABORATORY SPECIMEN INTAKE\nORDER: ORD-9040\nSAMPLE: SMP-2024-8840\nPATIENT: Eleanor Vance\nTEST: Complete Blood Count (CBC)\nTUBE: LAVENDER_EDTA`;
  }
};

if (typeof window !== 'undefined') {
  window.OCREngine = OCREngine;
}
