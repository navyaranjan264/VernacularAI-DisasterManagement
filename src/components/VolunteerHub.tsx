import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Truck,
  Droplets,
  Heart,
  Utensils,
  Plus,
  MapPin,
  Phone,
  ShieldCheck,
  Search,
  CheckCircle2,
  Zap,
  Loader2,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { pipeline } from '@huggingface/transformers';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { sanitizeInput } from '@/utils/security';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { VERNACULAR_VOLUNTEER } from '@/utils/vernacularData';

interface Resource {
  id: string;
  type: 'vehicle' | 'food' | 'water' | 'medical' | 'other';
  name: string;
  location: string;
  contact: string;
  status: 'available' | 'in-use' | 'needed';
  description: string;
}

const VolunteerHub: React.FC = () => {
  const { language } = useLanguage();
  const vDict = VERNACULAR_VOLUNTEER[language] || VERNACULAR_VOLUNTEER.en;

  const [resources, setResources] = useState<Resource[]>([
    {
      id: 'demo-1',
      type: 'vehicle',
      name: language === 'ml' ? '4x4 രക്ഷാപ്രവർത്തന ബോട്ട്' : language === 'hi' ? '4x4 बचाव नौका' : '4x4 Rescue Boat',
      location: language === 'ml' ? 'ആലുവ, എറണാകുളം' : language === 'hi' ? 'अलुवा, एर्नाकुलम' : 'Aluva, Ernakulam',
      contact: '+91 94470 12345',
      status: 'available',
      description: language === 'ml' ? 'വെള്ളപ്പൊക്ക ബാധിത പ്രദേശങ്ങളിൽ സഞ്ചരിക്കാൻ സജ്ജമായ 8 പേർക്കുള്ള ബോട്ട്' : language === 'hi' ? 'बाढ़ प्रभावित क्षेत्रों के लिए 8 सीटर मोटर चालित बचाव नाव' : '8-person motorized rescue boat equipped for flood zones'
    },
    {
      id: 'demo-2',
      type: 'medical',
      name: language === 'ml' ? 'അടിയന്തര പ്രഥമശുശ്രൂഷാ സംഘം' : language === 'hi' ? 'मोबाइल प्राथमिक चिकित्सा दल' : 'Mobile First Aid Team',
      location: language === 'ml' ? 'വൈറ്റില, കൊച്ചി' : language === 'hi' ? 'वाइटीला, कोच्चि' : 'Vyttila, Kochi',
      contact: '+91 98460 54321',
      status: 'available',
      description: language === 'ml' ? 'ഡോക്ടറും നഴ്സും അടങ്ങുന്ന സംഘം, അത്യാവശ്യ മരുന്നുകൾ ലഭ്യമാണ്' : language === 'hi' ? 'डॉक्टर और पैरामेडिक्स के साथ 24x7 आपातकालीन दवा आपूर्ति' : 'Team with doctor, paramedic and critical trauma supplies'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showVolunteerDialog, setShowVolunteerDialog] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    phone: '',
    skills: ''
  });
  const [isVolunteer, setIsVolunteer] = useState(() => {
    return localStorage.getItem('is_volunteer') === 'true';
  });

  const [newResource, setNewResource] = useState<Partial<Resource>>({
    type: 'food',
    status: 'available'
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'vehicle': return <Truck className="h-5 w-5" />;
      case 'food': return <Utensils className="h-5 w-5" />;
      case 'water': return <Droplets className="h-5 w-5" />;
      case 'medical': return <Heart className="h-5 w-5" />;
      default: return <Plus className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vehicle': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'medical': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'food': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'water': return 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  const [activeSection, setActiveSection] = useState<'resources' | 'analysis'>('resources');
  const [inputText, setInputText] = useState('');
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const classifierRef = useRef<any>(null);

  const categories = [
    'Rescue Needed',
    'Medical Emergency',
    'Food & Water Shortage',
    'Flood Hazard',
    'Fire Hazard',
    'Safe / Not Urgent'
  ];

  const CATEGORY_MAP: Record<string, Record<string, string>> = {
    ml: {
      'Rescue Needed': 'രക്ഷാപ്രവർത്തനം അടിയന്തരമായി ആവശ്യമുണ്ട്',
      'Medical Emergency': 'അടിയന്തര വൈദ്യസഹായം',
      'Food & Water Shortage': 'ഭക്ഷണവും കുടിവെള്ളവും ക്ഷാമം',
      'Flood Hazard': 'വെള്ളപ്പൊക്ക ഭീഷണി',
      'Fire Hazard': 'തീപിടുത്ത ഭീഷണി',
      'Safe / Not Urgent': 'സുരക്ഷിതം / അടിയന്തരമല്ല'
    },
    hi: {
      'Rescue Needed': 'बचाव की तत्काल आवश्यकता',
      'Medical Emergency': 'चिकित्सा आपातकाल',
      'Food & Water Shortage': 'भोजन एवं पेयजल की कमी',
      'Flood Hazard': 'बाढ़ का खतरा',
      'Fire Hazard': 'आग का खतरा',
      'Safe / Not Urgent': 'सुरक्षित / गैर-जरूरी'
    },
    ta: {
      'Rescue Needed': 'உடனடி மீட்பு தேவை',
      'Medical Emergency': 'மருத்துவ அவசரநிலை',
      'Food & Water Shortage': 'உணவு மற்றும் குடிநீர் பற்றாக்குறை',
      'Flood Hazard': 'வெள்ள அபாயம்',
      'Fire Hazard': 'தீ விபத்து ஆபத்து',
      'Safe / Not Urgent': 'பாதுகாப்பானது / அவசரமில்லை'
    },
    te: {
      'Rescue Needed': 'తక్షణ రక్షణ అవసరం',
      'Medical Emergency': 'వైద్య అత్యవసర పరిస్థితి',
      'Food & Water Shortage': 'ఆహారం మరియు తాగునీటి కొరత',
      'Flood Hazard': 'వరద ప్రమాదం',
      'Fire Hazard': 'అగ్ని ప్రమాదం',
      'Safe / Not Urgent': 'సురక్షితం / అత్యవసరం కాదు'
    },
    mr: {
      'Rescue Needed': 'तातडीने बचाव आवश्यक',
      'Medical Emergency': 'वैद्यकीय आणीबाणी',
      'Food & Water Shortage': 'अन्न आणि पाण्याची टंचाई',
      'Flood Hazard': 'पुराचा धोका',
      'Fire Hazard': 'आगीचा धोका',
      'Safe / Not Urgent': 'सुरक्षित / तातडीचे नाही'
    },
    gu: {
      'Rescue Needed': 'તાત્કાલિક બચાવની જરૂર છે',
      'Medical Emergency': 'તબીબી કટોકટી',
      'Food & Water Shortage': 'ખોરાક અને પાણીની તંગી',
      'Flood Hazard': 'પૂરનો ખતરો',
      'Fire Hazard': 'આગનો ખતરો',
      'Safe / Not Urgent': 'સુરક્ષિત / કટોકટી નથી'
    },
    bn: {
      'Rescue Needed': 'অবিলম্বে উদ্ধার প্রয়োজন',
      'Medical Emergency': 'চিকিৎসা জরুরি অবস্থা',
      'Food & Water Shortage': 'খাদ্য ও পানীয় জলের সংকট',
      'Flood Hazard': 'বন্যার ঝুঁকি',
      'Fire Hazard': 'অগ্নিকাণ্ডের ঝুঁকি',
      'Safe / Not Urgent': 'নিরাপদ / জরুরি নয়'
    },
    as: {
      'Rescue Needed': 'তাত্ক্ষণিক উদ্ধাৰ প্ৰয়োজন',
      'Medical Emergency': 'চিকিৎসা জৰুৰীকালীন অৱস্থা',
      'Food & Water Shortage': 'খাদ্য আৰু খোৱাপানীৰ নাটনি',
      'Flood Hazard': 'বানপানীৰ বিপদ',
      'Fire Hazard': 'অগ্নিসংযোগৰ বিপদ',
      'Safe / Not Urgent': 'নিৰাপদ / জৰুৰী নহয়'
    },
    en: {
      'Rescue Needed': 'Rescue Needed',
      'Medical Emergency': 'Medical Emergency',
      'Food & Water Shortage': 'Food & Water Shortage',
      'Flood Hazard': 'Flood Hazard',
      'Fire Hazard': 'Fire Hazard',
      'Safe / Not Urgent': 'Safe / Not Urgent'
    }
  };

  const translateCategory = (cat: string) => {
    return CATEGORY_MAP[language]?.[cat] || CATEGORY_MAP.en[cat] || cat;
  };

  const loadModel = async () => {
    if (classifierRef.current) return classifierRef.current;
    setIsModelLoading(true);
    setLoadingProgress(10);
    try {
      const classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli', {
        progress_callback: (p: any) => {
          if (p.status === 'progress') {
            setLoadingProgress(Math.round(p.progress));
          }
        }
      });
      classifierRef.current = classifier;
      setIsModelLoading(false);
      return classifier;
    } catch (error) {
      console.error('Error loading NLP model:', error);
      toast.error(language === 'ml' ? 'മോഡൽ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല' : 'Failed to load NLP model.');
      setIsModelLoading(false);
      return null;
    }
  };

  const analyzeSOS = async () => {
    if (!inputText.trim()) {
      toast.error(language === 'ml' ? 'ദയവായി പരിശോധിക്കേണ്ട സന്ദേശം നൽകുക' : 'Please enter a message to analyze.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const classifier = await loadModel();
      if (!classifier) {
        setIsAnalyzing(false);
        return;
      }
      const sanitized = sanitizeInput(inputText);
      const output = await classifier(sanitized, categories);
      setResults(output);
      toast.success(language === 'ml' ? 'പരിശോധന പൂർത്തിയായി' : 'Analysis complete!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(language === 'ml' ? 'വിശകലനത്തിൽ പിശക് സംഭവിച്ചു' : 'Error during analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyColor = (label: string, score: number) => {
    if (label === 'Safe / Not Urgent') return 'bg-success/20 text-success border-success/30';
    if (score > 0.6) return 'bg-destructive/20 text-destructive border-destructive/30';
    if (score > 0.3) return 'bg-warning/20 text-warning border-warning/30';
    return 'bg-primary/20 text-primary border-primary/30';
  };

  const handleAddResource = () => {
    if (!newResource.name || !newResource.contact) {
      toast.error(language === 'ml' ? 'ദയവായി ആവശ്യമായ വിവരങ്ങൾ പൂരിപ്പിക്കുക' : 'Please fill in required fields');
      return;
    }
    const resource: Resource = {
      id: Date.now().toString(),
      type: newResource.type as any,
      name: sanitizeInput(newResource.name || ''),
      location: sanitizeInput(newResource.location || (language === 'ml' ? 'സ്ഥലം ലഭ്യമല്ല' : 'Unknown')),
      contact: sanitizeInput(newResource.contact || ''),
      status: 'available',
      description: sanitizeInput(newResource.description || '')
    };
    setResources([resource, ...resources]);
    setShowAddForm(false);
    toast.success(language === 'ml' ? 'സാമഗ്രി വിജയകരമായി പട്ടികപ്പെടുത്തി' : 'Resource listed successfully');
  };

  const handleJoinAsVolunteer = () => {
    if (!registrationData.name || !registrationData.phone) {
      toast.error(language === 'ml' ? 'ദയവായി പേരും ഫോൺ നമ്പറും നൽകുക' : 'Please fill in your name and phone number');
      return;
    }
    setIsVolunteer(true);
    localStorage.setItem('is_volunteer', 'true');
    setShowVolunteerDialog(false);
    const sName = sanitizeInput(registrationData.name);
    toast.success(language === 'ml' ? `സ്വാഗതം, ${sName}!` : `Welcome aboard, ${sName}!`, {
      description: language === 'ml' ? 'നിങ്ങൾ സന്നദ്ധപ്രവർത്തകനായി രജിസ്റ്റർ ചെയ്യപ്പെട്ടു.' : 'You are now registered as an active volunteer.'
    });
  };

  // Localized UI helper strings
  const getVolunteerStrings = (lang: string) => {
    switch (lang) {
      case 'ml':
        return {
          statsTitle: 'സന്നദ്ധ സേവന സ്ഥിതിവിവരക്കണക്കുകൾ',
          activeVolunteers: 'സജീവ സന്നദ്ധപ്രവർത്തകർ',
          rescueBoats: 'രക്ഷാ ബോട്ടുകൾ',
          medicalTeams: 'മെഡിക്കൽ സംഘങ്ങൾ',
          acknowledged: 'സ്ഥിരീകരിച്ചു',
          youAreVolunteer: 'നിങ്ങൾ രജിസ്റ്റർ ചെയ്ത സന്നദ്ധപ്രവർത്തകനാണ്',
          joinBtn: 'സന്നദ്ധപ്രവർത്തകനാകൂ',
          liveListings: 'ലഭ്യമായ സാമഗ്രികളുടെ പട്ടിക',
          contactBtn: 'ബന്ധപ്പെടുക',
          guidelinesTitle: 'ദുരിതാശ്വാസ മാർഗ്ഗനിർദ്ദേശങ്ങൾ',
          g1: 'സ്ഥലം പങ്കിടുന്നതിന് മുൻപ് ആധികാരികത ഉറപ്പുവരുത്തുക.',
          g2: 'കുട്ടികൾ, മുതിർന്നവർ, രോഗികൾ എന്നിവർക്ക് പ്രഥമ പരിഗണന നൽകുക.',
          g3: 'വ്യാജ വിവരങ്ങൾ ശ്രദ്ധയിൽപ്പെട്ടാൽ അഡ്മിനെ ഉടൻ അറിയിക്കുക.',
          initNeural: 'എഐ ന്യൂറൽ നെറ്റ്‌വർക്ക് സജ്ജമാക്കുന്നു...',
          fullName: 'മുഴുവൻ പേര്',
          namePlaceholder: 'നിങ്ങളുടെ പേര് നൽകുക',
          skillsPlaceholder: 'ഉദാ: നീന്തൽ, പ്രഥമശുശ്രൂഷ, ഡ്രൈവിംഗ്',
          aiBadge: 'എഐ സിഗ്നൽ പ്രോസസ്സർ',
        };
      case 'hi':
        return {
          statsTitle: 'स्वयंसेवक आंकड़े',
          activeVolunteers: 'सक्रिय स्वयंसेवक',
          rescueBoats: 'बचाव नौकाएं',
          medicalTeams: 'चिकित्सा दल',
          acknowledged: 'स्वीकृत',
          youAreVolunteer: 'आप एक पंजीकृत स्वयंसेवक हैं',
          joinBtn: 'स्वयंसेवक के रूप में जुड़ें',
          liveListings: 'उपलब्ध संसाधनों की सूची',
          contactBtn: 'संपर्क करें',
          guidelinesTitle: 'राहत दिशानिर्देश',
          g1: 'स्थान विवरण साझा करने से पहले पहचान सत्यापित करें।',
          g2: 'बच्चों, बुजुर्गों और रोगियों के बचाव को प्राथमिकता दें।',
          g3: 'फर्जी संदेशों की सूचना तत्काल नियंत्रण कक्ष को दें।',
          initNeural: 'तंत्रिका नेटवर्क आरंभ हो रहा है...',
          fullName: 'पूरा नाम',
          namePlaceholder: 'अपना नाम दर्ज करें',
          skillsPlaceholder: 'उदा. तैराकी, प्राथमिक चिकित्सा, ड्राइविंग',
          aiBadge: 'एआई सिग्नल विश्लेषक',
        };
      case 'ta':
        return {
          statsTitle: 'தன்னார்வலர் புள்ளிவிவரங்கள்',
          activeVolunteers: 'செயலில் உள்ள தன்னார்வலர்கள்',
          rescueBoats: 'மீட்புப் படகுகள்',
          medicalTeams: 'மருத்துவக் குழுக்கள்',
          acknowledged: 'உறுதிப்படுத்தப்பட்டது',
          youAreVolunteer: 'நீங்கள் பதிவுசெய்த தன்னார்வலர்',
          joinBtn: 'தன்னார்வலராக இணையுங்கள்',
          liveListings: 'நேரலை வளப் பட்டியல்',
          contactBtn: 'தொடர்புகொள்ள',
          guidelinesTitle: 'நிவாரண வழிகாட்டுதல்கள்',
          g1: 'இட விவரங்களைப் பகிர்வதற்கு முன் சரிபார்க்கவும்.',
          g2: 'குழந்தைகள், முதியவர்கள் மற்றும் நோயாளிகளுக்கு முன்னுரிமை அளியுங்கள்.',
          g3: 'போலி பட்டியல்கள் இருந்தால் உடனடியாக புகாரளிக்கவும்.',
          initNeural: 'AI கட்டமைப்பு தொடங்குகிறது...',
          fullName: 'முழு பெயர்',
          namePlaceholder: 'உங்கள் பெயரை உள்ளிடவும்',
          skillsPlaceholder: 'எ.கா. நீச்சல், முதலுதவி, ஓட்டுநர்',
          aiBadge: 'AI சமிக்ஞை பகுப்பாய்வு',
        };
      case 'te':
        return {
          statsTitle: 'వాలంటీర్ గణాంకాలు',
          activeVolunteers: 'క్రియాశీల వాలంటీర్లు',
          rescueBoats: 'రక్షణ పడవలు',
          medicalTeams: 'వైద్య బృందాలు',
          acknowledged: 'ధృవీకరించబడింది',
          youAreVolunteer: 'మీరు నమోదైన వాలంటీర్',
          joinBtn: 'వాలంటీర్‌గా చేరండి',
          liveListings: 'ప్రత్యక్ష వనరుల జాబితా',
          contactBtn: 'సంప్రదించండి',
          guidelinesTitle: 'సహాయ మార్గదర్శకాలు',
          g1: 'స్థల వివరాలను పంచుకునే ముందు గుర్తింపును ధృవీకరించండి.',
          g2: 'పిల్లలు, వృద్ధులు మరియు రోగులకు ప్రాధాన్యత ఇవ్వండి.',
          g3: 'నకిలీ సమాచారాన్ని వెంటనే నివేదించండి.',
          initNeural: 'AI నెట్‌వర్క్ ప్రారంభమవుతోంది...',
          fullName: 'పూర్తి పేరు',
          namePlaceholder: 'మీ పేరు నమోదు చేయండి',
          skillsPlaceholder: 'ఉదా: ఈత, ప్రథమ చికిత్స, డ్రైవింగ్',
          aiBadge: 'AI సిగ్నల్ విశ్లేషణ',
        };
      case 'mr':
        return {
          statsTitle: 'स्वयंसेवक आकडेवारी',
          activeVolunteers: 'सक्रिय स्वयंसेवक',
          rescueBoats: 'बचाव बोटी',
          medicalTeams: 'वैद्यकीय पथके',
          acknowledged: 'नोंदणीकृत',
          youAreVolunteer: 'तुम्ही एक नोंदणीकृत स्वयंसेवक आहात',
          joinBtn: 'स्वयंसेवक म्हणून सामील व्हा',
          liveListings: 'थेट उपलब्ध साहित्य सूची',
          contactBtn: 'संपर्क साधा',
          guidelinesTitle: 'मदत व बचाव मार्गदर्शक तत्त्वे',
          g1: 'ठिकाण शेअर करण्यापूर्वी खात्री करा.',
          g2: 'लहान मुले, वृद्ध आणि आजारी व्यक्तींना प्रथम प्राधान्य द्या.',
          g3: 'खोट्या माहितीची त्वरित तक्रार करा.',
          initNeural: 'AI नेटवर्क सुरू होत आहे...',
          fullName: 'पूर्ण नाव',
          namePlaceholder: 'आपले नाव प्रविष्ट करा',
          skillsPlaceholder: 'उदा. पोहणे, प्रथमोपचार, ड्रायव्हिंग',
          aiBadge: 'AI सिग्नल विश्लेषक',
        };
      case 'gu':
        return {
          statsTitle: 'સ્વયંસેવક આંકડા',
          activeVolunteers: 'સક્રિય સ્વયંસેવકો',
          rescueBoats: 'બચાવ હોડીઓ',
          medicalTeams: 'તબીબી ટીમો',
          acknowledged: 'ચકાસાયેલ',
          youAreVolunteer: 'તમે નોંધાયેલ સ્વયંસેવક છો',
          joinBtn: 'સ્વયંસેવક તરીકે જોડાવો',
          liveListings: 'લાઇવ સંસાધન સૂચિ',
          contactBtn: 'સંપર્ક કરો',
          guidelinesTitle: 'રાહત માર્ગદર્શિકા',
          g1: 'વિગતો શેર કરતા પહેલા ઓળખ ચકાસો.',
          g2: 'બાળકો, વૃદ્ધો અને દર્દીઓને પ્રાથમિકતા આપો.',
          g3: 'ખોટી માહિતીની તરત જ જાણ કરો.',
          initNeural: 'AI નેટવર્ક શરૂ થઈ રહ્યું છે...',
          fullName: 'પૂરું નામ',
          namePlaceholder: 'તમારું નામ દાખલ કરો',
          skillsPlaceholder: 'દા.ત. તરવું, પ્રાથમિક સારવાર, ડ્રાઇવિંગ',
          aiBadge: 'AI સિગ્નલ વિશ્લેષક',
        };
      case 'bn':
        return {
          statsTitle: 'স্বেচ্ছাসেবক পরিসংখ্যান',
          activeVolunteers: 'সক্রিয় স্বেচ্ছাসেবক',
          rescueBoats: 'উদ্ধারকারী নৌকা',
          medicalTeams: 'মেডিকেল টিম',
          acknowledged: 'স্বীকৃত',
          youAreVolunteer: 'আপনি একজন নিবন্ধিত স্বেচ্ছাসেবক',
          joinBtn: 'স্বেচ্ছাসেবক হিসেবে যোগ দিন',
          liveListings: 'লাইভ ত্রাণ সামগ্রীর তালিকা',
          contactBtn: 'যোগাযোগ করুন',
          guidelinesTitle: 'ত্রাণ নির্দেশিকা',
          g1: 'স্থান শেয়ার করার আগে পরিচয় যাচাই করুন।',
          g2: 'শিশু, বৃদ্ধ এবং রোগীদের উদ্ধারে অগ্রাধিকার দিন।',
          g3: 'ভুয়া বার্তার বিষয়ে অবিলম্বে রিপোর্ট করুন।',
          initNeural: 'AI নেটওয়ার্ক প্রস্তুত হচ্ছে...',
          fullName: 'সম্পূর্ণ নাম',
          namePlaceholder: 'আপনার নাম লিখুন',
          skillsPlaceholder: 'যেমন: সাঁতার, প্রাথমিক চিকিৎসা, ড্রাইভিং',
          aiBadge: 'AI সংকেত বিশ্লেষক',
        };
      case 'as':
        return {
          statsTitle: 'স্বেচ্ছাসেৱকৰ পৰিসংখ্যা',
          activeVolunteers: 'সক্ৰিয় স্বেচ্ছাসেৱক',
          rescueBoats: 'উদ্ধাৰকাৰী নাও',
          medicalTeams: 'চিকিৎসা দল',
          acknowledged: 'স্বীকৃত',
          youAreVolunteer: 'আপুনি এজন পঞ্জীয়নভুক্ত স্বেচ্ছাসেৱক',
          joinBtn: 'স্বেচ্ছাসেৱক হিচাপে যোগদান কৰক',
          liveListings: 'সাহায্য সামগ্ৰীৰ তালিকা',
          contactBtn: 'যোগাযোগ কৰক',
          guidelinesTitle: 'সাহায্য নিৰ্দেশনাৱলী',
          g1: 'স্থানৰ তথ্য দিয়াৰ পূৰ্বে পৰীক্ষা কৰক।',
          g2: 'শিশু, বৃদ্ধ আৰু ৰোগীক প্ৰথম অগ্ৰাধিকাৰ দিয়ক।',
          g3: 'ভুৱা তথ্য পালে লগে লগে জনাব।',
          initNeural: 'AI নেটৱৰ্ক আৰম্ভ হৈছে...',
          fullName: 'সম্পূৰ্ণ নাম',
          namePlaceholder: 'আপোনাৰ নাম লিখক',
          skillsPlaceholder: 'যেনে: সাঁতোৰ, প্ৰাথমিক চিকিৎসা, গাড়ী চালনা',
          aiBadge: 'AI সংকেত বিশ্লেষক',
        };
      default:
        return {
          statsTitle: 'Volunteer Stats',
          activeVolunteers: 'Active Volunteers',
          rescueBoats: 'Rescue Boats',
          medicalTeams: 'Medical Teams',
          acknowledged: 'Acknowledged',
          youAreVolunteer: 'YOU ARE A REGISTERED VOLUNTEER',
          joinBtn: 'JOIN AS VOLUNTEER',
          liveListings: 'Live Resource Listings',
          contactBtn: 'CONTACT',
          guidelinesTitle: 'Relief Guidelines',
          g1: 'Always verify identity before providing location details.',
          g2: 'Prioritize rescue for children, elderly, and those with medical conditions.',
          g3: 'Report any fake listings to the admin team immediately.',
          initNeural: 'INITIALIZING NEURAL NETWORK...',
          fullName: 'Full Name',
          namePlaceholder: 'Enter your name',
          skillsPlaceholder: 'e.g. Swimmer, Medical, Driving',
          aiBadge: 'MobileBERT AI',
        };
    }
  };

  const strings = getVolunteerStrings(language);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/10 pb-6">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-foreground">
            {vDict.pageTitle.toUpperCase()}
          </h1>
          <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest flex items-center gap-2 mt-1">
            <Users className="h-4 w-4" /> {vDict.pageSubtitle}
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary hover:bg-primary/90 text-white font-black"
        >
          <Plus className="mr-2 h-4 w-4" /> {vDict.listResourceBtn.toUpperCase()}
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-6 p-1 bg-muted/30 rounded-lg w-fit">
        <Button
          variant={activeSection === 'resources' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('resources')}
          className="text-xs font-bold"
        >
          <Truck className="h-3.5 w-3.5 mr-1" /> {vDict.tabResources.toUpperCase()}
        </Button>
        <Button
          variant={activeSection === 'analysis' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveSection('analysis')}
          className="text-xs font-bold"
        >
          <Zap className="h-3.5 w-3.5 mr-1" /> {vDict.tabRescueML.toUpperCase()}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {activeSection === 'analysis' ? (
            <div className="space-y-6">
              <Card className="p-6 glass border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <ShieldAlert className="h-16 w-16" />
                </div>
                <div className="space-y-4 relative z-10">
                  <h3 className="font-bold flex items-center gap-2 text-foreground">
                    <AlertCircle className="h-5 w-5 text-primary" /> {vDict.signalAnalysisTitle}
                  </h3>
                  <Textarea
                    placeholder={vDict.signalPlaceholder}
                    className="min-h-[150px] bg-background/50 border-primary/20 text-foreground"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tabular-nums">
                      {strings.aiBadge}
                    </span>
                    <Button
                      onClick={analyzeSOS}
                      disabled={isAnalyzing || isModelLoading}
                      className="bg-primary font-bold shadow-lg shadow-primary/20 text-white"
                    >
                      {isAnalyzing || isModelLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 fill-current" />}
                      {isModelLoading ? vDict.loadingModel.toUpperCase() : isAnalyzing ? vDict.analyzingText.toUpperCase() : vDict.btnAnalyzeSignal.toUpperCase()}
                    </Button>
                  </div>
                  {isModelLoading && (
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>{strings.initNeural}</span>
                        <span>{loadingProgress}%</span>
                      </div>
                      <Progress value={loadingProgress} className="h-1" />
                    </div>
                  )}
                </div>
              </Card>

              {results && (
                <Card className="p-6 glass border-success/20 animate-in zoom-in-95 duration-300">
                  <h3 className="font-bold mb-6 text-sm uppercase flex items-center gap-2 underline underline-offset-4 decoration-primary text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-success" /> {vDict.mlResultsTitle.toUpperCase()}
                  </h3>
                  <div className="space-y-5">
                    {results.labels.map((label: string, index: number) => {
                      const score = results.scores[index];
                      const percentage = Math.round(score * 100);
                      return (
                        <div key={label} className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase">
                            <Badge variant="outline" className={getUrgencyColor(label, score)}>
                              {translateCategory(label)}
                            </Badge>
                            <span className="font-mono">{percentage}%</span>
                          </div>
                          <Progress value={percentage} className={`h-1 ${score > 0.5 ? '[&>div]:bg-primary' : ''}`} />
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {showAddForm && (
                <Card className="p-6 border-primary/20 bg-primary/5 animate-in slide-in-from-top-4">
                  <h3 className="font-bold mb-4 text-foreground">{vDict.formTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">{vDict.labelType}</label>
                      <select
                        className="w-full bg-background border border-border rounded-md p-2 text-sm text-foreground"
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                        value={newResource.type}
                      >
                        <option value="vehicle">{vDict.types.vehicle}</option>
                        <option value="food">{vDict.types.food}</option>
                        <option value="water">{vDict.types.water}</option>
                        <option value="medical">{vDict.types.medical}</option>
                        <option value="other">{vDict.types.other}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">{vDict.labelName}</label>
                      <Input
                        placeholder={vDict.labelName}
                        value={newResource.name}
                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                        className="text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">{vDict.labelContact}</label>
                      <Input
                        placeholder="+91..."
                        value={newResource.contact}
                        onChange={(e) => setNewResource({ ...newResource, contact: e.target.value })}
                        className="text-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">{vDict.labelLocation}</label>
                      <Input
                        placeholder={vDict.labelLocation}
                        value={newResource.location}
                        onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                        className="text-foreground"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                      <label className="text-[10px] font-bold uppercase text-muted-foreground">{vDict.labelDescription}</label>
                      <Input
                        placeholder={vDict.labelDescription}
                        value={newResource.description}
                        onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                        className="text-foreground"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="ghost" onClick={() => setShowAddForm(false)}>{vDict.btnCancel}</Button>
                    <Button onClick={handleAddResource}>{vDict.btnPost}</Button>
                  </div>
                </Card>
              )}

              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-foreground">
                  <Search className="h-4 w-4" /> {strings.liveListings}
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {resources.map((item) => (
                    <Card key={item.id} className="p-4 bg-white/50 dark:bg-black/20 border-border/10 hover:border-primary/30 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          <div className={`p-3 rounded-xl border ${getTypeColor(item.type)}`}>
                            {getIcon(item.type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-foreground">{item.name}</h4>
                              <Badge variant="outline" className="text-[10px] h-4">
                                {vDict.types[item.type] || item.type}
                              </Badge>
                            </div>
                            <div className="flex flex-col gap-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {item.location}
                              </p>
                              <p className="text-xs text-primary font-bold flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {item.contact}
                              </p>
                            </div>
                            <p className="text-sm mt-3 text-foreground/80 leading-snug">{item.description}</p>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" className="text-[10px] font-bold">
                          {strings.contactBtn}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-5 bg-primary/5 border-primary/10 overflow-hidden relative">
            <div className="absolute -top-6 -right-6 opacity-5 rotate-12">
              <Users className="h-32 w-32" />
            </div>
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> {strings.statsTitle}
            </h4>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <p className="text-xs text-muted-foreground uppercase">{strings.activeVolunteers}</p>
                <p className="text-2xl font-black">1.2k</p>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-xs text-muted-foreground uppercase">{strings.rescueBoats}</p>
                <p className="text-2xl font-black">42</p>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-xs text-muted-foreground uppercase">{strings.medicalTeams}</p>
                <p className="text-2xl font-black">15</p>
              </div>
              {isVolunteer ? (
                <div className="p-4 bg-success/20 border border-success/30 rounded-xl flex items-center gap-3 animate-in zoom-in-95">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                  <div>
                    <p className="text-sm font-bold text-success uppercase">{strings.acknowledged}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{strings.youAreVolunteer}</p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowVolunteerDialog(true)}
                  className="w-full mt-4 bg-primary text-white font-bold h-12"
                >
                  {strings.joinBtn}
                </Button>
              )}
            </div>
          </Card>

          {/* Volunteer Registration Dialog */}
          <Dialog open={showVolunteerDialog} onOpenChange={setShowVolunteerDialog}>
            <DialogContent className="max-w-md bg-background border-primary/20">
              <DialogHeader>
                <DialogTitle className="text-xl font-black italic tracking-tighter text-foreground">
                  {vDict.volunteerDialogTitle}
                </DialogTitle>
                <DialogDescription className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                  {vDict.volunteerDialogDesc}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">{strings.fullName}</Label>
                  <Input
                    placeholder={strings.namePlaceholder}
                    className="h-12 font-bold"
                    value={registrationData.name}
                    onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">{vDict.labelContact}</Label>
                  <Input
                    placeholder="+91..."
                    className="h-12 font-bold"
                    value={registrationData.phone}
                    onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase">{vDict.volunteerSkillsLabel}</Label>
                  <Input
                    placeholder={strings.skillsPlaceholder}
                    className="h-12 font-bold"
                    value={registrationData.skills}
                    onChange={(e) => setRegistrationData({ ...registrationData, skills: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  className="w-full h-12 bg-primary text-white font-black uppercase tracking-widest"
                  onClick={handleJoinAsVolunteer}
                >
                  {vDict.btnRegisterVolunteer}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card className="p-5 glass border-border/10 bg-accent/5">
            <h4 className="font-bold text-sm mb-3 text-foreground">{strings.guidelinesTitle}</h4>
            <ul className="space-y-3">
              <li className="text-xs flex gap-2">
                <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-muted-foreground">{strings.g1}</span>
              </li>
              <li className="text-xs flex gap-2">
                <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-muted-foreground">{strings.g2}</span>
              </li>
              <li className="text-xs flex gap-2">
                <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="text-muted-foreground">{strings.g3}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VolunteerHub;
