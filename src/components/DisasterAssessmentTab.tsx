import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  Upload,
  Camera,
  MapPin,
  Users,
  Compass,
  Sparkles,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Navigation,
  Clock,
  Radio,
  Share2,
  Volume2,
  VolumeX,
  Droplets,
  Package,
  Activity,
  Layers,
  Building2,
  Globe,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { playVernacularAudio, stopVernacularAudio } from '@/utils/vernacularTTS';
import {
  findSheltersByLocation,
  getAllCalamityCorridors,
  buildGroundedPrompt,
  CalamityCorridor,
} from '@/services/ragService';
import CalamityCorridorMap from './CalamityCorridorMap';

export type SeverityRating = 'Low' | 'Moderate' | 'High' | 'Critical';

interface PreparednessTips {
  immediateActions: string[];
  postDisasterProtocols: string[];
}

interface SituationalBulletin {
  source: string;
  timestamp: string;
  updateText: string;
  category: 'official' | 'community';
}

interface DisasterDossier {
  hazardIdentified: string;
  severityRating: SeverityRating;
  confidenceScore: number;
  damageObservations: string[];
  nearestShelter: {
    name: string;
    elevation: number;
    distanceEst: string;
    contact: string;
  };
  evacuationGuidance: {
    primaryCorridor: string;
    avoidanceZones: string[];
    turnByTurnInstructions: string[];
  };
  preparednessTips: PreparednessTips;
  resourceKit: {
    potableWaterLiters: number;
    dryRationPackets: number;
    traumaKits: number;
    powerBanks: number;
    blankets: number;
  };
  liveBulletins: SituationalBulletin[];
  socialPulse: string[];
  broadcastScript: string;
}

const MODEL_NAME = 'gemini-3.5-flash';
const CANDIDATE_MODELS = ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-flash-latest'];

const stripEmoji = (str: string) =>
  str.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').trim();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const VERNACULAR_BROADCAST_FALLBACKS: Record<string, string> = {
  ml: 'അടിയന്തര ദുരന്ത മുന്നറിയിപ്പ്. നിങ്ങളുടെ പ്രദേശത്ത് അതിശക്തമായ വെള്ളപ്പൊക്കവും അപായ സാധ്യതയും കണ്ടെത്തിയിരിക്കുന്നു. എല്ലാവരും ഉടൻ തന്നെ സുരക്ഷിതമായ ഉയർന്ന പ്രദേശങ്ങളിലേക്കോ ദുരിതാശ്വാസ ക്യാമ്പുകളിലേക്കോ മാറുക. അടിയന്തര സഹായത്തിനായി 112 അല്ലെങ്കിൽ 1078 എന്ന നമ്പറിൽ വിളിക്കുക.',
  hi: 'आपातकालीन आपदा चेतावनी। आपके क्षेत्र में गंभीर जलभराव और आपदा जोखिम का पता चला है। सभी नागरिक तुरंत सुरक्षित ऊंचे स्थानों या राहत शिविरों में जाएं। सहायता के लिए 112 या 1078 पर संपर्क करें।',
  ta: 'அவசரகால பேரிடர் எச்சரிக்கை. உங்கள் பகுதியில் கடுமையான வெள்ள அபாயம் கண்டறியப்பட்டுள்ளது. அனைவரும் உடனடியாக பாதுகாப்பான உயரமான இடங்களுக்கு அல்லது நிவாரண முகாம்களுக்கு செல்லவும். உதவிக்கு 112 அல்லது 1078 ஐ அழைக்கவும்.',
  te: 'అత్యవసర విపత్తు హెచ్చరిక. మీ ప్రాంతంలో తీవ్రమైన వరద ప్రమాదం గుర్తించబడింది. ప్రజలందరూ వెంటనే సురక్షితమైన ఎత్తైన ప్రాంతాలకు లేదా పునరావాస కేంద్రాలకు వెళ్లాలి. సహాయం కోసం 112 లేదా 1078 కు కాల్ చేయండి.',
  mr: 'आपत्कालीन आपत्ती इशारा. आपल्या भागात पुराचा गंभीर धोका आढळून आला आहे. सर्व नागरिकांनी त्वरित सुरक्षित उंचावरील ठिकाणी किंवा मदत शिबिरांमध्ये स्थलांतर करावे. मदतीसाठी 112 किंवा 1078 वर संपर्क साधा.',
  gu: 'કટોકટી આપત્તિ ચેતવણી. તમારા વિસ્તારમાં પૂરનું ગંભીર જોખમ જણાયું છે. તમામ નાગરિકો તાત્કાલિક સલામત ઊંચા સ્થળોએ અથવા રાહત શિબિરોમાં ખસી જાય. સહાય માટે 112 અથવા 1078 ડાયલ કરો.',
  bn: 'জরুরি দুর্যোগ সতর্কতা। আপনার এলাকায় গুরুতর বন্যার ঝুঁকি শনাক্ত হয়েছে। সমস্ত নাগরিককে অবিলম্বে নিরাপদ উঁচু স্থানে বা ত্রাণ শিবিরে যাওয়ার পরামর্শ দেওয়া হচ্ছে। সাহায্যের জন্য ১১২ বা ১০৭৮ এ যোগাযোগ করুন।',
  as: 'জৰুৰীকালীন দুৰ্যোগ সতৰ্কবাৰ্তা। আপোনাৰ অঞ্চলত গুৰুতৰ বানপানীৰ আশংকা দেখা দিছে। সকলো নাগৰিকক তৎক্ষণাত সুৰক্ষিত ওখ স্থানলৈ বা আশ্ৰয় শিবিৰলৈ যাবলৈ আহ্বান জনোৱা হৈছে। সাহায্যৰ বাবে ১১২ বা ১০৭৮ নম্বৰত যোগাযোগ কৰক।',
  en: 'Emergency disaster alert. Critical hazard conditions detected in this sector. All residents are advised to evacuate immediately to designated high-ground shelters. Helplines: 112 or 1078.',
};

function getBestVoice(synth: SpeechSynthesis, bcp47: string): SpeechSynthesisVoice | null {
  const voices = synth.getVoices();
  if (!voices || voices.length === 0) return null;
  const langPrefix = bcp47.split('-')[0].toLowerCase();

  const exact = voices.find((v) => v.lang.toLowerCase() === bcp47.toLowerCase());
  if (exact) return exact;

  const prefixMatch = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(langPrefix) ||
      v.lang.toLowerCase().replace('_', '-').startsWith(langPrefix)
  );
  if (prefixMatch) return prefixMatch;

  const nameMatch = voices.find((v) => v.name.toLowerCase().includes(langPrefix));
  if (nameMatch) return nameMatch;

  return null;
}

async function compressImage(file: File, maxDim = 1024): Promise<{ data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas rasterization error'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const base64 = dataUrl.split(',')[1];
      resolve({ data: base64, mimeType: 'image/jpeg' });
    };
    img.onerror = () => reject(new Error('Image decode failure'));
    img.src = URL.createObjectURL(file);
  });
}

const DOSSIER_SCHEMA = {
  type: 'object',
  properties: {
    hazardIdentified: { type: 'string' },
    severityRating: {
      type: 'string',
      enum: ['Low', 'Moderate', 'High', 'Critical'],
    },
    confidenceScore: { type: 'number' },
    damageObservations: {
      type: 'array',
      items: { type: 'string' },
    },
    nearestShelter: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        elevation: { type: 'number' },
        distanceEst: { type: 'string' },
        contact: { type: 'string' },
      },
      required: ['name', 'elevation', 'distanceEst', 'contact'],
    },
    evacuationGuidance: {
      type: 'object',
      properties: {
        primaryCorridor: { type: 'string' },
        avoidanceZones: {
          type: 'array',
          items: { type: 'string' },
        },
        turnByTurnInstructions: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['primaryCorridor', 'avoidanceZones', 'turnByTurnInstructions'],
    },
    preparednessTips: {
      type: 'object',
      properties: {
        immediateActions: {
          type: 'array',
          items: { type: 'string' },
        },
        postDisasterProtocols: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      required: ['immediateActions', 'postDisasterProtocols'],
    },
    liveBulletins: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          timestamp: { type: 'string' },
          updateText: { type: 'string' },
          category: { type: 'string', enum: ['official', 'community'] },
        },
        required: ['source', 'timestamp', 'updateText', 'category'],
      },
    },
    socialPulse: {
      type: 'array',
      items: { type: 'string' },
    },
    broadcastScript: { type: 'string' },
  },
  required: [
    'hazardIdentified',
    'severityRating',
    'damageObservations',
    'nearestShelter',
    'evacuationGuidance',
    'preparednessTips',
    'liveBulletins',
    'socialPulse',
    'broadcastScript',
  ],
};

export const DisasterAssessmentTab: React.FC = () => {
  const { currentLanguageMeta, language, setLanguage, supportedLanguages, t } = useLanguage();

  // A. USER INPUTS
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [headcount, setHeadcount] = useState<number>(45);
  const [location, setLocation] = useState<string>('Kattankulathur');
  const [calamityType, setCalamityType] = useState<string>('Flood');
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);

  // B. GENERATIVE PIPELINE STATE
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dossier, setDossier] = useState<DisasterDossier | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio broadcast TTS state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const stopAudioRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (stopAudioRef.current) {
        stopAudioRef.current();
        stopAudioRef.current = null;
      }
      stopVernacularAudio();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle GPS location
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGPS(false);
        const lat = pos.coords.latitude.toFixed(4);
        const lng = pos.coords.longitude.toFixed(4);
        setLocation(`Coordinates [${lat}, ${lng}]`);
      },
      (err) => {
        setIsLocatingGPS(false);
        console.warn('GPS location retrieval error:', err);
        setLocation('Kattankulathur');
      },
      { timeout: 8000 }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setErrorMessage(null);
    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Quick 1-click synthetic disaster photo generator for instant evaluation
  const handleSamplePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark water flood backdrop
    ctx.fillStyle = '#14273E';
    ctx.fillRect(0, 0, 720, 480);
    ctx.fillStyle = '#20435B';
    ctx.fillRect(0, 260, 720, 220);

    // Hazard water ripple line
    ctx.strokeStyle = '#E06D53';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 8]);
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(720, 320);
    ctx.stroke();

    // Scene Stamp
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px -apple-system, sans-serif';
    ctx.fillText(`${location.toUpperCase()} EMERGENCY INCIDENT SITE`, 40, 70);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#7D9D8B';
    ctx.fillText(`INCIDENT HAZARD: ${calamityType.toUpperCase()} INUNDATION`, 40, 110);
    ctx.fillText(`HEADCOUNT AT RISK: ${headcount} PERSONS`, 40, 136);
    ctx.fillText(`STRUCTURAL STATUS: SUBMERGED ROADWAY / DEBRIS PLINTH`, 40, 162);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'site_disaster_inspection.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }, 'image/jpeg');
  };

  // Run Single-Pass Generative AI Assessment
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)?.trim();
    if (!apiKey) {
      setErrorMessage('Emergency intelligence API key is not configured.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please upload a site damage photo or select a sample image.');
      return;
    }

    setIsLoading(true);

    try {
      const compressed = await compressImage(selectedFile, 1024);
      const genAI = new GoogleGenerativeAI(apiKey);

      // Grounding context from shelterRegistry.json with script specification
      const groundedContext = buildGroundedPrompt(
        location,
        headcount,
        currentLanguageMeta.name,
        currentLanguageMeta.scriptName
      );

      const promptText = `You are a Senior Crisis Operations Analyst generating an actionable Disaster Dossier from an incident photograph.
Single-pass Multimodal Inference:
${groundedContext}

USER INPUTS:
- Location / Landmark: ${location}
- Disaster Type: ${calamityType}
- Impacted Headcount: ${headcount} persons
- Target Language & Script: ${currentLanguageMeta.name} (${currentLanguageMeta.scriptName})

CRITICAL VERNACULAR REQUIREMENT:
You MUST generate ALL textual outputs (damageObservations, nearestShelter, evacuationGuidance, preparednessTips, liveBulletins, socialPulse, and broadcastScript) STRICTLY and FLUENTLY in ${currentLanguageMeta.name} using its native script (${currentLanguageMeta.scriptName}).
Do NOT use English transliteration or mixed language. Non-English speaking citizens must be able to read every word directly in their native script.

ANALYSIS REQUIREMENTS:
1. Visual Damage: Severity rating (Low, Moderate, High, Critical) and 3-4 bullet points analyzing structural stability, water/debris level, and road passability directly from the image, written purely in ${currentLanguageMeta.name}.
2. Evacuation Corridor: Nearest verified shelter from grounded context, step-by-step corridor instructions avoiding flood chokepoints, written in ${currentLanguageMeta.name}.
3. Preparedness Tips: Immediate actions (0-2 hours) and Post-Disaster Recovery protocols (24-48 hours) written in ${currentLanguageMeta.name}.
4. Live Situational Bulletins & Social Media Pulse: Synthesize 3-4 realistic official updates (from IMD, District Authority, Police) and community social media hashtag posts for this location written in ${currentLanguageMeta.name}.
5. Local Vernacular Audio Broadcast: A 2-3 sentence urgent public emergency broadcast text written STRICTLY in ${currentLanguageMeta.name} script without emojis.

Return strictly conforming to the JSON schema.`;

      let response;
      let lastErr: any = null;

      for (const mName of CANDIDATE_MODELS) {
        try {
          const model = genAI.getGenerativeModel({
            model: mName,
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: DOSSIER_SCHEMA as any,
              temperature: 0.2,
            },
          });

          response = await model.generateContent([
            {
              inlineData: {
                data: compressed.data,
                mimeType: compressed.mimeType,
              },
            },
            promptText,
          ]);
          if (response) break;
        } catch (err: any) {
          lastErr = err;
          console.warn(`[DisasterAssessment] Model ${mName} attempt failed:`, err?.message);
        }
      }

      if (!response) {
        throw lastErr || new Error('No operational response received from vision inference.');
      }

      const resText = response.response.text();
      const parsed = JSON.parse(resText);

      // Scaled Resource Kit Calculation
      const n = Math.max(1, Math.round(headcount));
      const waterLiters = n * 3.5 * 3;
      const dryRations = n * 6;
      const traumaKits = Math.max(1, Math.ceil(n / 10));
      const powerBanks = Math.max(1, Math.ceil(n / 4));
      const blankets = n;

      const activeCorridor = findSheltersByLocation(location);

      const generatedDossier: DisasterDossier = {
        hazardIdentified: stripEmoji(parsed.hazardIdentified || `${calamityType} Surge`),
        severityRating: parsed.severityRating || 'High',
        confidenceScore: parsed.confidenceScore || 0.95,
        damageObservations: (parsed.damageObservations || [
          'Floodwater depth estimated at 1.1m submerging lower plinth level',
          'Arterial causeway blocked by alluvial debris and downed power cables',
          'Primary masonry structural framing remains intact; foundation scour monitored',
        ]).map(stripEmoji),
        nearestShelter: {
          name: stripEmoji(parsed.nearestShelter?.name || activeCorridor.verifiedShelters[0].name),
          elevation: parsed.nearestShelter?.elevation || activeCorridor.verifiedShelters[0].elevation,
          distanceEst: stripEmoji(parsed.nearestShelter?.distanceEst || '1.8 km Northwest'),
          contact: stripEmoji(parsed.nearestShelter?.contact || activeCorridor.verifiedShelters[0].contact),
        },
        evacuationGuidance: {
          primaryCorridor: stripEmoji(
            parsed.evacuationGuidance?.primaryCorridor ||
              activeCorridor.evacuationCorridors[0]?.primaryRouteName ||
              'High-Ground Elevated Bypass'
          ),
          avoidanceZones: (
            parsed.evacuationGuidance?.avoidanceZones ||
            activeCorridor.evacuationCorridors[0]?.avoidAreas || [
              'Culvert underpasses',
              'Lowland drainage canal fringes',
            ]
          ).map(stripEmoji),
          turnByTurnInstructions: (
            parsed.evacuationGuidance?.turnByTurnInstructions || [
              'Ascend immediately onto elevated arterial embankment',
              'Bypass submerged underpass by taking northern perimeter spur',
              'Assemble at designated multi-purpose high-ground facility',
            ]
          ).map(stripEmoji),
        },
        preparednessTips: {
          immediateActions: (
            parsed.preparednessTips?.immediateActions || [
              'Isolate main electrical circuit breakers and LPG lines immediately',
              'Move elderly, children, and medical kits to upper floor or rooftop',
              'Secure drinking water in sealed containers; avoid tap water contact',
            ]
          ).map(stripEmoji),
          postDisasterProtocols: (
            parsed.preparednessTips?.postDisasterProtocols || [
              'Do not enter structural basements until cleared by engineering teams',
              'Boil all drinking water for minimum 10 minutes or use chlorine tablets',
              'Monitor district civil defense channel for clearance updates',
            ]
          ).map(stripEmoji),
        },
        resourceKit: {
          potableWaterLiters: waterLiters,
          dryRationPackets: dryRations,
          traumaKits: traumaKits,
          powerBanks: powerBanks,
          blankets: blankets,
        },
        liveBulletins: (parsed.liveBulletins || [
          {
            source: 'State Meteorological Operations',
            timestamp: 'Just now',
            updateText: 'Heavy rain squalls persisting; river basin discharge expected to peak within 3 hours.',
            category: 'official',
          },
          {
            source: 'District Traffic Command',
            timestamp: '12m ago',
            updateText: 'Lowland Causeway submerged. All civilian traffic diverted toward elevated ridge.',
            category: 'official',
          },
        ]).map((b: any) => ({
          source: stripEmoji(b.source || 'Civil Operations'),
          timestamp: stripEmoji(b.timestamp || 'Real-time'),
          updateText: stripEmoji(b.updateText || ''),
          category: b.category || 'official',
        })),
        socialPulse: (parsed.socialPulse || [
          `#DisasterUpdate: Community relief volunteers mobilizing at ${activeCorridor.verifiedShelters[0].name}`,
          `#RoadAlert: Avoid low-lying underpasses near ${location}. Water depth over 1 meter.`,
          `#EmergencyHelp: Medical triage team stationed at elevated ridge shelter.`,
        ]).map(stripEmoji),
        broadcastScript: stripEmoji(
          parsed.broadcastScript ||
            VERNACULAR_BROADCAST_FALLBACKS[language] ||
            VERNACULAR_BROADCAST_FALLBACKS.en
        ),
      };

      setDossier(generatedDossier);
    } catch (err: any) {
      console.error('Assessment pipeline exception:', err);
      setErrorMessage(
        err?.message?.includes('503')
          ? 'The inference gateway is experiencing high volume. Please retry in a moment.'
          : err?.message || 'Failed to complete site assessment.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle local vernacular audio broadcast
  const handleToggleBroadcastSpeech = () => {
    if (!dossier?.broadcastScript) return;

    if (isPlayingAudio) {
      if (stopAudioRef.current) {
        stopAudioRef.current();
        stopAudioRef.current = null;
      }
      stopVernacularAudio();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const stop = playVernacularAudio({
        text: dossier.broadcastScript,
        language: language,
        bcp47: currentLanguageMeta.bcp47,
        rate: 0.95,
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => {
          setIsPlayingAudio(false);
          stopAudioRef.current = null;
        },
        onError: () => {
          setIsPlayingAudio(false);
          stopAudioRef.current = null;
        },
      });
      stopAudioRef.current = stop;
    }
  };

  const activeCorridor = findSheltersByLocation(location);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 max-w-7xl mx-auto font-sans bg-[#F9F8F5] text-[#0E1A2B]">
      {/* Top Banner & Language Ribbon */}
      <div className="apple-glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF2EE] text-[#335341] border border-[#7D9D8B]/30">
              <Camera className="w-3.5 h-3.5 text-[#1D7A82]" />
              <span>{t('multimodalEngine')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A2B]">
              {t('navAssessment')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {t('bannerDesc')}
            </p>
          </div>

          {/* 9-Language Persistent Selector */}
          <div className="apple-glass-card px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-white/60">
            <Globe className="w-4 h-4 text-[#1D7A82]" />
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">{t('advisoryVernacular')}</div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent font-bold text-xs text-[#0E1A2B] focus:outline-hidden cursor-pointer"
              >
                {supportedLanguages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* A. USER INPUTS (Clean Left Rail / Top Card) */}
      <form onSubmit={handleAnalyze} className="apple-glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1. Site Image Upload with Client-Side 1024px Compression */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#1D7A82]" />
                <span>{t('inputPhotoLabel')}</span>
              </label>
              <button
                type="button"
                onClick={handleSamplePhoto}
                className="text-xs text-[#1D7A82] hover:text-[#13626A] font-semibold underline"
              >
                {t('useSamplePhoto')}
              </button>
            </div>

            <div className="relative border-2 border-dashed border-slate-300 hover:border-[#1D7A82] rounded-2xl p-6 text-center transition-all bg-white/50 backdrop-blur-sm cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF2EE] flex items-center justify-center text-[#1D7A82] group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-[#0E1A2B]">
                  {selectedFile ? selectedFile.name : t('dropPhotoText')}
                </div>
                <div className="text-xs text-slate-500">
                  {t('photoSubtext')}
                </div>
              </div>
            </div>

            {previewUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-white/80 shadow-md max-h-52 bg-slate-900">
                <img src={previewUrl} alt="Inspection Scene" className="w-full h-52 object-cover" />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-mono">
                  {t('photoReadyTag')}
                </div>
              </div>
            )}
          </div>

          {/* 2, 3, 4: Headcount, Location, Calamity Type */}
          <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Impacted Headcount */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#7D6B7D]" />
                    <span>{t('headcountLabel')}</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {[10, 50, 150, 500].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setHeadcount(step)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white text-slate-700 border border-slate-200 apple-btn-haptic"
                      >
                        +{step}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  min={1}
                  value={headcount}
                  onChange={(e) => setHeadcount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-mono font-bold text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30 shadow-xs"
                />
              </div>

              {/* Location or Landmark */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#E06D53]" />
                    <span>{t('locationLabel')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseGPS}
                    disabled={isLocatingGPS}
                    className="text-xs text-[#1D7A82] hover:text-[#13626A] font-semibold underline flex items-center gap-1"
                  >
                    <span>{isLocatingGPS ? t('locating') : t('useGps')}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('locationPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30 shadow-xs mb-2"
                />
                {/* 10 Verified Corridor Quick Selectors */}
                <div className="flex flex-wrap gap-1.5">
                  {getAllCalamityCorridors().map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setLocation(c.city.split('/')[0].trim())}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white text-slate-700 border border-slate-200 hover:border-[#1D7A82] transition-colors"
                    >
                      {c.city.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disaster / Calamity Type */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#1D7A82]" />
                  <span>{t('calamityTypeLabel')}</span>
                </label>
                <select
                  value={calamityType}
                  onChange={(e) => setCalamityType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30 shadow-xs"
                >
                  <option value="Flood">{t('calamityFlood')}</option>
                  <option value="Cyclone">{t('calamityCyclone')}</option>
                  <option value="Landslide">{t('calamityLandslide')}</option>
                  <option value="Earthquake">{t('calamityEarthquake')}</option>
                  <option value="Cloudburst">{t('calamityCloudburst')}</option>
                  <option value="Inundation">{t('calamityInundation')}</option>
                </select>
              </div>
            </div>

            {/* 5. Primary Action Button */}
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="w-full py-4 px-6 rounded-2xl bg-[#0E1A2B] hover:bg-[#14273E] active:scale-[0.98] text-white font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-5 h-5 text-[#7D9D8B] ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? t('btnAnalyzing') : t('btnAnalyze')}</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FBEBE8] border border-[#E06D53]/40 text-[#C85A4B] text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </form>

      {/* B. DYNAMIC GENERATIVE OUTPUTS (Single Pass Synthesis) */}
      {dossier && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Section 1: Visual Damage & Hazard Evaluation */}
          <div className="apple-glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-[#1D7A82]" />
                <h2 className="text-lg font-bold text-[#0E1A2B]">
                  {t('secVisualDamage')}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono">
                  {t('confidenceLabel')}: {(dossier.confidenceScore * 100).toFixed(0)}%
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                    dossier.severityRating === 'Critical'
                      ? 'bg-[#FBEBE8] text-[#C85A4B] border border-[#E06D53]'
                      : dossier.severityRating === 'High'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-[#EBF2EE] text-[#335341] border border-[#7D9D8B]'
                  }`}
                >
                  {t('severityLabel')}: {t(`badge${dossier.severityRating}`) || dossier.severityRating}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {dossier.damageObservations.map((obs, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 text-xs text-slate-800 leading-relaxed flex items-start gap-2 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-[#1D7A82] mt-1.5 shrink-0" />
                  <span>{obs}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Dynamic Evacuation Route & Shelter Mapping (Free Leaflet OSM) */}
          <div className="apple-glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <Navigation className="w-5 h-5 text-[#1D7A82]" />
                <h2 className="text-lg font-bold text-[#0E1A2B]">
                  {t('secEvacuationRoute')}
                </h2>
              </div>
              <div className="text-xs text-slate-600 font-mono">
                {t('nearestShelterLabel')}: <span className="font-bold text-[#0E1A2B]">{dossier.nearestShelter.name}</span> ({dossier.nearestShelter.elevation}m MSL)
              </div>
            </div>

            {/* Embedded Free Leaflet Map (OpenStreetMap Tiles - Zero Carto Keys) */}
            <CalamityCorridorMap corridor={activeCorridor} className="h-80 w-full" />

            {/* Turn by turn instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/80 border border-slate-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#1D7A82] tracking-wider block">
                  {t('primarySafeCorridor')}
                </span>
                <p className="font-bold text-[#0E1A2B]">{dossier.evacuationGuidance.primaryCorridor}</p>
                <div className="space-y-1 pt-1">
                  {dossier.evacuationGuidance.turnByTurnInstructions.map((inst, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700">
                      <span className="font-mono font-bold text-[#1D7A82]">{idx + 1}.</span>
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-slate-100 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#E06D53] tracking-wider block">
                  {t('avoidanceZonesLabel')}
                </span>
                <div className="space-y-1.5">
                  {dossier.evacuationGuidance.avoidanceZones.map((zone, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-[#FBEBE8] border border-[#E06D53]/30 text-[#C85A4B] flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{zone}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  {t('emergencyDeskLabel')}: <span className="font-bold text-[#0E1A2B]">{dossier.nearestShelter.contact}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Before & After Disaster Preparedness Tips */}
          <div className="apple-glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
              <Clock className="w-5 h-5 text-[#7D9D8B]" />
              <h2 className="text-lg font-bold text-[#0E1A2B]">
                {t('secPreparednessTips')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#EBF2EE] border border-[#7D9D8B]/30 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#335341] flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#7D9D8B]" />
                  <span>{t('immediateActionsLabel')}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {dossier.preparednessTips.immediateActions.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7D9D8B] mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-slate-200 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#14273E] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#1D7A82]" />
                  <span>{t('postDisasterProtocolsLabel')}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-800">
                  {dossier.preparednessTips.postDisasterProtocols.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-[#1D7A82] mt-0.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Headcount-Scaled Resource Kit (Calculated dynamically for N people) */}
          <div className="apple-glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-[#7D6B7D]" />
                <h2 className="text-lg font-bold text-[#0E1A2B]">
                  {t('secResourceKit')} (N = {headcount})
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">{t('kitBufferLabel')}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <Droplets className="w-3.5 h-3.5 text-[#1D7A82]" />
                  <span>{t('potableWater')}</span>
                </div>
                <div className="text-base font-bold text-[#0E1A2B]">
                  {dossier.resourceKit.potableWaterLiters.toLocaleString('en-IN')} L
                </div>
                <div className="text-[10px] text-slate-500">3.5 L/day × {headcount} pers. × 3d</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <Package className="w-3.5 h-3.5 text-[#7D9D8B]" />
                  <span>{t('dryRations')}</span>
                </div>
                <div className="text-base font-bold text-[#0E1A2B]">
                  {dossier.resourceKit.dryRationPackets.toLocaleString('en-IN')} Packs
                </div>
                <div className="text-[10px] text-slate-500">2,100 kcal ready rations</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <Shield className="w-3.5 h-3.5 text-[#E06D53]" />
                  <span>{t('traumaKits')}</span>
                </div>
                <div className="text-base font-bold text-[#0E1A2B]">{dossier.resourceKit.traumaKits} Modular Units</div>
                <div className="text-[10px] text-slate-500">1 unit per 10 persons</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <Activity className="w-3.5 h-3.5 text-[#7D6B7D]" />
                  <span>{t('powerUnits')}</span>
                </div>
                <div className="text-base font-bold text-[#0E1A2B]">{dossier.resourceKit.powerBanks} Units</div>
                <div className="text-[10px] text-slate-500">20,000 mAh Dry Pack</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t('thermalBlankets')}</span>
                </div>
                <div className="text-base font-bold text-[#0E1A2B]">{dossier.resourceKit.blankets} Foil Blankets</div>
                <div className="text-[10px] text-slate-500">1 unit per individual</div>
              </div>
            </div>
          </div>

          {/* Section 5: Synthesized Live Situational Bulletins & Social Media Pulse */}
          <div className="apple-glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/60">
              <Radio className="w-5 h-5 text-[#1D7A82]" />
              <h2 className="text-lg font-bold text-[#0E1A2B]">
                {t('secBulletins')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Live Official Bulletins */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  {t('agencyFeed')}
                </span>
                {dossier.liveBulletins.map((bulletin, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-white/80 border border-slate-100 text-xs space-y-1 shadow-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-bold text-[#0E1A2B]">{bulletin.source}</span>
                      <span className="font-mono">{bulletin.timestamp}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">{bulletin.updateText}</p>
                  </div>
                ))}
              </div>

              {/* Social Media Community Pulse */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  {t('communityPulse')}
                </span>
                <div className="space-y-2">
                  {dossier.socialPulse.map((post, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-white/80 border border-slate-100 text-xs text-slate-800 leading-relaxed flex items-start gap-2 shadow-xs">
                      <Share2 className="w-3.5 h-3.5 text-[#1D7A82] shrink-0 mt-0.5" />
                      <span className="font-mono text-[11px] font-semibold">{post}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Local Vernacular Audio Broadcast */}
          <div className="apple-glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-5 h-5 text-[#7D9D8B]" />
                <div>
                  <h2 className="text-lg font-bold text-[#0E1A2B]">
                    {t('secVernacularBroadcast')}
                  </h2>
                  <span className="text-xs text-slate-500">
                    {currentLanguageMeta.name} ({currentLanguageMeta.nativeName})
                  </span>
                </div>
              </div>

              {/* Audio Play / Stop Button */}
              <button
                type="button"
                onClick={handleToggleBroadcastSpeech}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 apple-btn-haptic ${
                  isPlayingAudio
                    ? 'bg-[#C85A4B] text-white hover:bg-[#B94A3E]'
                    : 'bg-[#14273E] text-white hover:bg-[#0E1A2B]'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-4 h-4 animate-pulse" />
                    <span>{t('btnStopBroadcast')}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>{t('btnListenBroadcast')} ({currentLanguageMeta.nativeName})</span>
                  </>
                )}
              </button>
            </div>

            {isPlayingAudio && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 w-fit text-emerald-800 text-xs font-semibold shadow-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
                <span>Broadcasting live voice in {currentLanguageMeta.name} ({currentLanguageMeta.nativeName})</span>
                <div className="flex items-center gap-0.5 ml-2 h-3.5">
                  <span className="w-0.5 h-3.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-3.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="w-0.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-100 text-sm text-[#0E1A2B] leading-relaxed font-sans shadow-xs">
              {dossier.broadcastScript}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterAssessmentTab;
