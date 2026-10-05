import React, { useState, useId, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Smartphone,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Clock,
  Sliders,
  Check,
  Globe,
  Volume2,
  Square,
  MessageSquare,
  Search,
  MapPin,
  ChevronDown,
  Key,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  sendVernacularSMS,
  sanitizePhoneNumbers,
  generateWhatsAppUrl,
  generateDeviceSmsUri,
  SMSDispatchResult,
} from '@/services/smsService';
import {
  CALAMITY_LIST,
  synthesizeVernacularMicroAlert,
  DETERMINISTIC_VERNACULAR_ALERTS,
} from '@/utils/vernacularAlertSynthesizer';
import {
  INDIAN_LOCATIONS,
  searchLocalIndianLocations,
  searchNominatimIndia,
  IndianLocationItem,
} from '@/data/indianLocations';
import { playVernacularAudio, stopVernacularAudio } from '@/utils/vernacularTTS';

interface AlertPreset {
  hazardId: string;
  location: string;
  action: string;
  label: string;
}

const PRESETS: AlertPreset[] = [
  {
    label: 'Kankarbagh Flood',
    hazardId: 'flood',
    location: 'Kankarbagh, Patna, Bihar',
    action: 'MOVE TO HIGH GROUND SHELTER',
  },
  {
    label: 'Coastal Cyclone Alert',
    hazardId: 'cyclone',
    location: 'Kattankulathur, Chennai, Tamil Nadu',
    action: 'EVACUATE TO CONCRETE CYCLONE SHELTER',
  },
  {
    label: 'Wayanad Landslide',
    hazardId: 'landslide',
    location: 'Wayanad (Meppadi), Kerala',
    action: 'LEAVE VALLEY IMMEDIATELY',
  },
  {
    label: 'Joshimath Subsidence',
    hazardId: 'landslide',
    location: 'Joshimath, Chamoli, Uttarakhand',
    action: 'EVACUATE CRACKED STRUCTURES',
  },
  {
    label: 'Aluva Dam Spillway',
    hazardId: 'dam',
    location: 'Aluva Periyar Riverfront, Kochi, Kerala',
    action: 'CLEAR RIVERBED BASIN IMMEDIATELY',
  },
  {
    label: 'Dispur Urban Deluge',
    hazardId: 'inundation',
    location: 'Dispur Capital Complex, Guwahati, Assam',
    action: 'AVOID LOWLAND SUBMERGED ROADS',
  },
];

interface DispatchHistoryItem {
  id: string;
  timestamp: string;
  recipientsCount: number;
  message: string;
  simulated: boolean;
  status: 'delivered' | 'simulated' | 'failed';
  details?: string;
}

export const MicroAlertTab: React.FC = () => {
  const { t, language, currentLanguageMeta, supportedLanguages, setLanguage } = useLanguage();
  const alertInputId = useId();
  const phoneInputId = useId();
  const locationInputRef = useRef<HTMLDivElement>(null);

  // Calamity / Hazard Dropdown state (12 Calamities)
  const [selectedCalamityId, setSelectedCalamityId] = useState<string>('flood');

  // Location / Landmark Autocomplete state (Indian Database)
  const [locationQuery, setLocationQuery] = useState<string>('Kankarbagh, Patna, Bihar');
  const [locationSuggestions, setLocationSuggestions] = useState<IndianLocationItem[]>([]);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState<boolean>(false);
  const [isSearchingOnline, setIsSearchingOnline] = useState<boolean>(false);

  // Mandatory Directive
  const [instruction, setInstruction] = useState<string>('EVACUATE TO HIGH GROUND SHELTER');

  // Generated 30-char alert text in vernacular
  const [alertText, setAlertText] = useState<string>(() => {
    return DETERMINISTIC_VERNACULAR_ALERTS.flood[language] || DETERMINISTIC_VERNACULAR_ALERTS.flood.en;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Audio advisory state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // SMS Dispatch inputs & settings
  const [phoneNumbersInput, setPhoneNumbersInput] = useState('9876543210, 9123456789, 9988776655');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<SMSDispatchResult | null>(null);
  const [simulationMode, setSimulationMode] = useState<boolean>(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [showApiKeyDrawer, setShowApiKeyDrawer] = useState<boolean>(false);

  const [dispatchHistory, setDispatchHistory] = useState<DispatchHistoryItem[]>([
    {
      id: 'disp-hist-1',
      timestamp: '10:15:32 AM',
      recipientsCount: 42,
      message: DETERMINISTIC_VERNACULAR_ALERTS.flood[language] || 'FLOOD: MOVE TO HIGH GROUND NOW',
      simulated: true,
      status: 'simulated',
      details: 'Cellular Gateway Quick Route session',
    },
  ]);
  const [copied, setCopied] = useState(false);

  // Auto-update alert template when user switches language
  useEffect(() => {
    const matchingTemplate = DETERMINISTIC_VERNACULAR_ALERTS[selectedCalamityId]?.[language] ||
      DETERMINISTIC_VERNACULAR_ALERTS.flood[language] ||
      'FLOOD: MOVE TO HIGH GROUND NOW';
    setAlertText(matchingTemplate.slice(0, 30));
    stopVernacularAudio();
    setIsPlayingAudio(false);
  }, [language, selectedCalamityId]);

  // Click outside listener for location dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(e.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter location suggestions when typing
  useEffect(() => {
    if (!locationQuery.trim()) {
      setLocationSuggestions(INDIAN_LOCATIONS.slice(0, 8));
      return;
    }
    const localMatches = searchLocalIndianLocations(locationQuery, 8);
    setLocationSuggestions(localMatches);

    // If local results are sparse, query Nominatim with debounce
    if (localMatches.length < 3 && locationQuery.length >= 3) {
      setIsSearchingOnline(true);
      const timer = setTimeout(async () => {
        const osmResults = await searchNominatimIndia(locationQuery);
        if (osmResults.length > 0) {
          setLocationSuggestions((prev) => {
            const ids = new Set(prev.map((p) => p.name.toLowerCase()));
            const filteredOsm = osmResults.filter((o) => !ids.has(o.name.toLowerCase()));
            return [...prev, ...filteredOsm].slice(0, 10);
          });
        }
        setIsSearchingOnline(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [locationQuery]);

  // Validation
  const charLength = alertText.length;
  const isWithin30 = charLength <= 30;
  const sanitizedPhones = sanitizePhoneNumbers(phoneNumbersInput);

  // Synthesize 30-char alert in the active target language
  const handleSynthesizeAlert = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    stopVernacularAudio();
    setIsPlayingAudio(false);

    try {
      const activeCalamity = CALAMITY_LIST.find((c) => c.id === selectedCalamityId);
      const hazardLabel = activeCalamity ? t(activeCalamity.nameKey) : selectedCalamityId;

      const synthesized = await synthesizeVernacularMicroAlert({
        hazard: hazardLabel,
        calamityId: selectedCalamityId,
        location: locationQuery,
        directive: instruction,
        language,
        languageName: currentLanguageMeta.name,
      });

      setAlertText(synthesized.slice(0, 30));
    } catch (err: any) {
      console.error('[MicroAlert] Synthesis error:', err);
      setGenerationError(err?.message || 'Synthesis fallback applied.');
      const fallback = DETERMINISTIC_VERNACULAR_ALERTS[selectedCalamityId]?.[language] ||
        DETERMINISTIC_VERNACULAR_ALERTS.flood[language];
      setAlertText(fallback.slice(0, 30));
    } finally {
      setIsGenerating(false);
    }
  };

  // Audio TTS Advisory
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopVernacularAudio();
      setIsPlayingAudio(false);
      return;
    }

    if (!alertText.trim()) return;

    playVernacularAudio({
      text: alertText,
      language,
      bcp47: currentLanguageMeta.bcp47,
      rate: 0.95,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: (err) => {
        console.warn('[MicroAlert] Audio advisory error:', err);
        setIsPlayingAudio(false);
      },
    });
  };

  // Dispatch via Fast2SMS Bulk Gateway
  const handleDispatchSMS = async () => {
    if (sanitizedPhones.length === 0) {
      alert('Please enter at least one valid 10-digit Indian phone number.');
      return;
    }

    if (!alertText.trim()) {
      alert('Alert message cannot be blank.');
      return;
    }

    setIsDispatching(true);
    setDispatchResult(null);

    try {
      const res = await sendVernacularSMS({
        numbers: phoneNumbersInput,
        message: alertText,
        language: currentLanguageMeta.name.toLowerCase(),
        apiKeyOverride: customApiKey.trim() || undefined,
        forceSimulation: simulationMode,
      });

      setDispatchResult(res);

      const newHistoryItem: DispatchHistoryItem = {
        id: `disp-${Date.now()}`,
        timestamp: res.timestamp,
        recipientsCount: res.recipientCount,
        message: alertText,
        simulated: res.simulated,
        status: res.success ? (res.simulated ? 'simulated' : 'delivered') : 'failed',
        details: res.message,
      };

      setDispatchHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
    } catch (err: any) {
      console.error('[MicroAlert] Dispatch exception:', err);
      setDispatchResult({
        success: false,
        simulated: false,
        recipientCount: 0,
        message: err?.message || 'Cellular gateway dispatch error.',
        error: 'DISPATCH_ERROR',
        timestamp: new Date().toLocaleTimeString('en-IN'),
      });
    } finally {
      setIsDispatching(false);
    }
  };

  const handleCopyAlert = () => {
    navigator.clipboard.writeText(alertText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPreset = (preset: AlertPreset) => {
    setSelectedCalamityId(preset.hazardId);
    setLocationQuery(preset.location);
    setInstruction(preset.action);
    const tmpl = DETERMINISTIC_VERNACULAR_ALERTS[preset.hazardId]?.[language] ||
      DETERMINISTIC_VERNACULAR_ALERTS.flood[language];
    setAlertText(tmpl.slice(0, 30));
  };

  const handleSelectLocation = (item: IndianLocationItem) => {
    setLocationQuery(`${item.name}, ${item.city}, ${item.state}`);
    setIsLocationDropdownOpen(false);
  };

  const whatsappUrl = generateWhatsAppUrl(sanitizedPhones, alertText);
  const deviceSmsUri = generateDeviceSmsUri(sanitizedPhones, alertText);

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 max-w-7xl mx-auto font-sans bg-[#F9F8F5] text-[#0E1A2B]">
      {/* Top Header Card */}
      <div className="apple-glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-white/60 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF2EE] text-[#335341] border border-[#7D9D8B]/30">
              <Smartphone className="w-3.5 h-3.5 text-[#1D7A82]" />
              <span>{t('tab3Title')}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D7A82]" />
              <span>{t('activeGateway')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0E1A2B]">
              {t('microAlertTitle')}
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              {t('alertConstraintNote')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Language Selector */}
            <div className="apple-glass-card px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/60">
              <Globe className="w-4 h-4 text-[#1D7A82]" />
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {t('advisoryVernacular')}
                </div>
                <select
                  value={language}
                  aria-label="Select Vernacular Language"
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

            {/* Simulation Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setSimulationMode(!simulationMode)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                simulationMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${simulationMode ? 'bg-amber-600' : 'bg-emerald-600'}`} />
              <span>{t('simulationModeToggle')}: {simulationMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Action Strip */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#1D7A82]" />
          <span>{t('quickPresets')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 bg-white/80 hover:bg-white hover:text-[#0E1A2B] border border-slate-200/80 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Column Grid: Generator on Left, Dispatch on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 30-Character Generator */}
        <div className="lg:col-span-6 space-y-6">
          <div className="apple-glass-panel p-6 rounded-3xl border border-white/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1D7A82]" />
                <h2 className="text-base font-bold text-[#0E1A2B]">{t('btnGenerateAlert')}</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {currentLanguageMeta.name} ({currentLanguageMeta.nativeName})
              </span>
            </div>

            <div className="space-y-4">
              {/* 1. Hazard Type Dropdown (12 Calamities) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>{t('calamitySelectLabel')}</span>
                  <span className="text-[11px] font-normal text-slate-500">12 Calamities</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCalamityId}
                    onChange={(e) => setSelectedCalamityId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30 shadow-xs appearance-none pr-10 cursor-pointer"
                  >
                    {CALAMITY_LIST.map((c) => (
                      <option key={c.id} value={c.id}>
                        {t(c.nameKey) || c.defaultEnglish}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* 2. Indian Location Autocomplete Dropdown */}
              <div ref={locationInputRef} className="relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#1D7A82]" />
                    <span>{t('locationSelectLabel')}</span>
                  </span>
                  <span className="text-[11px] font-normal text-[#1D7A82]">
                    {t('openDatabaseOptions')}
                  </span>
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      setIsLocationDropdownOpen(true);
                    }}
                    onFocus={() => setIsLocationDropdownOpen(true)}
                    placeholder={t('locationInputPlaceholder')}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30 shadow-xs"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Autocomplete Dropdown List */}
                {isLocationDropdownOpen && (
                  <div className="absolute z-30 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-xl divide-y divide-slate-100">
                    {locationSuggestions.length > 0 ? (
                      locationSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectLocation(item)}
                          className="w-full text-left px-3.5 py-2.5 hover:bg-[#EBF2EE] transition-colors flex items-start gap-2.5 cursor-pointer"
                        >
                          <MapPin className="w-4 h-4 text-[#1D7A82] shrink-0 mt-0.5" />
                          <div className="text-xs">
                            <span className="font-bold text-[#0E1A2B]">{item.name}</span>
                            <span className="text-slate-500"> — {item.city}, {item.state}</span>
                            {item.disasterProneTo && item.disasterProneTo.length > 0 && (
                              <span className="block text-[10px] text-amber-700 mt-0.5">
                                Prone: {item.disasterProneTo.join(', ')}
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-500 text-center">
                        {isSearchingOnline ? 'Searching Indian maps...' : 'Type to search Indian cities & landmarks'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Mandatory Directive Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t('instructionAction')}
                </label>
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="e.g. EVACUATE TO HIGH GROUND SHELTER"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30 shadow-xs"
                />
              </div>

              {/* Synthesize Button */}
              <button
                type="button"
                onClick={handleSynthesizeAlert}
                disabled={isGenerating}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0E1A2B] hover:bg-[#14273E] active:scale-[0.98] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`w-4 h-4 text-[#7D9D8B] ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? t('btnSynthesizing') : t('btnSynthesizeAlert')} ({currentLanguageMeta.name})</span>
              </button>

              {generationError && (
                <div className="p-3 rounded-xl bg-[#FBEBE8] border border-[#E06D53]/40 text-[#C85A4B] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{generationError}</span>
                </div>
              )}
            </div>

            {/* Synthesized 30-Character Alert Card with Audio Playback */}
            <div className="pt-2 border-t border-slate-200/60">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor={alertInputId} className="text-xs font-bold text-[#0E1A2B] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#1D7A82]" />
                  <span>30-Char Alert ({currentLanguageMeta.name})</span>
                </label>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    charLength <= 25
                      ? 'bg-[#EBF2EE] text-[#335341]'
                      : charLength <= 30
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-[#FBEBE8] text-[#C85A4B]'
                  }`}
                >
                  {charLength} / 30 chars
                </span>
              </div>

              <div className="relative">
                <input
                  id={alertInputId}
                  type="text"
                  maxLength={30}
                  value={alertText}
                  onChange={(e) => setAlertText(e.target.value)}
                  className={`w-full px-4 py-3.5 pr-28 rounded-2xl bg-white border font-bold text-base transition-all focus:outline-hidden focus:ring-2 ${
                    isWithin30
                      ? 'border-[#7D9D8B] text-[#0E1A2B] focus:ring-[#1D7A82]/30'
                      : 'border-[#E06D53] text-[#C85A4B] focus:ring-[#E06D53]/30'
                  }`}
                  placeholder="30-CHAR MICRO ALERT"
                />

                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {/* Vernacular Audio Listen Button */}
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    title={isPlayingAudio ? t('stopAudio') : t('listenVernacularAudio')}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-amber-100 text-amber-900 animate-pulse'
                        : 'text-[#1D7A82] hover:bg-[#EBF2EE]'
                    }`}
                  >
                    {isPlayingAudio ? <Square className="w-4 h-4 fill-amber-900" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Copy Alert Button */}
                  <button
                    type="button"
                    onClick={handleCopyAlert}
                    title="Copy payload"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#7D9D8B]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Character Progress Bar */}
              <div className="mt-2.5">
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      charLength <= 25 ? 'bg-[#7D9D8B]' : charLength <= 30 ? 'bg-amber-500' : 'bg-[#E06D53]'
                    }`}
                    style={{ width: `${Math.min(100, (charLength / 30) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500 font-mono">
                  <span>0</span>
                  <span className="font-semibold text-slate-700">{t('strictCap30')}</span>
                  <span>30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Fast2SMS Cellular Dispatch */}
        <div className="lg:col-span-6 space-y-6">
          <div className="apple-glass-panel p-6 rounded-3xl border border-white/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#1D7A82]" />
                <h2 className="text-base font-bold text-[#0E1A2B]">Fast2SMS Bulk Gateway</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyDrawer(!showApiKeyDrawer)}
                className="text-xs text-[#1D7A82] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>API Settings</span>
              </button>
            </div>

            {/* Custom API Key Collapsible Drawer */}
            {showApiKeyDrawer && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2 text-xs">
                <div className="font-bold text-amber-950 flex items-center justify-between">
                  <span>Custom Fast2SMS API Key</span>
                  <a
                    href="https://www.fast2sms.com/dashboard/dev-api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#1D7A82] underline flex items-center gap-0.5 text-[11px]"
                  >
                    Get Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Paste funded Fast2SMS API key (or leave blank to use default/simulation)"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 text-xs text-slate-900 focus:outline-hidden"
                />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Note: Fast2SMS requires a one-time ₹100 recharge on new accounts before opening the live bulk API route. Enable Simulation Mode for instant zero-cost testing.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor={phoneInputId} className="text-xs font-semibold text-slate-700">
                    {t('smsRecipientsLabel')}
                  </label>
                  <span className="text-xs font-semibold text-[#335341] bg-[#EBF2EE] px-2 py-0.5 rounded-full border border-[#7D9D8B]/30">
                    {sanitizedPhones.length} Valid Mobile{sanitizedPhones.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <textarea
                  id={phoneInputId}
                  rows={3}
                  value={phoneNumbersInput}
                  onChange={(e) => setPhoneNumbersInput(e.target.value)}
                  placeholder={t('phoneNumbersPlaceholder')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-mono text-[#0E1A2B] focus:outline-hidden focus:ring-2 focus:ring-[#1D7A82]/30 shadow-xs"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Standard 10-digit Indian numbers</span>
                  <button
                    type="button"
                    onClick={() => setPhoneNumbersInput('9876543210, 9123456789, 9988776655, 9811223344, 9844332211')}
                    className="text-[#1D7A82] hover:text-[#13626A] font-semibold underline cursor-pointer"
                  >
                    Load Sample Test Numbers
                  </button>
                </div>
              </div>

              {/* Pre-Flight Check Box */}
              <div className="apple-glass-card p-4 rounded-2xl border border-white/60 space-y-2.5">
                <div className="text-xs font-bold text-[#0E1A2B] uppercase tracking-wider">
                  {t('transmissionPreflight')}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">{t('payloadLength')}</span>
                    <span className="font-bold text-[#0E1A2B]">{charLength} / 30 Chars</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">{t('totalRecipients')}</span>
                    <span className="font-bold text-[#0E1A2B]">{sanitizedPhones.length} Cellular Devices</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">{t('gatewayRoute')}</span>
                    <span className="font-bold text-[#0E1A2B]">Fast2SMS Bulk (q)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                    <span className="text-slate-500 block text-[10px]">{t('gsmFraming')}</span>
                    <span className="font-bold text-[#0E1A2B]">{t('singleFrameBillable')}</span>
                  </div>
                </div>
              </div>

              {/* Main Dispatch Action Button */}
              <button
                type="button"
                onClick={handleDispatchSMS}
                disabled={isDispatching || sanitizedPhones.length === 0 || !alertText.trim()}
                className="w-full py-4 px-4 rounded-2xl bg-[#0E1A2B] hover:bg-[#14273E] active:scale-[0.98] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className={`w-4 h-4 ${isDispatching ? 'animate-pulse' : ''}`} />
                <span>
                  {isDispatching
                    ? 'Broadcasting to Gateway...'
                    : `Dispatch Cellular SMS (${sanitizedPhones.length})`}
                </span>
              </button>

              {/* Fallback Channels: WhatsApp & Direct Phone SMS */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="truncate">{t('sendViaWhatsappBtn')}</span>
                </a>
                <a
                  href={deviceSmsUri}
                  className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="truncate">{t('sendViaDirectSmsBtn')}</span>
                </a>
              </div>

              {/* Dispatch Confirmation Card */}
              {dispatchResult && (
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    dispatchResult.success
                      ? dispatchResult.simulated
                        ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                        : 'bg-[#EBF2EE] border-[#7D9D8B]/40 text-[#335341]'
                      : 'bg-[#FBEBE8] border-[#E06D53]/40 text-[#C85A4B]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {dispatchResult.success ? (
                      <CheckCircle2
                        className={`w-5 h-5 shrink-0 mt-0.5 ${
                          dispatchResult.simulated ? 'text-amber-700' : 'text-[#7D9D8B]'
                        }`}
                      />
                    ) : (
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#E06D53]" />
                    )}
                    <div className="space-y-1 text-xs">
                      <div className="font-bold text-sm">
                        {dispatchResult.success
                          ? dispatchResult.simulated
                            ? 'Simulation Gateway Confirmed'
                            : 'Live Cellular Broadcast Dispatched'
                          : 'Dispatch Notice'}
                      </div>
                      <p className="leading-relaxed">{dispatchResult.message}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] opacity-80 font-mono">
                        <span>Recipients: {dispatchResult.recipientCount}</span>
                        <span>Time: {dispatchResult.timestamp}</span>
                        <span>Chars: {dispatchResult.characterCount || charLength}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch History Table */}
      <div className="apple-glass-panel p-6 rounded-3xl border border-white/60 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1D7A82]" />
            <h2 className="text-base font-bold text-[#0E1A2B]">{t('dispatchHistory')}</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">{dispatchHistory.length} Transmissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/60 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Recipients</th>
                <th className="py-2.5 px-3">30-Char Payload</th>
                <th className="py-2.5 px-3">Length</th>
                <th className="py-2.5 px-3">Gateway</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dispatchHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{item.timestamp}</td>
                  <td className="py-3 px-3 font-semibold text-[#0E1A2B] whitespace-nowrap">
                    {item.recipientsCount} Numbers
                  </td>
                  <td className="py-3 px-3 font-bold text-[#0E1A2B] max-w-xs truncate">
                    {item.message}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{item.message.length} Chars</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.simulated
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-[#EBF2EE] text-[#335341] border border-[#7D9D8B]/30'
                      }`}
                    >
                      {item.simulated ? 'Fast2SMS Simulation' : 'Live Gateway'}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        item.status === 'delivered'
                          ? 'text-[#335341]'
                          : item.status === 'simulated'
                          ? 'text-amber-700'
                          : 'text-[#C85A4B]'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="capitalize">{item.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MicroAlertTab;
