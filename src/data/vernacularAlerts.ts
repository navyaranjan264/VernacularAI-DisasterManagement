/**
 * Vernacular Bulk SMS Alert Data
 * India-wide state→language mapping + disaster-type message templates
 * Used for mass emergency broadcasts to entire states/districts
 */

// ─── State → Language Mapping ──────────────────────────────────────────────
export interface StateInfo {
  name: string;
  code: string;
  langCode: string;
  langLabel: string;
  script: string;
  region: string;
  floodProne?: boolean;
  cycloneProne?: boolean;
  earthquakeProne?: boolean;
  landslide?: boolean;
}

export const INDIAN_STATES: StateInfo[] = [
  // South India
  { name: 'Tamil Nadu',        code: 'TN', langCode: 'ta', langLabel: 'Tamil',      script: 'தமிழ்',     region: 'South',     floodProne: true,  cycloneProne: true },
  { name: 'Kerala',            code: 'KL', langCode: 'ml', langLabel: 'Malayalam',  script: 'മലയാളം',    region: 'South',     floodProne: true,  landslide: true },
  { name: 'Karnataka',         code: 'KA', langCode: 'kn', langLabel: 'Kannada',    script: 'ಕನ್ನಡ',     region: 'South',     floodProne: true,  landslide: true },
  { name: 'Andhra Pradesh',    code: 'AP', langCode: 'te', langLabel: 'Telugu',     script: 'తెలుగు',    region: 'South',     floodProne: true,  cycloneProne: true },
  { name: 'Telangana',         code: 'TS', langCode: 'te', langLabel: 'Telugu',     script: 'తెలుగు',    region: 'South',     floodProne: true },
  { name: 'Puducherry',        code: 'PY', langCode: 'ta', langLabel: 'Tamil',      script: 'தமிழ்',     region: 'South',     cycloneProne: true },
  { name: 'Lakshadweep',       code: 'LD', langCode: 'ml', langLabel: 'Malayalam',  script: 'മലയാളം',    region: 'South',     cycloneProne: true },

  // West India
  { name: 'Maharashtra',       code: 'MH', langCode: 'mr', langLabel: 'Marathi',    script: 'मराठी',     region: 'West',      floodProne: true,  landslide: true },
  { name: 'Gujarat',           code: 'GJ', langCode: 'gu', langLabel: 'Gujarati',   script: 'ગુજરાતી',  region: 'West',      cycloneProne: true, earthquakeProne: true },
  { name: 'Goa',               code: 'GA', langCode: 'kok',langLabel: 'Konkani/En', script: 'कोंकणी',   region: 'West',      floodProne: true },
  { name: 'Daman & Diu',       code: 'DD', langCode: 'gu', langLabel: 'Gujarati',   script: 'ગુજરાતી',  region: 'West' },
  { name: 'Dadra & NH',        code: 'DH', langCode: 'gu', langLabel: 'Gujarati',   script: 'ગુજરાતી',  region: 'West' },

  // North India
  { name: 'Delhi',             code: 'DL', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'North',     floodProne: true },
  { name: 'Uttar Pradesh',     code: 'UP', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'North',     floodProne: true },
  { name: 'Haryana',           code: 'HR', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'North' },
  { name: 'Punjab',            code: 'PB', langCode: 'pa', langLabel: 'Punjabi',    script: 'ਪੰਜਾਬੀ',   region: 'North',     floodProne: true },
  { name: 'Rajasthan',         code: 'RJ', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'North' },
  { name: 'Himachal Pradesh',  code: 'HP', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'North',     landslide: true, earthquakeProne: true },
  { name: 'Uttarakhand',       code: 'UK', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'North',     floodProne: true,  landslide: true, earthquakeProne: true },
  { name: 'Jammu & Kashmir',   code: 'JK', langCode: 'ur', langLabel: 'Urdu/Hindi', script: 'اردو',     region: 'North',     earthquakeProne: true, landslide: true },
  { name: 'Ladakh',            code: 'LA', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'North',     earthquakeProne: true },
  { name: 'Chandigarh',        code: 'CH', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'North' },

  // Central India
  { name: 'Madhya Pradesh',    code: 'MP', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'Central',   floodProne: true },
  { name: 'Chhattisgarh',      code: 'CG', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'Central',   floodProne: true },

  // East India
  { name: 'West Bengal',       code: 'WB', langCode: 'bn', langLabel: 'Bengali',    script: 'বাংলা',    region: 'East',      floodProne: true,  cycloneProne: true },
  { name: 'Odisha',            code: 'OD', langCode: 'or', langLabel: 'Odia',       script: 'ଓଡ଼ିଆ',    region: 'East',      cycloneProne: true, floodProne: true },
  { name: 'Bihar',             code: 'BR', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'East',      floodProne: true },
  { name: 'Jharkhand',         code: 'JH', langCode: 'hi', langLabel: 'Hindi',      script: 'हिन्दी',   region: 'East',      floodProne: true },
  { name: 'Andaman & Nicobar', code: 'AN', langCode: 'hi', langLabel: 'Hindi/En',   script: 'हिन्दी',   region: 'East',      cycloneProne: true, earthquakeProne: true },

  // Northeast India
  { name: 'Assam',             code: 'AS', langCode: 'as', langLabel: 'Assamese',   script: 'অসমীয়া',  region: 'Northeast', floodProne: true,  landslide: true },
  { name: 'Meghalaya',         code: 'ML', langCode: 'en', langLabel: 'English',    script: 'English',  region: 'Northeast', floodProne: true,  landslide: true },
  { name: 'Manipur',           code: 'MN', langCode: 'mni',langLabel: 'Meitei/En',  script: 'মৈতৈলোন্', region: 'Northeast', floodProne: true,  landslide: true },
  { name: 'Nagaland',          code: 'NL', langCode: 'en', langLabel: 'English',    script: 'English',  region: 'Northeast', landslide: true },
  { name: 'Tripura',           code: 'TR', langCode: 'bn', langLabel: 'Bengali',    script: 'বাংলা',    region: 'Northeast', floodProne: true },
  { name: 'Mizoram',           code: 'MZ', langCode: 'en', langLabel: 'English',    script: 'English',  region: 'Northeast', landslide: true },
  { name: 'Arunachal Pradesh', code: 'AR', langCode: 'en', langLabel: 'English',    script: 'English',  region: 'Northeast', floodProne: true,  earthquakeProne: true, landslide: true },
  { name: 'Sikkim',            code: 'SK', langCode: 'ne', langLabel: 'Nepali',     script: 'नेपाली',   region: 'Northeast', earthquakeProne: true, landslide: true },
];

// ─── Disaster Types ─────────────────────────────────────────────────────────
export const DISASTER_TYPES = [
  { key: 'flood',      label: 'Flood / Flash Flood',   icon: '🌊', color: '#0ea5e9' },
  { key: 'cyclone',    label: 'Cyclone / Storm',        icon: '🌀', color: '#7c3aed' },
  { key: 'earthquake', label: 'Earthquake',             icon: '🏚️', color: '#dc2626' },
  { key: 'landslide',  label: 'Landslide / Mudslide',  icon: '⛰️', color: '#92400e' },
  { key: 'heatwave',   label: 'Heatwave / Heat Alert',  icon: '🌡️', color: '#f97316' },
  { key: 'tsunami',    label: 'Tsunami Warning',        icon: '🌊', color: '#0369a1' },
  { key: 'fire',       label: 'Fire Emergency',         icon: '🔥', color: '#ef4444' },
  { key: 'drought',    label: 'Drought / Water Crisis', icon: '🏜️', color: '#ca8a04' },
] as const;

export type DisasterKey = typeof DISASTER_TYPES[number]['key'];
export type LangCode = 'ta' | 'hi' | 'te' | 'ml' | 'bn' | 'mr' | 'gu' | 'pa' | 'kn' | 'or' | 'as' | 'ne' | 'ur' | 'en' | 'kok' | 'mni';

// ─── Severity Levels ────────────────────────────────────────────────────────
export const SEVERITY_LEVELS = [
  { key: 'HIGH',     label: 'High Alert',     color: '#f59e0b', bg: '#fffbeb' },
  { key: 'CRITICAL', label: 'Critical Alert', color: '#ef4444', bg: '#fef2f2' },
  { key: 'EXTREME',  label: 'Extreme / SOS',  color: '#7f1d1d', bg: '#fef2f2' },
] as const;

// ─── Vernacular SMS Templates ───────────────────────────────────────────────
// Tokens: {state}, {severity}, {helpline}
type TemplateMap = Partial<Record<LangCode, string>>;
type DisasterTemplates = Record<DisasterKey, TemplateMap>;

export const VERNACULAR_TEMPLATES: DisasterTemplates = {
  flood: {
    ta: `🚨 வெள்ள அவசர எச்சரிக்கை — {state} | {severity}

⚠️ உங்கள் பகுதியில் கடும் வெள்ளம் வெளியேறவும்!

✅ உடனடியாக செய்யுங்கள்:
• தாழ்வான பகுதிகளை விட்டு உடனே வெளியேறுங்கள்
• மின் இணைப்புகளை துண்டியுங்கள்
• குடிநீர், மருந்து, ஆவணங்கள் எடுத்துச் செல்லுங்கள்
• அருகிலுள்ள நிவாரண முகாமிற்கு செல்லுங்கள்
• ஆழமற்ற நீரிலும் நடக்காதீர்கள்

📞 உதவி எண்கள்:
• தேசிய அவசரம்: 112
• பேரிடர் உதவி: 1078
• நிவாரண முகாம் தகவல்: {helpline}

🏛️ {state} பேரிடர் மேலாண்மை ஆணையம்`,

    te: `🚨 వరద అత్యవసర హెచ్చరిక — {state} | {severity}

⚠️ మీ ప్రాంతంలో తీవ్ర వరదలు - వెంటనే తరలండి!

✅ వెంటనే చేయండి:
• నిమ్నప్రదేశాలను వెంటనే విడిచిపెట్టండి
• విద్యుత్ కనెక్షన్లు నిలిపివేయండి
• తాగునీరు, మందులు, పత్రాలు తీసుకెళ్ళండి
• సమీప ఉపశమన శిబిరానికి వెళ్ళండి
• ప్రవహించే నీటిలో నడవకండి

📞 సహాయ నంబర్లు:
• జాతీయ అత్యవసర: 112
• విపత్తు సహాయం: 1078
• శిబిర సమాచారం: {helpline}

🏛️ {state} విపత్తు నిర్వహణ ప్రాధికార సంస్థ`,

    ml: `🚨 വെള്ളപ്പൊക്ക അടിയന്തര മുന്നറിയിപ്പ് — {state} | {severity}

⚠️ നിങ്ങളുടെ പ്രദേശത്ത് ശക്തമായ വെള്ളപ്പൊക്കം - ഉടനെ ഒഴിഞ്ഞുമാറുക!

✅ ഇപ്പോൾ ചെയ്യേണ്ടത്:
• താഴ്ന്ന പ്രദേശങ്ങൾ ഉടൻ ഒഴിഞ്ഞുമാറുക
• വൈദ്യുതി ബന്ധം വിച്ഛേദിക്കുക
• കുടിവെള്ളം, മരുന്ന്, രേഖകൾ കൊണ്ടുപോകുക
• ഏറ്റവും അടുത്ത ദുരിതാശ്വാസ ക്യാമ്പിൽ അഭയം തേടുക
• ഒഴുകുന്ന വെള്ളത്തിൽ നടക്കരുത്

📞 ഹെൽപ്‌ലൈൻ നമ്പറുകൾ:
• ദേശീയ അടിയന്തരം: 112
• ദുരന്ത സഹായം: 1078
• ദുരിതാശ്വാസ ക്യാമ്പ്: {helpline}

🏛️ {state} ദുരന്ത നിവാരണ അതോറിറ്റി`,

    hi: `🚨 बाढ़ आपातकालीन चेतावनी — {state} | {severity}

⚠️ आपके क्षेत्र में भारी बाढ़ - तुरंत निकासी करें!

✅ अभी करें:
• निचले इलाकों को तुरंत खाली करें
• बिजली कनेक्शन बंद करें
• पीने का पानी, दवाई, दस्तावेज़ साथ लें
• नजदीकी राहत शिविर में जाएं
• बहते पानी में न चलें

📞 आपातकालीन नंबर:
• राष्ट्रीय आपातकाल: 112
• आपदा सहायता: 1078
• राहत शिविर जानकारी: {helpline}

🏛️ {state} आपदा प्रबंधन प्राधिकरण`,

    mr: `🚨 पूर आपत्कालीन इशारा — {state} | {severity}

⚠️ तुमच्या भागात तीव्र पूर - ताबडतोब निर्वासन करा!

✅ आत्ता करा:
• खालच्या भागांतून ताबडतोब बाहेर पडा
• वीज जोडणी बंद करा
• पिण्याचे पाणी, औषधे, कागदपत्रे घ्या
• जवळच्या मदत शिबिरात जा
• वाहत्या पाण्यात चालू नका

📞 मदत क्रमांक:
• राष्ट्रीय आपत्काल: 112
• आपत्ती सहाय्य: 1078
• मदत शिबिर माहिती: {helpline}

🏛️ {state} आपत्ती व्यवस्थापन प्राधिकरण`,

    bn: `🚨 বন্যা জরুরি সতর্কতা — {state} | {severity}

⚠️ আপনার এলাকায় তীব্র বন্যা - এখনই সরে যান!

✅ এখনই করুন:
• নিচু এলাকা থেকে সঙ্গে সঙ্গে সরে যান
• বিদ্যুৎ সংযোগ বিচ্ছিন্ন করুন
• পানীয় জল, ওষুধ, কাগজপত্র নিন
• নিকটতম ত্রাণ শিবিরে আশ্রয় নিন
• প্রবাহিত পানিতে হাঁটবেন না

📞 জরুরি নম্বর:
• জাতীয় জরুরি: 112
• দুর্যোগ সহায়তা: 1078
• ত্রাণ শিবির তথ্য: {helpline}

🏛️ {state} দুর্যোগ ব্যবস্থাপনা কর্তৃপক্ষ`,

    gu: `🚨 પૂર કટોકટી ચેતવણી — {state} | {severity}

⚠️ તમારા વિસ્તારમાં ભારે પૂર - તાત્કાલિક સ્થળાંતર કરો!

✅ હમણાં જ કરો:
• નીચાણવાળા વિસ્તારો ત્વરિત ખાલી કરો
• વીજળી જોડાણ બંધ કરો
• પીવાનું પાણી, દવા, દસ્તાવેજો સાથે લો
• નજીકના રાહત છાવણીમાં જાઓ
• વહેતા પાણીમાં ચાલશો નહીં

📞 મદદ નંબર:
• રાષ્ટ્રીય ઈમરજન્સી: 112
• આપત્તિ સહાય: 1078
• રાહત છાવણી: {helpline}

🏛️ {state} આપત્તિ વ્યવસ્થાપન સત્તામંડળ`,

    pa: `🚨 ਹੜ੍ਹ ਐਮਰਜੈਂਸੀ ਚੇਤਾਵਨੀ — {state} | {severity}

⚠️ ਤੁਹਾਡੇ ਖੇਤਰ ਵਿੱਚ ਭਾਰੀ ਹੜ੍ਹ - ਹੁਣੇ ਬਾਹਰ ਜਾਓ!

✅ ਹੁਣੇ ਕਰੋ:
• ਨੀਵੇਂ ਇਲਾਕਿਆਂ ਤੋਂ ਫੌਰਨ ਨਿਕਲੋ
• ਬਿਜਲੀ ਦੇ ਕੁਨੈਕਸ਼ਨ ਬੰਦ ਕਰੋ
• ਪੀਣ ਵਾਲਾ ਪਾਣੀ, ਦਵਾਈਆਂ ਨਾਲ ਲਓ
• ਨੇੜੇ ਰਾਹਤ ਕੈਂਪ ਵਿੱਚ ਜਾਓ

📞 ਮਦਦ ਨੰਬਰ: 112 | 1078 | {helpline}

🏛️ {state} ਆਫ਼ਤ ਪ੍ਰਬੰਧਨ ਅਥਾਰਿਟੀ`,

    kn: `🚨 ಪ್ರವಾಹ ತುರ್ತು ಎಚ್ಚರಿಕೆ — {state} | {severity}

⚠️ ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ತೀವ್ರ ಪ್ರವಾಹ - ತಕ್ಷಣ ಸ್ಥಳಾಂತರಿಸಿ!

✅ ಈಗಲೇ ಮಾಡಿ:
• ತಗ್ಗು ಪ್ರದೇಶಗಳನ್ನು ತಕ್ಷಣ ಖಾಲಿ ಮಾಡಿ
• ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಳಿಸಿ
• ಕುಡಿಯುವ ನೀರು, ಔಷಧ, ದಾಖಲೆಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ
• ಹತ್ತಿರದ ಪರಿಹಾರ ಶಿಬಿರಕ್ಕೆ ಹೋಗಿ

📞 ಸಹಾಯ ಸಂಖ್ಯೆಗಳು: 112 | 1078 | {helpline}

🏛️ {state} ವಿಪತ್ತು ನಿರ್ವಹಣಾ ಪ್ರಾಧಿಕಾರ`,

    or: `🚨 ବନ୍ୟା ଜରୁରୀ ସତର୍କତା — {state} | {severity}

⚠️ ଆପଣଙ୍କ ଅଞ୍ଚଳରେ ଭୟଙ୍କର ବନ୍ୟା - ତୁରନ୍ତ ସ୍ଥାନାନ୍ତର ହୁଅନ୍ତୁ!

✅ ଏବେ କରନ୍ତୁ:
• ନିମ୍ନ ସ୍ଥାନ ଛାଡ଼ି ତୁରନ୍ତ ଚାଲି ଯାଆନ୍ତୁ
• ବିଦ୍ୟୁତ୍ ସଂଯୋଗ ବନ୍ଦ କରନ୍ତୁ
• ଖାଇବା ପାଣି, ଔଷଧ, ଦଲିଲ ନିଅନ୍ତୁ
• ନିକଟ ଆଶ୍ରୟ ଶିବିରରେ ଯାଆନ୍ତୁ

📞 ସାହାଯ୍ୟ: 112 | 1078 | {helpline}

🏛️ {state} ବିପର୍ଯ୍ୟୟ ପ୍ରବନ୍ଧନ ପ୍ରାଧିକରଣ`,

    as: `🚨 বান পানীৰ জৰুৰী সতৰ্কবাণী — {state} | {severity}

⚠️ আপোনাৰ অঞ্চলত প্ৰচণ্ড বানপানী - এতিয়াই আঁতৰি যাওক!

✅ এতিয়াই কৰক:
• নিম্নভূমি এলেকা তৎক্ষণাৎ খালি কৰক
• বিদ্যুৎ সংযোগ বিচ্ছিন্ন কৰক
• পোৱা পানী, ঔষধ, কাগজপত্ৰ লৈ যাওক
• ওচৰৰ সাহায্য শিবিৰলৈ যাওক

📞 সাহায্য নম্বৰ: 112 | 1078 | {helpline}

🏛️ {state} দুৰ্যোগ ব্যৱস্থাপনা কৰ্তৃপক্ষ`,

    en: `🚨 FLOOD EMERGENCY ALERT — {state} | {severity}

⚠️ SEVERE FLOODING IN YOUR AREA - EVACUATE IMMEDIATELY!

✅ ACT NOW:
• Evacuate low-lying areas immediately
• Switch off electricity at main breaker
• Carry drinking water, medicines & documents
• Move to nearest relief camp / shelter
• Do NOT walk in flowing water

📞 Emergency Helplines:
• National Emergency: 112
• Disaster Helpline: 1078
• Relief Camp Info: {helpline}

🏛️ {state} State Disaster Management Authority (SDMA)`,
  },

  cyclone: {
    ta: `🚨 சூறாவளி அவசர எச்சரிக்கை — {state} | {severity}

⚠️ கடும் சூறாவளி உங்கள் கடற்கரைப் பகுதியை நோக்கி வருகிறது!

✅ உடனடியாக செய்யுங்கள்:
• கடற்கரைப் பகுதிகளை உடனே விட்டு வெளியேறுங்கள்
• கட்டமைப்பு பலமான கட்டடங்களில் அடைக்கலம் தேடுங்கள்
• ஜன்னல்கள், கதவுகளை மூடிப் பூட்டுங்கள்
• மூன்று நாள் உணவு மற்றும் தண்ணீர் இருப்பு வைக்கவும்
• அரசு ஒலிபரப்பை தொடர்ந்து கேட்கவும்

📞 உதவி: 112 | 1078 | IMD: 1800-180-1717 | {helpline}

🏛️ {state} பேரிடர் மேலாண்மை`,

    te: `🚨 తుఫాను అత్యవసర హెచ్చరిక — {state} | {severity}

⚠️ తీవ్రమైన తుఫాను మీ తీర ప్రాంతానికి చేరుకుంటోంది!

✅ వెంటనే చేయండి:
• తీర ప్రాంతాలను వెంటనే విడిచిపెట్టండి
• బలమైన భవనాల్లో ఆశ్రయం పొందండి
• కిటికీలు, తలుపులు మూసి లాక్ చేయండి
• 3 రోజుల ఆహారం, నీరు నిల్వ ఉంచుకోండి
• ప్రభుత్వ ప్రసారాలను వినండి

📞 సహాయం: 112 | 1078 | {helpline}

🏛️ {state} విపత్తు నిర్వహణ`,

    ml: `🚨 ചുഴലിക്കാറ്റ് അടിയന്തര മുന്നറിയിപ്പ് — {state} | {severity}

⚠️ ശക്തമായ ചുഴലിക്കാറ്റ് നിങ്ങളുടെ തീരദേശ പ്രദേശത്തേക്ക് വരുന്നു!

✅ ഉടൻ ചെയ്യേണ്ടത്:
• തീര പ്രദേശങ്ങൾ ഉടൻ ഒഴിഞ്ഞുമാറുക
• ഉറപ്പുള്ള കെട്ടിടങ്ങളിൽ അഭയം തേടുക
• ജനലുകളും വാതിലുകളും അടച്ചു പൂട്ടുക
• 3 ദിവസത്തെ ഭക്ഷണം, വെള്ളം ശേഖരിക്കുക

📞 ഹെൽപ്‌ലൈൻ: 112 | 1078 | {helpline}

🏛️ {state} ദുരന്ത നിവാരണ`,

    hi: `🚨 चक्रवात आपातकालीन चेतावनी — {state} | {severity}

⚠️ भयंकर चक्रवात आपके तटीय क्षेत्र की ओर बढ़ रहा है!

✅ अभी करें:
• तटीय क्षेत्र तुरंत खाली करें
• मजबूत इमारतों में आश्रय लें
• खिड़कियाँ और दरवाजे बंद करें
• 3 दिन का भोजन और पानी रखें
• सरकारी प्रसारण सुनते रहें

📞 मदद: 112 | 1078 | IMD: 1800-180-1717 | {helpline}

🏛️ {state} आपदा प्रबंधन प्राधिकरण`,

    mr: `🚨 चक्रीवादळ आपत्कालीन इशारा — {state} | {severity}

⚠️ भयंकर चक्रीवादळ किनारपट्टी भागाकडे येत आहे!

✅ आत्ता करा:
• किनारपट्टी भाग लगेच सोडा
• मजबूत इमारतींमध्ये आश्रय घ्या
• खिडक्या आणि दरवाजे बंद करा
• 3 दिवसांचे अन्न आणि पाणी ठेवा

📞 मदद: 112 | 1078 | {helpline}

🏛️ {state} आपत्ती व्यवस्थापन प्राधिकरण`,

    bn: `🚨 ঘূর্ণিঝড় জরুরি সতর্কতা — {state} | {severity}

⚠️ ভয়ংকর ঘূর্ণিঝড় আপনার উপকূলীয় এলাকায় আসছে!

✅ এখনই করুন:
• উপকূলীয় এলাকা এখনই ছেড়ে দিন
• মজবুত ভবনে আশ্রয় নিন
• জানালা ও দরজা বন্ধ করুন
• ৩ দিনের খাবার ও পানি রাখুন

📞 সাহায্য: 112 | 1078 | {helpline}

🏛️ {state} দুর্যোগ ব্যবস্থাপনা`,

    gu: `🚨 વાવાઝોડા કટોકટી ચેતવણી — {state} | {severity}

⚠️ ભયંકર વાવાઝોડું દરિયાકિનારાના વિસ્તાર તરફ આવી રહ્યું છે!

✅ હમણાં જ કરો:
• દરિયાકિનારાનો વિસ્તાર ત્વરિત ખાલી કરો
• મજબૂત ઇમારતોમાં આશ્રય લો
• બારીઓ અને દરવાજા બંધ કરો
• ૩ દિવસના ખોરાક અને પાણી રાખો

📞 મદદ: 112 | 1078 | {helpline}

🏛️ {state} આપત્તિ વ્યવસ્થાપન`,

    or: `🚨 ବାତ୍ୟା ଜରୁରୀ ସତର୍କତା — {state} | {severity}

⚠️ ଭୟଙ୍କର ବାତ୍ୟା ଆପଣଙ୍କ ଉପକୂଳ ଅଞ୍ଚଳ ଆଡ଼ ଆସୁଅଛି!

✅ ଏବେ କରନ୍ତୁ:
• ଉପକୂଳ ଅଞ୍ଚଳ ତୁରନ୍ତ ଛାଡ଼ି ଯାଆନ୍ତୁ
• ଦୃଢ଼ ଭବନରେ ଆଶ୍ରୟ ନିଅନ୍ତୁ
• ୩ ଦିନ ଖାଦ୍ୟ ଓ ପାଣି ରଖନ୍ତୁ

📞 ସାହାଯ୍ୟ: 112 | 1078 | {helpline}

🏛️ {state} ବିପର୍ଯ୍ୟୟ ପ୍ରବନ୍ଧନ`,

    en: `🚨 CYCLONE EMERGENCY ALERT — {state} | {severity}

⚠️ SEVERE CYCLONE APPROACHING YOUR COASTAL AREA!

✅ ACT NOW:
• Evacuate coastal areas immediately
• Take shelter in strong buildings
• Shut and lock all windows/doors
• Stock 3 days of food and water
• Monitor official government broadcasts

📞 Emergency: 112 | Disaster: 1078 | IMD: 1800-180-1717 | {helpline}

🏛️ {state} State Disaster Management Authority`,
  },

  earthquake: {
    ta: `🚨 நிலநடுக்க அவசர எச்சரிக்கை — {state} | {severity}

⚠️ நிலநடுக்கம் ஏற்பட்டுள்ளது / ஏற்படலாம் - கவனமாக இருங்கள்!

✅ உடனடியாக செய்யுங்கள்:
• கட்டடங்களுக்குள் - மேசை/கட்டிலுக்கு அடியில் அடைக்கலம் தேடுங்கள்
• வெளியில் - திறந்த வெளியில் நிறுத்துங்கள், கட்டடங்களை விட்டு விலகுங்கள்
• மின்சாரம், கேஸ் இணைப்புகளை நிறுத்துங்கள்
• அதிர்வு நிறுத்திய பிறகு மட்டும் வெளியே வாருங்கள்
• மலைப்பகுதிகளில் நிலச்சரிவுக்கு கவனமாக இருங்கள்

📞 உதவி: 112 | 1078 | NCS: 011-24363260 | {helpline}

🏛️ {state} பேரிடர் மேலாண்மை`,

    hi: `🚨 भूकंप आपातकालीन चेतावनी — {state} | {severity}

⚠️ भूकंप आया है / आ सकता है - सावधान रहें!

✅ अभी करें:
• इमारत के अंदर - मेज/बिस्तर के नीचे छिप जाएं
• बाहर - खुले स्थान पर रुकें, इमारतों से दूर रहें
• बिजली और गैस बंद करें
• झटके रुकने के बाद ही बाहर निकलें
• पहाड़ी इलाकों में भूस्खलन से सावधान रहें

📞 मदद: 112 | 1078 | NCS: 011-24363260 | {helpline}

🏛️ {state} आपदा प्रबंधन प्राधिकरण`,

    te: `🚨 భూకంప అత్యవసర హెచ్చరిక — {state} | {severity}

⚠️ భూకంపం సంభవించింది / సంభవించవచ్చు - జాగ్రత్తగా ఉండండి!

✅ వెంటనే చేయండి:
• భవనం లోపల - బల్ల/మంచం కింద ఆశ్రయం పొందండి
• బయట - తెరిచిన జాగాలో నిలబడండి
• విద్యుత్, గ్యాస్ కనెక్షన్లు నిలిపివేయండి
• కుదుపు ఆగిన తర్వాతే బయటకు వెళ్ళండి

📞 సహాయం: 112 | 1078 | {helpline}

🏛️ {state} విపత్తు నిర్వహణ`,

    ml: `🚨 ഭൂകമ്പ അടിയന്തര മുന്നറിയിപ്പ് — {state} | {severity}

⚠️ ഭൂകമ്പം സംഭവിച്ചു / സംഭവിക്കാം - ജാഗ്രതയോടിരിക്കുക!

✅ ഇപ്പോൾ ചെയ്യുക:
• കെട്ടിടത്തിനുള്ളിൽ - മേശ/കട്ടിലിന്‌ കീഴിൽ അഭയം തേടുക
• പുറത്ത് - തുറന്ന സ്ഥലത്ത് നിൽക്കുക
• വൈദ്യുതി, ഗ്യാസ് ബന്ധം വിച്ഛേദിക്കുക

📞 ഹെൽപ്‌ലൈൻ: 112 | 1078 | {helpline}

🏛️ {state} ദുരന്ത നിവാരണ`,

    kn: `🚨 ಭೂಕಂಪ ತುರ್ತು ಎಚ್ಚರಿಕೆ — {state} | {severity}

⚠️ ಭೂಕಂಪ ಸಂಭವಿಸಿದೆ - ಎಚ್ಚರಿಕೆಯಾಗಿರಿ!

✅ ಈಗಲೇ: ಮೇಜಿನ ಕೆಳಗೆ ಆಶ್ರಯ ಪಡೆಯಿರಿ. ವಿದ್ಯುತ್-ಗ್ಯಾಸ್ ಬಂದ್ ಮಾಡಿ. ಹೊರಗೆ ತೆರೆದ ಜಾಗದಲ್ಲಿ ನಿಲ್ಲಿ.

📞 112 | 1078 | {helpline}

🏛️ {state} ವಿಪತ್ತು ನಿರ್ವಹಣೆ`,

    en: `🚨 EARTHQUAKE EMERGENCY ALERT — {state} | {severity}

⚠️ EARTHQUAKE DETECTED - TAKE COVER IMMEDIATELY!

✅ ACT NOW:
• INDOORS: Drop, Cover under table/desk, Hold On
• OUTDOORS: Move to open area, away from buildings
• Switch off electricity and gas supply
• Exit ONLY after shaking stops
• Watch for landslides in hilly terrain

📞 Emergency: 112 | Disaster: 1078 | NCS: 011-24363260 | {helpline}

🏛️ {state} State Disaster Management Authority`,
  },

  landslide: {
    ta: `🚨 நிலச்சரிவு அவசர எச்சரிக்கை — {state} | {severity}

⚠️ மலைப்பகுதிகளில் நிலச்சரிவு/மண்சரிவு ஆபத்து!

✅ உடனடியாக செய்யுங்கள்:
• மலைப்பகுதி மற்றும் குன்றுகளிலிருந்து உடனே விலகுங்கள்
• ஆறு, நதிக்கரை பகுதிகளை தவிர்க்கவும்
• வழி சரிவு, கரைவு ஆகியவற்றை கவனியுங்கள்
• உடனடியாக மேட்டுப்பகுதிக்கு சென்று அடைக்கலம் தேடுங்கள்

📞 உதவி: 112 | 1078 | {helpline}

🏛️ {state} பேரிடர் மேலாண்மை`,

    ml: `🚨 ഉരുൾപൊട്ടൽ അടിയന്തര മുന്നറിയിപ്പ് — {state} | {severity}

⚠️ മലഞ്ചരിവുകളിൽ ഉരുൾപൊട്ടൽ അപകടം!

✅ ഇപ്പോൾ ചെയ്യുക:
• കുന്നിൻ ചരിവുകളിൽ നിന്ന് ഉടൻ മാറുക
• നദീതീരം ഒഴിവാക്കുക
• ഉയർന്ന സ്ഥലങ്ങളിൽ അഭയം തേടുക

📞 112 | 1078 | {helpline}

🏛️ {state} ദുരന്ത നിവാരണ`,

    hi: `🚨 भूस्खलन आपातकालीन चेतावनी — {state} | {severity}

⚠️ पहाड़ी क्षेत्रों में भूस्खलन का खतरा!

✅ अभी करें:
• पहाड़ी ढलानों और नदी किनारों से दूर रहें
• ऊंचे और सुरक्षित स्थान पर जाएं
• मलबे और गंदे पानी से बचें

📞 112 | 1078 | {helpline}

🏛️ {state} आपदा प्रबंधन`,

    en: `🚨 LANDSLIDE EMERGENCY ALERT — {state} | {severity}

⚠️ LANDSLIDE / MUDSLIDE RISK IN HILLY TERRAIN!

✅ ACT NOW:
• Move away from hill slopes and river banks immediately
• Evacuate to higher, stable ground
• Avoid travel on mountain roads
• Watch for cracks in ground or unusual water flow

📞 Emergency: 112 | Disaster: 1078 | {helpline}

🏛️ {state} State Disaster Management Authority`,

    kn: `🚨 ಭೂಕುಸಿತ ತುರ್ತು ಎಚ್ಚರಿಕೆ — {state} | {severity}

⚠️ ಪರ್ವತ ಪ್ರದೇಶಗಳಲ್ಲಿ ಭೂಕುಸಿತ ಅಪಾಯ!

✅ ಈಗಲೇ ದಿಬ್ಬಗಳಿಂದ ದೂರ ಹೋಗಿ. ಎತ್ತರದ ಸ್ಥಳಕ್ಕೆ ತೆರಳಿ.

📞 112 | 1078 | {helpline}

🏛️ {state} ವಿಪತ್ತು ನಿರ್ವಹಣೆ`,
  },

  heatwave: {
    ta: `🚨 வெப்ப அலை அவசர எச்சரிக்கை — {state} | {severity}

⚠️ கடும் வெப்பநிலை - வெப்பக்காய்ச்சல் ஆபத்து அதிகம்!

✅ உடனடியாக செய்யுங்கள்:
• மதியம் 11-4 மணி வரை வெளியே செல்லாதீர்கள்
• அதிக அளவு தண்ணீர், ORS குடிக்கவும்
• வயதானவர்கள், குழந்தைகளை கவனியுங்கள்
• குளிர்ந்த இடங்களில் தங்குங்கள்
• லேசான, தளர்வான ஆடைகள் அணியுங்கள்

📞 உதவி: 112 | 1800-180-1104 (NHM) | {helpline}

🏛️ {state} பேரிடர் மேலாண்மை`,

    hi: `🚨 लू / हीटवेव आपातकालीन चेतावनी — {state} | {severity}

⚠️ अत्यधिक गर्मी - लू लगने का खतरा अधिक!

✅ अभी करें:
• दोपहर 11-4 बजे घर से बाहर न निकलें
• खूब पानी और ORS पिएं
• बुजुर्गों और बच्चों का ख्याल रखें
• ठंडी जगह पर रहें

📞 मदद: 112 | NHM: 1800-180-1104 | {helpline}

🏛️ {state} आपदा प्रबंधन`,

    te: `🚨 వేడిమి అత్యవసర హెచ్చరిక — {state} | {severity}

⚠️ అత్యధిక ఉష్ణోగ్రత - హీట్ స్ట్రోక్ ప్రమాదం!

✅ వెంటనే:
• మధ్యాహ్నం 11-4 గంటల మధ్య బయటకు వెళ్ళకండి
• విస్తారంగా నీళ్ళు, ORS తాగండి
• వృద్ధులు, పిల్లలను జాగ్రత్తగా చూసుకోండి

📞 112 | {helpline}

🏛️ {state} విపత్తు నిర్వహణ`,

    ml: `🚨 ചൂടലർ അടിയന്തര മുന്നറിയിപ്പ് — {state} | {severity}

⚠️ അതിതീവ്ര ചൂട് - ഹീറ്റ് സ്ട്രോക്ക് അപകടം!

✅ ഉച്ചയ്ക്ക് 11-4 മണി വരെ പുറത്ത് ഇറങ്ങരുത്. ധാരാളം വെള്ളം കുടിക്കുക.

📞 112 | {helpline}

🏛️ {state} ദുരന്ത നിവാരണ`,

    en: `🚨 HEATWAVE EMERGENCY ALERT — {state} | {severity}

⚠️ EXTREME HEAT WARNING - HEAT STROKE RISK IS HIGH!

✅ ACT NOW:
• Avoid going outdoors between 11 AM - 4 PM
• Drink plenty of water and ORS regularly
• Check on elderly, children, and outdoor workers
• Use fans, wet cloth; stay in shade or cool buildings
• Wear light, loose-fitting clothing

📞 Emergency: 112 | NHM Helpline: 1800-180-1104 | {helpline}

🏛️ {state} State Disaster Management Authority`,
  },

  tsunami: {
    ta: `🚨 சுனாமி அவசர எச்சரிக்கை — {state} | {severity}

🌊 சுனாமி எச்சரிக்கை - கடற்கரை பகுதிகளை உடனே விட்டு வெளியேறுங்கள்!

✅ உடனடியாக செய்யுங்கள்:
• கடற்கரையிலிருந்து உடனே 3 கி.மீ தூரம் உள்ளே செல்லுங்கள்
• மேட்டுப்பகுதி, உயரமான பகுதிகளுக்கு செல்லுங்கள்
• அலைகள் வர ஆரம்பித்தால் மீண்டும் திரும்பாதீர்கள்
• அதிகாரப்பூர்வ அறிவிப்பு வரும் வரை கடற்கரை திரும்பாதீர்கள்

📞 உதவி: 112 | 1078 | INCOIS: 1800-425-0006 | {helpline}

🏛️ {state} பேரிடர் மேலாண்மை / INCOIS`,

    te: `🚨 సునామీ అత్యవసర హెచ్చరిక — {state} | {severity}

🌊 సునామీ హెచ్చరిక - తీర ప్రాంతాలను వెంటనే విడిచిపెట్టండి!

✅ వెంటనే: తీరం నుండి 3 కి.మీ దూరం లోపలికి వెళ్ళండి. ఎత్తైన ప్రదేశాలకు వెళ్ళండి.

📞 112 | 1078 | INCOIS: 1800-425-0006 | {helpline}

🏛️ {state} విపత్తు నిర్వహణ`,

    ml: `🚨 സുനാമി അടിയന്തര മുന്നറിയിപ്പ് — {state} | {severity}

🌊 സുനാമി മുന്നറിയിപ്പ് - തീര പ്രദേശങ്ങൾ ഉടൻ ഒഴിഞ്ഞുമാറുക!

✅ ഉടൻ: തീരത്ത് നിന്ന് 3 കി.മീ ദൂരം ഉൾനാട്ടിലേക്ക് പോകുക. ഉയർന്ന ഭൂമിയിൽ അഭയം തേടുക.

📞 112 | 1078 | INCOIS: 1800-425-0006 | {helpline}

🏛️ {state} ദുരന്ത നിവാരണ`,

    en: `🚨 TSUNAMI WARNING — {state} | {severity}

🌊 TSUNAMI APPROACHING - EVACUATE COASTAL AREAS NOW!

✅ ACT IMMEDIATELY:
• Move at least 3 km inland from coast
• Go to highest ground possible
• Do NOT return until official ALL CLEAR is given
• Stay away from beaches and harbors

📞 Emergency: 112 | Disaster: 1078 | INCOIS: 1800-425-0006 | {helpline}

🏛️ {state} SDMA / Indian National Centre for Ocean Info Services`,
  },

  fire: {
    ta: `🚨 தீ அவசர எச்சரிக்கை — {state} | {severity}

🔥 பெரும் தீ விபத்து - உடனடி நடவடிக்கை தேவை!

✅ உடனடியாக செய்யுங்கள்:
• கட்டடத்திலிருந்து படிக்கட்டுகள் மூலம் உடனே வெளியேறுங்கள் (லிப்ட் பயன்படுத்தாதீர்கள்)
• புகை குறைவாக உள்ள தரை வழியே நடந்து செல்லுங்கள்
• கதவுகளை நெருப்புக்கு எதிரே மூடுங்கள்
• வெளியே வந்தவுடன் திரும்பி வராதீர்கள்

📞 தீ அணைப்பு: 101 | அவசரம்: 112 | {helpline}

🏛️ {state} தீ மற்றும் மீட்பு சேவைகள்`,

    hi: `🚨 आग आपातकालीन चेतावनी — {state} | {severity}

🔥 बड़ी आग लगी है - तुरंत कार्रवाई करें!

✅ अभी करें:
• सीढ़ियों से इमारत खाली करें (लिफ्ट का उपयोग न करें)
• धुएं से नीचे झुककर बाहर निकलें
• दरवाजे आग की तरफ बंद रखें
• बाहर आने के बाद वापस न जाएं

📞 अग्निशमन: 101 | आपातकाल: 112 | {helpline}

🏛️ {state} अग्निशमन एवं बचाव सेवाएं`,

    en: `🚨 FIRE EMERGENCY ALERT — {state} | {severity}

🔥 MAJOR FIRE INCIDENT - IMMEDIATE ACTION REQUIRED!

✅ ACT NOW:
• Evacuate building using STAIRS only (NO lifts/elevators)
• Stay low under smoke, crawl if needed
• Close doors behind you to slow fire spread
• Do NOT re-enter building for any reason

📞 Fire: 101 | Emergency: 112 | {helpline}

🏛️ {state} Fire & Rescue Services`,
  },

  drought: {
    hi: `🚨 सूखा / जल संकट चेतावनी — {state} | {severity}

⚠️ आपके क्षेत्र में गंभीर जल संकट घोषित किया गया है।

✅ अभी करें:
• पानी का संयमित उपयोग करें
• पानी स्टोर करें और बर्बाद न करें
• जल वितरण केंद्रों की जानकारी लें
• सरकारी निर्देशों का पालन करें

📞 जल संकट सहायता: 1800-180-6069 | 112 | {helpline}

🏛️ {state} आपदा प्रबंधन / जल संसाधन विभाग`,

    ta: `🚨 வறட்சி / நீர் நெருக்கடி எச்சரிக்கை — {state} | {severity}

⚠️ உங்கள் பகுதியில் கடுமையான நீர் நெருக்கடி அறிவிக்கப்பட்டுள்ளது.

✅ உடனடியாக: தண்ணீரை சேமியுங்கள். அரசு நீர் விநியோக மையங்களை அணுகுங்கள்.

📞 112 | 1800-180-6069 | {helpline}

🏛️ {state} பேரிடர் மேலாண்மை`,

    en: `🚨 DROUGHT / WATER CRISIS ALERT — {state} | {severity}

⚠️ SEVERE WATER SCARCITY DECLARED IN YOUR REGION.

✅ ACT NOW:
• Use water sparingly; avoid waste
• Store clean water in containers
• Locate nearest government water distribution point
• Follow official water rationing guidelines

📞 Water Crisis Helpline: 1800-180-6069 | Emergency: 112 | {helpline}

🏛️ {state} State Disaster Management Authority`,
  },
};

// ─── State-specific Helplines ────────────────────────────────────────────────
export const STATE_HELPLINES: Record<string, string> = {
  'Tamil Nadu':        '1800-425-1188 (SDMA TN)',
  'Kerala':            '1077 (Kerala SDMA)',
  'Karnataka':         '1070 (Karnataka SDMA)',
  'Andhra Pradesh':    '1800-425-5566 (AP SDMA)',
  'Telangana':         '040-23450141 (TS SDMA)',
  'Maharashtra':       '022-22027990 (MH SDMA)',
  'Gujarat':           '079-23250842 (GJ SDMA)',
  'Odisha':            '0674-2534177 (OD SDMA)',
  'West Bengal':       '033-22143526 (WB SDMA)',
  'Assam':             '0361-2237219 (AS SDMA)',
  'Uttarakhand':       '1070 (UK SDMA)',
  'Himachal Pradesh':  '1077 (HP SDMA)',
  'Bihar':             '0612-2294204 (BR SDMA)',
  'Madhya Pradesh':    '0755-2443333 (MP SDMA)',
  'Rajasthan':         '0141-2225688 (RJ SDMA)',
  'Uttar Pradesh':     '1070 (UP SDMA)',
  'Punjab':            '0172-2740611 (PB SDMA)',
  'Delhi':             '011-23438252 (Delhi SDMA)',
};

// ─── Helper: Get template for state + disaster + language ───────────────────
export function getBulkSMSTemplate(
  disasterKey: DisasterKey,
  langCode: LangCode,
  state: string,
  severity: string,
): string {
  const templates = VERNACULAR_TEMPLATES[disasterKey];
  // Try exact language match, then fallback to Hindi, then English
  const text = templates[langCode] || templates['hi'] || templates['en'] || '';
  const helpline = STATE_HELPLINES[state] || '1078 (National Disaster Helpline)';

  return text
    .replace(/\{state\}/g, state)
    .replace(/\{severity\}/g, severity)
    .replace(/\{helpline\}/g, helpline);
}

// ─── SMS char limits ─────────────────────────────────────────────────────────
export function getSMSStats(message: string) {
  const isUnicode = /[^\u0000-\u007F]/.test(message);
  const charLimit = isUnicode ? 70 : 160; // unicode SMS = 70 chars per segment
  const chars = message.length;
  const segments = Math.ceil(chars / charLimit);
  return { isUnicode, charLimit, chars, segments };
}
