import { SupportedLanguageCode } from '@/context/LanguageContext';

// Comprehensive Indian Locations Dictionary across all 9 supported languages
export const INDIAN_LOCATIONS_MAP: Record<string, Record<SupportedLanguageCode, string>> = {
  // States & UTs
  'kerala': {
    en: 'Kerala',
    ml: 'കേരളം',
    hi: 'केरल',
    ta: 'கேரளா',
    te: 'కేరళ',
    mr: 'केरळ',
    gu: 'કેરળ',
    bn: 'কেরল',
    as: 'কেৰালা',
  },
  'tamil nadu': {
    en: 'Tamil Nadu',
    ml: 'തമിഴ്‌നാട്',
    hi: 'तमिलनाडु',
    ta: 'தமிழ்நாடு',
    te: 'తమిళనాడు',
    mr: 'तामिळनाडू',
    gu: 'તમિલનાડુ',
    bn: 'তামিলনাড়ু',
    as: 'তামিলনাডু',
  },
  'karnataka': {
    en: 'Karnataka',
    ml: 'കർണാടക',
    hi: 'कर्नाटक',
    ta: 'கர்நாடகா',
    te: 'కర్ణాటక',
    mr: 'कर्नाटक',
    gu: 'કર્ણાટક',
    bn: 'কর্ণাটক',
    as: 'কৰ্ণাটক',
  },
  'maharashtra': {
    en: 'Maharashtra',
    ml: 'മഹാരാഷ്ട്ര',
    hi: 'महाराष्ट्र',
    ta: 'மகாராஷ்டிரா',
    te: 'మహారాష్ట్ర',
    mr: 'महाराष्ट्र',
    gu: 'મહારાષ્ટ્ર',
    bn: 'মহারাষ্ট্র',
    as: 'মহাৰাষ্ট্ৰ',
  },
  'gujarat': {
    en: 'Gujarat',
    ml: 'ഗുജറാത്ത്',
    hi: 'गुजरात',
    ta: 'குஜராத்',
    te: 'గుజరాత్',
    mr: 'गुजरात',
    gu: 'ગુજરાત',
    bn: 'গুজরাট',
    as: 'গুজৰাট',
  },
  'assam': {
    en: 'Assam',
    ml: 'അസം',
    hi: 'असम',
    ta: 'அசாம்',
    te: 'అస్సాం',
    mr: 'आसाम',
    gu: 'આસામ',
    bn: 'আসাম',
    as: 'অসম',
  },
  'west bengal': {
    en: 'West Bengal',
    ml: 'പശ്ചിമ ബംഗാൾ',
    hi: 'पश्चिम बंगाल',
    ta: 'மேற்கு வங்காளம்',
    te: 'పశ్చిమ బెంగాల్',
    mr: 'पश्चिम बंगाल',
    gu: 'પશ્ચિમ બંગાળ',
    bn: 'পশ্চিমবঙ্গ',
    as: 'পশ্চিমবংগ',
  },
  'odisha': {
    en: 'Odisha',
    ml: 'ഒഡീഷ',
    hi: 'ओडिशा',
    ta: 'ஒடிசா',
    te: 'ఒడిశా',
    mr: 'ओडिशा',
    gu: 'ઓડિશા',
    bn: 'ওড়িশা',
    as: 'ওড়িশা',
  },
  'andhra pradesh': {
    en: 'Andhra Pradesh',
    ml: 'ആന്ധ്രാപ്രദേശ്',
    hi: 'आंध्र प्रदेश',
    ta: 'ஆந்திரப் பிரதேசம்',
    te: 'ఆంధ్రప్రదేశ్',
    mr: 'आंध्र प्रदेश',
    gu: 'આંધ્ર પ્રદેશ',
    bn: 'অন্ধ্রপ্রদেশ',
    as: 'অন্ধ্ৰপ্ৰদেশ',
  },
  'telangana': {
    en: 'Telangana',
    ml: 'തെലങ്കാന',
    hi: 'तेलंगाना',
    ta: 'தெலுங்கானா',
    te: 'తెలంగాణ',
    mr: 'तेलंगणा',
    gu: 'તેલંગાણા',
    bn: 'তেলেঙ্গানা',
    as: 'তেলেংগানা',
  },
  'uttar pradesh': {
    en: 'Uttar Pradesh',
    ml: 'ഉത്തർപ്രദേശ്',
    hi: 'उत्तर प्रदेश',
    ta: 'உத்தரப் பிரதேசம்',
    te: 'ఉత్తరప్రదేశ్',
    mr: 'उत्तर प्रदेश',
    gu: 'ઉત્તર પ્રદેશ',
    bn: 'উত্তরপ্রদেশ',
    as: 'উত্তৰ প্ৰদেশ',
  },
  'delhi': {
    en: 'Delhi',
    ml: 'ഡൽഹി',
    hi: 'दिल्ली',
    ta: 'தில்லி',
    te: 'ఢిల్లీ',
    mr: 'दिल्ली',
    gu: 'દિલ્હી',
    bn: 'দিল্লি',
    as: 'দিল্লী',
  },
  'new delhi': {
    en: 'New Delhi',
    ml: 'ന്യൂഡൽഹി',
    hi: 'नई दिल्ली',
    ta: 'புது தில்லி',
    te: 'న్యూఢిల్లీ',
    mr: 'नवी दिल्ली',
    gu: 'નવી દિલ્હી',
    bn: 'নতুন দিল্লি',
    as: 'নতুন দিল্লী',
  },
  'uttarakhand': {
    en: 'Uttarakhand',
    ml: 'ഉത്തരാഖണ്ഡ്',
    hi: 'उत्तराखंड',
    ta: 'உத்தராகண்ட்',
    te: 'ఉత్తరాఖండ్',
    mr: 'उत्तराखंड',
    gu: 'ઉત્તરાખંડ',
    bn: 'উত্তরাখণ্ড',
    as: 'উত্তৰাখণ্ড',
  },
  'himachal pradesh': {
    en: 'Himachal Pradesh',
    ml: 'ഹിമാചൽ പ്രദേശ്',
    hi: 'हिमाचल प्रदेश',
    ta: 'இமாச்சலப் பிரதேசம்',
    te: 'హిమాచల్ ప్రదేశ్',
    mr: 'हिमाचल प्रदेश',
    gu: 'હિમાચલ પ્રદેશ',
    bn: 'হিমাচল প্রদেশ',
    as: 'হিমাচল প্ৰদেশ',
  },
  'jammu & kashmir': {
    en: 'Jammu & Kashmir',
    ml: 'ജമ്മു കശ്മീർ',
    hi: 'जम्मू और कश्मीर',
    ta: 'ஜம்மு & காஷ்மீர்',
    te: 'జమ్మూ & కాశ్మీర్',
    mr: 'जम्मू आणि काश्मीर',
    gu: 'જમ્મુ અને કાશ્મીર',
    bn: 'জম্মু ও কাশ্মীর',
    as: 'জম্মু আৰু কাশ্মীৰ',
  },
  'bihar': {
    en: 'Bihar',
    ml: 'ബിഹാർ',
    hi: 'बिहार',
    ta: 'பீகார்',
    te: 'బీహార్',
    mr: 'बिहार',
    gu: 'બિહાર',
    bn: 'বিহার',
    as: 'বিহাৰ',
  },
  'rajasthan': {
    en: 'Rajasthan',
    ml: 'രാജസ്ഥാൻ',
    hi: 'राजस्थान',
    ta: 'ராஜஸ்தான்',
    te: 'రాజస్థాన్',
    mr: 'राजस्थान',
    gu: 'રાજસ્થાન',
    bn: 'রাজস্থান',
    as: 'ৰাজস্থান',
  },
  'punjab': {
    en: 'Punjab',
    ml: 'പഞ്ചാബ്',
    hi: 'पंजाब',
    ta: 'பஞ்சாப்',
    te: 'పంజాబ్',
    mr: 'पंजाब',
    gu: 'પંજાબ',
    bn: 'পাঞ্জাব',
    as: 'পঞ্জাব',
  },
  'madhya pradesh': {
    en: 'Madhya Pradesh',
    ml: 'മധ്യപ്രദേശ്',
    hi: 'मध्य प्रदेश',
    ta: 'மத்தியப் பிரதேசம்',
    te: 'మధ్యప్రదేశ్',
    mr: 'मध्य प्रदेश',
    gu: 'મધ્ય પ્રદેશ',
    bn: 'মধ্যপ্রদেশ',
    as: 'মধ্যপ্ৰদেশ',
  },
  'goa': {
    en: 'Goa',
    ml: 'ഗോവ',
    hi: 'गोवा',
    ta: 'கோவா',
    te: 'గోవా',
    mr: 'गोवा',
    gu: 'ગોવા',
    bn: 'গোয়া',
    as: 'গোৱা',
  },

  // Key Calamity Corridor Locations & Districts
  'ernakulam': {
    en: 'Ernakulam',
    ml: 'എറണാകുളം',
    hi: 'एर्नाकुलम',
    ta: 'எர்ணாகுளம்',
    te: 'ఎర్నాకుళం',
    mr: 'एर्नाकुलम',
    gu: 'એર્નાકુલમ',
    bn: 'এর্নাকুলাম',
    as: 'এৰ্নাকুলাম',
  },
  'kochi': {
    en: 'Kochi',
    ml: 'കൊച്ചി',
    hi: 'कोच्चि',
    ta: 'கொச்சி',
    te: 'కొచ్చి',
    mr: 'कोची',
    gu: 'કોચી',
    bn: 'কোচি',
    as: 'কোচ্চি',
  },
  'aluva': {
    en: 'Aluva',
    ml: 'ആലുവ',
    hi: 'अलुवा',
    ta: 'ஆலுவா',
    te: 'అలువ',
    mr: 'अलुवा',
    gu: 'અલુવા',
    bn: 'আলুভা',
    as: 'আলুৱা',
  },
  'wayanad': {
    en: 'Wayanad',
    ml: 'വയനാട്',
    hi: 'वायनाड',
    ta: 'வயநாடு',
    te: 'వాయనాడ్',
    mr: 'वायनाड',
    gu: 'વાયનાડ',
    bn: 'ওয়ায়ানাদ',
    as: 'ৱায়নাড',
  },
  'idukki': {
    en: 'Idukki',
    ml: 'ഇടുക്കി',
    hi: 'इडुक्की',
    ta: 'இடுக்கி',
    te: 'ఇడుక్కి',
    mr: 'इडुक्की',
    gu: 'ઇડુક્કી',
    bn: 'ইডুক্কি',
    as: 'ইডুক্কি',
  },
  'thiruvananthapuram': {
    en: 'Thiruvananthapuram',
    ml: 'തിരുവനന്തപുരം',
    hi: 'तिरुवनंतपुरम',
    ta: 'திருவனந்தபுரம்',
    te: 'తిరువనంతపురం',
    mr: 'तिरुवनंतपुरम',
    gu: 'તિરુવનંતપુરમ',
    bn: 'তিরুবনন্তপুরম',
    as: 'তিৰুৱনন্তপুৰম',
  },
  'kozhikode': {
    en: 'Kozhikode',
    ml: 'കോഴിക്കോട്',
    hi: 'कोझिकोड',
    ta: 'கோழிக்கோடு',
    te: 'కోజికోడ్',
    mr: 'कोझिकोड',
    gu: 'કોઝિકોડ',
    bn: 'কোঝিকোড়',
    as: 'কোজিকোড',
  },
  'thrissur': {
    en: 'Thrissur',
    ml: 'തൃശ്ശൂർ',
    hi: 'त्रिशूर',
    ta: 'திருச்சூர்',
    te: 'త్రిసూర్',
    mr: 'त्रिशूर',
    gu: 'ત્રિશૂર',
    bn: 'ত্রিশূর',
    as: 'ত্ৰিছুৰ',
  },
  'kannur': {
    en: 'Kannur',
    ml: 'കണ്ണൂർ',
    hi: 'कन्नूर',
    ta: 'கண்ணூர்',
    te: 'కన్నూర్',
    mr: 'कन्नूर',
    gu: 'કન્નૂર',
    bn: 'কান্নুর',
    as: 'কান্নুৰ',
  },
  'kollam': {
    en: 'Kollam',
    ml: 'കൊല്ലം',
    hi: 'कोल्लम',
    ta: 'கொல்லம்',
    te: 'కొల్లాం',
    mr: 'कोल्लम',
    gu: 'કોલ્લમ',
    bn: 'কোল্লাম',
    as: 'কোল্লাম',
  },
  'palakkad': {
    en: 'Palakkad',
    ml: 'പാലക്കാട്',
    hi: 'पालक्कड़',
    ta: 'பாலக்காடு',
    te: 'పాలక్కాడ్',
    mr: 'पालक्कड',
    gu: 'પાલક્કડ',
    bn: 'পালাক্কাড়',
    as: 'পালাক্কাড',
  },
  'alappuzha': {
    en: 'Alappuzha',
    ml: 'ആലപ്പുഴ',
    hi: 'अलप्पुझा',
    ta: 'ஆலப்புழா',
    te: 'అలప్పుళా',
    mr: 'अलप्पुझा',
    gu: 'અલપ્પુઝા',
    bn: 'আলাপ্পুঝা',
    as: 'আলাপ্পুঝা',
  },
  'kottayam': {
    en: 'Kottayam',
    ml: 'കോട്ടയം',
    hi: 'कोट्टायम',
    ta: 'கோட்டயம்',
    te: 'కొట్టాయం',
    mr: 'कोट्टायम',
    gu: 'કોટ્ટાયમ',
    bn: 'কোট্টায়াম',
    as: 'কোট্টায়ম',
  },
  'cachar': {
    en: 'Cachar',
    ml: 'കച്ചാർ',
    hi: 'कछार',
    ta: 'கச்சார்',
    te: 'కచార్',
    mr: 'कचर',
    gu: 'કચ્છાર',
    bn: 'কাছাড়',
    as: 'কাছাৰ',
  },
  'silchar': {
    en: 'Silchar',
    ml: 'സിൽച്ചാർ',
    hi: 'सिलचर',
    ta: 'சில்சார்',
    te: 'సిల్చార్',
    mr: 'सिलचर',
    gu: 'સિલચર',
    bn: 'শিলচর',
    as: 'শিলচৰ',
  },
  'guwahati': {
    en: 'Guwahati',
    ml: 'ഗുവാഹത്തി',
    hi: 'गुवाहाटी',
    ta: 'குவஹாத்தி',
    te: 'గౌహతి',
    mr: 'गुवाहाटी',
    gu: 'ગુવાહાટી',
    bn: 'গুয়াহাটি',
    as: 'গুৱাহাটী',
  },
  'dispur': {
    en: 'Dispur',
    ml: 'ദിസ്പൂർ',
    hi: 'दिसपुर',
    ta: 'திஸ்பூர்',
    te: 'దిస్పూర్',
    mr: 'दिसपूर',
    gu: 'દિસપુર',
    bn: 'দিসপুর',
    as: 'দিছপুৰ',
  },
  'puri': {
    en: 'Puri',
    ml: 'പുരി',
    hi: 'पुरी',
    ta: 'பூரி',
    te: 'పూరీ',
    mr: 'पुरी',
    gu: 'પુરી',
    bn: 'পুরী',
    as: 'পুৰী',
  },
  'bhubaneswar': {
    en: 'Bhubaneswar',
    ml: 'ഭുവനേശ്വർ',
    hi: 'भुवनेश्वर',
    ta: 'புவனேஸ்வர்',
    te: 'భువనేశ్వర్',
    mr: 'भुवनेश्वर',
    gu: 'ભુવનેશ્વર',
    bn: 'ভুবনেশ্বর',
    as: 'ভুৱনেশ্বৰ',
  },
  'chamoli': {
    en: 'Chamoli',
    ml: 'ചമോലി',
    hi: 'चमोली',
    ta: 'சமோலி',
    te: 'చమోలి',
    mr: 'चमोली',
    gu: 'ચમોલી',
    bn: 'চামোলি',
    as: 'চামোলী',
  },
  'joshimath': {
    en: 'Joshimath',
    ml: 'ജോഷിമഠ്',
    hi: 'जोशीमठ',
    ta: 'ஜோஷிமத்',
    te: 'జోషిమఠ్',
    mr: 'जोशीमठ',
    gu: 'જોશીમઠ',
    bn: 'জোশীমঠ',
    as: 'যোশীমঠ',
  },
  'shimla': {
    en: 'Shimla',
    ml: 'ഷിംല',
    hi: 'शिमला',
    ta: 'சிம்லா',
    te: 'సిమ్లా',
    mr: 'शिमला',
    gu: 'શિમલા',
    bn: 'শিমলা',
    as: 'ছিমলা',
  },
  'mandi': {
    en: 'Mandi',
    ml: 'മണ്ഡി',
    hi: 'मंडी',
    ta: 'மண்டி',
    te: 'మండి',
    mr: 'मंडी',
    gu: 'મંડી',
    bn: 'মান্ডি',
    as: 'মাণ্ডী',
  },
  'kutch': {
    en: 'Kutch',
    ml: 'കച്ച്',
    hi: 'कच्छ',
    ta: 'கட்ச்',
    te: 'కచ్',
    mr: 'कच्छ',
    gu: 'કચ્છ',
    bn: 'কচ্ছ',
    as: 'কচ্ছ',
  },
  'bhuj': {
    en: 'Bhuj',
    ml: 'ഭുജ്',
    hi: 'भुज',
    ta: 'புஜ்',
    te: 'భుజ్',
    mr: 'भुज',
    gu: 'ભુજ',
    bn: 'ভুজ',
    as: 'ভুজ',
  },
  'surat': {
    en: 'Surat',
    ml: 'സൂറത്ത്',
    hi: 'सूरत',
    ta: 'சூரத்',
    te: 'సూరత్',
    mr: 'सुरत',
    gu: 'સુરત',
    bn: 'সুরাট',
    as: 'ছুৰাট',
  },
  'ahmedabad': {
    en: 'Ahmedabad',
    ml: 'അഹമ്മദാബാദ്',
    hi: 'अहमदाबाद',
    ta: 'அகமதாபாத்',
    te: 'అహ్మదాబాద్',
    mr: 'अहमदाबाद',
    gu: 'અમદાવાદ',
    bn: 'আহমেদাবাদ',
    as: 'আহমেদাবাদ',
  },
  'raigad': {
    en: 'Raigad',
    ml: 'റായ്ഗഡ്',
    hi: 'रायगढ़',
    ta: 'ராய்காட்',
    te: 'రాయగఢ్',
    mr: 'रायगड',
    gu: 'રાયગઢ',
    bn: 'রায়গড়',
    as: 'ৰায়গড়',
  },
  'ratnagiri': {
    en: 'Ratnagiri',
    ml: 'രത്നഗിരി',
    hi: 'रत्नागिरी',
    ta: 'ரத்னகிரி',
    te: 'రత్నగిరి',
    mr: 'रत्नागिरी',
    gu: 'રત્નાગિરી',
    bn: 'রত্নগিরি',
    as: 'ৰত্নগিৰি',
  },
  'mumbai': {
    en: 'Mumbai',
    ml: 'മുംബൈ',
    hi: 'मुंबई',
    ta: 'மும்பை',
    te: 'ముంబై',
    mr: 'मुंबई',
    gu: 'મુંબઈ',
    bn: 'মুম্বই',
    as: 'মুম্বাই',
  },
  'pune': {
    en: 'Pune',
    ml: 'പൂനെ',
    hi: 'पुणे',
    ta: 'புனே',
    te: 'పూణే',
    mr: 'पुणे',
    gu: 'પુણે',
    bn: 'পুনে',
    as: 'পুনে',
  },
  'chennai': {
    en: 'Chennai',
    ml: 'ചെന്നൈ',
    hi: 'चेन्नई',
    ta: 'சென்னை',
    te: 'చెన్నై',
    mr: 'चेन्नई',
    gu: 'ચેન્નાઈ',
    bn: 'চেন্নাই',
    as: 'চেন্নাই',
  },
  'kanyakumari': {
    en: 'Kanyakumari',
    ml: 'കന്യാകുമാരി',
    hi: 'कन्याकुमारी',
    ta: 'கன்யாகுமரி',
    te: 'కన్యాకుమారి',
    mr: 'कन्याकुमारी',
    gu: 'કન્યાકુમારી',
    bn: 'কন্যাকুমারী',
    as: 'কন্যাজুমাৰী',
  },
  'nagapattinam': {
    en: 'Nagapattinam',
    ml: 'നാഗപട്ടണം',
    hi: 'नागापट्टिनम',
    ta: 'நாகப்பட்டினம்',
    te: 'నాగపట్నం',
    mr: 'नागपट्टिनम',
    gu: 'નાગાપટ્ટિનમ',
    bn: 'নাগাপট্টিনম',
    as: 'নাগাপট্টিনম',
  },
  'cuddalore': {
    en: 'Cuddalore',
    ml: 'കടലൂർ',
    hi: 'कुड्डालोर',
    ta: 'கடலூர்',
    te: 'కడలూరు',
    mr: 'कुड्डालोर',
    gu: 'કુડ્ડાલોર',
    bn: 'কাড্ডালোর',
    as: 'কুড্ডালোৰ',
  },
  'nellore': {
    en: 'Nellore',
    ml: 'നെല്ലൂർ',
    hi: 'नेल्लोर',
    ta: 'நெல்லூர்',
    te: 'నెల్లూరు',
    mr: 'नेल्लोर',
    gu: 'નેલ્લોર',
    bn: 'নেলোর',
    as: 'নেল্লোৰ',
  },
  'visakhapatnam': {
    en: 'Visakhapatnam',
    ml: 'വിശാഖപട്ടണം',
    hi: 'विशाखापत्तनम',
    ta: 'விசாகப்பட்டினம்',
    te: 'విశాఖపట్నం',
    mr: 'विशाखापट्टणम',
    gu: 'વિશાખાપટ્ટનમ',
    bn: 'বিশাখাপত্তনম',
    as: 'বিশাখাপত্তনম',
  },
  'bengaluru': {
    en: 'Bengaluru',
    ml: 'ബെംഗളൂരു',
    hi: 'बेंगलुरु',
    ta: 'பெங்களூரு',
    te: 'బెంగళూరు',
    mr: 'बंगळुरू',
    gu: 'બેંગલુરુ',
    bn: 'বেঙ্গালুরু',
    as: 'বেংগালুৰু',
  },
  'kolkata': {
    en: 'Kolkata',
    ml: 'കൊൽക്കത്ത',
    hi: 'कोलकाता',
    ta: 'கொல்கத்தா',
    te: 'కోల్‌కతా',
    mr: 'कोलकाता',
    gu: 'કોલકાતા',
    bn: 'কলকাতা',
    as: 'কলকাতা',
  },
  'hyderabad': {
    en: 'Hyderabad',
    ml: 'ഹൈദരാബാദ്',
    hi: 'हैदराबाद',
    ta: 'ஹைதராபாத்',
    te: 'హైదరాబాద్',
    mr: 'हैदराबाद',
    gu: 'હૈદરાબાદ',
    bn: 'হায়দ্রাবাদ',
    as: 'হায়দৰাবাদ',
  },
  'india': {
    en: 'India',
    ml: 'ഇന്ത്യ',
    hi: 'भारत',
    ta: 'இந்தியா',
    te: 'భారతదేశం',
    mr: 'भारत',
    gu: 'ભારત',
    bn: 'ভারত',
    as: 'ভাৰত',
  },
};

/**
 * Localizes any location, city, state, or region string into the selected language script.
 */
export function localizeLocationName(rawName: string | undefined | null, lang: SupportedLanguageCode): string {
  if (!rawName) {
    if (lang === 'ml') return 'ലഭ്യമല്ല';
    if (lang === 'hi') return 'स्थान उपलब्ध नहीं';
    if (lang === 'ta') return 'இடம் கிடைக்கவில்லை';
    if (lang === 'te') return 'ప్రాంతం అందుబాటులో లేదు';
    if (lang === 'mr') return 'स्थान उपलब्ध नाही';
    if (lang === 'gu') return 'સ્થાન ઉપલબ્ધ નથી';
    if (lang === 'bn') return 'স্থান উপলব্ধ নয়';
    if (lang === 'as') return 'স্থান উপলব্ধ নহয়';
    return 'Location Unavailable';
  }

  if (lang === 'en') return rawName;

  // Split tokens by commas, spaces, or hyphens
  let translated = rawName;
  for (const [key, val] of Object.entries(INDIAN_LOCATIONS_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    if (regex.test(translated)) {
      translated = translated.replace(regex, val[lang] || val.hi || key);
    }
  }

  // Handle generic words
  if (lang === 'ml') {
    translated = translated
      .replace(/\bNorth\b/gi, 'വടക്ക്')
      .replace(/\bSouth\b/gi, 'തെക്ക്')
      .replace(/\bEast\b/gi, 'കിഴക്ക്')
      .replace(/\bWest\b/gi, 'പടിഞ്ഞാറ്')
      .replace(/\bDistrict\b/gi, 'ജില്ല')
      .replace(/\bState\b/gi, 'സംസ്ഥാനം')
      .replace(/\bRegion\b/gi, 'മേഖല')
      .replace(/\bCoastal\b/gi, 'തീരദേശ')
      .replace(/\bValley\b/gi, 'താഴ്‌വര')
      .replace(/\bRiver\b/gi, 'നദി')
      .replace(/\bBasin\b/gi, 'തടം');
  } else if (lang === 'hi') {
    translated = translated
      .replace(/\bNorth\b/gi, 'उत्तर')
      .replace(/\bSouth\b/gi, 'दक्षिण')
      .replace(/\bEast\b/gi, 'पूर्व')
      .replace(/\bWest\b/gi, 'पश्चिम')
      .replace(/\bDistrict\b/gi, 'जिला')
      .replace(/\bState\b/gi, 'राज्य')
      .replace(/\bRegion\b/gi, 'क्षेत्र');
  }

  return translated;
}

/**
 * Translates Disaster Title into the native language script.
 */
export function translateDisasterTitle(title: string | undefined | null, lang: SupportedLanguageCode): string {
  if (!title) return '';
  if (lang === 'en') return title;

  // 1. Magnitude X Earthquake - Location
  const magMatch = title.match(/Magnitude\s*([\d.]+)\s*Earthquake(?:\s*[-–—]\s*(.+))?/i);
  if (magMatch) {
    const mag = magMatch[1];
    const loc = magMatch[2] ? localizeLocationName(magMatch[2].trim(), lang) : '';
    const locSuffix = loc ? ` - ${loc}` : '';

    if (lang === 'ml') return `തീവ്രത ${mag} രേഖപ്പെടുത്തിയ ഭൂകമ്പം${locSuffix}`;
    if (lang === 'hi') return `तीव्रता ${mag} का भूकंप${locSuffix}`;
    if (lang === 'ta') return `ரிக்டர் ${mag} நிலநடுக்கம்${locSuffix}`;
    if (lang === 'te') return `తీవ్రత ${mag} భూకంపం${locSuffix}`;
    if (lang === 'mr') return `तीव्रता ${mag} चा भूकंप${locSuffix}`;
    if (lang === 'gu') return `તીવ્રતા ${mag} નો ભૂકંપ${locSuffix}`;
    if (lang === 'bn') return `মাত্রা ${mag} ভূমিকম্প${locSuffix}`;
    if (lang === 'as') return `প্ৰাৱল্য ${mag} ভূমিকম্প${locSuffix}`;
  }

  // 2. Flood Risk - Location
  const floodMatch = title.match(/Flood\s*Risk(?:\s*[-–—]\s*(.+))?/i);
  if (floodMatch) {
    const loc = floodMatch[1] ? localizeLocationName(floodMatch[1].trim(), lang) : '';
    const locSuffix = loc ? ` – ${loc}` : '';

    if (lang === 'ml') return `പ്രളയ സാധ്യതാ മുന്നറിയിപ്പ്${locSuffix}`;
    if (lang === 'hi') return `बाढ़ का खतरा${locSuffix}`;
    if (lang === 'ta') return `வெள்ள அபாய எச்சரிக்கை${locSuffix}`;
    if (lang === 'te') return `వరద ప్రమాద హెచ్చరిక${locSuffix}`;
    if (lang === 'mr') return `पुराचा धोका${locSuffix}`;
    if (lang === 'gu') return `પૂરનો ખતરો${locSuffix}`;
    if (lang === 'bn') return `বন্যার ঝুঁকি সতর্কতা${locSuffix}`;
    if (lang === 'as') return `বানপানীৰ সম্ভাৱ্য সতৰ্কবাণী${locSuffix}`;
  }

  // 3. Cyclone Warning - Location
  const cycloneMatch = title.match(/Cyclone\s*(?:Warning|Alert)?(?:\s*[-–—]\s*(.+))?/i);
  if (cycloneMatch) {
    const loc = cycloneMatch[1] ? localizeLocationName(cycloneMatch[1].trim(), lang) : '';
    const locSuffix = loc ? ` – ${loc}` : '';

    if (lang === 'ml') return `ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ്${locSuffix}`;
    if (lang === 'hi') return `चक्रवात चेतावनी${locSuffix}`;
    if (lang === 'ta') return `புயல் எச்சரிக்கை${locSuffix}`;
    if (lang === 'te') return `తుఫాను హెచ్చరిక${locSuffix}`;
    if (lang === 'mr') return `चक्रीवादळाचा इशारा${locSuffix}`;
    if (lang === 'gu') return `વાવાઝોડાની ચેતવણી${locSuffix}`;
    if (lang === 'bn') return `ঘূর্ণিঝড় সতর্কতা${locSuffix}`;
    if (lang === 'as') return `ঘূৰ্ণীবতাহৰ সতৰ্কবাণী${locSuffix}`;
  }

  // 4. Landslide Alert - Location
  const landslideMatch = title.match(/Landslide\s*(?:Warning|Alert)?(?:\s*[-–—]\s*(.+))?/i);
  if (landslideMatch) {
    const loc = landslideMatch[1] ? localizeLocationName(landslideMatch[1].trim(), lang) : '';
    const locSuffix = loc ? ` – ${loc}` : '';

    if (lang === 'ml') return `ഉരുൾപൊട്ടൽ / മണ്ണിടിച്ചിൽ ജാഗ്രത${locSuffix}`;
    if (lang === 'hi') return `भूस्खलन चेतावनी${locSuffix}`;
    if (lang === 'ta') return `நிலச்சரிவு எச்சரிக்கை${locSuffix}`;
    if (lang === 'te') return `కొండచరియలు విరిగిపడే ప్రమాదం${locSuffix}`;
    if (lang === 'mr') return `दरड कोसळण्याचा इशारा${locSuffix}`;
    if (lang === 'gu') return `ભૂસ્ખલનની ચેતવણી${locSuffix}`;
    if (lang === 'bn') return `ভূমিধস সতর্কতা${locSuffix}`;
    if (lang === 'as') return `ভূমিস্খলনৰ সতৰ্কবাণী${locSuffix}`;
  }

  // Fallback: translate location inside title
  return localizeLocationName(title, lang);
}

/**
 * Translates Disaster Description into the native language script.
 */
export function translateDisasterDescription(desc: string | undefined | null, lang: SupportedLanguageCode): string {
  if (!desc) return '';
  if (lang === 'en') return desc;

  // 1. Detected in {State}, India - Depth: {depth} km
  const detectedMatch = desc.match(/Detected in\s+([^,]+),\s*India\s*-\s*Depth:\s*([\d.]+)\s*km/i);
  if (detectedMatch) {
    const loc = localizeLocationName(detectedMatch[1].trim(), lang);
    const depth = detectedMatch[2];

    if (lang === 'ml') return `${loc}, ഇന്ത്യയിൽ രേഖപ്പെടുത്തി - ഭൂഗർഭ ആഴം: ${depth} കി.മീ`;
    if (lang === 'hi') return `${loc}, भारत में दर्ज - गहराई: ${depth} किमी`;
    if (lang === 'ta') return `${loc}, இந்தியாவில் பதிவானது - ஆழம்: ${depth} கி.மீ`;
    if (lang === 'te') return `${loc}, భారతదేశంలో నమోదైంది - లోతు: ${depth} కి.మీ`;
    if (lang === 'mr') return `${loc}, भारतात नोंदवले गेले - खोली: ${depth} किमी`;
    if (lang === 'gu') return `${loc}, ભારતમાં નોંધાયું - ઊંડાઈ: ${depth} કિમી`;
    if (lang === 'bn') return `${loc}, ভারতে সনাক্ত - গভীরতা: ${depth} কিমি`;
    if (lang === 'as') return `${loc}, ভাৰতত চিনাক্ত - গভীৰতা: ${depth} কিমি`;
  }

  // 2. Probability: {P}% | {Model} | Based on ...
  const probMatch = desc.match(/Probability:\s*(\d+)%.*?Based on\s*(monsoon season|current rainfall)\s*and regional risk/i);
  if (probMatch) {
    const p = probMatch[1];
    const isMonsoon = probMatch[2].toLowerCase().includes('monsoon');

    if (lang === 'ml') {
      return `അപകടസാധ്യത: ${p}% | എഐ ന്യൂറൽ നെറ്റ്‌വർക്ക് | ${isMonsoon ? 'കാലവർഷവും പ്രാദേശിക ഘടകങ്ങളും' : 'നിലവിലെ മഴക്കെടുതിയും ഭൂപ്രകൃതിയും'} അടിസ്ഥാനമാക്കിയുള്ള പ്രവചനം.`;
    }
    if (lang === 'hi') {
      return `जोखिम संभावना: ${p}% | न्यूरल नेटवर्क मॉडल | ${isMonsoon ? 'मानसून और क्षेत्रीय जोखिम' : 'वर्तमान वर्षा और इलाके'} पर आधारित।`;
    }
    if (lang === 'ta') {
      return `ஆபத்து நிகழ்தகவு: ${p}% | நியூரல் நெட்வொர்க் | ${isMonsoon ? 'பருவமழை மற்றும் பிராந்திய ஆபத்து' : 'மழைப்பொழிவு'} அடிப்படையில்.`;
    }
    if (lang === 'te') {
      return `ప్రమాద సంభావ్యత: ${p}% | న్యూరల్ నెట్‌వర్క్ | ${isMonsoon ? 'వర్షాకాలం మరియు ప్రాంతీయ ప్రమాదం' : 'ప్రస్తుత వర్షపాతం'} ఆధారంగా.`;
    }
    if (lang === 'mr') {
      return `धोक्याची शक्यता: ${p}% | न्यूरल नेटवर्क | ${isMonsoon ? 'पावसाळा आणि प्रादेशिक धोका' : 'सध्याचा पाऊस'} यावर आधारित.`;
    }
    if (lang === 'gu') {
      return `જોખમ સંભાવના: ${p}% | ન્યુરલ નેટવર્ક | ${isMonsoon ? 'ચોમાસું અને પ્રાદેશિક જોખમ' : 'વર્તમાન વરસાદ'} પર આધારિત.`;
    }
    if (lang === 'bn') {
      return `ঝুঁকির সম্ভাবনা: ${p}% | নিউরাল নেটওয়ার্ক | ${isMonsoon ? 'বর্ষাকাল ও আঞ্চলিক ঝুঁকি' : 'বর্তমান বৃষ্টিপাত'} ভিত্তিক।`;
    }
    if (lang === 'as') {
      return `বিপদৰ সম্ভাৱনা: ${p}% | নিউৰেল নেটৱৰ্ক | ${isMonsoon ? 'বৰ্ষাকাল আৰু আঞ্চলিক বিপদ' : 'বৰ্তমানৰ বৰষুণ'} ভিত্তিত।`;
    }
  }

  return localizeLocationName(desc, lang);
}

/**
 * Translates Air Quality Index value and yields localized badge and advice.
 */
export function getAirQualityData(aqi: number | undefined, lang: SupportedLanguageCode) {
  if (aqi === undefined || aqi === null) {
    return { label: 'N/A', advice: '' };
  }

  const isGood = aqi <= 50;
  const isModerate = aqi <= 100;
  const isSensitive = aqi <= 150;
  const isUnhealthy = aqi <= 200;
  const isVeryUnhealthy = aqi <= 300;

  if (lang === 'ml') {
    if (isGood) return { label: 'മികച്ചത്', advice: 'വായു ഗുണനിലവാരം മികച്ചതാണ്. പുറത്തിറങ്ങാൻ അനുയോജ്യമായ സമയം.' };
    if (isModerate) return { label: 'തൃപ്തികരം', advice: 'വായു ഗുണനിലവാരം തൃപ്തികരമാണ്.' };
    if (isSensitive) return { label: 'ശ്രദ്ധിക്കുക', advice: 'ശ്വാസകോശ സംബന്ധമായ അസുഖമുള്ളവരും കുട്ടികളും ശ്രദ്ധിക്കുക.' };
    if (isUnhealthy) return { label: 'മോശം', advice: 'അനാരോഗ്യകരം. പുറത്തിറങ്ങി കഠിനമായ വ്യായാമം ചെയ്യുന്നത് ഒഴിവാക്കുക.' };
    if (isVeryUnhealthy) return { label: 'വളരെ മോശം', advice: 'വളരെ അനാരോഗ്യകരം. പുറത്തിറങ്ങുമ്പോൾ മാസ്ക് ധരിക്കുക.' };
    return { label: 'അപകടകരം', advice: 'അപകടകരം. വീടുകൾക്കുള്ളിൽ തന്നെ കഴിയുക.' };
  }

  if (lang === 'hi') {
    if (isGood) return { label: 'उत्कृष्ट', advice: 'वायु गुणवत्ता उत्कृष्ट है। बाहरी गतिविधियों के लिए उत्तम समय।' };
    if (isModerate) return { label: 'संतोषजनक', advice: 'वायु गुणवत्ता स्वीकार्य स्तर पर है।' };
    if (isSensitive) return { label: 'सावधान', advice: 'संवेदनशील समूहों को बाहर कम समय बिताना चाहिए।' };
    if (isUnhealthy) return { label: 'अस्वस्थ', advice: 'अस्वस्थकर। लंबे समय तक बाहर रहने से बचें।' };
    if (isVeryUnhealthy) return { label: 'बहुत अस्वस्थ', advice: 'बहुत अस्वस्थकर। बाहरी गतिविधियों से बचें।' };
    return { label: 'खतरनाक', advice: 'खतरनाक। घर के अंदर ही रहें।' };
  }

  if (lang === 'ta') {
    if (isGood) return { label: 'சிறந்தது', advice: 'காற்று தரம் சிறந்தது. வெளிப்புற நடவடிக்கைகளுக்கு ஏற்றது.' };
    if (isModerate) return { label: 'மிதமானது', advice: 'காற்று தரம் ஏற்றுக்கொள்ளக்கூடிய அளவில் உள்ளது.' };
    if (isSensitive) return { label: 'கவனம்', advice: 'முதியவர்கள் மற்றும் குழந்தைகள் கூடுதல் கவனம் செலுத்தவும்.' };
    if (isUnhealthy) return { label: 'ஆரோக்கியமற்றது', advice: 'ஆரோக்கியமற்ற காற்று. வெளியே செல்வதை தவிர்க்கவும்.' };
    return { label: 'ஆபத்தானது', advice: 'மிகவும் ஆபத்தான நிலை. வீடுகளிலேயே இருக்கவும்.' };
  }

  if (lang === 'te') {
    if (isGood) return { label: 'ఉత్తమం', advice: 'గాలి నాణ్యత చాలా బాగుంది. బయటకు వెళ్లడానికి అనుకూలం.' };
    if (isModerate) return { label: 'మధ్యస్థం', advice: 'గాలి నాణ్యత సాధారణ స్థాయిలో ఉంది.' };
    if (isSensitive) return { label: 'జాగ్రత్త', advice: 'సున్నితమైన వ్యక్తులు జాగ్రత్త వహించాలి.' };
    if (isUnhealthy) return { label: 'అనారోగ్యకరం', advice: 'అనారోగ్యకరమైన వాతావరణం. బయట తిరగవద్దు.' };
    return { label: 'ప్రమాదకరం', advice: 'తీవ్ర ప్రమాదకరం. ఇళ్లలోనే ఉండండి.' };
  }

  if (lang === 'mr') {
    if (isGood) return { label: 'उत्तम', advice: 'हवेची गुणवत्ता उत्कृष्ट आहे. बाहेर फिरण्यासाठी योग्य वेळ.' };
    if (isModerate) return { label: 'समाधानकारक', advice: 'हवेची गुणवत्ता स्वीकारार्ह आहे.' };
    if (isSensitive) return { label: 'काळजी घ्या', advice: 'लहान मुले व वृद्धांनी काळजी घ्यावी.' };
    if (isUnhealthy) return { label: 'अस्वस्थ', advice: 'अस्वस्थ हवामान. जास्त वेळ बाहेर राहणे टाळा.' };
    return { label: 'धोकादायक', advice: 'अतिशय धोकादायक. घरामध्येच राहा.' };
  }

  if (lang === 'gu') {
    if (isGood) return { label: 'ઉત્તમ', advice: 'હવાની ગુણવત્તા ઉત્તમ છે. બહાર જવું સલામત છે.' };
    if (isModerate) return { label: 'સામાન્ય', advice: 'હવાની ગુણવત્તા સંતોષકારક છે.' };
    if (isSensitive) return { label: 'સાવચેત', advice: 'સંવેદનશીલ જૂથોએ સાવચેત રહેવું.' };
    if (isUnhealthy) return { label: 'અસ્વસ્થ', advice: 'હવા હાનિકારક છે. બહાર જવાનું ટાળો.' };
    return { label: 'જોખમી', advice: 'ખૂબ જોખમી હવા. ઘરમાં જ રહો.' };
  }

  if (lang === 'bn') {
    if (isGood) return { label: 'চমৎকার', advice: 'বাতাসের মান খুব ভালো। বাইরে বেরোনো নিরাপদ।' };
    if (isModerate) return { label: 'সহনীয়', advice: 'বাতাসের মান গ্রহণযোগ্য।' };
    if (isSensitive) return { label: 'সতর্কতা', advice: 'সংবেদনশীল ব্যক্তিরা বাইরে কম সময় কাটান।' };
    if (isUnhealthy) return { label: 'অস্বাস্থ্যকর', advice: 'অস্বাস্থ্যকর বাতাস। বাইরে শারীরিক পরিশ্রম এড়িয়ে চলুন।' };
    return { label: 'বিপজ্জনক', advice: 'বিপজ্জনক বাতাস। ঘরের ভিতরেই থাকুন।' };
  }

  if (lang === 'as') {
    if (isGood) return { label: 'উৎকৃষ্ট', advice: 'বায়ুৰ গুণমান অতি উত্তম। বাহিৰলৈ যোৱাৰ বাবে উপযোগী।' };
    if (isModerate) return { label: 'মধ্যমীয়া', advice: 'বায়ুৰ গুণমান সন্তোষজনক।' };
    if (isSensitive) return { label: 'সতৰ্ক', advice: 'অসুস্থ ব্যক্তি আৰু শিশুসকলে সতৰ্ক থাকক।' };
    if (isUnhealthy) return { label: 'অস্বাস্থ্যকৰ', advice: 'অস্বাস্থ্যকৰ বায়ু। বাহিৰত বেছি সময় নাথাকিব।' };
    return { label: 'ভয়ংকৰ', advice: 'অতি বিপদজনক। ঘৰৰ ভিতৰতে থাকক।' };
  }

  // English fallback
  if (isGood) return { label: 'Good', advice: 'Air quality is excellent. Perfect for outdoor activities.' };
  if (isModerate) return { label: 'Moderate', advice: 'Air quality is acceptable for most people.' };
  if (isSensitive) return { label: 'Sensitive', advice: 'Sensitive groups should limit outdoor exposure.' };
  if (isUnhealthy) return { label: 'Unhealthy', advice: 'Unhealthy. Limit prolonged outdoor exertion.' };
  return { label: 'Hazardous', advice: 'Hazardous. Stay indoors.' };
}

/**
 * Translates UV Index and yields localized advice.
 */
export function getUVData(uv: number | undefined, lang: SupportedLanguageCode) {
  if (uv === undefined || uv === null) return { label: 'N/A', advice: '' };

  if (lang === 'ml') {
    if (uv < 3) return { label: 'കുറവ്', advice: 'കുറഞ്ഞ സംരക്ഷണം മതിയാകും.' };
    if (uv < 6) return { label: 'മിതമായത്', advice: 'വെയിലത്തിറങ്ങുമ്പോൾ കുടയോ സൺഗ്ലാസ്സോ കരുതുക.' };
    if (uv < 8) return { label: 'കൂടുതൽ', advice: 'അൾട്രാവയലറ്റ് രശ്മികൾ ശക്തമാണ്. നേരിട്ട് വെയിൽ ഏൽക്കുന്നത് ഒഴിവാക്കുക.' };
    return { label: 'അതിതീവ്രം', advice: 'അതിതീവ്രമായ അൾട്രാവയലറ്റ് രശ്മികൾ. പരമാവധി തണലിൽ കഴിയുക.' };
  }

  if (lang === 'hi') {
    if (uv < 3) return { label: 'कम', advice: 'न्यूनतम सुरक्षा की आवश्यकता है।' };
    if (uv < 6) return { label: 'मध्यम', advice: 'धूप में निकलते समय छाता या चश्मा प्रयोग करें।' };
    if (uv < 8) return { label: 'अधिक', advice: 'धूप से बचें और त्वचा को ढककर रखें।' };
    return { label: 'अत्यधिक', advice: 'अत्यधिक यूवी किरणें। सीधे धूप में जाने से बचें।' };
  }

  if (lang === 'ta') {
    if (uv < 3) return { label: 'குறைவு', advice: 'குறைந்த பாதுகாப்பு போதுமானது.' };
    if (uv < 6) return { label: 'மிதமானது', advice: 'வெளியில் செல்லும் போது குடை அல்லது கண்ணாடி பயன்படுத்தவும்.' };
    return { label: 'அதிகம்', advice: 'நேரடி வெயிலைத் தவிர்க்கவும்.' };
  }

  if (lang === 'te') {
    if (uv < 3) return { label: 'తక్కువ', advice: 'కనిష్ట రక్షణ సరిపోతుంది.' };
    if (uv < 6) return { label: 'మధ్యస్థం', advice: 'ఎండలో గొడుగు లేదా కళ్లద్దాలు వాడండి.' };
    return { label: 'తీవ్రం', advice: 'నేరుగా ఎండ తగలకుండా చూసుకోండి.' };
  }

  if (lang === 'mr') {
    if (uv < 3) return { label: 'कमी', advice: 'किमान संरक्षणाची गरज आहे.' };
    if (uv < 6) return { label: 'मध्यम', advice: 'उन्हात छत्री किंवा चष्मा वापरा.' };
    return { label: 'अतिशय', advice: 'थेट उन्हात जाणे टाळा.' };
  }

  if (lang === 'gu') {
    if (uv < 3) return { label: 'ઓછું', advice: 'ઓછી કાળજી પૂરતી છે.' };
    if (uv < 6) return { label: 'મધ્યમ', advice: 'તડકામાં છત્રી અથવા ગોગલ્સ વાપરો.' };
    return { label: 'વધારે', advice: 'સીધા સૂર્યપ્રકાશથી બચો.' };
  }

  if (lang === 'bn') {
    if (uv < 3) return { label: 'কম', advice: 'কম সুরক্ষা যথেষ্ট।' };
    if (uv < 6) return { label: 'মাঝারি', advice: 'রোদে বের হলে ছাতা ব্যবহার করুন।' };
    return { label: 'তীব্র', advice: 'সরাসরি রোদ এড়িয়ে চলুন।' };
  }

  if (lang === 'as') {
    if (uv < 3) return { label: 'কম', advice: 'কম সুৰক্ষা পৰ্যাপ্ত।' };
    if (uv < 6) return { label: 'মধ্যমীয়া', advice: 'ৰʼদত ওলালে ছাতি লওক।' };
    return { label: 'অধিক', advice: 'পোনপটীয়া ৰʼদৰ পৰা আঁতৰি থাকক।' };
  }

  if (uv < 3) return { label: 'Low', advice: 'Minimal protection needed.' };
  if (uv < 6) return { label: 'Moderate', advice: 'Use sun protection if outdoors.' };
  if (uv < 8) return { label: 'High', advice: 'Protection essential. Reduce sun exposure.' };
  return { label: 'Extreme', advice: 'Avoid sun exposure. Take all precautions.' };
}

/**
 * Translates Thermal Comfort Advice.
 */
export function getComfortData(temp: number, lang: SupportedLanguageCode) {
  if (lang === 'ml') {
    if (temp > 35) return { label: 'കഠിനമായ ചൂട്', advice: 'കഠിനമായ ചൂട്. ധാരാളം വെള്ളം കുടിക്കുക, തണലിൽ കഴിയുക.' };
    if (temp > 30) return { label: 'ചൂട്', advice: 'ധാരാളം ശുദ്ധജലം കുടിക്കുക; കഠിനമായ വെയിൽ ഒഴിവാക്കുക.' };
    if (temp > 25) return { label: 'സുഖകരം', advice: 'പുറത്തിറങ്ങി നടക്കാൻ ഏറ്റവും സുഖകരമായ അന്തരീക്ഷം.' };
    if (temp > 15) return { label: 'തണുപ്പ്', advice: 'സുഖകരമായ തണുത്ത കാലാവസ്ഥ.' };
    return { label: 'കഠിനമായ തണുപ്പ്', advice: 'തണുപ്പിൽ നിന്ന് സംരക്ഷണം നേടാൻ ആവശ്യമായ വസ്ത്രങ്ങൾ ധരിക്കുക.' };
  }

  if (lang === 'hi') {
    if (temp > 35) return { label: 'अत्यधिक गर्मी', advice: 'भीषण गर्मी। लू से बचें और पर्याप्त पानी पिएं।' };
    if (temp > 30) return { label: 'गर्म', advice: 'पर्याप्त पानी पिएं और सीधे धूप से बचें।' };
    if (temp > 25) return { label: 'उत्तम', advice: 'बाहरी गतिविधियों के लिए सुखद मौसम।' };
    if (temp > 15) return { label: 'शीतल', advice: 'हल्के गर्म कपड़े पहनें।' };
    return { label: 'ठंडा', advice: 'गर्म कपड़े पहनें।' };
  }

  if (lang === 'ta') {
    if (temp > 30) return { label: 'வெப்பம்', advice: 'அதிக தண்ணீர் குடிக்கவும், நேரடி வெயிலைத் தவிர்க்கவும்.' };
    if (temp > 25) return { label: 'இதமானது', advice: 'வெளியே செல்ல இனிமையான வானிலை.' };
    return { label: 'குளிர்ச்சி', advice: 'மிதமான குளிர் உள்ளது.' };
  }

  if (lang === 'te') {
    if (temp > 30) return { label: 'ఎండ', advice: 'తగినంత నీరు త్రాగండి, నేరుగా ఎండలోకి వెళ్లవద్దు.' };
    if (temp > 25) return { label: 'అనుకూలం', advice: 'బయటకు వెళ్లడానికి అనుకూలమైన వాతావరణం.' };
    return { label: 'చల్లదనం', advice: 'చల్లని వాతావరణం.' };
  }

  if (lang === 'mr') {
    if (temp > 30) return { label: 'उष्ण', advice: 'भरपूर पाणी प्या आणि थेट उन्हात जाणे टाळा.' };
    if (temp > 25) return { label: 'उत्तम', advice: 'बाहेर फिरण्यासाठी अनुकूल वातावरण.' };
    return { label: 'थंड', advice: 'थंड हवामान.' };
  }

  if (lang === 'gu') {
    if (temp > 30) return { label: 'ગરમ', advice: 'પુષ્કળ પાણી પીવો અને તડકાથી બચો.' };
    if (temp > 25) return { label: 'અનુકૂળ', advice: 'બહાર જવા માટે સુંદર વાતાવરણ.' };
    return { label: 'ઠંડું', advice: 'ઠંડું વાતાવરણ.' };
  }

  if (lang === 'bn') {
    if (temp > 30) return { label: 'উষ্ণ', advice: 'প্রচুর জল পান করুন এবং কড়া রোদ এড়িয়ে চলুন।' };
    if (temp > 25) return { label: 'মনোরম', advice: 'বাইরে যাওয়ার জন্য চমৎকার আবহাওয়া।' };
    return { label: 'শীতল', advice: 'হালকা গরম পোশাক পরিধান করুন।' };
  }

  if (lang === 'as') {
    if (temp > 30) return { label: 'গৰম', advice: 'প্ৰচুৰ পানী খাওক আৰু প্ৰখৰ ৰʼদ পৰিহাৰ কৰক।' };
    if (temp > 25) return { label: 'সুখকৰ', advice: 'বাহিৰলৈ যোৱাৰ বাবে সুন্দৰ বতৰ।' };
    return { label: 'শীতল', advice: 'শীতল বতৰ।' };
  }

  if (temp > 30) return { label: 'Hot', advice: 'Stay hydrated and avoid prolonged sun exposure.' };
  if (temp > 25) return { label: 'Perfect', advice: 'Perfect weather for outdoor activities.' };
  if (temp > 15) return { label: 'Cool', advice: 'Light jacket recommended.' };
  return { label: 'Cold', advice: 'Wear warm clothing.' };
}

/**
 * Translates Wind Compass Direction into native script.
 */
export function getLocalizedWindDirection(deg: number | undefined | null, lang: SupportedLanguageCode): string {
  if (deg === undefined || deg === null) {
    if (lang === 'ml') return 'ലഭ്യമല്ല';
    if (lang === 'hi') return 'अनुपलब्ध';
    if (lang === 'ta') return 'இல்லை';
    if (lang === 'te') return 'లేదు';
    if (lang === 'mr') return 'नाही';
    if (lang === 'gu') return 'નથી';
    if (lang === 'bn') return 'নেই';
    if (lang === 'as') return 'নাই';
    return 'N/A';
  }

  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const dir = directions[Math.round(deg / 22.5) % 16];

  if (lang === 'ml') {
    const mlDir: Record<string, string> = {
      N: 'വടക്ക്', S: 'തെക്ക്', E: 'കിഴക്ക്', W: 'പടിഞ്ഞാറ്',
      NE: 'വടക്കുകിഴക്ക്', NW: 'വടക്കുപടിഞ്ഞാറ്', SE: 'തെക്കുകിഴക്ക്', SW: 'തെക്കുപടിഞ്ഞാറ്',
      NNE: 'വടക്ക്-വടക്കുകിഴക്ക്', ENE: 'കിഴക്ക്-വടക്കുകിഴക്ക്',
      ESE: 'കിഴക്ക്-തെക്കുകിഴക്ക്', SSE: 'തെക്ക്-തെക്കുകിഴക്ക്',
      SSW: 'തെക്ക്-തെക്കുപടിഞ്ഞാറ്', WSW: 'പടിഞ്ഞാറ്-തെക്കുപടിഞ്ഞാറ്',
      WNW: 'പടിഞ്ഞാറ്-വടക്കുപടിഞ്ഞാറ്', NNW: 'വടക്ക്-വടക്കുപടിഞ്ഞാറ്'
    };
    return mlDir[dir] || dir;
  }

  if (lang === 'hi') {
    const hiDir: Record<string, string> = {
      N: 'उत्तर', S: 'दक्षिण', E: 'पूर्व', W: 'पश्चिम',
      NE: 'उत्तर-पूर्व', NW: 'उत्तर-पश्चिम', SE: 'दक्षिण-पूर्व', SW: 'दक्षिण-पश्चिम',
      NNE: 'उत्तर-उत्तर-पूर्व', ENE: 'पूर्व-उत्तर-पूर्व',
      ESE: 'पूर्व-दक्षिण-पूर्व', SSE: 'दक्षिण-दक्षिण-पूर्व',
      SSW: 'दक्षिण-दक्षिण-पश्चिम', WSW: 'पश्चिम-दक्षिण-पश्चिम',
      WNW: 'पश्चिम-उत्तर-पश्चिम', NNW: 'उत्तर-उत्तर-पश्चिम'
    };
    return hiDir[dir] || dir;
  }

  if (lang === 'ta') {
    const taDir: Record<string, string> = {
      N: 'வடக்கு', S: 'தெற்கு', E: 'கிழக்கு', W: 'மேற்கு',
      NE: 'வடகிழக்கு', NW: 'வடமேற்கு', SE: 'தென்கிழக்கு', SW: 'தென்மேற்கு',
    };
    return taDir[dir] || dir;
  }

  if (lang === 'te') {
    const teDir: Record<string, string> = {
      N: 'ఉత్తరం', S: 'దక్షిణం', E: 'తూర్పు', W: 'పడమర',
      NE: 'ఈశాన్యం', NW: 'వాయువ్యం', SE: 'ఆగ్నేయం', SW: 'నైరుతి',
    };
    return teDir[dir] || dir;
  }

  if (lang === 'mr') {
    const mrDir: Record<string, string> = {
      N: 'उत्तर', S: 'दक्षिण', E: 'पूर्व', W: 'पश्चिम',
      NE: 'ईशान्य', NW: 'वायव्य', SE: 'आग्नेय', SW: 'नैऋत्य',
    };
    return mrDir[dir] || dir;
  }

  if (lang === 'gu') {
    const guDir: Record<string, string> = {
      N: 'ઉત્તર', S: 'દક્ષિણ', E: 'પૂર્વ', W: 'પશ્ચિમ',
      NE: 'ઈશાન', NW: 'વાયવ્ય', SE: 'અગ્નિ', SW: 'નૈઋત્ય',
    };
    return guDir[dir] || dir;
  }

  if (lang === 'bn') {
    const bnDir: Record<string, string> = {
      N: 'উত্তর', S: 'দক্ষিণ', E: 'পূর্ব', W: 'পশ্চিম',
      NE: 'উত্তর-পূর্ব', NW: 'উত্তর-পশ্চিম', SE: 'দক্ষিণ-পূর্ব', SW: 'দক্ষিণ-পশ্চিম',
    };
    return bnDir[dir] || dir;
  }

  if (lang === 'as') {
    const asDir: Record<string, string> = {
      N: 'উত্তৰ', S: 'দক্ষিণ', E: 'পূব', W: 'পশ্চিম',
      NE: 'উত্তৰ-পূব', NW: 'উত্তৰ-পশ্চিম', SE: 'দক্ষিণ-পূব', SW: 'দক্ষিণ-পশ্চিম',
    };
    return asDir[dir] || dir;
  }

  return dir;
}

/**
 * Translates Severity labels into native script.
 */
export function translateSeverityGrade(severity: string | undefined | null, lang: SupportedLanguageCode): string {
  if (!severity) return '';
  const lower = severity.toLowerCase();

  if (lang === 'ml') {
    if (lower.includes('crit') || lower.includes('severe')) return 'അതിതീവ്രം';
    if (lower.includes('high')) return 'തീവ്രം';
    if (lower.includes('mod') || lower.includes('guard')) return 'മിതമായത്';
    if (lower.includes('low')) return 'കുറഞ്ഞത്';
    return 'ശ്രദ്ധിക്കുക';
  }

  if (lang === 'hi') {
    if (lower.includes('crit') || lower.includes('severe')) return 'अत्यधिक गंभीर';
    if (lower.includes('high')) return 'गंभीर';
    if (lower.includes('mod') || lower.includes('guard')) return 'मध्यम';
    if (lower.includes('low')) return 'कम';
    return 'सावधान';
  }

  if (lang === 'ta') {
    if (lower.includes('crit') || lower.includes('severe')) return 'அதிதீவிரம்';
    if (lower.includes('high')) return 'தீவிரம்';
    if (lower.includes('mod') || lower.includes('guard')) return 'மிதமானது';
    return 'குறைவு';
  }

  if (lang === 'te') {
    if (lower.includes('crit') || lower.includes('severe')) return 'అతి తీవ్రం';
    if (lower.includes('high')) return 'తీవ్రం';
    if (lower.includes('mod') || lower.includes('guard')) return 'మధ్యస్థం';
    return 'తక్కువ';
  }

  if (lang === 'mr') {
    if (lower.includes('crit') || lower.includes('severe')) return 'अति गंभीर';
    if (lower.includes('high')) return 'गंभीर';
    if (lower.includes('mod') || lower.includes('guard')) return 'मध्यम';
    return 'कमी';
  }

  if (lang === 'gu') {
    if (lower.includes('crit') || lower.includes('severe')) return 'અતિ ગંભીર';
    if (lower.includes('high')) return 'ગંભીર';
    if (lower.includes('mod') || lower.includes('guard')) return 'મધ્યમ';
    return 'ઓછું';
  }

  if (lang === 'bn') {
    if (lower.includes('crit') || lower.includes('severe')) return 'অতি বিপজ্জনক';
    if (lower.includes('high')) return 'উচ্চ ঝুঁকি';
    if (lower.includes('mod') || lower.includes('guard')) return 'মাঝারি';
    return 'কম';
  }

  if (lang === 'as') {
    if (lower.includes('crit') || lower.includes('severe')) return 'অতি ভয়াৱহ';
    if (lower.includes('high')) return 'উচ্চ সংকট';
    if (lower.includes('mod') || lower.includes('guard')) return 'মধ্যমীয়া';
    return 'নিম্ন';
  }

  return severity.toUpperCase();
}
