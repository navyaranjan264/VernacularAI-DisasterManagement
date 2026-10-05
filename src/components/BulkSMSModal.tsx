import { useState, useEffect, useMemo } from 'react';
import {
  X, Radio, Globe, ChevronDown, AlertTriangle, CheckCircle2,
  Smartphone, Send, Loader2, Users, FileText, MessageSquare,
  RefreshCw, Info, Zap,
} from 'lucide-react';
import {
  INDIAN_STATES,
  DISASTER_TYPES,
  SEVERITY_LEVELS,
  VERNACULAR_TEMPLATES,
  getBulkSMSTemplate,
  getSMSStats,
  type StateInfo,
  type DisasterKey,
  type LangCode,
} from '@/data/vernacularAlerts';
import { sendVernacularSMS } from '@/services/smsService';
import { useToast } from '@/hooks/use-toast';

interface BulkSMSModalProps {
  open: boolean;
  onClose: () => void;
  defaultState?: string;
  defaultLang?: string;
}

// All languages supported in templates
const SUPPORTED_LANGUAGES = [
  { code: 'ta', label: 'Tamil',     script: 'தமிழ்' },
  { code: 'te', label: 'Telugu',    script: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', script: 'മലയാളം' },
  { code: 'kn', label: 'Kannada',   script: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'Hindi',     script: 'हिन्दी' },
  { code: 'mr', label: 'Marathi',   script: 'मराठी' },
  { code: 'bn', label: 'Bengali',   script: 'বাংলা' },
  { code: 'gu', label: 'Gujarati',  script: 'ગુજરાતી' },
  { code: 'pa', label: 'Punjabi',   script: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia',      script: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese',  script: 'অসমীয়া' },
  { code: 'en', label: 'English',   script: 'English' },
];

const REGIONS = ['All', 'South', 'West', 'North', 'Central', 'East', 'Northeast'];

const BulkSMSModal = ({ open, onClose, defaultState, defaultLang }: BulkSMSModalProps) => {
  const { toast } = useToast();

  // ── State ────────────────────────────────────────────────────────────────
  const [selectedState, setSelectedState] = useState<StateInfo | null>(null);
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterKey>('flood');
  const [selectedSeverity, setSelectedSeverity] = useState<'HIGH' | 'CRITICAL' | 'EXTREME'>('CRITICAL');
  const [selectedLang, setSelectedLang] = useState<LangCode>('en');
  const [message, setMessage] = useState('');
  const [numbersInput, setNumbersInput] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultOk, setResultOk] = useState(true);
  const [stateSearch, setStateSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // ── Initialize from props ─────────────────────────────────────────────────
  useEffect(() => {
    if (defaultState) {
      const found = INDIAN_STATES.find(s => s.name === defaultState);
      if (found) {
        setSelectedState(found);
        setSelectedLang(found.langCode as LangCode);
      }
    }
    if (defaultLang) setSelectedLang(defaultLang as LangCode);
  }, [defaultState, defaultLang]);

  // ── Auto-generate message when inputs change ──────────────────────────────
  useEffect(() => {
    if (selectedState && selectedDisaster && selectedSeverity && selectedLang) {
      const severityLabel = SEVERITY_LEVELS.find(s => s.key === selectedSeverity)?.label || selectedSeverity;
      const generated = getBulkSMSTemplate(selectedDisaster, selectedLang, selectedState.name, severityLabel);
      if (generated) setMessage(generated);
    }
  }, [selectedState, selectedDisaster, selectedSeverity, selectedLang]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const smsStats = useMemo(() => getSMSStats(message), [message]);

  const filteredStates = useMemo(() =>
    INDIAN_STATES.filter(s =>
      (regionFilter === 'All' || s.region === regionFilter) &&
      s.name.toLowerCase().includes(stateSearch.toLowerCase())
    ), [stateSearch, regionFilter]);

  const validNumbers = useMemo(() => {
    return numbersInput
      .split(/[\s,;\n|]+/)
      .map(n => n.replace(/\D/g, ''))
      .map(n => {
        if (n.length === 12 && n.startsWith('91')) return n.slice(2);
        if (n.length === 11 && n.startsWith('0')) return n.slice(1);
        return n;
      })
      .filter(n => n.length === 10)
      .filter((n, i, arr) => arr.indexOf(n) === i);
  }, [numbersInput]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleStateSelect = (state: StateInfo) => {
    setSelectedState(state);
    setSelectedLang(state.langCode as LangCode);
    setShowStateDropdown(false);
    setStateSearch('');
  };

  const handleSend = async () => {
    if (!selectedState) {
      toast({ title: 'Select a state', description: 'Please select the target state/region.', variant: 'destructive' });
      return;
    }
    if (validNumbers.length === 0) {
      toast({ title: 'No valid numbers', description: 'Enter at least one 10-digit mobile number.', variant: 'destructive' });
      return;
    }
    if (!message.trim()) {
      toast({ title: 'Empty message', description: 'Please compose an alert message.', variant: 'destructive' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = await sendVernacularSMS({
        numbers: numbersInput,
        message,
        language: selectedLang,
      });

      setResultOk(res.success);
      setResult(res.message);

      toast({
        title: res.simulated ? '📡 Broadcast Simulated' : res.success ? '✅ Broadcast Dispatched' : '⚠️ Dispatch Issue',
        description: res.message.slice(0, 80),
        variant: res.success ? 'default' : 'destructive',
      });
    } catch (err: any) {
      setResultOk(false);
      setResult(`Dispatch error: ${err.message}`);
      toast({ title: 'Dispatch Failed', description: err.message, variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  // ── Current disaster and severity display ────────────────────────────────
  const currentDisaster = DISASTER_TYPES.find(d => d.key === selectedDisaster)!;
  const currentSeverity = SEVERITY_LEVELS.find(s => s.key === selectedSeverity)!;
  const hasTemplate = selectedLang && selectedDisaster &&
    !!((VERNACULAR_TEMPLATES[selectedDisaster] as any)?.[selectedLang]);

  // ── Template has coverage info ────────────────────────────────────────────
  const availableLangs = Object.keys(VERNACULAR_TEMPLATES[selectedDisaster] || {});

  return (
    <div
      className="fixed inset-0 z-[7000] flex items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 100%)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(239,68,68,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm sm:text-base">Bulk Regional SMS Broadcast</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Fast2SMS Gateway · Vernacular · Multi-State Mass Alert
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Step Tabs ───────────────────────────────────────────────────── */}
        <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { n: 1 as const, label: 'State & Disaster', icon: Globe },
            { n: 2 as const, label: 'Compose Alert', icon: MessageSquare },
            { n: 3 as const, label: 'Recipients & Send', icon: Send },
          ].map(({ n, label, icon: Icon }) => (
            <button
              key={n}
              onClick={() => setStep(n)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all"
              style={{
                color: step === n ? '#f87171' : 'rgba(255,255,255,0.35)',
                borderBottom: step === n ? '2px solid #f87171' : '2px solid transparent',
                background: step === n ? 'rgba(248,113,113,0.05)' : 'transparent',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{n}</span>
            </button>
          ))}
        </div>

        {/* ── Scrollable Content ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

          {/* ════ STEP 1: State & Disaster ═════════════════════════════════ */}
          {step === 1 && (
            <>
              {/* State Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Target State / Union Territory
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowStateDropdown(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: selectedState ? '#fff' : 'rgba(255,255,255,0.35)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-sky-400" />
                      {selectedState ? (
                        <span>{selectedState.name} <span style={{ color: 'rgba(255,255,255,0.4)' }}>({selectedState.langLabel} · {selectedState.script})</span></span>
                      ) : (
                        <span>Select State / UT</span>
                      )}
                    </div>
                    <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  </button>

                  {showStateDropdown && (
                    <div
                      className="absolute top-14 left-0 right-0 z-50 rounded-2xl overflow-hidden shadow-2xl"
                      style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', maxHeight: 320, overflowY: 'auto' }}
                    >
                      {/* Region filter pills */}
                      <div className="flex gap-1.5 p-2.5 pb-2 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {REGIONS.map(r => (
                          <button
                            key={r}
                            onClick={() => setRegionFilter(r)}
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all"
                            style={{
                              background: regionFilter === r ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.06)',
                              color: regionFilter === r ? '#f87171' : 'rgba(255,255,255,0.4)',
                              border: regionFilter === r ? '1px solid rgba(248,113,113,0.3)' : '1px solid transparent',
                            }}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                      {/* Search */}
                      <div className="px-2.5 py-1.5">
                        <input
                          type="text"
                          placeholder="Search state..."
                          value={stateSearch}
                          onChange={e => setStateSearch(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                          style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}
                          autoFocus
                        />
                      </div>
                      {/* State list */}
                      {filteredStates.map(state => (
                        <button
                          key={state.code}
                          onClick={() => handleStateSelect(state)}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 transition-all text-left"
                          style={{
                            color: selectedState?.code === state.code ? '#f87171' : 'rgba(255,255,255,0.75)',
                            background: selectedState?.code === state.code ? 'rgba(248,113,113,0.08)' : 'transparent',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selectedState?.code === state.code ? 'rgba(248,113,113,0.08)' : 'transparent'; }}
                        >
                          <span className="text-xs font-semibold">{state.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{state.script}</span>
                            {(state.floodProne || state.cycloneProne) && (
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                            )}
                          </div>
                        </button>
                      ))}
                      {filteredStates.length === 0 && (
                        <p className="text-center py-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>No states found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Disaster Type */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Disaster Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DISASTER_TYPES.map(d => (
                    <button
                      key={d.key}
                      onClick={() => setSelectedDisaster(d.key)}
                      className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl text-xs font-semibold transition-all"
                      style={{
                        background: selectedDisaster === d.key ? `${d.color}22` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedDisaster === d.key ? d.color + '55' : 'rgba(255,255,255,0.07)'}`,
                        color: selectedDisaster === d.key ? '#fff' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      <span className="text-lg">{d.icon}</span>
                      <span className="leading-tight text-center" style={{ fontSize: '10px' }}>{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Alert Severity Level
                </label>
                <div className="flex gap-2">
                  {SEVERITY_LEVELS.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setSelectedSeverity(s.key as typeof selectedSeverity)}
                      className="flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all"
                      style={{
                        background: selectedSeverity === s.key ? `${s.color}22` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedSeverity === s.key ? s.color + '66' : 'rgba(255,255,255,0.07)'}`,
                        color: selectedSeverity === s.key ? s.color : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Broadcast Language
                  {selectedState && (
                    <span className="ml-1.5 font-normal normal-case" style={{ color: 'rgba(248,113,113,0.8)' }}>
                      (Auto-set for {selectedState.name})
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORTED_LANGUAGES.map(l => {
                    const covered = availableLangs.includes(l.code);
                    return (
                      <button
                        key={l.code}
                        onClick={() => setSelectedLang(l.code as LangCode)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                        style={{
                          background: selectedLang === l.code ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${selectedLang === l.code ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.07)'}`,
                          color: selectedLang === l.code ? '#38bdf8' : covered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)',
                          opacity: covered ? 1 : 0.6,
                        }}
                        title={covered ? `${l.label} template available` : `${l.label} — falls back to Hindi/English`}
                      >
                        {l.script}
                        {!covered && <span style={{ color: 'rgba(251,191,36,0.7)', fontSize: '8px' }}>*</span>}
                      </button>
                    );
                  })}
                </div>
                {!hasTemplate && (
                  <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: 'rgba(251,191,36,0.7)' }}>
                    <Info className="w-3 h-3" /> No native template for this combination — will use Hindi or English fallback.
                  </p>
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!selectedState}
                className="w-full py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  background: selectedState ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${selectedState ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  color: selectedState ? '#f87171' : 'rgba(255,255,255,0.25)',
                }}
              >
                Next: Compose Alert <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </button>
            </>
          )}

          {/* ════ STEP 2: Compose ══════════════════════════════════════════ */}
          {step === 2 && (
            <>
              {/* Context summary bar */}
              <div
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-lg">{currentDisaster.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-white">{selectedState?.name || 'No state selected'}</span>
                  <span className="mx-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{currentDisaster.label}</span>
                  <span className="mx-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                  <span style={{ color: currentSeverity.color }}>{currentSeverity.label}</span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-[10px] font-semibold flex items-center gap-1"
                  style={{ color: 'rgba(56,189,248,0.7)' }}
                >
                  <RefreshCw className="w-3 h-3" /> Change
                </button>
              </div>

              {/* Message editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Alert Message ({SUPPORTED_LANGUAGES.find(l => l.code === selectedLang)?.label || selectedLang})
                  </label>
                  <div className="flex items-center gap-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    <span style={{ color: smsStats.isUnicode ? '#fbbf24' : '#34d399' }}>
                      {smsStats.isUnicode ? '🌏 Unicode' : '🔤 ASCII'}
                    </span>
                    <span>{smsStats.chars} chars · {smsStats.segments} SMS segment{smsStats.segments !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 rounded-2xl text-xs leading-relaxed outline-none resize-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                  placeholder="Your regional alert message will appear here..."
                />
                <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <Info className="w-3 h-3" />
                  Each Unicode SMS = 70 chars/segment · ASCII = 160 chars/segment · Edit freely
                </p>
              </div>

              {/* Language quick-switch row */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Quick Language Switch (Regenerates Template)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUPPORTED_LANGUAGES.filter(l => Object.keys(VERNACULAR_TEMPLATES[selectedDisaster] || {}).includes(l.code)).map(l => (
                    <button
                      key={l.code}
                      onClick={() => setSelectedLang(l.code as LangCode)}
                      className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                      style={{
                        background: selectedLang === l.code ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${selectedLang === l.code ? 'rgba(56,189,248,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        color: selectedLang === l.code ? '#38bdf8' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {l.script}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full py-3 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171' }}
              >
                Next: Add Recipients <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </button>
            </>
          )}

          {/* ════ STEP 3: Recipients & Send ════════════════════════════════ */}
          {step === 3 && (
            <>
              {/* Summary bar */}
              <div
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px]"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-lg">{currentDisaster.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-white">{selectedState?.name}</span>
                  <span className="mx-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{currentDisaster.label}</span>
                  <span className="mx-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                  <span style={{ color: currentSeverity.color }}>{currentSeverity.label}</span>
                  <span className="mx-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                  <span style={{ color: smsStats.isUnicode ? '#fbbf24' : '#34d399' }}>
                    {smsStats.segments} SMS/recipient
                  </span>
                </div>
              </div>

              {/* Phone numbers input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Recipient Mobile Numbers
                  </label>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                    style={{
                      background: validNumbers.length > 0 ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.06)',
                      color: validNumbers.length > 0 ? '#34d399' : 'rgba(255,255,255,0.3)',
                    }}
                  >
                    {validNumbers.length} valid
                  </span>
                </div>
                <textarea
                  value={numbersInput}
                  onChange={e => setNumbersInput(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 rounded-2xl text-xs leading-relaxed outline-none resize-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontFamily: 'monospace',
                  }}
                  placeholder={"Enter 10-digit mobile numbers:\n• One per line, or comma-separated\n• Example:\n9876543210\n9123456789, 8001234567\n+91-98765-43210 (auto-cleaned)"}
                />
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-[10px] flex items-center gap-1 flex-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <Users className="w-3 h-3" />
                    Auto-deduplicates · Strips country codes · Validates 10-digit format
                  </p>
                  <div className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {Math.ceil(validNumbers.length / 1000)} batch(es)
                  </div>
                </div>
              </div>

              {/* Stats row */}
              {validNumbers.length > 0 && (
                <div
                  className="grid grid-cols-3 gap-2 p-3 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {[
                    { label: 'Recipients', value: validNumbers.length.toLocaleString(), color: '#38bdf8' },
                    { label: 'SMS/Recipient', value: smsStats.segments, color: smsStats.isUnicode ? '#fbbf24' : '#34d399' },
                    { label: 'Est. Total SMS', value: (validNumbers.length * smsStats.segments).toLocaleString(), color: '#f87171' },
                  ].map(stat => (
                    <div key={stat.label} className="text-center">
                      <p className="text-lg font-black" style={{ color: stat.color }}>{stat.value}</p>
                      <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Dispatch Info Banner */}
              <div
                className="flex gap-2.5 px-3.5 py-2.5 rounded-xl text-[10px] leading-relaxed"
                style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)', color: 'rgba(251,191,36,0.8)' }}
              >
                <Zap className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Production Note:</strong> For CORS-free bulk dispatch to 10,000+ numbers, route through a backend proxy (Supabase Edge Function / Node.js server). Fast2SMS supports DLT-registered Sender IDs for state-level emergency broadcasts.
                </div>
              </div>

              {/* Result */}
              {result && (
                <div
                  className="flex items-start gap-2.5 px-3.5 py-3 rounded-2xl text-xs leading-relaxed"
                  style={{
                    background: resultOk ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)',
                    border: `1px solid ${resultOk ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    color: resultOk ? '#34d399' : '#f87171',
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{result}</span>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={sending || validNumbers.length === 0 || !message.trim()}
                className="w-full py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
                style={{
                  background: sending || validNumbers.length === 0
                    ? 'rgba(255,255,255,0.06)'
                    : 'linear-gradient(135deg, #dc2626 0%, #9f1239 100%)',
                  color: sending || validNumbers.length === 0 ? 'rgba(255,255,255,0.25)' : '#fff',
                  border: 'none',
                  boxShadow: sending || validNumbers.length === 0 ? 'none' : '0 8px 24px rgba(220,38,38,0.35)',
                  letterSpacing: '0.02em',
                }}
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Dispatching to {validNumbers.length} recipients...
                  </>
                ) : (
                  <>
                    <Radio className="w-5 h-5" />
                    Broadcast {selectedState ? `to ${selectedState.name}` : 'SMS Alert'}
                    {validNumbers.length > 0 && ` · ${validNumbers.length} recipients`}
                  </>
                )}
              </button>

              <p className="text-center text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Saarthi · Fast2SMS Bulk API · Unicode Regional Language Broadcast
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkSMSModal;
