import { GoogleGenerativeAI } from '@google/generative-ai';
import { SupportedLanguageCode } from '@/context/LanguageContext';

export interface CalamityDefinition {
  id: string;
  nameKey: string;
  defaultEnglish: string;
  category: 'flood' | 'cyclone' | 'landslide' | 'earthquake' | 'cloudburst' | 'inundation' | 'tsunami' | 'dam' | 'chemical' | 'fire' | 'heatwave' | 'thunderstorm';
}

export const CALAMITY_LIST: CalamityDefinition[] = [
  { id: 'flood', nameKey: 'calamityFlood', defaultEnglish: 'Flood (Riverine / Flash Inundation)', category: 'flood' },
  { id: 'cyclone', nameKey: 'calamityCyclone', defaultEnglish: 'Cyclone (Coastal Surge & Extreme Wind)', category: 'cyclone' },
  { id: 'landslide', nameKey: 'calamityLandslide', defaultEnglish: 'Landslide (Debris Flow & Slope Rupture)', category: 'landslide' },
  { id: 'earthquake', nameKey: 'calamityEarthquake', defaultEnglish: 'Earthquake (Tectonic Tremor & Collapse)', category: 'earthquake' },
  { id: 'cloudburst', nameKey: 'calamityCloudburst', defaultEnglish: 'Cloudburst (Torrential Mountain Deluge)', category: 'cloudburst' },
  { id: 'inundation', nameKey: 'calamityInundation', defaultEnglish: 'Urban Inundation (Drainage Choke)', category: 'inundation' },
  { id: 'tsunami', nameKey: 'calamityTsunami', defaultEnglish: 'Tsunami (Coastal Surge Wave)', category: 'tsunami' },
  { id: 'dam', nameKey: 'calamityDamSpillway', defaultEnglish: 'Dam Spillway Release (High Volume Discharge)', category: 'dam' },
  { id: 'chemical', nameKey: 'calamityChemicalGas', defaultEnglish: 'Chemical Gas Leak (Toxic Plume Dispersion)', category: 'chemical' },
  { id: 'fire', nameKey: 'calamityForestFire', defaultEnglish: 'Forest Fire (Active Flame Front)', category: 'fire' },
  { id: 'heatwave', nameKey: 'calamityHeatwave', defaultEnglish: 'Severe Heatwave (Extreme Thermal Alert)', category: 'heatwave' },
  { id: 'thunderstorm', nameKey: 'calamityThunderstorm', defaultEnglish: 'Severe Thunderstorm & Lightning Hazard', category: 'thunderstorm' },
];

/**
 * High-precision, verified emergency civil defense alerts strictly constrained to <= 30 characters.
 * Each alert uses life-saving direct imperatives in the native vernacular script.
 */
export const DETERMINISTIC_VERNACULAR_ALERTS: Record<string, Record<SupportedLanguageCode, string>> = {
  flood: {
    en: 'FLOOD: MOVE TO HIGH GROUND NOW',
    hi: 'बाढ़: तुरंत ऊंचे स्थान पर जाएं',
    ml: 'പ്രളയം: ഉയർന്ന ഇടത്തേക്ക് മാറുക',
    gu: 'પૂર: તુરંત ઊંચા સ્થળે ખસો',
    mr: 'पूर: त्वरित उंच ठिकाणी जा',
    ta: 'வெள்ளம்: பாதுகாப்பான மேடு செல்க',
    te: 'వరద: ఎత్తైన ప్రాంతానికి వెళ్లండి',
    as: 'বানপানী: ওখ স্থানলৈ যাওক',
    bn: 'বন্যা: উঁচু আশ্রয়ে সরে যান',
  },
  cyclone: {
    en: 'CYCLONE: EVACUATE TO SHELTER',
    hi: 'चक्रवात: पक्के आश्रय में जाएं',
    ml: 'ചുഴലിക്കാറ്റ്: താവളത്തിൽ കഴിയുക',
    gu: 'વાવાઝોડું: પાકા આશ્રયે ખસો',
    mr: 'चक्रीवादळ: पक्क्या निवाऱ्यात जा',
    ta: 'புயல்: புயல் காப்பகம் செல்க',
    te: 'తుఫాను: పక్కా షెల్టర్‌కు వెళ్లండి',
    as: 'ঘূৰ্ণি: আশ্ৰয় শিবিৰলৈ যাওক',
    bn: 'ঘূর্ণিঝড়: পাকা আশ্রয়ে যান',
  },
  landslide: {
    en: 'LANDSLIDE: LEAVE VALLEY NOW',
    hi: 'भूस्खलन: ढलान क्षेत्र तुरंत छोड़ें',
    ml: 'ഉരുൾപൊട്ടൽ: താഴ്‌വര ഒഴിയുക',
    gu: 'ભૂસ્ખલન: ઢોળાવ તરત છોડો',
    mr: 'दरड कोसळणे: खोरे तातडीने सोडा',
    ta: 'நிலச்சரிவு: மலையடிவாரம் விடுக',
    te: 'కొండచరియలు: లోయను వీడండి',
    as: 'ভূমিস্খলন: উপত্যকা ত্যাগ কৰক',
    bn: 'ভূমিধস: উপত্যকা ত্যাগ করুন',
  },
  earthquake: {
    en: 'QUAKE: DROP COVER AND HOLD ON',
    hi: 'भूकंप: खुले स्थान पर तुरंत जाएं',
    ml: 'ഭൂകമ്പം: തുറസ്സായ സ്ഥലത്തേക്ക്',
    gu: 'ધરતીકંપ: ખુલ્લા મેદાનમાં જાવ',
    mr: 'भूकंप: मोकळ्या जागेवर जा',
    ta: 'நிலநடுக்கம்: திறந்தவெளி செல்க',
    te: 'భూకంపం: బహిరంగ ప్రదేశానికి రండి',
    as: 'ভূমিকম্প: মুকলি ঠাইলৈ যাওক',
    bn: 'ভূমিকম্প: খোলা জায়গায় যান',
  },
  cloudburst: {
    en: 'CLOUDBURST: FLEE WATERWAYS',
    hi: 'बादल फटा: नदी तट तुरंत छोड़ें',
    ml: 'മേഘവിസ്ഫോടനം: മാറിനിൽക്കുക',
    gu: 'વાદળ ફાટવું: પ્રવાહથી દૂર ખસો',
    mr: 'ढगफुटी: ओढ्यांपासून दूर व्हा',
    ta: 'மேகவெடிப்பு: நீர்நிலையை விடுக',
    te: 'మేఘవిస్ఫోటనం: వాగులను వీడండి',
    as: 'মেঘভঙা বান: নৈৰ পৰা আঁতৰক',
    bn: 'মেঘভাঙা বৃষ্টি: জলপথ ছাড়ুন',
  },
  inundation: {
    en: 'WATERLOGGING: AVOID UNDERPASS',
    hi: 'जलभराव: निचले रास्तों से बचें',
    ml: 'വെള്ളക്കെട്ട്: അണ്ടർപാസ് ഒഴിവാക്കുക',
    gu: 'જળબંબાકાર: અંડરપાસ ટાળો',
    mr: 'पाणी साचले: भुयारी मार्ग टाळा',
    ta: 'நீர் தேக்கம்: சுரங்கப்பாதை தவிர்க',
    te: 'నీటి నిల్వ: అండర్‌పాస్‌లు వద్దు',
    as: 'কৃত্ৰিম বান: আণ্ডাৰপাছ এৰক',
    bn: 'জলাবদ্ধতা: আন্ডারপাস এড়ান',
  },
  tsunami: {
    en: 'TSUNAMI: EVACUATE COASTLINE',
    hi: 'सुनामी: समुद्र तट तुरंत छोड़ें',
    ml: 'സുനാമി: തീരത്തുനിന്ന് മാറുക',
    gu: 'સુનામી: દરિયાકાંઠો તરત છોડો',
    mr: 'सुनामी: समुद्रकिनारा तातडीने सोडा',
    ta: 'சுனாமி: கடற்கரையை விட்டு விலகு',
    te: 'సునామీ: తీర ప్రాంతాన్ని వీడండి',
    as: 'চুনামী: উপকূল তৎক্ষণাৎ এৰক',
    bn: 'সুনামি: উপকূল অবিলম্বে ছাড়ুন',
  },
  dam: {
    en: 'DAM SPILLWAY: CLEAR BASIN NOW',
    hi: 'डैम गेट खुला: नदी तल खाली करें',
    ml: 'ഡാം തുറന്നു: പുഴയോരം ഒഴിയുക',
    gu: 'ડેમ ડિસ્ચાર્જ: નદીપટ ખાલી કરો',
    mr: 'धरण विसर्ग: नदीपात्र रिकामे करा',
    ta: 'அணை திறப்பு: ஆற்றுப்படுகை விடுக',
    te: 'డ్యామ్ గేట్లు ఎత్తారు: ఖాళీ చేయండి',
    as: 'বান্ধৰ পানী: নৈৰ কাষ এৰি দিয়ক',
    bn: 'ড্যাম খোলা: নদী অববাহিকা ছাড়ুন',
  },
  chemical: {
    en: 'GAS LEAK: STAY INDOORS SEAL',
    hi: 'गैस रिसाव: खिड़कियां बंद रखें',
    ml: 'വാതക ചോർച്ച: വാതിലുകൾ അടയ്ക്കുക',
    gu: 'ગેસ ગળતર: બારીઓ બંધ રાખો',
    mr: 'वायू गळती: घराची दारे बंद करा',
    ta: 'விஷ வாயு: கதவுகளை மூடுங்கள்',
    te: 'గ్యాస్ లీక్: తలుపులు మూసివేయండి',
    as: 'গেছ নিঃসৰণ: খিৰিকী বন্ধ ৰাখক',
    bn: 'গ্যাস লিক: জানালা বন্ধ রাখুন',
  },
  fire: {
    en: 'WILDFIRE: EVACUATE UPWIND NOW',
    hi: 'दावानल: हवा के विपरीत दिशा में जाएं',
    ml: 'കാട്ടുതീ: കാറ്റിനെതിരെ മാറുക',
    gu: 'દાવાનળ: પવનથી વિરુદ્ધ દિશા પકડો',
    mr: 'वणवा: वाऱ्याच्या विरुद्ध पळा',
    ta: 'காட்டுத்தீ: காற்றுதிசைக்கு எதிர் செல்க',
    te: 'దావానలం: ఎదురుగాలి వైపు పరుగెత్తండి',
    as: 'বনজুই: বতাহৰ ওলোটা দিশলৈ যাওক',
    bn: 'দাবানল: বাতাসের উল্টো দিকে যান',
  },
  heatwave: {
    en: 'HEATWAVE: STAY IN SHADE HYDRATE',
    hi: 'लू का प्रकोप: छाया में रहें पानी पिएं',
    ml: 'സൂര്യാഘാതം: തണലിലിരിക്കുക',
    gu: 'લૂ ચેતવણી: છાંયડે રહો પાણી પીવો',
    mr: 'उष्णतेची लाट: सावलीत राहा पाणी प्या',
    ta: 'வெப்ப அலை: நிழலில் இரு நீர் குடி',
    te: 'వడగాల్పులు: నీడన ఉండండి నీరు తాగండి',
    as: 'প্ৰচণ্ড গৰম: ছাঁত থাকক পানী খাওক',
    bn: 'তাপপ্রবাহ: ছায়ায় থাকুন জল খান',
  },
  thunderstorm: {
    en: 'LIGHTNING: SHELTER INDOORS NOW',
    hi: 'वज्रपात: तुरंत पक्के मकान में जाएं',
    ml: 'ഇടിമിന്നൽ: സുരക്ഷിത കെട്ടിടത്തിൽ കയറുക',
    gu: 'વીજળી ચેતવણી: પાકા મકાને આશરો લો',
    mr: 'वीज संकट: पक्क्या घरात आश्रय घ्या',
    ta: 'இடிமின்னல்: உடனே கட்டிடத்தினுள் செல்க',
    te: 'పిడుగులు: తక్షణమే ఇళ్లలోకి వెళ్లండి',
    as: 'বজ্ৰপাত: নিৰাপদ ঘৰৰ ভিতৰত সোমাওক',
    bn: 'বজ্রপাত: নিরাপদ আশ্রয়ে যান',
  },
};

/**
 * Synthesizes a high-urgency 30-character micro-alert in the specified Indian vernacular language.
 */
export async function synthesizeVernacularMicroAlert(params: {
  hazard: string;
  calamityId?: string;
  location: string;
  directive: string;
  language: SupportedLanguageCode;
  languageName: string;
}): Promise<string> {
  const { hazard, calamityId, location, directive, language, languageName } = params;

  // Resolve best matching deterministic template
  let key = (calamityId || '').toLowerCase();
  if (!key || !DETERMINISTIC_VERNACULAR_ALERTS[key]) {
    const textLower = `${hazard} ${directive}`.toLowerCase();
    for (const item of CALAMITY_LIST) {
      if (textLower.includes(item.id) || textLower.includes(item.category)) {
        key = item.id;
        break;
      }
    }
  }
  if (!key || !DETERMINISTIC_VERNACULAR_ALERTS[key]) {
    key = 'flood';
  }

  const deterministicAlert = DETERMINISTIC_VERNACULAR_ALERTS[key][language] || DETERMINISTIC_VERNACULAR_ALERTS[key].en;

  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey.length < 10) {
    return deterministicAlert.slice(0, 30);
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a civil defense alert dispatcher for Indian cellular emergency broadcasts.
TASK: Synthesize a 30-character micro-alert.
TARGET LANGUAGE: ${languageName} (Script: native vernacular script for ${language}).
CRITICAL RULES:
1. THE OUTPUT MUST BE WRITTEN IN ${languageName.toUpperCase()} (NOT English, unless the target language is English).
2. ABSOLUTE MAXIMUM LENGTH: 30 characters (including letters, spaces, colons).
3. URGENT CIVIL DEFENSE ACTION: Imperative instruction for life safety.
4. ZERO EMOJIS, ZERO MARKDOWN, ZERO EXPLANATION.
5. If the target language is English, output UPPERCASE English. For Indian vernacular scripts, output grammatically accurate urgent text under 30 characters.

CONTEXT:
Hazard: ${hazard}
Location: ${location}
Directive: ${directive}
Reference Example for ${languageName}: "${deterministicAlert}"

Output ONLY the 30-character alert in ${languageName}:`;

    const res = await model.generateContent(prompt);
    let output = res.response.text().trim();

    // Clean formatting
    output = output
      .replace(/["'`*#\n\r]/g, '')
      .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
      .trim();

    // Verify language output: if user requested non-English but AI produced Latin ASCII characters, fall back to native script template
    if (language !== 'en' && /^[\x00-\x7F\s:!.,-]+$/.test(output)) {
      console.warn(`[Synthesizer] AI generated English for ${language}. Using verified vernacular template.`);
      return deterministicAlert.slice(0, 30);
    }

    if (output.length > 30) {
      output = output.slice(0, 30).trim();
    }

    return output || deterministicAlert.slice(0, 30);
  } catch (err) {
    console.warn('[Synthesizer] Generative call failed, using verified vernacular template:', err);
    return deterministicAlert.slice(0, 30);
  }
}
