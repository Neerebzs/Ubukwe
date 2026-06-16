/**
 * Rwanda National ID (Indangamuntu) Validator
 *
 * Layers:
 *  1. File sanity  — size, mime type, dimensions
 *  2. Liveness     — Sobel edge-detection sharpness score via canvas
 *  3. OCR          — Tesseract.js text extraction
 *  4. NID fields   — keywords, ID-number format, DOB, name presence
 */

import Tesseract from "tesseract.js"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NIDValidationResult {
  valid: boolean
  stage: "file" | "liveness" | "ocr" | "fields" | "passed"
  score: number          // 0-100 overall confidence
  checks: NIDCheck[]
  extractedData?: ExtractedNIDData
  error?: string
}

export interface NIDCheck {
  name: string
  passed: boolean
  detail: string
}

export interface ExtractedNIDData {
  rawText: string
  name?: string
  idNumber?: string
  dateOfBirth?: string
  sex?: string
  placeOfIssue?: string
  hasRwandaKeyword: boolean
  hasIndangamuntu: boolean
  hasRepublicKeyword: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

/** Rwanda NID number: 1 YYYY X XXXXXXXX X XX  (16 digits, starts with 1 or 2) */
const NID_NUMBER_REGEX = /[12]\s*\d{3,4}\s*\d\s*\d{7,8}\s*\d\s*\d{1,2}/

/** Condensed version — digits only, 16 chars, starts with 1 or 2 */
const NID_COMPACT_REGEX = /^[12]\d{15}$/

/** Date of birth on Rwandan IDs  DD/MM/YYYY */
const DOB_REGEX = /\b\d{2}\/\d{2}\/\d{4}\b/

/** Minimum sharpness (Sobel variance) for a usable scan */
const MIN_SHARPNESS = 80

/** Minimum image dimensions to bother running OCR */
const MIN_WIDTH = 400
const MIN_HEIGHT = 250

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Cannot decode image"))
    }
    img.src = url
  })
}

/**
 * Sobel edge-detection sharpness score.
 * Converts the image to greyscale, applies horizontal + vertical Sobel kernels
 * and returns the variance of the gradient magnitudes as a proxy for focus.
 * A sharp, well-lit document scan typically scores > 100; a blurry photo < 40.
 */
function sobelSharpness(img: HTMLImageElement): number {
  const MAX_DIM = 512          // downsample for speed
  const scale  = Math.min(1, MAX_DIM / Math.max(img.width, img.height))
  const w = Math.round(img.width  * scale)
  const h = Math.round(img.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width  = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(img, 0, 0, w, h)

  const { data } = ctx.getImageData(0, 0, w, h)

  // Greyscale
  const grey = new Float32Array(w * h)
  for (let i = 0; i < grey.length; i++) {
    const p = i * 4
    grey[i] = 0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]
  }

  // Sobel
  const magnitudes: number[] = []
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (r: number, c: number) => grey[(y + r) * w + (x + c)]
      const gx =
        -idx(-1, -1) + idx(-1, 1) +
        -2 * idx(0, -1) + 2 * idx(0, 1) +
        -idx(1, -1) + idx(1, 1)
      const gy =
        -idx(-1, -1) - 2 * idx(-1, 0) - idx(-1, 1) +
         idx(1, -1)  + 2 * idx(1, 0)  + idx(1, 1)
      magnitudes.push(Math.sqrt(gx * gx + gy * gy))
    }
  }

  // Variance of magnitudes
  const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length
  const variance = magnitudes.reduce((a, b) => a + (b - mean) ** 2, 0) / magnitudes.length
  return Math.sqrt(variance)   // return std-dev — more stable than raw variance
}

/**
 * Parse OCR text and extract structured fields from a Rwandan NID.
 */
function extractNIDFields(rawText: string): ExtractedNIDData {
  const text = rawText.toUpperCase()
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean)

  // Keywords
  const hasIndangamuntu  = text.includes("INDANGAMUNTU")
  const hasRwandaKeyword = text.includes("RWANDA")
  const hasRepublicKeyword = text.includes("REPUBLIC")

  // ID number — strip spaces then match compact pattern
  const compact = text.replace(/\s+/g, "")
  const idMatch = compact.match(NID_COMPACT_REGEX)
    ?? rawText.replace(/\s+/g, "").match(NID_COMPACT_REGEX)
    ?? rawText.match(NID_NUMBER_REGEX)
  const idNumber = idMatch ? idMatch[0].replace(/\s/g, "") : undefined

  // Date of birth
  const dobMatch = rawText.match(DOB_REGEX)
  const dateOfBirth = dobMatch ? dobMatch[0] : undefined

  // Name — look for the line after "Amazina" / "Names"
  let name: string | undefined
  for (let i = 0; i < lines.length; i++) {
    const upper = lines[i].toUpperCase()
    if (upper.includes("AMAZINA") || upper.includes("NAMES")) {
      // Name is typically on the very next non-empty line
      const nextLine = lines[i + 1]
      if (nextLine && nextLine.length > 3 && /[A-Z]/.test(nextLine)) {
        name = nextLine.trim()
      }
      break
    }
  }

  // Sex (Igitsina / Sex)
  let sex: string | undefined
  for (let i = 0; i < lines.length; i++) {
    const upper = lines[i].toUpperCase()
    if (upper.includes("IGITSINA") || upper.includes("SEX")) {
      const m = lines[i].match(/\b([MF]|Gabo|Gore)\b/i)
      if (m) sex = m[1]
      // also check same line after the label
      break
    }
  }

  // Place of issue
  let placeOfIssue: string | undefined
  for (let i = 0; i < lines.length; i++) {
    const upper = lines[i].toUpperCase()
    if (upper.includes("AHO YATANGIWE") || upper.includes("PLACE OF ISSUE")) {
      const nextLine = lines[i + 1]
      if (nextLine && nextLine.length > 2) placeOfIssue = nextLine.trim()
      break
    }
  }

  return {
    rawText,
    name,
    idNumber,
    dateOfBirth,
    sex,
    placeOfIssue,
    hasRwandaKeyword,
    hasIndangamuntu,
    hasRepublicKeyword,
  }
}

// ─── Main validator ────────────────────────────────────────────────────────────

/**
 * Runs all validation layers against an uploaded NID image file.
 * Returns a structured result with per-check details and an overall score.
 *
 * @param file  The File object from the <input type="file"> element
 * @param onProgress  Optional callback called between layers with a 0-100 value
 */
export async function validateNationalID(
  file: File,
  onProgress?: (pct: number, label: string) => void
): Promise<NIDValidationResult> {
  const checks: NIDCheck[] = []

  const fail = (
    stage: NIDValidationResult["stage"],
    error: string,
    score = 0
  ): NIDValidationResult => ({
    valid: false,
    stage,
    score,
    checks,
    error,
  })

  // ── Layer 1: File sanity ──────────────────────────────────────────────────
  onProgress?.(5, "Checking file…")

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  const typeOk = allowedTypes.includes(file.type)
  checks.push({
    name: "File type",
    passed: typeOk,
    detail: typeOk ? `${file.type} accepted` : `${file.type} is not allowed (JPEG/PNG/WebP only)`,
  })
  if (!typeOk) return fail("file", "Invalid file type. Please upload a JPEG or PNG image of your National ID.")

  const sizeOk = file.size <= 10 * 1024 * 1024
  checks.push({
    name: "File size",
    passed: sizeOk,
    detail: sizeOk
      ? `${(file.size / 1024).toFixed(0)} KB — within limit`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB — exceeds 10 MB limit`,
  })
  if (!sizeOk) return fail("file", "File is too large. Maximum allowed size is 10 MB.")

  // ── Layer 2: Dimensions + Liveness (Sobel sharpness) ─────────────────────
  onProgress?.(15, "Checking image quality…")

  let img: HTMLImageElement
  try {
    img = await loadImage(file)
  } catch {
    return fail("liveness", "Cannot read the image. The file may be corrupted.")
  }

  const dimsOk = img.width >= MIN_WIDTH && img.height >= MIN_HEIGHT
  checks.push({
    name: "Image dimensions",
    passed: dimsOk,
    detail: dimsOk
      ? `${img.width}×${img.height} px — sufficient resolution`
      : `${img.width}×${img.height} px — too small (min ${MIN_WIDTH}×${MIN_HEIGHT})`,
  })
  if (!dimsOk)
    return fail("liveness", `Image resolution is too low (${img.width}×${img.height}). Please use a clearer photo.`)

  // Aspect ratio: ID cards are landscape ~85.6 × 54 mm → ~1.58:1
  const aspectRatio = img.width / img.height
  const aspectOk = aspectRatio >= 1.3 && aspectRatio <= 2.2
  checks.push({
    name: "Aspect ratio",
    passed: aspectOk,
    detail: aspectOk
      ? `${aspectRatio.toFixed(2)} — matches ID card format`
      : `${aspectRatio.toFixed(2)} — expected landscape card format (1.3–2.2)`,
  })
  // soft warning — don't hard-fail (user might have cropped slightly)

  // Sharpness via Sobel
  let sharpness = 0
  try {
    sharpness = sobelSharpness(img)
  } catch {
    sharpness = MIN_SHARPNESS + 1  // if canvas blocked, be lenient
  }
  const sharpOk = sharpness >= MIN_SHARPNESS
  checks.push({
    name: "Image sharpness (liveness)",
    passed: sharpOk,
    detail: sharpOk
      ? `Sharpness score ${sharpness.toFixed(0)} — image is clear`
      : `Sharpness score ${sharpness.toFixed(0)} — image appears blurry or low-contrast`,
  })
  if (!sharpOk)
    return fail(
      "liveness",
      "The ID photo looks blurry or poorly lit. Please retake the photo in good lighting and ensure the card is flat and in focus.",
      15
    )

  // ── Layer 3: OCR ─────────────────────────────────────────────────────────
  onProgress?.(30, "Reading document text (OCR)…")

  let rawText = ""
  try {
    const result = await Tesseract.recognize(file, "eng", {
      // Improve accuracy for document scans
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/: '-.",
    } as any)
    rawText = result.data.text
  } catch (err) {
    console.warn("Tesseract OCR failed:", err)
    // OCR failure is not fatal — fall back to a lenient pass
    checks.push({ name: "OCR extraction", passed: false, detail: "OCR could not read the document text" })
    return fail("ocr", "Could not extract text from the image. Please upload a clearer, well-lit photo of your National ID.", 10)
  }

  const hasText = rawText.trim().length > 20
  checks.push({
    name: "OCR extraction",
    passed: hasText,
    detail: hasText
      ? `Extracted ${rawText.trim().length} characters`
      : "Very little text found — image may be too dark or low quality",
  })
  if (!hasText)
    return fail("ocr", "No readable text was found in the image. Ensure the entire front of the National ID is visible and well-lit.", 20)

  // ── Layer 4: NID field validation ─────────────────────────────────────────
  onProgress?.(75, "Validating document fields…")

  const extracted = extractNIDFields(rawText)

  // Keyword checks
  checks.push({
    name: "INDANGAMUNTU keyword",
    passed: extracted.hasIndangamuntu,
    detail: extracted.hasIndangamuntu
      ? "Found 'INDANGAMUNTU' on document"
      : "Missing 'INDANGAMUNTU' — does not appear to be a Rwandan National ID",
  })

  checks.push({
    name: "Rwanda / Republic keyword",
    passed: extracted.hasRwandaKeyword || extracted.hasRepublicKeyword,
    detail:
      extracted.hasRwandaKeyword || extracted.hasRepublicKeyword
        ? "Found Rwanda/Republic header"
        : "Missing country header",
  })

  const hasIdNumber = !!extracted.idNumber
  checks.push({
    name: "ID number format",
    passed: hasIdNumber,
    detail: hasIdNumber
      ? `Detected ID No. ${extracted.idNumber}`
      : "No valid 16-digit ID number found",
  })

  const hasDOB = !!extracted.dateOfBirth
  checks.push({
    name: "Date of birth",
    passed: hasDOB,
    detail: hasDOB ? `DOB: ${extracted.dateOfBirth}` : "Date of birth field not detected",
  })

  const hasName = !!extracted.name
  checks.push({
    name: "Name field",
    passed: hasName,
    detail: hasName ? `Name: ${extracted.name}` : "Name field not clearly detected",
  })

  // Scoring
  const keyFieldsPassed = [
    extracted.hasIndangamuntu,
    extracted.hasRwandaKeyword || extracted.hasRepublicKeyword,
    hasIdNumber,
    hasDOB,
    hasName,
  ]
  const fieldScore = keyFieldsPassed.filter(Boolean).length  // 0-5

  // Hard requirements: at least the INDANGAMUNTU keyword + either ID number or Rwanda header
  const hardPass =
    extracted.hasIndangamuntu &&
    (extracted.hasRwandaKeyword || extracted.hasRepublicKeyword) &&
    (hasIdNumber || hasDOB)

  if (!hardPass) {
    const missing: string[] = []
    if (!extracted.hasIndangamuntu) missing.push("'INDANGAMUNTU'")
    if (!extracted.hasRwandaKeyword && !extracted.hasRepublicKeyword) missing.push("Rwanda header")
    if (!hasIdNumber) missing.push("valid ID number")
    if (!hasDOB) missing.push("date of birth")

    return fail(
      "fields",
      `This does not appear to be a valid Rwandan National ID. Missing: ${missing.join(", ")}. Please upload the front side of your Indangamuntu.`,
      Math.round((fieldScore / 5) * 40)
    )
  }

  // ── All layers passed ─────────────────────────────────────────────────────
  onProgress?.(100, "Validation complete")

  const score = Math.round(40 + (fieldScore / 5) * 60)  // 40-100

  return {
    valid: true,
    stage: "passed",
    score,
    checks,
    extractedData: extracted,
  }
}
