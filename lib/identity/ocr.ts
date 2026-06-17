import Tesseract from 'tesseract.js';

export interface IDData {
  documentNumber: string | null;
  name: string | null;
  dob: string | null;
  address: string | null;
  rawText: string;
}

/**
 * Extracts text from a preprocessed ID image buffer using Tesseract.js.
 * @param buffer - Preprocessed image buffer
 * @returns Parsed ID data
 */
export async function extractIDText(buffer: Buffer): Promise<IDData> {
  const { data: { text } } = await Tesseract.recognize(
    buffer,
    'eng',
    { logger: m => console.log(m) }
  );

  return parseRwandanID(text);
}

function parseRwandanID(text: string): IDData {
  // Typical Rwandan ID is 16 digits starting with 1
  const idRegex = /(1\s?\d{3}\s?\d{1}\s?\d{7}\s?\d{1}\s?\d{2})/g;
  const match = text.replace(/[^0-9]/g, '').match(/1\d{15}/);
  const documentNumber = match ? match[0] : null;

  // Basic heuristics for DOB (usually format DD/MM/YYYY or YYYY)
  const dobMatch = text.match(/\b(19\d{2}|20\d{2})\b|\b\d{2}[\/\-\.]\d{2}[\/\-\.]\d{4}\b/);
  const dob = dobMatch ? dobMatch[0] : null;

  // Simplified extraction - in reality this requires complex NLP or specific bounding boxes
  return {
    documentNumber,
    name: null, // Placeholder for actual name extraction logic based on layout
    dob,
    address: null, // Placeholder
    rawText: text,
  };
}
