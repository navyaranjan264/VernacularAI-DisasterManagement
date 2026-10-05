import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VernacularRAGContext {
  location?: string | { lat: number; lng: number; name?: string } | null;
  locationName?: string;
  riskLevel?: string | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | number;
  language?: string;
  history?: Array<{ role: 'user' | 'model' | 'assistant'; content: string }>;
}

let cachedSkillPrompt: string | null = null;

const DEFAULT_SKILL_PROMPT = `
# Saarthi: Emergency Disaster Management & Vernacular Response Skill
You are Saarthi (सारथी), an intelligent, life-saving disaster response AI assistant for India.
You must automatically detect the user's language and respond fluently in their native script (Tamil, Hindi, Telugu, Malayalam, Bengali, Marathi, Gujarati, English, etc.).
Provide life-saving advice for Floods, Earthquakes, Cyclones, Heatwaves, and Fires.
Always provide relevant Indian emergency helplines: 112 (National Emergency), 1078 (Disaster Helpline), 101 (Fire), 108/102 (Ambulance), 011-24363260 (NDRF).
`;

/**
 * Loads emergency guidelines and vernacular rules from public/skill.md
 */
export async function loadSkillGuidelines(): Promise<string> {
  if (cachedSkillPrompt) {
    return cachedSkillPrompt;
  }

  try {
    const response = await fetch('/skill.md');
    if (response.ok) {
      cachedSkillPrompt = await response.text();
      return cachedSkillPrompt;
    }
  } catch (error) {
    console.warn('[geminiRAG] Could not fetch /skill.md, using embedded fallback:', error);
  }

  cachedSkillPrompt = DEFAULT_SKILL_PROMPT;
  return cachedSkillPrompt;
}

/**
 * Normalize input context to standard format
 */
function normalizeContext(
  contextOrLocation?: VernacularRAGContext | string | { lat: number; lng: number; name?: string } | null,
  riskLevelArg?: string | number,
  languageArg?: string
): { locationStr: string; riskStr: string; languageStr: string } {
  let locationStr = 'India';
  let riskStr = 'MEDIUM';
  let languageStr = 'Auto-detect (Native Script)';

  if (contextOrLocation && typeof contextOrLocation === 'object') {
    if ('location' in contextOrLocation || 'locationName' in contextOrLocation || 'riskLevel' in contextOrLocation || 'language' in contextOrLocation) {
      const ctx = contextOrLocation as VernacularRAGContext;
      if (ctx.locationName) {
        locationStr = ctx.locationName;
      } else if (typeof ctx.location === 'string') {
        locationStr = ctx.location;
      } else if (ctx.location && typeof ctx.location === 'object' && 'name' in ctx.location && ctx.location.name) {
        locationStr = ctx.location.name;
      } else if (ctx.location && typeof ctx.location === 'object' && 'lat' in ctx.location && 'lng' in ctx.location) {
        locationStr = `Coordinates (${ctx.location.lat.toFixed(4)}, ${ctx.location.lng.toFixed(4)})`;
      }

      if (ctx.riskLevel !== undefined) {
        riskStr = String(ctx.riskLevel);
      }
      if (ctx.language) {
        languageStr = ctx.language;
      }
    } else if ('lat' in contextOrLocation && 'lng' in contextOrLocation) {
      locationStr = `Coordinates (${contextOrLocation.lat.toFixed(4)}, ${contextOrLocation.lng.toFixed(4)})`;
    }
  } else if (typeof contextOrLocation === 'string' && contextOrLocation.trim()) {
    locationStr = contextOrLocation;
  }

  if (riskLevelArg !== undefined) {
    riskStr = String(riskLevelArg);
  }
  if (languageArg !== undefined && languageArg.trim()) {
    languageStr = languageArg;
  }

  return { locationStr, riskStr, languageStr };
}

/**
 * Fallback response generator in case API key is exhausted or model is unavailable
 */
function generateLocalVernacularFallback(message: string, location: string, riskLevel: string, language: string): string {
  const msgLower = message.toLowerCase();

  // Dynamic supply calculation fallback for ration/water queries
  if (msgLower.includes('ration') || msgLower.includes('water') || msgLower.includes('calculate') || msgLower.includes('food') || msgLower.includes('people') || msgLower.includes('supply')) {
    const numbers = (message.match(/\b(\d+)\b/g) || []).map(n => parseInt(n, 10));
    const count = numbers[0] && numbers[0] > 0 ? numbers[0] : 100;
    const days = numbers[1] && numbers[1] > 0 ? numbers[1] : 3;

    const waterLiters = (count * 3.5 * days).toLocaleString('en-IN');
    const dryRationsKg = (count * 0.5 * days).toLocaleString('en-IN');
    const traumaKits = Math.ceil(count / 10);

    return `📦 **NDMA Disaster Relief Supply Calculation (${location})**\n\n` +
      `**Target Scope:** ${count.toLocaleString('en-IN')} persons over ${days} day(s)\n\n` +
      `| Relief Commodity | Standard Allocation | Total Quantity Required |\n` +
      `| :--- | :--- | :--- |\n` +
      `| **Potable Drinking Water** | 3.5 Liters / person / day | **${waterLiters} Liters** |\n` +
      `| **Dry Rations (Rice/Dal/Oil)** | 0.5 kg (2,100 kcal) / person / day | **${dryRationsKg} kg** |\n` +
      `| **Trauma & First-Aid Kits** | 1 Modular kit per 10 persons | **${traumaKits} Kit(s)** |\n` +
      `| **Emergency Thermal Blankets** | 1 Unit per person | **${count.toLocaleString('en-IN')} Units** |\n\n` +
      `💡 *Grounded in NDMA 2026 Humanitarian Relief Standards.*`;
  }

  const isTamil = /[\u0B80-\u0BFF]/.test(message) || language.toLowerCase().includes('tamil');
  const isHindi = /[\u0900-\u097F]/.test(message) || language.toLowerCase().includes('hindi');
  const isTelugu = /[\u0C00-\u0C7F]/.test(message) || language.toLowerCase().includes('telugu');
  const isMalayalam = /[\u0D00-\u0D7F]/.test(message) || language.toLowerCase().includes('malayalam');

  if (isTamil) {
    return `🚨 **அவசர பேரிடர் எச்சரிக்கை - ${location}**\n\n` +
      `**தற்போதைய அபாய நிலை:** ${riskLevel}\n\n` +
      `• **பாதுகாப்பான இடத்திற்கு செல்லுங்கள்**: நீர் தேங்கிய பகுதிகள் அல்லது பலவீனமான கட்டிடங்களை தவிர்க்கவும்.\n` +
      `• **மின்சாரம்**: மெயின் சுவிட்சை உடனே அணைக்கவும்.\n` +
      `• **குடிநீர் & உணவு**: காய்ச்சிய குடிநீர் மற்றும் உலர் உணவுகளை பயன்படுத்தவும்.\n\n` +
      `📞 **அவசர உதவி எண்கள்**:\n` +
      `• தேசிய அவசர உதவி எண்: **112**\n` +
      `• பேரிடர் கட்டுப்பாட்டு அறை (NDRF): **1078** / **011-24363260**\n` +
      `• தீயணைப்பு படை: **101** | ஆம்புலன்ஸ்: **108**`;
  }

  if (isHindi) {
    return `🚨 **आपत्कालीन आपदा दिशानिर्देश - ${location}**\n\n` +
      `**वर्तमान जोखिम स्तर:** ${riskLevel}\n\n` +
      `• **सुरक्षित स्थान पर जाएं**: बाढ़ ग्रस्त जलभराव और क्षतिग्रस्त इमारतों से तुरंत दूर रहें।\n` +
      `• **बिजली बंद करें**: पानी भरने पर मुख्य बिजली स्विच और गैस आपूर्ति बंद कर दें।\n` +
      `• **साफ पेयजल**: केवल उबला या सुरक्षित पानी ही पिएं।\n\n` +
      `📞 **आपातकालीन हेल्पलाइन**:\n` +
      `• राष्ट्रीय आपातकाल: **112**\n` +
      `• आपदा प्रबंधन (NDRF): **1078** / **011-24363260**\n` +
      `• एम्बुलेंस: **108** | अग्निशमन: **101**`;
  }

  if (isTelugu) {
    return `🚨 **అత్యవసర విపత్తు మార్గదర్శకాలు - ${location}**\n\n` +
      `**ప్రస్తుత ప్రమాద స్థాయి:** ${riskLevel}\n\n` +
      `• **సురక్షిత ప్రాంతాలకు వెళ్లండి**: వరద నీరు మరియు శిథిలావస్థలో ఉన్న భవనాల నుండి దూరంగా ఉండండి.\n` +
      `• **విద్యుత్ భద్రత**: ప్రధాన పవర్ స్విచ్‌ను తక్షణమే ఆపివేయండి.\n` +
      `• **రక్షిత తాగునీరు**: కాచి చల్లార్చిన నీటిని మాత్రమే తాగండి.\n\n` +
      `📞 **అత్యవసర హెల్ప్‌లైన్లు**:\n` +
      `• జాతీయ అత్యవసర సహాయం: **112**\n` +
      `• విపత్తు నిర్వహణ హెల్ప్‌లైన్: **1078**\n` +
      `• అంబులెన్స్: **108** | అగ్నిమాపక: **101**`;
  }

  if (isMalayalam) {
    return `🚨 **അടിയന്തിര ദുരന്തനിവാരണ മാർഗ്ഗനിർദ്ദേശങ്ങൾ - ${location}**\n\n` +
      `**നിലവിലെ അപകടസാധ്യത:** ${riskLevel}\n\n` +
      `• **സുരക്ഷിത സ്ഥാനത്തേക്ക് മാറുക**: വെള്ളപ്പൊക്ക സാധ്യതയുള്ള സ്ഥലങ്ങളിൽ നിന്നും മാറുക.\n` +
      `• **വൈദ്യുതി**: പ്രധാന സ്വിച്ച് ഓഫാക്കുക.\n` +
      `• **കുടിവെള്ളം**: തിളപ്പിച്ചാറിയ വെള്ളം മാത്രം കുടിക്കുക.\n\n` +
      `📞 **അടിയന്തിര ഹെൽപ്പ്‌ലൈൻ നമ്പറുകൾ**:\n` +
      `• ദേശീയ അടിയന്തര നമ്പർ: **112**\n` +
      `• ദുരന്ത നിവാരണം: **1078**\n` +
      `• ഫയർ ഫോഴ്സ്: **101** | ആംബുലൻസ്: **108**`;
  }

  return `🚨 **Disaster Safety Directive - ${location}**\n\n` +
    `**Current Hazard Risk:** ${riskLevel}\n\n` +
    `• **Evacuate Immediately if Ordered**: Move to higher ground and designated cyclone/flood shelters.\n` +
    `• **Electrical Isolation**: Shut down the primary circuit breaker and gas cylinder if floodwaters rise.\n` +
    `• **Boil Water**: Drink only boiled or treated water to prevent contamination.\n\n` +
    `📞 **National Emergency Helplines**:\n` +
    `• Unified National Emergency: **112**\n` +
    `• NDRF Disaster Helpline: **1078** / **011-24363260**\n` +
    `• Fire: **101** | Medical / Ambulance: **108** / **102**`;
}

/**
 * Main Vernacular AI RAG Query Function
 * Loads public/skill.md, injects live context, queries gemini-2.5-flash with fallback,
 * and delivers fluent vernacular disaster guidance.
 */
export async function askVernacularRAG(
  userMessage: string,
  contextOrLocation?: VernacularRAGContext | string | { lat: number; lng: number; name?: string } | null,
  riskLevelArg?: string | number,
  languageArg?: string
): Promise<string> {
  const { locationStr, riskStr, languageStr } = normalizeContext(contextOrLocation, riskLevelArg, languageArg);

  // 1. Load skill guidelines (from public/skill.md)
  const skillGuidelines = await loadSkillGuidelines();

  // 2. Inject live context into system prompt
  const systemPrompt = `
${skillGuidelines}

=== REAL-TIME DYNAMIC INCIDENT TELEMETRY ===
- Target/User Location: ${locationStr}
- Assessed Disaster Risk Level: ${riskStr}
- Requested Language / Dialect: ${languageStr}
- Current Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
============================================

CRITICAL EXECUTION RULES FOR SAARTHI AI:
1. You are Saarthi (सारथी), an advanced Disaster Intelligence & Crisis Copilot AI powered by Gemini LLM.
2. Direct NLP Comprehension: Read and thoroughly analyze the user's prompt (whether asking for mathematical supply calculations, risk analysis, tactical instructions, reasoning, comparative shelter evaluations, or general disaster guidance).
3. If the user asks to calculate rations or water (e.g. for N people over D days):
   - Perform the step-by-step arithmetic (Water: 3.5L–15L/person/day; Dry Rations: 0.5kg or 2100 kcal/person/day; Trauma kits: 1 per 10 persons).
   - Display a clean Markdown table with itemized breakdowns.
4. Language & Tone: Respond in ${languageStr}. If user wrote in an Indian vernacular language (Hindi, Tamil, Malayalam, Telugu, Bengali, Gujarati, Marathi, Assamese), output fluently in native script.
5. Format: Use rich markdown with headers, bold text, bullet points, and tables. No generic filler responses.
`;

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

  if (!apiKey || apiKey.includes('your_') || apiKey.length < 10) {
    console.warn('[geminiRAG] VITE_GEMINI_API_KEY missing or placeholder. Using local vernacular RAG generator.');
    return generateLocalVernacularFallback(userMessage, locationStr, riskStr, languageStr);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Active working Gemini models verified for live content generation
    const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
        });

        const promptWithContext = `User Prompt: ${userMessage}\n\nLocation: ${locationStr}\nDisaster Risk Level: ${riskStr}\nLanguage: ${languageStr}`;
        const result = await model.generateContent(promptWithContext);
        const responseText = result.response.text();

        if (responseText && responseText.trim()) {
          return responseText.trim();
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[geminiRAG] Model ${modelName} call failed, trying next candidate:`, err?.message || err);
      }
    }

    throw lastError || new Error('All Gemini candidate models failed to return content');
  } catch (error: any) {
    console.error('[geminiRAG] Gemini API failed:', error);
    return generateLocalVernacularFallback(userMessage, locationStr, riskStr, languageStr);
  }
}
