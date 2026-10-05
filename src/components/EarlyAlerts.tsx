import React, { useState, useEffect, useCallback, useRef } from "react";
import { Location } from "@/types";
import { escapeHtml } from "@/utils/sanitize";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ShieldAlert,
  Info,
  Bell,
  BellRing,
  Droplets,
  Mountain,
  Thermometer,
  Wind,
  CloudLightning,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  Database,
  Zap,
  CheckCircle2,
  Loader2,
  XCircle,
  ArrowRight,
  BellOff,
  BellPlus,
  Snowflake,
  Leaf,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Download,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  isPushSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendEmergencyNotification,
  shouldNotify,
} from "@/utils/pushNotifications";
import { addAlertToHistory } from "@/components/NotificationHistory";
import { supabase } from "@/integrations/supabase/client";
import {
  predictFlood,
  predictEarthquakeRisk,
  loadMLModels,
  getMLLoadError,
  type FloodPredictionInput,
  type EarthquakePredictionInput,
  type MLPrediction,
} from "../utils/mlModels";
import {
  translateDisasterTitle,
  translateDisasterDescription,
  translateSeverityGrade,
  localizeLocationName,
} from "@/utils/vernacularHelpers";

// ── Markdown renderer (for AI Brief) ──────────────────────────────────────────
const renderMarkdown = (text: string): React.ReactNode[] => {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];

  const inlineFormat = (
    line: string,
    key: string | number,
  ): React.ReactNode => {
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/);
    return (
      <span key={key}>
        {parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**"))
            return (
              <strong key={i} className="font-semibold text-foreground">
                {part.slice(2, -2)}
              </strong>
            );
          if (part.startsWith("*") && part.endsWith("*"))
            return (
              <em key={i} className="italic">
                {part.slice(1, -1)}
              </em>
            );
          if (part.startsWith("`") && part.endsWith("`"))
            return (
              <code
                key={i}
                className="px-1 py-0.5 bg-muted rounded text-xs font-mono"
              >
                {part.slice(1, -1)}
              </code>
            );
          return part;
        })}
      </span>
    );
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      nodes.push(<div key={i} className="h-1" />);
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(
        <h4 key={i} className="font-bold text-sm mt-3 mb-1 text-foreground">
          {inlineFormat(line.slice(4), "h")}
        </h4>,
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={i} className="font-bold text-base mt-2 mb-1 text-foreground">
          {inlineFormat(line.slice(3), "h")}
        </h3>,
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      nodes.push(
        <h2 key={i} className="font-bold text-lg mt-2 mb-1 text-foreground">
          {inlineFormat(line.slice(2), "h")}
        </h2>,
      );
      i++;
      continue;
    }
    if (line.match(/^[•\-*] /) || line.match(/^\d+[.)]/)) {
      const listItems: React.ReactNode[] = [];
      while (
        i < lines.length &&
        (lines[i].match(/^[•\-*] /) ||
          lines[i].match(/^\d+[.)]/) ||
          lines[i].trim() === "")
      ) {
        if (lines[i].trim() !== "") {
          const content = lines[i].replace(/^[•\-*] |^\d+[.)] /, "");
          listItems.push(
            <li key={i} className="ml-4 text-xs sm:text-sm leading-relaxed">
              {inlineFormat(content, i)}
            </li>,
          );
        }
        i++;
      }
      nodes.push(
        <ul
          key={`ul-${i}`}
          className="list-disc list-outside space-y-1 my-2 text-foreground/90"
        >
          {listItems}
        </ul>,
      );
      continue;
    }
    nodes.push(
      <p
        key={i}
        className="text-xs sm:text-sm leading-relaxed text-foreground/90"
      >
        {inlineFormat(line, i)}
      </p>,
    );
    i++;
  }
  return nodes;
};

import { EarlyAlert, fetchEarlyAlertsLocal } from "../utils/earlyAlertsLogic";

interface AlertMetadata {
  sources: string[];
  generatedAt: string;
  algorithmsUsed: string[];
  calculationSteps?: CalculationStep[];
}

interface CalculationStep {
  step: number;
  source: string;
  algorithm: string;
  status: "success" | "failed" | "no_alert";
  duration_ms: number;
  rawData?: Record<string, any>;
  result?: string;
  thresholds?: Record<string, any>;
}

interface EarlyAlertsProps {
  userLocation: Location | null;
  language?: string;
}

type CalcPhase =
  | "idle"
  | "fetching_weather"
  | "fetching_precipitation"
  | "fetching_seismic"
  | "fetching_gdacs"
  | "fetching_aqi"
  | "fetching_imd"
  | "analyzing"
  | "done";

const EarlyAlerts: React.FC<EarlyAlertsProps> = ({ userLocation, language = 'en' }) => {
  const t = {
    en: {
      title: "Early Disaster Warnings & Risk Analysis",
      subtitle: "Live Intelligence",
      compositeRisk: "Composite Area Risk",
      analyzing: "Analyzing real-time signals...",
      noAlerts: "No immediate disaster threats detected for your current location.",
      probability: "Probability",
      recommendation: "Recommendation",
      threatLevel: "Threat Level",
      fetchingWeather: "Fetching weather data",
      fetchingPrecip: "Fetching precipitation forecast",
      fetchingSeismic: "Querying seismic activity",
      checkingGlobal: "Checking global alerts",
      measuringAQI: "Measuring air quality",
      loadingAI: "Loading ML Neural Models",
      runningML: "Running ML inference",
      emergency: "Emergency",
      warning: "Warning",
      watch: "Watch",
      advisory: "Advisory",
      alertTriggered: "Alert Triggered",
      fetchFailed: "Fetch Failed",
      allClear: "All Clear",
      enableLocation: "Enable location to receive early warnings for floods, earthquakes, and extreme weather.",
      warnings: "Early Warnings",
    },
    hi: {
      title: "प्रारंभिक आपदा चेतावनी और जोखिम विश्लेषण",
      subtitle: "लाइव इंटेलिजेंस",
      compositeRisk: "समग्र क्षेत्र जोखिम",
      analyzing: "वास्तविक समय के संकेतों का विश्लेषण...",
      noAlerts: "आपके वर्तमान स्थान के लिए किसी तत्काल आपदा खतरे का पता नहीं चला है।",
      probability: "संभावना",
      recommendation: "सिफारिश",
      threatLevel: "खतरे का स्तर",
      fetchingWeather: "मौसम डेटा प्राप्त किया जा रहा है",
      fetchingPrecip: "वर्षा पूर्वानुमान प्राप्त करना",
      fetchingSeismic: "भूकंपीय गतिविधि की जाँच",
      checkingGlobal: "वैश्विक अलर्ट की जाँच",
      measuringAQI: "वायु गुणवत्ता मापना",
      loadingAI: "ML तंत्रिका मॉडल लोड हो रहा है",
      runningML: "ML अनुमान चल रहा है",
      emergency: "आपातकालीन",
      warning: "चेतावनी",
      watch: "निगरानी",
      advisory: "सलाह",
      alertTriggered: "अलर्ट सक्रिय",
      fetchFailed: "प्राप्ति विफल",
      allClear: "सब स्पष्ट",
      enableLocation: "बाढ़, भूकंप और अत्यधिक मौसम की चेतावनी के लिए स्थान सक्षम करें।",
      warnings: "प्रारंभिक चेतावनी",
    },
    ml: {
      title: "മുൻകൂർ ദുരന്ത മുന്നറിയിപ്പും അപകടസാധ്യതാ വിശകലനവും",
      subtitle: "തത്സമയ വിവരങ്ങൾ",
      compositeRisk: "മേഖലയിലെ മൊത്തം അപകടസാധ്യത",
      analyzing: "തത്സമയ സിഗ്നലുകൾ വിശകലനം ചെയ്യുന്നു...",
      noAlerts: "നിങ്ങളുടെ നിലവിലെ പ്രദേശത്ത് അടിയന്തര ദുരന്ത ഭീഷണികളൊന്നും കണ്ടെത്തിയിട്ടില്ല.",
      probability: "സാധ്യത",
      recommendation: "നിർദ്ദേശം",
      threatLevel: "ഭീഷണി നിലവാരം",
      fetchingWeather: "കാലാവസ്ഥാ ഡാറ്റ ശേഖരിക്കുന്നു",
      fetchingPrecip: "മഴയുടെ അളവ് കണക്കാക്കുന്നു",
      fetchingSeismic: "ഭൂകമ്പ സാധ്യത പരിശോധിക്കുന്നു",
      checkingGlobal: "ആഗോള മുന്നറിയിപ്പുകൾ പരിശോധിക്കുന്നു",
      measuringAQI: "വായു ഗുണനിലവാരം കണക്കാക്കുന്നു",
      loadingAI: "എഐ ന്യൂറൽ മോഡലുകൾ ലോഡ് ചെയ്യുന്നു",
      runningML: "എഐ പരിശോധന നടക്കുന്നു",
      emergency: "അടിയന്തരം",
      warning: "മുന്നറിയിപ്പ്",
      watch: "നിരീക്ഷണം",
      advisory: "നിർദ്ദേശം",
      alertTriggered: "മുന്നറിയിപ്പ് സജീവമായി",
      fetchFailed: "വിവരശേഖരണം പരാജയപ്പെട്ടു",
      allClear: "സുരക്ഷിതം",
      enableLocation: "വെള്ളപ്പൊക്കം, ഭൂകമ്പം, തീവ്ര കാലാവസ്ഥ എന്നിവയുടെ മുന്നറിയിപ്പ് ലഭിക്കാൻ ലൊക്കേഷൻ അനുവദിക്കുക.",
      warnings: "മുൻകൂർ മുന്നറിയിപ്പുകൾ",
    },
    ta: {
      title: "முன்கூட்டிய பேரிடர் எச்சரிக்கை மற்றும் இடர் பகுப்பாய்வு",
      subtitle: "நேரலை நுண்ணறிவு",
      compositeRisk: "பகுதி இடர் மதிப்பீடு",
      analyzing: "நிகழ்நேர சமிக்ஞைகள் பகுப்பாய்வு செய்யப்படுகின்றன...",
      noAlerts: "உங்கள் தற்போதைய பகுதியில் உடனடி பேரிடர் அச்சுறுத்தல்கள் எதுவும் கண்டறியப்படவில்லை.",
      probability: "நிகழ்தகவு",
      recommendation: "பரிந்துரை",
      threatLevel: "அச்சுறுத்தல் நிலை",
      fetchingWeather: "வானிலை தரவு பெறப்படுகிறது",
      fetchingPrecip: "மழைப்பொழிவு கணக்கிடப்படுகிறது",
      fetchingSeismic: "நில அதிர்வு ஆய்வு செய்யப்படுகிறது",
      checkingGlobal: "உலகளாவிய எச்சரிக்கைகள் சரிபார்க்கப்படுகின்றன",
      measuringAQI: "காற்றின் தரம் அளவிடப்படுகிறது",
      loadingAI: "ஏஐ நரம்பியல் மாதிரிகள் ஏற்றப்படுகின்றன",
      runningML: "ஏஐ ஆய்வு நடைபெறுகிறது",
      emergency: "அவசரம்",
      warning: "எச்சரிக்கை",
      watch: "கண்காணிப்பு",
      advisory: "ஆலோசனை",
      alertTriggered: "எச்சரிக்கை தூண்டப்பட்டது",
      fetchFailed: "பெறுதல் தோல்வியடைந்தது",
      allClear: "அனைத்தும் சீரானது",
      enableLocation: "வெள்ளம், நிலநடுக்கம், தீவிர வானிலை எச்சரிக்கைகளைப் பெற இருப்பிடத்தை இயக்கவும்.",
      warnings: "முன்கூட்டிய எச்சரிக்கைகள்",
    },
    te: {
      title: "ముందస్తు విపత్తు హెచ్చరికలు & ప్రమాద విశ్లేషణ",
      subtitle: "ప్రత్యక్ష సమాచారం",
      compositeRisk: "ప్రాంతీయ ప్రమాద అంచనా",
      analyzing: "రియల్-టైమ్ సిగ్నల్స్ విశ్లేషణ జరుగుతోంది...",
      noAlerts: "మీ ప్రస్తుత ప్రాంతానికి తక్షణ విపత్తు ముప్పు ఏదీ కనుగొనబడలేదు.",
      probability: "సంభావ్యత",
      recommendation: "సిఫార్సు",
      threatLevel: "ముప్పు స్థాయి",
      fetchingWeather: "వాతావరణ సమాచారం సేకరిస్తోంది",
      fetchingPrecip: "వర్షపాత అంచనా",
      fetchingSeismic: "భూకంపాల సమాచారం",
      checkingGlobal: "గ్లోబల్ హెచ్చరికలు",
      measuringAQI: "గాలి నాణ్యత",
      loadingAI: "ఏఐ మోడల్స్ లోడ్ అవుతున్నాయి",
      runningML: "ఏఐ విశ్లేషణ",
      emergency: "అత్యవసరం",
      warning: "హెచ్చరిక",
      watch: "నిఘా",
      advisory: "సలహా",
      alertTriggered: "హెచ్చరిక ప్రారంభమైంది",
      fetchFailed: "విఫలమైంది",
      allClear: "అంతా సురక్షితం",
      enableLocation: "వరదలు, భూకంపాల హెచ్చరికల కోసం స్థానాన్ని ప్రారంభించండి.",
      warnings: "ముందస్తు హెచ్చరికలు",
    },
    mr: {
      title: "पूर्व आपत्ती इशारे आणि जोखीम विश्लेषण",
      subtitle: "थेट माहिती",
      compositeRisk: "एकूण क्षेत्र जोखीम",
      analyzing: "रिअल-टाइम सिग्नलचे विश्लेषण...",
      noAlerts: "आपल्या सध्याच्या स्थानासाठी कोणताही तातडीचा धोका आढळला नाही.",
      probability: "संभाव्यता",
      recommendation: "शिफारस",
      threatLevel: "धोका पातळी",
      fetchingWeather: "हवामान डेटा प्राप्त करत आहे",
      fetchingPrecip: "पावसाचा अंदाज",
      fetchingSeismic: "भूकंपीय क्रियाकलाप तपासणी",
      checkingGlobal: "जागतिक इशारे तपासत आहे",
      measuringAQI: "हवेची गुणवत्ता मोजत आहे",
      loadingAI: "एआय मॉडेल्स लोड होत आहेत",
      runningML: "एआय विश्लेषण सुरू आहे",
      emergency: "आणीबाणी",
      warning: "इशारा",
      watch: "निरीक्षण",
      advisory: "सल्ला",
      alertTriggered: "इशारा सक्रिय",
      fetchFailed: "डेटा प्राप्त अयशस्वी",
      allClear: "सर्व सुरक्षित",
      enableLocation: "पूर, भूकंप आणि तीव्र हवामानाच्या इशाऱ्यांसाठी स्थान सक्षम करा.",
      warnings: "पूर्व इशारे",
    },
    gu: {
      title: "પ્રારંભિક આપત્તિ ચેતવણીઓ અને જોખમ વિશ્લેષણ",
      subtitle: "લાઇવ માહિતી",
      compositeRisk: "સમગ્ર વિસ્તારનું જોખમ",
      analyzing: "સિગ્નલોનું વિશ્લેષણ ચાલુ છે...",
      noAlerts: "તમારા વર્તમાન સ્થાન માટે કોઈ તાત્કાલિક જોખમ જણાયું નથી.",
      probability: "સંભાવના",
      recommendation: "ભલામણ",
      threatLevel: "જોખમ સ્તર",
      fetchingWeather: "હવામાન માહિતી મેળવી રહ્યું છે",
      fetchingPrecip: "વરસાદની આગાહી",
      fetchingSeismic: "ધરતીકંપ પ્રવૃત્તિ તપાસ",
      checkingGlobal: "વૈશ્વિક ચેતવણીઓ",
      measuringAQI: "હવાની ગુણવત્તા",
      loadingAI: "AI મોડેલ લોડ થઈ રહ્યું છે",
      runningML: "AI વિશ્લેષણ ચાલુ છે",
      emergency: "કટોકટી",
      warning: "ચેતવણી",
      watch: "નિરીક્ષણ",
      advisory: "સલાહ",
      alertTriggered: "ચેતવણી સક્રિય",
      fetchFailed: "માહિતી મેળવવામાં નિષ્ફળ",
      allClear: "બધું સુરક્ષિત",
      enableLocation: "પૂર, ધરતીકંપ માટે સ્થાન સક્ષમ કરો.",
      warnings: "પ્રારંભિક ચેતવણીઓ",
    },
    bn: {
      title: "আগাম দুর্যোগ সতর্কতা ও ঝুঁকি বিশ্লেষণ",
      subtitle: "লাইভ তথ্য",
      compositeRisk: "সামগ্রিক এলাকা ঝুঁকি",
      analyzing: "রিয়েল-টাইম সংকেত বিশ্লেষণ করা হচ্ছে...",
      noAlerts: "আপনার বর্তমান অবস্থানের জন্য কোনো তাৎক্ষণিক দুর্যোগের ঝুঁকি নেই।",
      probability: "সম্ভাবনা",
      recommendation: "সুপারিশ",
      threatLevel: "ঝুঁকির মাত্রা",
      fetchingWeather: "আবহাওয়া তথ্য আনা হচ্ছে",
      fetchingPrecip: "বৃষ্টিপাতের পূর্বাভাস",
      fetchingSeismic: "ভূমিকম্প সম্পর্কিত তথ্য",
      checkingGlobal: "বিশ্বব্যাপী সতর্কতা যাচাই",
      measuringAQI: "বায়ু মান পরিমাপ",
      loadingAI: "AI মডেল লোড হচ্ছে",
      runningML: "AI বিশ্লেষণ চলছে",
      emergency: "জরুরি",
      warning: "সতর্কতা",
      watch: "নজরদারি",
      advisory: "পরামর্শ",
      alertTriggered: "সতর্কতা সক্রিয়",
      fetchFailed: "তথ্য প্রাপ্তি ব্যর্থ",
      allClear: "সব ঠিক আছে",
      enableLocation: "বন্যা, ভূমিকম্প ও চরম আবহাওয়ার সতর্কতার জন্য অবস্থান সক্ষম করুন।",
      warnings: "আগাম সতর্কতা",
    },
    as: {
      title: "আগতীয়া দুৰ্যোগ সতৰ্কবাৰ্তা আৰু বিপদাশংকা বিশ্লেষণ",
      subtitle: "লাইভ তথ্য",
      compositeRisk: "সামগ্ৰিক অঞ্চলৰ বিপদাশংকা",
      analyzing: "তথ্য বিশ্লেষণ কৰা হৈছে...",
      noAlerts: "আপোনাৰ বৰ্তমান স্থানৰ বাবে কোনো তাৎক্ষণিক দুৰ্যোগ নাই।",
      probability: "সম্ভাৱনা",
      recommendation: "পৰামৰ্শ",
      threatLevel: "বিপদৰ মাত্ৰা",
      fetchingWeather: "বতৰৰ তথ্য লাভ কৰা হৈছে",
      fetchingPrecip: "বৰষুণৰ পূৰ্বাভাস",
      fetchingSeismic: "ভূমিকম্পৰ তথ্য",
      checkingGlobal: "বিশ্বব্যাপী সতৰ্কবাৰ্তা",
      measuringAQI: "বায়ুৰ গুণমান",
      loadingAI: "AI মডেল লোড হৈছে",
      runningML: "AI বিশ্লেষণ চলিছে",
      emergency: "জৰুৰীকালীন",
      warning: "সতৰ্কবাৰ্তা",
      watch: "নজৰদাৰী",
      advisory: "পৰামৰ্শ",
      alertTriggered: "সতৰ্কবাৰ্তা সক্ৰিয়",
      fetchFailed: "তথ্য পোৱা নগ'ল",
      allClear: "সকলো সুৰক্ষিত",
      enableLocation: "বানপানী, ভূমিকম্পৰ সতৰ্কবাৰ্তাৰ বাবে স্থান সক্ষম কৰক।",
      warnings: "আগতীয়া সতৰ্কবাৰ্তা",
    },
  };

  const activeT = (t as any)[language] || t.en;

  const getAlertUiStrings = (lang: string) => {
    const map: Record<string, any> = {
      ml: {
        atmosphericSecured: "അന്തരീക്ഷ സ്ഥിതി സുരക്ഷിതമാണ് | നിലവിൽ ഭീഷണികളില്ല",
        confidence: "വിശ്വാസ്യത",
        howCalculated: "വിവരങ്ങൾ കണക്കാക്കിയത് എങ്ങനെ",
        rawDataPoints: "ഡാറ്റാ വിവരങ്ങൾ",
        source: "ഉറവിടം",
        expires: "കാലാവധി",
        modelArchitecture: "മോഡൽ ആർക്കിടെക്ചറും യുക്തിയും",
        neuralNetHydrology: "ന്യൂറൽ നെറ്റ്‌വർക്ക് പ്രളയ അനുമാന മോഡൽ",
        seismicNet: "ഭൂകമ്പ തരംഗ വ്യാപന മോഡൽ",
        critical: "അതിതീവ്രം",
        nominal: "സാധാരണം",
        anomaly: "വ്യതിയാനം",
        stable: "സുരക്ഷിതം",
        telemetryProtocols: "ടെലിമെട്രി ഡാറ്റാ ഉറവിടങ്ങൾ",
        liveNodes: "സജീവ ഉറവിടങ്ങൾ",
        architecture: "സിസ്റ്റം ഘടന",
        checkpoint: "സമയരേഖ",
        prototypeFooter: "മെഷീൻ ലേണിംഗ് അധിഷ്ഠിത ദുരന്ത നിവാരണ സഹായ സംവിധാനം",
      },
      hi: {
        atmosphericSecured: "वायुमंडलीय स्थिति सामान्य | कोई सक्रिय खतरा नहीं",
        confidence: "सटीकता",
        howCalculated: "इसकी गणना कैसे की गई",
        rawDataPoints: "मूल डेटा बिंदु",
        source: "स्रोत",
        expires: "वैधता",
        modelArchitecture: "मॉडल संरचना एवं तर्क",
        neuralNetHydrology: "न्यूरल नेटवर्क जल विज्ञान मॉडल",
        seismicNet: "भूकंपीय प्रसार नेटवर्क",
        critical: "अति गंभीर",
        nominal: "सामान्य",
        anomaly: "विसंगति",
        stable: "स्थिर",
        telemetryProtocols: "टेलीमेट्री स्रोत प्रोटोकॉल",
        liveNodes: "सक्रिय नोड्स",
        architecture: "सिस्टम संरचना",
        checkpoint: "समय बिंदु",
        prototypeFooter: "मशीन लर्निंग संचालित निर्णय सहायता प्रणाली",
      },
      ta: {
        atmosphericSecured: "வளிமண்டலம் சீராக உள்ளது | அச்சுறுத்தல்கள் இல்லை",
        confidence: "துல்லியம்",
        howCalculated: "இது எவ்வாறு கணக்கிடப்பட்டது",
        rawDataPoints: "மூலத் தரவு",
        source: "மூலம்",
        expires: "காலாவதி",
        modelArchitecture: "மாதிரி கட்டமைப்பு",
        neuralNetHydrology: "நியூரல் நெட்வொர்க் மாதிரி",
        seismicNet: "நில அதிர்வு மாதிரி",
        critical: "அதிதீவிரம்",
        nominal: "சாதாரண நிலை",
        anomaly: "மாறுபாடு",
        stable: "நிலையானது",
        telemetryProtocols: "தொலைநிலை நெறிமுறைகள்",
        liveNodes: "செயலில் உள்ள முனையங்கள்",
        architecture: "கட்டமைப்பு",
        checkpoint: "நேரக்குறிப்பு",
        prototypeFooter: "இயந்திர கற்றல் வழிகாட்டல் அமைப்பு",
      },
      te: {
        atmosphericSecured: "వాతావరణం సురక్షితంగా ఉంది | ఎటువంటి ముప్పు లేదు",
        confidence: "ఖచ్చితత్వం",
        howCalculated: "ఇది ఎలా లెక్కించబడింది",
        rawDataPoints: "డేటా పాయింట్లు",
        source: "మూలం",
        expires: "ముగింపు",
        modelArchitecture: "మోడల్ ఆర్కిటెక్చర్",
        neuralNetHydrology: "న్యూరల్ నెట్‌వర్క్ జల నమూనా",
        seismicNet: "భూకంప వ్యాప్తి నమూనా",
        critical: "అతి తీవ్రం",
        nominal: "సాధారణం",
        anomaly: "అసాధారణం",
        stable: "స్థిరంగా ఉంది",
        telemetryProtocols: "టెలిమెట్రీ ప్రోటోకాల్స్",
        liveNodes: "క్రియాశీల నోడ్స్",
        architecture: "నిర్మాణం",
        checkpoint: "సమయ రికార్డు",
        prototypeFooter: "మెషిన్ లెర్నింగ్ ఆధారిత నిర్ణయ సహాయ వ్యవస్థ",
      },
      mr: {
        atmosphericSecured: "वातावरण सामान्य | कोणताही सक्रिय धोका नाही",
        confidence: "अचूकता",
        howCalculated: "हे कसे मोजले गेले",
        rawDataPoints: "मूळ डेटा",
        source: "स्रोत",
        expires: "कालबाह्य",
        modelArchitecture: "मॉडेल रचना",
        neuralNetHydrology: "न्यूरल नेटवर्क मॉडेल",
        seismicNet: "भूकंपीय मॉडेल",
        critical: "अति गंभीर",
        nominal: "सामान्य",
        anomaly: "विसंगती",
        stable: "स्थिर",
        telemetryProtocols: "टेलीमेट्री स्रोत",
        liveNodes: "थेट नोड्स",
        architecture: "रचना",
        checkpoint: "वेळ नोंद",
        prototypeFooter: "मशीन लर्निंग संचलित निर्णय प्रणाली",
      },
      gu: {
        atmosphericSecured: "વાતાવરણ સલામત છે | કોઈ સક્રિય ખતરો નથી",
        confidence: "ચોક્કસાઈ",
        howCalculated: "આ કેવી રીતે ગણવામાં આવ્યું",
        rawDataPoints: "મૂળ ડેટા",
        source: "સ્ત્રોત",
        expires: "સમાપ્તિ",
        modelArchitecture: "મોડેલ માળખું",
        neuralNetHydrology: "ન્યુરલ નેટવર્ક મોડેલ",
        seismicNet: "ધરતીકંપ મોડેલ",
        critical: "અતિ ગંભીર",
        nominal: "સામાન્ય",
        anomaly: "અસામાન્ય",
        stable: "સ્થિર",
        telemetryProtocols: "ટેલિમેટ્રી સ્ત્રોત",
        liveNodes: "જીવંત સ્ત્રોતો",
        architecture: "માળખું",
        checkpoint: "સમય રેકોર્ડ",
        prototypeFooter: "મશીન લર્નિંગ આધારિત નિર્ણય પ્રણાલી",
      },
      bn: {
        atmosphericSecured: "বায়ুমণ্ডল নিরাপদ | কোনো সক্রিয় হুমকি নেই",
        confidence: "নির্ভুলতা",
        howCalculated: "এটি কীভাবে গণনা করা হয়েছে",
        rawDataPoints: "মূল ডেটা",
        source: "উৎস",
        expires: "মেয়াদ",
        modelArchitecture: "মডেল আর্কিটেকচার",
        neuralNetHydrology: "নিউরাল নেটওয়ার্ক মডেল",
        seismicNet: "ভূমিকম্প প্রসারণ মডেল",
        critical: "অতি বিপজ্জনক",
        nominal: "স্বাভাবিক",
        anomaly: "অস্বাভাবিক",
        stable: "স্থির",
        telemetryProtocols: "টেলিমেট্রি উৎস",
        liveNodes: "লাইভ নোড",
        architecture: "গঠন",
        checkpoint: "সময় রেকর্ড",
        prototypeFooter: "মেশিন লার্নিং ভিত্তিক সিদ্ধান্ত সহায়তা ব্যবস্থা",
      },
      as: {
        atmosphericSecured: "বায়ুমণ্ডল সুৰক্ষিত | কোনো ভাবুকি নাই",
        confidence: "নিৰ্ভুলতা",
        howCalculated: "এইটো কেনেদৰে গণনা কৰা হৈছিল",
        rawDataPoints: "মূল তথ্য",
        source: "উৎস",
        expires: "ম্যাদ",
        modelArchitecture: "মডেল গঠন",
        neuralNetHydrology: "নিউৰেল নেটৱৰ্ক মডেল",
        seismicNet: "ভূমিকম্প প্ৰসাৰণ মডেল",
        critical: "অতি ভয়াৱহ",
        nominal: "স্বাভাৱিক",
        anomaly: "অস্বাভাৱিক",
        stable: "স্থিৰ",
        telemetryProtocols: "টেলিমেট্ৰি উৎস",
        liveNodes: "সক্ৰিয় নোড",
        architecture: "গাঁথনি",
        checkpoint: "সময় নথিপত্ৰ",
        prototypeFooter: "মেচিন লাৰ্নিং সহায়ক ব্যৱস্থা",
      },
      en: {
        atmosphericSecured: "Atmospheric Continuity Secured | No Active Threats",
        confidence: "Confidence",
        howCalculated: "How This Was Calculated",
        rawDataPoints: "Raw Data Points",
        source: "Source",
        expires: "Expires",
        modelArchitecture: "Model Architecture & Logic",
        neuralNetHydrology: "Neural Net Hydrology Model",
        seismicNet: "Seismic Propagation Net",
        critical: "Critical",
        nominal: "Nominal",
        anomaly: "Anomaly",
        stable: "Stable",
        telemetryProtocols: "Telemetry Source Protocols",
        liveNodes: "Live Nodes",
        architecture: "Architecture",
        checkpoint: "Checkpoint",
        prototypeFooter: "ML-Powered Decision Support Prototype",
      },
    };
    return map[lang] || map.en;
  };

  const alertExtra = getAlertUiStrings(language);

  const PHASES: {
    key: CalcPhase;
    label: string;
    icon: React.ReactNode;
    source: string;
  }[] = [
      {
        key: "fetching_weather",
        label: activeT.fetchingWeather,
        icon: <Thermometer className="h-4 w-4" />,
        source: "Open-Meteo API",
      },
      {
        key: "fetching_precipitation",
        label: activeT.fetchingPrecip,
        icon: <Droplets className="h-4 w-4" />,
        source: "Open-Meteo API",
      },
      {
        key: "fetching_seismic",
        label: activeT.fetchingSeismic,
        icon: <Mountain className="h-4 w-4" />,
        source: "USGS FDSNWS",
      },
      {
        key: "fetching_gdacs",
        label: activeT.checkingGlobal,
        icon: <AlertTriangle className="h-4 w-4" />,
        source: "GDACS",
      },
      {
        key: "fetching_aqi",
        label: activeT.measuringAQI,
        icon: <Leaf className="h-4 w-4" />,
        source: "Open-Meteo AQI",
      },
      {
        key: "fetching_imd",
        label: activeT.loadingAI,
        icon: <Bell className="h-4 w-4" />,
        source: "TensorFlow.js Engine",
      },
      {
        key: "analyzing",
        label: activeT.runningML,
        icon: <Zap className="h-4 w-4" />,
        source: "Neural Net Inference Pipeline",
      },
    ];

  const [alerts, setAlerts] = useState<EarlyAlert[]>([]);
  const [metadata, setMetadata] = useState<AlertMetadata | null>(null);
  const [floodModel, setFloodModel] = useState<any>(null);
  const [seismicModel, setSeismicModel] = useState<any>(null);
  const [landslideModel, setLandslideModel] = useState<any>(null);
  const [compositeRisk, setCompositeRisk] = useState<any>(null);

  // AI Brief State
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);

  const [loading, setLoading] = useState(false);
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  const [showSources, setShowSources] = useState(false);
  const [showCalcSteps, setShowCalcSteps] = useState(false);
  const [showMLModels, setShowMLModels] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [currentPhase, setCurrentPhase] = useState<CalcPhase>("idle");
  const [completedPhases, setCompletedPhases] = useState<Set<CalcPhase>>(
    new Set(),
  );
  const [calcProgress, setCalcProgress] = useState(0);
  const [notifPermission, setNotifPermission] = useState<string>("default");
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track previous alert ids+severity to compute trend badges
  const previousAlertsRef = useRef<Map<string, EarlyAlert["severity"]>>(
    new Map(),
  );

  // Check notification permission on mount
  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const handleEnableNotifications = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      toast.success("Notifications enabled!", {
        description: "You'll receive alerts for emergency warnings.",
      });
    } else if (perm === "denied") {
      toast.error("Notifications blocked", {
        description: "Enable them in your browser settings.",
      });
    }
  };

  // Send push notifications and save to history for emergency/warning alerts
  const notifyForAlerts = useCallback(
    (newAlerts: EarlyAlert[]) => {
      const criticalAlerts = newAlerts.filter(
        (a) =>
          (a.severity === "emergency" || a.severity === "warning") &&
          shouldNotify(a.id),
      );

      for (const alert of criticalAlerts) {
        const cleanTitle = alert.title.replace(/[^\w\s—:.°,()/-]/g, "").trim();
        const body = alert.description.slice(0, 200);

        // Save to history
        addAlertToHistory({
          id: alert.id,
          title: cleanTitle,
          body,
          type: alert.type,
          severity: alert.severity,
          confidence: alert.confidence,
          locationName: userLocation?.name || undefined,
        });

        // Send push notification if permission granted
        if (getNotificationPermission() === "granted") {
          sendEmergencyNotification({
            title: cleanTitle,
            body,
            type: alert.type,
            severity: alert.severity,
            confidence: alert.confidence,
          });
        }
      }
    },
    [userLocation],
  );



  // ── Severity order helper (for trend comparison) ────────────────────────
  const severityRank = (s: EarlyAlert["severity"]) =>
    ({ advisory: 0, watch: 1, warning: 2, emergency: 3 })[s] ?? 0;

  // Build a stable "type key" for cross-run comparison (same disaster type ≈ same ID)
  const alertTypeKey = (a: EarlyAlert) => a.type;

  // Track which phase index we're on for smooth sequential progress
  const phaseIndexRef = useRef(0);

  const fetchAlerts = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    setCompletedPhases(new Set());
    setCalcProgress(0);
    setCurrentPhase("idle");
    phaseIndexRef.current = 0;

    const { lat, lng } = userLocation;

    try {
      const data = await fetchEarlyAlertsLocal(lat, lng, (phase) => {
        // Mark the PREVIOUS phase as completed, set new phase as active
        setCompletedPhases((prev) => {
          const next = new Set(prev);
          // All phases before the current one are completed
          const phaseKeys = PHASES.map(p => p.key);
          const newIdx = phaseKeys.indexOf(phase as CalcPhase);
          if (newIdx >= 0) {
            for (let i = 0; i < newIdx; i++) {
              next.add(phaseKeys[i]);
            }
          }
          return next;
        });
        setCurrentPhase(phase as CalcPhase);
        // Smooth progress: each phase = one step
        const phaseKeys = PHASES.map(p => p.key);
        const idx = phaseKeys.indexOf(phase as CalcPhase);
        if (idx >= 0) {
          setCalcProgress(Math.round(((idx + 0.5) / PHASES.length) * 100));
        }
      });

      if (!data) throw new Error("No data received from local ML function");

      const generatedAlerts = data.alerts || [];

      // Mark all phases completed with a smooth final fill
      setCompletedPhases(new Set(PHASES.map((p) => p.key)));
      setCurrentPhase("done");
      setCalcProgress(100);
      
      // Let the final "100%" frame render so the user sees the completed pipeline
      await new Promise(r => setTimeout(r, 700));

      setAlerts(generatedAlerts);
      setFloodModel(data.floodModel);
      setSeismicModel(data.seismicModel);
      setLandslideModel(data.landslideModel);
      setCompositeRisk(data.compositeRisk);

      previousAlertsRef.current = new Map(
        generatedAlerts.map((a: EarlyAlert) => [alertTypeKey(a), a.severity]),
      );
      setMetadata(data.metadata || null);
      setLastFetched(new Date());
      notifyForAlerts(generatedAlerts);

      // Trigger AI Generation if there is moderate or higher risk
      if (data.compositeRisk?.score > 20 || generatedAlerts.length > 0) {
        generateAIBrief(data);
      } else {
        setAiBrief(null);
      }
    } catch (err: any) {
      console.error(
        "Failed to generate early alerts via local ML function:",
        err,
      );
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      setCurrentPhase("done");
      setCalcProgress(100);
      setAiBrief(
        "Failed to load environment data. Ensure a stable internet connection or check your API keys.",
      );
    } finally {
      setLoading(false);
    }
  }, [userLocation, notifyForAlerts]);

  const generateAIBrief = async (data: any) => {
    setGeneratingBrief(true);
    setAiBrief(null);
    try {
      const promptContext = `
        Current Time: ${new Date().toLocaleString()}
        Location: ${userLocation?.lat}, ${userLocation?.lng} (${userLocation?.name || "Unknown"})
        Active Alerts: ${data.alerts?.map((a: any) => `[${a.severity.toUpperCase()}] ${a.title}`).join(", ") || "None"}
        ML Flood Model P(flood): ${((data.floodModel?.probability || 0) * 100).toFixed(1)}%
        ML Seismic Risk P(quake): ${((data.seismicModel?.probability || 0) * 100).toFixed(1)}%
      `;

      const { supabase } = await import("@/integrations/supabase/client");
      const briefMessages = [
        {
          role: "system",
          content:
            "You are the Chief Resilience AI for India. You synthesize live machine learning environmental models into a concise, 2-paragraph executive brief for the user. Explicitly mention the AI models (like ANN Landslide, or TF.js Neural Network Flood & Earthquake Risk models) to show sophistication. End with 2 highly actionable bullet points. Keep it brief, professional, and urgent if needed. Do not use filler intro text.",
        },
        {
          role: "user",
          content: `Please provide an executive brief based on this live telemetry:\n${promptContext}`,
        },
      ];

      let aiDataResult;
      const { data: aiData, error } = await supabase.functions.invoke("v1-generate-ai-brief", {
        body: { messages: briefMessages }
      });

      if (error) {
        console.warn("Backend Brief Proxy failed or CORS blocked. Falling back to local direct fetch...", error);
        
        // Local Fallback for development routed securely through backend proxy or Vercel Serverless
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: briefMessages,
          }),
        });

        if (!res.ok) throw new Error(`Brief Fallback failed: ${res.status}`);
        const fallbackData = await res.json();
        aiDataResult = { message: fallbackData.choices[0].message.content };
      } else {
        aiDataResult = aiData;
      }

      if (!aiDataResult?.message) throw new Error("Empty AI response");
      setAiBrief(aiDataResult.message);
    } catch (e: any) {
      console.error("Failed to generate AI brief:", e);
      setAiBrief(e.message || "Failed to generate AI executive brief. Please check API keys.");
    } finally {
      setGeneratingBrief(false);
    }
  };

  const handleDownloadReport = () => {
    if (!lastFetched || !userLocation) return;

    // We'll create a professional PDF using html2pdf.js
    // We'll create a temporary element with a branded layout
    const element = document.createElement("div");
    element.style.padding = "40px";
    element.style.color = "#000";
    element.style.background = "#fff";
    element.style.fontFamily = "'Inter', sans-serif";
    element.style.width = "800px";

    const dateStr = new Date().toLocaleString();
    const locName = userLocation.name ? escapeHtml(userLocation.name) : "Unknown Location";

    element.innerHTML = `
      <div style="border-bottom: 3px solid #0f172a; padding-bottom: 24px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <h1 style="margin: 0; color: #0f172a; font-size: 32px; letter-spacing: -0.05em; font-weight: 800;">PREDICT<span style="color: #64748b;">AID</span></h1>
          <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Disaster Decision Support Architecture</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 10px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Doc ID: PA-${Date.now().toString(36).toUpperCase()}</p>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
        <div style="border-left: 1px solid #e2e8f0; padding-left: 20px;">
          <h3 style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Telemetry Window</h3>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">Generated: ${dateStr}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">Confidence Cycle: Real-time Analysis</p>
        </div>
        <div style="border-left: 1px solid #e2e8f0; padding-left: 20px;">
          <h3 style="margin: 0 0 8px 0; font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">Geospatial Context</h3>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #1e293b;">${locName}</p>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">COORDS: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}</p>
        </div>
      </div>

      ${aiBrief ? `
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px;">Chief Resilience Executive Brief</h2>
        <div style="line-height: 1.7; font-size: 13px; color: #334155; padding: 0 0 0 0;">
          ${escapeHtml(aiBrief).replace(/\n\n/g, '</div><div style="height: 16px;"></div><div style="line-height: 1.7; font-size: 13px; color: #334155;">').replace(/\n/g, '<br/>')}
        </div>
      </div>
      ` : ""}

      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px;">Active Threat Matrix</h2>
        ${alerts.length === 0 ? '<p style="font-style: italic; color: #94a3b8; font-size: 13px;">No priority alerts identified in current cycle.</p>' : `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="text-align: left;">
                <th style="padding: 12px 0; border-bottom: 2px solid #0f172a; font-size: 11px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Classification</th>
                <th style="padding: 12px 0; border-bottom: 2px solid #0f172a; font-size: 11px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">Analytical Description</th>
                <th style="padding: 12px 0; border-bottom: 2px solid #0f172a; font-size: 11px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Conf.</th>
              </tr>
            </thead>
            <tbody>
              ${alerts.map(a => `
                <tr>
                  <td style="padding: 20px 10px 20px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 25%;">
                    <div style="font-weight: 800; color: #0f172a; font-size: 13px; margin-bottom: 6px;">${escapeHtml(a.title)}</div>
                    <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">${escapeHtml(a.severity)}</div>
                  </td>
                  <td style="padding: 20px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
                    <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #475569;">${escapeHtml(a.description)}</p>
                    <p style="margin: 8px 0 0 0; font-size: 9px; font-family: monospace; color: #94a3b8;">MODEL_ID: ${escapeHtml(a.algorithm || "N/A")}</p>
                  </td>
                  <td style="padding: 20px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 10%; text-align: right;">
                    <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${(a.confidence * 100).toFixed(0)}%</div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        `}
      </div>

      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px;">Scientific Model Indicators</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          ${floodModel ? `
            <div>
              <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Neural Net Flood Prob.</h4>
              <div style="font-size: 32px; font-weight: 800; color: #0f172a;">${(floodModel.probability * 100).toFixed(1)}%</div>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #94a3b8;">Static Validation: AUC 0.94</p>
            </div>
          ` : ""}
          ${seismicModel ? `
            <div>
              <h4 style="margin: 0 0 10px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Seismic Risk Index</h4>
              <div style="font-size: 32px; font-weight: 800; color: #0f172a;">${(seismicModel.probability * 100).toFixed(1)}%</div>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #94a3b8;">TF.js Model Alpha</p>
            </div>
          ` : ""}
        </div>
      </div>

      <div style="margin-top: 80px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 9px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">
          Official Incident Document | SAHAYai Operations Core
        </div>
        <div style="font-size: 9px; color: #94a3b8; font-weight: 600; font-family: monospace;">
          Generated ${dateStr}<br/>
          HEX_${Date.now().toString(16).toUpperCase()}
        </div>
      </div>
    `;

    const opt = {
      margin: 10,
      filename: `PredictAid-Report-${dateStr.replace(/[/:\s]/g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Use html2pdf global from CDN
    // @ts-ignore
    window.html2pdf().from(element).set(opt).save();
    toast.success("PDF Report generated successfully");
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10 * 60 * 1000);
    return () => {
      clearInterval(interval);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [fetchAlerts]);

  const toggleExpand = (id: string) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "flood":
        return <Droplets className="h-5 w-5" />;
      case "earthquake":
        return <Mountain className="h-5 w-5" />;
      case "heatwave":
        return <Thermometer className="h-5 w-5" />;
      case "cold_wave":
        return <Thermometer className="h-5 w-5" />;
      case "cyclone":
        return <Wind className="h-5 w-5" />;
      case "thunderstorm":
        return <CloudLightning className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "emergency":
        return {
          border: "border-red-500/30 dark:border-red-500/20",
          bg: "bg-red-500/10 dark:bg-red-500/5 backdrop-blur-xl",
          badge: "bg-red-500 text-white",
          icon: <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />,
          glow: "border-transparent shadow-none",
          label: activeT.emergency.toUpperCase(),
        };
      case "warning":
        return {
          border: "border-amber-500/30 dark:border-amber-500/20",
          bg: "bg-amber-500/10 dark:bg-amber-500/5 backdrop-blur-xl",
          badge: "bg-amber-500 text-black",
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          glow: "border-transparent shadow-none",
          label: activeT.warning.toUpperCase(),
        };
      case "watch":
        return {
          border: "border-emerald-500/30 dark:border-emerald-500/20",
          bg: "bg-emerald-500/10 dark:bg-emerald-500/5 backdrop-blur-xl",
          badge: "bg-emerald-500 text-white",
          icon: <Bell className="h-5 w-5 text-emerald-500" />,
          glow: "border-transparent shadow-none",
          label: activeT.watch.toUpperCase(),
        };
      default:
        return {
          border: "border-slate-400/30",
          bg: "bg-slate-400/5 backdrop-blur-sm",
          badge: "bg-slate-400 text-white",
          icon: <Info className="h-5 w-5 text-slate-400" />,
          glow: "",
          label: activeT.advisory.toUpperCase(),
        };
    }
  };

  const getStepStatusConfig = (status: string) => {
    switch (status) {
      case "success":
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
          label: activeT.alertTriggered,
          badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        };
      case "failed":
        return {
          icon: <XCircle className="h-3.5 w-3.5 text-red-400" />,
          label: activeT.fetchFailed,
          badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
        };
      default:
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
          label: activeT.allClear,
          badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        };
    }
  };

  if (!userLocation) {
    return (
      <Card className="p-10 border-dashed border-muted-foreground/20 bg-muted/5 backdrop-blur-sm transition-smooth hover:border-primary/40">
        <div className="flex flex-col items-center text-center gap-4 text-muted-foreground">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-subtle">
            <BellRing className="h-8 w-8 text-primary/60" />
          </div>
          <p className="text-sm font-medium leading-relaxed max-w-[280px]">
            {activeT.enableLocation}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
          <h2 className="text-base sm:text-lg font-bold text-foreground truncate">
            {activeT.warnings}
          </h2>
          {alerts.length > 0 && (
            <Badge
              variant="outline"
              className="ml-1 text-[10px] sm:text-xs flex-shrink-0"
            >
              {alerts.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Notification toggle */}
          {isPushSupported() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEnableNotifications}
              className="h-8 gap-1.5 text-xs"
              title={
                notifPermission === "granted"
                  ? "Notifications enabled"
                  : "Enable notifications"
              }
            >
              {notifPermission === "granted" ? (
                <>
                  <Bell className="h-3.5 w-3.5 text-green-500" />
                  <span className="hidden sm:inline text-green-600">On</span>
                </>
              ) : notifPermission === "denied" ? (
                <>
                  <BellOff className="h-3.5 w-3.5 text-red-400" />
                  <span className="hidden sm:inline text-red-400">Blocked</span>
                </>
              ) : (
                <>
                  <BellPlus className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">Enable Alerts</span>
                </>
              )}
            </Button>
          )}
          {lastFetched && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastFetched.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadReport}
            disabled={loading || !lastFetched}
            className="h-8 gap-2 px-3 text-xs font-bold text-primary hover:bg-primary/10 transition-smooth group"
            title="Download Professional PDF Report"
          >
            <Download className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline italic tracking-tight">PDF Export</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAlerts}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Push notification prompt - Skinny & Professional */}
      {isPushSupported() && notifPermission === "default" && !loading && (
        <div className="flex items-center justify-between gap-3 p-3 apple-glass rounded-xl animate-fade-in group shadow-none border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BellRing className="h-4 w-4 text-primary" />
            </div>
            <p className="text-[11px] font-bold text-foreground uppercase tracking-tight">
              Enable Real-time Emergency Intelligence
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEnableNotifications}
            className="text-[10px] h-7 px-3 font-black bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 uppercase"
          >
            Authorize
          </Button>
        </div>
      )}

      {/* ═══ LIVE CALCULATION PROGRESS ═══ */}
      {loading && (
        <div className="p-5 apple-glass rounded-2xl space-y-4 overflow-hidden relative shadow-none border border-primary/5 animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">
                  ML Diagnostic Pipeline
                </span>
                <span className="text-[10px] font-mono text-primary/60 font-bold tabular-nums">
                  {Math.round(calcProgress)}%
                </span>
              </div>
              <div className="h-1 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/50 rounded-full"
                  style={{
                    width: `${calcProgress}%`,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {PHASES.map((phase, idx) => {
              const isCompleted = completedPhases.has(phase.key);
              const isActive = currentPhase === phase.key;

              return (
                <div
                  key={phase.key}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg border ${
                    isActive
                      ? "bg-primary/5 dark:bg-primary/10 border-primary/20 shadow-none"
                      : isCompleted
                        ? "bg-slate-50 dark:bg-muted/30 border-slate-200 dark:border-transparent"
                        : "bg-transparent border-transparent"
                  }`}
                  style={{
                    opacity: isActive ? 1 : isCompleted ? 1 : 0.35,
                    transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <div
                    className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full"
                    style={{
                      backgroundColor: isCompleted
                        ? 'rgba(34, 197, 94, 0.2)'
                        : isActive
                          ? 'hsl(var(--primary) / 0.2)'
                          : 'hsl(var(--muted) / 0.5)',
                      transition: 'background-color 0.4s ease',
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500" style={{ animation: 'fade-in 0.3s ease-out' }} />
                    ) : isActive ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    ) : (
                      <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[11px] font-bold uppercase tracking-wider"
                      style={{
                        color: isActive ? 'hsl(var(--primary))' : undefined,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {phase.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground/60 font-mono truncate">
                      {phase.source}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No alerts - Clean line */}
      {
        !loading && alerts.length === 0 && (
          <div
            className="flex items-center gap-3 p-4 apple-glass rounded-xl shadow-none border border-primary/10"
            style={{ animation: 'fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-bold text-primary dark:text-muted-foreground uppercase tracking-[0.1em]">
              {alertExtra.atmosphericSecured}
            </span>
          </div>
        )
      }

      {/* Alert Cards */}
      {
        alerts.filter((alert) => alert.severity !== "watch").map((alert, idx) => {
          const config = getSeverityConfig(alert.severity);
          const isExpanded = expandedAlerts.has(alert.id);

          return (
            <Card
              key={alert.id}
              className={`overflow-hidden shadow-none apple-glass ${config.border} ${config.bg} ${config.glow}`}
              style={{
                animation: `fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.12}s both`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleExpand(alert.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${config.badge}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {alertExtra.confidence}: {(alert.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground leading-tight">
                      {translateDisasterTitle(alert.title, language as any)}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {translateDisasterDescription(alert.description, language as any)}
                    </p>
                  </div>
                  <div className="flex-shrink-0" style={{ transition: 'transform 0.2s ease' }}>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div
                  className="px-4 pb-4 border-t border-border/30 pt-3 space-y-3"
                  style={{ animation: 'fade-in 0.3s ease-out' }}
                >
                  <p className="text-sm text-foreground">{translateDisasterDescription(alert.description, language as any)}</p>

                  {/* Algorithm details */}
                  <div className="bg-primary/5 dark:bg-background/50 rounded-lg p-3 space-y-2 border border-primary/10 dark:border-transparent">
                    <div className="flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary dark:text-foreground">
                        {alertExtra.howCalculated}
                      </span>
                    </div>
                    <p className="text-xs text-primary/60 dark:text-muted-foreground leading-relaxed">
                      {alert.algorithm}
                    </p>
                  </div>

                  {/* Data points */}
                  <div className="bg-primary/5 dark:bg-background/50 rounded-lg p-3 border border-primary/10 dark:border-transparent">
                    <span className="text-xs font-semibold text-primary dark:text-foreground block mb-1.5">
                      {alertExtra.rawDataPoints}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(alert.dataPoints).map(([key, value]) => (
                        <div key={key} className="text-xs">
                          <span className="text-muted-foreground">{key}: </span>
                          <span className="font-mono text-foreground">
                            {typeof value === "number"
                              ? value.toFixed(2)
                              : JSON.stringify(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Source & time */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{alertExtra.source}: {alert.source}</span>
                    <span>
                      {alertExtra.expires}:{" "}
                      {new Date(alert.expiresAt).toLocaleString(language === 'en' ? 'en-IN' : `${language}-IN`, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          );
        })
      }

      {/* ═══ MACHINE LEARNING MODELS ═══ */}
      {!loading && (floodModel || seismicModel || compositeRisk) && (
        <Collapsible
          open={showMLModels}
          onOpenChange={setShowMLModels}
          className="mb-4"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-[10px] font-black tracking-[0.2em] gap-2 border-primary/20 text-primary bg-primary/10 hover:bg-primary/20 uppercase transition-all"
            >
              <Database className="h-3 w-3" />
              {alertExtra.modelArchitecture}
              {showMLModels ? (
                <ChevronUp className="h-3 w-3 ml-auto opacity-40" />
              ) : (
                <ChevronDown className="h-3 w-3 ml-auto opacity-40" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-2">
              {getMLLoadError() && (
                <div className="p-2 mb-2 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-600 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                  <span>ML Error: {getMLLoadError()}</span>
                </div>
              )}

              {floodModel && (
                <div className="p-4 bg-white/40 dark:bg-slate-950/20 border border-primary/10 rounded-xl space-y-2 group transition-all hover:bg-white/60">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-teal-500/10 flex items-center justify-center">
                      <Droplets className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
                      {alertExtra.neuralNetHydrology}
                    </span>
                    <Badge
                      variant="outline"
                      className={`ml-auto text-[9px] font-black uppercase tracking-widest ${floodModel.isFlood ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-primary/10 text-primary border-primary/20"}`}
                    >
                      {floodModel.isFlood ? alertExtra.critical : alertExtra.nominal}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    TF.js 10-feature Neural Network Model:{" "}
                    <span className="font-mono">
                      AUC-ROC: {floodModel.metrics?.auc_roc != null ? floodModel.metrics.auc_roc.toFixed(4) : "N/A"}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Probability:{" "}
                    <span className="font-mono">
                      {((floodModel.probability || 0) * 100).toFixed(1)}%
                    </span>{" "}
                    | Features:{" "}
                    <span className="font-mono">
                      Rainfall, Humidity, Pressure, Wind
                    </span>
                  </p>
                </div>
              )}

              {seismicModel && (
                <div className="p-4 bg-white/40 dark:bg-slate-950/20 border border-primary/10 rounded-xl space-y-2 group transition-all hover:bg-white/60">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Mountain className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
                      {alertExtra.seismicNet}
                    </span>
                    <Badge
                      variant="outline"
                      className={`ml-auto text-[9px] font-black uppercase tracking-widest ${seismicModel.isAnomaly ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-primary/10 text-primary border-primary/20"}`}
                    >
                      {seismicModel.isAnomaly ? alertExtra.anomaly : alertExtra.stable}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1">
                    TF.js 10-feature Neural Network Model:{" "}
                    <span className="font-mono">
                      AUC-ROC: {seismicModel.metrics?.auc_roc != null ? seismicModel.metrics.auc_roc.toFixed(4) : "N/A"}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Probability:{" "}
                    <span className="font-mono">
                      {((seismicModel.probability || 0) * 100).toFixed(1)}%
                    </span>{" "}
                    | Features:{" "}
                    <span className="font-mono">
                      Magnitude, Depth, Event Count
                    </span>
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Data Sources Footer */}
      {metadata && (
        <Collapsible open={showSources} onOpenChange={setShowSources}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-[9px] font-bold text-muted-foreground/40 hover:text-muted-foreground gap-2 uppercase tracking-[0.2em] py-8"
            >
              <Database className="h-3 w-3" />
              {alertExtra.telemetryProtocols}
              {showSources ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 bg-white/60 dark:bg-slate-950/40 border border-primary/10 rounded-xl space-y-3 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-primary/60 uppercase">{alertExtra.liveNodes}</p>
                  <p className="text-[10px] text-primary/80 leading-relaxed font-mono">{metadata.sources.join(" • ")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-primary/60 uppercase">{alertExtra.architecture}</p>
                  <p className="text-[10px] text-primary/80 leading-relaxed font-mono">{metadata.algorithmsUsed.join(" • ")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-primary/60 uppercase">{alertExtra.checkpoint}</p>
                  <p className="text-[10px] text-primary/80 font-mono">{new Date(metadata.generatedAt).toLocaleString(language === 'en' ? 'en-IN' : `${language}-IN`)}</p>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/60">
        <ShieldAlert className="h-3 w-3" />
        <span>{alertExtra.prototypeFooter}</span>
      </div>
    </div>
  );
};

export default EarlyAlerts;
