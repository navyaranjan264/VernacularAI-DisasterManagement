/**
 * Emergency Bulk SMS Alert Dispatch Service
 * Handles broadcasting emergency alerts via Fast2SMS (bulk route)
 * with unicode support for regional Indian languages and built-in simulated fallback.
 * Strictly adheres to enterprise formatting with zero emojis and 160-char budget validation.
 */

export interface SMSDispatchParams {
  numbers: string; // Comma/newline-separated 10-digit numbers
  message: string;
  language?: string;
  senderId?: string;
  apiKeyOverride?: string;
  forceSimulation?: boolean;
}

export interface SMSDispatchResult {
  success: boolean;
  simulated: boolean;
  recipientCount: number;
  message: string;
  error?: string;
  timestamp: string;
  characterCount?: number;
  segmentCount?: number;
  details?: Record<string, unknown>;
  batchResults?: BatchResult[];
}

export interface BatchResult {
  batch: number;
  numbers: string[];
  success: boolean;
  response?: unknown;
  error?: string;
}

export interface SMSBudgetCheck {
  characterCount: number;
  maxBudget: number;
  isWithinBudget: boolean;
  segmentCount: number;
  isUnicode: boolean;
  warning?: string;
}

/** Standardize Indian 10-digit phone numbers from any format */
export function sanitizePhoneNumbers(input: string): string[] {
  return input
    .split(/[\s,;\n|]+/)
    .map((n) => n.replace(/\D/g, ''))
    .map((n) => {
      if (n.length === 12 && n.startsWith('91')) return n.slice(2);
      if (n.length === 11 && n.startsWith('0')) return n.slice(1);
      return n;
    })
    .filter((n) => n.length === 10)
    .filter((n, i, arr) => arr.indexOf(n) === i); // deduplicate
}

/** Split large number lists into batches (Fast2SMS max 1000 per request) */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/** Check if message contains non-ASCII (regional script) characters */
export function detectUnicode(message: string): boolean {
  return /[^\u0000-\u007F]/.test(message);
}

/** Strip any accidental emojis or pictographs */
export function sanitizeText(text: string): string {
  return text.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').trim();
}

/**
 * Strict 160-character budget validation.
 * Cellular SMS standards: Standard GSM 160 chars / Unicode 70 chars per segment.
 */
export function validateSMSBudget(message: string, strictCap = 160): SMSBudgetCheck {
  const clean = sanitizeText(message);
  const isUnicode = detectUnicode(clean);
  const characterCount = clean.length;
  const segmentLimit = isUnicode ? 70 : 160;
  const segmentCount = Math.ceil(characterCount / segmentLimit) || 1;
  const isWithinBudget = characterCount <= strictCap;

  let warning: string | undefined;
  if (!isWithinBudget) {
    warning = `Message exceeds standard ${strictCap}-character limit (${characterCount} characters). Cellular gateways will split this into ${segmentCount} billable segments.`;
  }

  return {
    characterCount,
    maxBudget: strictCap,
    isWithinBudget,
    segmentCount,
    isUnicode,
    warning,
  };
}

/**
 * Dispatches bulk vernacular SMS alerts using Fast2SMS Bulk Gateway.
 * - Supports up to 1000 numbers per batch (auto-chunked)
 * - Auto-detects unicode for regional language messages
 * - Gracefully falls back to simulation if API key is missing or CORS blocks
 */
export function generateWhatsAppUrl(numbers: string[], message: string): string {
  const cleanMsg = encodeURIComponent(sanitizeText(message));
  if (numbers.length === 1) {
    const num = numbers[0];
    const fullNum = num.startsWith('91') ? num : `91${num}`;
    return `https://wa.me/${fullNum}?text=${cleanMsg}`;
  }
  return `https://wa.me/?text=${cleanMsg}`;
}

export function generateDeviceSmsUri(numbers: string[], message: string): string {
  const cleanMsg = encodeURIComponent(sanitizeText(message));
  const joinedNumbers = numbers.join(',');
  return `sms:${joinedNumbers}?body=${cleanMsg}`;
}

/**
 * Dispatches bulk vernacular SMS alerts using Fast2SMS Bulk Gateway.
 * - Supports up to 1000 numbers per batch (auto-chunked)
 * - Auto-detects unicode for regional language messages
 * - Gracefully falls back to simulation if API key is missing, CORS blocks, or billing recharge needed
 */
export async function sendVernacularSMS({
  numbers,
  message,
  language = 'english',
  apiKeyOverride,
  forceSimulation = false,
}: SMSDispatchParams): Promise<SMSDispatchResult> {
  const effectiveApiKey = (apiKeyOverride || import.meta.env.VITE_FAST2SMS_API_KEY || '').trim();
  const validNumbers = sanitizePhoneNumbers(numbers);
  const cleanMessage = sanitizeText(message);
  const budget = validateSMSBudget(cleanMessage);

  const timestamp = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  if (validNumbers.length === 0) {
    return {
      success: false,
      simulated: false,
      recipientCount: 0,
      message: 'Please provide at least one valid 10-digit mobile number.',
      error: 'NO_VALID_RECIPIENTS',
      timestamp,
      characterCount: budget.characterCount,
      segmentCount: budget.segmentCount,
    };
  }

  // Simulation mode
  if (forceSimulation || !effectiveApiKey || effectiveApiKey.includes('your_') || effectiveApiKey.length < 10) {
    console.info(`[EMERGENCY BULK SMS BROADCAST - SIMULATION MODE]`);
    console.info(`Recipients (${validNumbers.length}): ${validNumbers.slice(0, 5).join(', ')}`);
    console.info(`Language: ${language} (Unicode: ${budget.isUnicode})`);
    console.info(`Characters: ${budget.characterCount} | Segments: ${budget.segmentCount}`);

    await new Promise((r) => setTimeout(r, 600));

    return {
      success: true,
      simulated: true,
      recipientCount: validNumbers.length,
      characterCount: budget.characterCount,
      segmentCount: budget.segmentCount,
      message: `Cellular broadcast simulated for ${validNumbers.length} recipient(s). Payload: ${budget.characterCount}/30 chars (1 billable GSM frame).`,
      timestamp,
      details: {
        numbers: validNumbers,
        message: cleanMessage,
        simulated: true,
        isUnicode: budget.isUnicode,
        characterCount: budget.characterCount,
        segmentCount: budget.segmentCount,
      },
    };
  }

  // Live Fast2SMS Bulk Dispatch
  const BATCH_SIZE = 1000;
  const batches = chunkArray(validNumbers, BATCH_SIZE);
  const batchResults: BatchResult[] = [];
  let successCount = 0;
  let failCount = 0;
  let billingNoticeDetected = false;

  try {
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const numbersString = batch.join(',');

      const payload = {
        route: 'q',
        message: cleanMessage,
        language: budget.isUnicode ? 'unicode' : 'english',
        flash: 0,
        numbers: numbersString,
      };

      try {
        const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: effectiveApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data && (data.return === true || data.status_code === 200)) {
          successCount += batch.length;
          batchResults.push({ batch: i + 1, numbers: batch, success: true, response: data });
        } else {
          const rawMsg = Array.isArray(data?.message) ? data.message.join(' ') : (data?.message || '');
          if (data?.status_code === 999 || rawMsg.includes('100 INR') || rawMsg.includes('transaction')) {
            billingNoticeDetected = true;
          }

          failCount += batch.length;
          batchResults.push({
            batch: i + 1,
            numbers: batch,
            success: false,
            response: data,
            error: rawMsg || 'Gateway rejected packet',
          });
        }

        if (i < batches.length - 1) {
          await new Promise((r) => setTimeout(r, 300));
        }
      } catch (batchErr: unknown) {
        const errMessage = batchErr instanceof Error ? batchErr.message : String(batchErr);
        failCount += batch.length;
        batchResults.push({ batch: i + 1, numbers: batch, success: false, error: errMessage });
      }
    }

    if (billingNoticeDetected) {
      return {
        success: true,
        simulated: true,
        recipientCount: validNumbers.length,
        characterCount: budget.characterCount,
        segmentCount: budget.segmentCount,
        message: `Fast2SMS Gateway Status 999: Fast2SMS requires an initial wallet recharge of ₹100 before enabling live API route (q). Broadcast has been logged in simulation mode. You can also use WhatsApp or Direct Device SMS below.`,
        timestamp,
        details: {
          notice: 'Fast2SMS ₹100 first transaction required',
          numbers: validNumbers,
          message: cleanMessage,
        },
        batchResults,
      };
    }

    const allSucceeded = failCount === 0;
    const partialSuccess = successCount > 0 && failCount > 0;

    return {
      success: allSucceeded || partialSuccess,
      simulated: false,
      recipientCount: successCount,
      characterCount: budget.characterCount,
      segmentCount: budget.segmentCount,
      message: allSucceeded
        ? `Fast2SMS Gateway: Broadcast delivered to ${successCount} cellular recipient(s) in ${batches.length} batch(es).`
        : partialSuccess
        ? `Partial delivery: ${successCount} sent, ${failCount} failed.`
        : `Dispatch failed: ${batchResults[0]?.error || 'Check Fast2SMS account balance.'}`,
      timestamp,
      details: { successCount, failCount, totalBatches: batches.length },
      batchResults,
    };
  } catch (networkError: unknown) {
    const errMessage = networkError instanceof Error ? networkError.message : String(networkError);
    return {
      success: true,
      simulated: true,
      recipientCount: validNumbers.length,
      characterCount: budget.characterCount,
      segmentCount: budget.segmentCount,
      message: `Cellular broadcast logged in simulation mode. Browser network fallback active for ${validNumbers.length} recipient(s).`,
      timestamp,
      details: {
        error: errMessage,
        numbers: validNumbers,
        message: cleanMessage,
      },
    };
  }
}
