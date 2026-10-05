import { GoogleGenerativeAI } from '@google/generative-ai';

export type SeverityRating = 'none' | 'minor' | 'moderate' | 'severe' | 'catastrophic';

export interface DamageAssessmentReport {
  hazardType: string;
  severityRating: SeverityRating;
  structuralDamageObservations: string[];
  fieldProtocols: string[];
  vernacularWarningSummary: string;
  confidence: number;
  summary: string;
}

const VALID_SEVERITY: SeverityRating[] = ['none', 'minor', 'moderate', 'severe', 'catastrophic'];

const ASSESSMENT_PROMPT = `You are a senior field damage assessor for an Indian emergency operations centre.
Analyze the attached image and return ONLY valid JSON (no markdown fences, no commentary) with this exact shape:
{
  "hazardType": "Flood | Earthquake | Fire | Cyclone | Landslide | Storm | Structural Collapse | None | Other",
  "severityRating": "none | minor | moderate | severe | catastrophic",
  "confidence": 0.0 to 1.0,
  "structuralDamageObservations": ["observation 1", "observation 2", "observation 3"],
  "fieldProtocols": ["protocol 1", "protocol 2", "protocol 3"],
  "vernacularWarningSummary": "A concise public warning in English that can be translated for field broadcast",
  "summary": "2-3 sentence formal damage assessment"
}

Rules:
- Use formal, operational language suitable for NDMA / SDMA briefings.
- Collapsed or crumbled buildings must be rated severe or catastrophic.
- Flooded streets, standing water in occupied structures: flood, typically moderate to severe.
- Charred or actively burning structures: fire, typically severe.
- If the scene is undamaged, set severityRating to none and say so clearly.
- fieldProtocols must be actionable for first responders (isolation, evacuation, utilities, documentation).
- Do not invent details that are not visible.`;

function stripDataUrlPrefix(dataUrlOrBase64: string): string {
  return dataUrlOrBase64.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, '').trim();
}

function mimeFromDataUrl(dataUrl: string, fallback: string): string {
  const match = dataUrl.match(/^data:([^;]+);base64,/);
  return match?.[1] || fallback || 'image/jpeg';
}

/**
 * Convert an uploaded File to raw Base64 (no data-URL prefix) using FileReader
 * to avoid large-string btoa failures and CORS issues.
 */
export function fileToRawBase64(file: File): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please upload a valid image file (JPG, PNG, or WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const data = stripDataUrlPrefix(result);
      if (!data) {
        reject(new Error('Unable to encode the image as Base64. Try a smaller file.'));
        return;
      }
      resolve({
        mimeType: mimeFromDataUrl(result, file.type),
        data,
      });
    };
    reader.onerror = () => {
      reject(new Error('Failed to read the uploaded image. The file may be corrupt.'));
    };
    reader.readAsDataURL(file);
  });
}

function parseAssessmentJson(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('The vision model did not return a structured assessment.');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

function normalizeReport(parsed: Record<string, unknown>): DamageAssessmentReport {
  const severityRaw = String(parsed.severityRating || parsed.severity || 'none').toLowerCase();
  const severityRating = VALID_SEVERITY.includes(severityRaw as SeverityRating)
    ? (severityRaw as SeverityRating)
    : 'none';

  const observations = Array.isArray(parsed.structuralDamageObservations)
    ? parsed.structuralDamageObservations.map(String).filter(Boolean)
    : [];
  const protocols = Array.isArray(parsed.fieldProtocols)
    ? parsed.fieldProtocols.map(String).filter(Boolean)
    : [];

  const confidence = Math.min(Math.max(Number(parsed.confidence ?? 0.6), 0), 1);

  return {
    hazardType: String(parsed.hazardType || 'Undetermined'),
    severityRating,
    structuralDamageObservations: observations.length
      ? observations
      : ['No distinct structural observations could be extracted from the image.'],
    fieldProtocols: protocols.length
      ? protocols
      : ['Document the site, restrict public access, and await local authority confirmation.'],
    vernacularWarningSummary: String(
      parsed.vernacularWarningSummary ||
        'Stay clear of damaged structures and follow official instructions from local authorities.',
    ),
    confidence,
    summary: String(parsed.summary || 'Formal damage assessment completed from the submitted image.'),
  };
}

function getApiKey(): string {
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}

/**
 * Multimodal damage assessment using Gemini 2.5 Flash.
 */
export async function analyzeDisasterImage(file: File): Promise<DamageAssessmentReport> {
  const { mimeType, data } = await fileToRawBase64(file);

  const apiKey = getApiKey();
  if (!apiKey || apiKey.includes('your_') || apiKey.length < 10) {
    throw new Error('Gemini API key is not configured. Set VITE_GEMINI_API_KEY to run vision assessment.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const candidateModels = ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-flash-latest'];
  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        { text: ASSESSMENT_PROMPT },
        { inlineData: { mimeType, data } },
      ]);
      const text = result.response.text();
      if (!text?.trim()) {
        throw new Error('Empty response from vision model.');
      }
      return normalizeReport(parseAssessmentJson(text));
    } catch (err) {
      lastError = err;
      console.warn(`[imageAnalyzer] Model ${modelName} failed:`, err instanceof Error ? err.message : err);
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'Vision assessment failed.';
  throw new Error(message);
}
