import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  Send,
  PhoneCall,
  Activity,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Clock,
  Filter,
  Wifi,
  Play,
  Square,
  RefreshCw,
  Hash,
  FileText,
  Sliders,
  ExternalLink,
  Signal,
  Waves,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { playVernacularAudio, stopVernacularAudio } from '@/utils/vernacularTTS';
import { generate30CharMicroAlert } from '@/services/ragService';
import { sendVernacularSMS, validateSMSBudget, SMSDispatchResult } from '@/services/smsService';
import AppleTiltCard from './AppleTiltCard';

/* ------------------------------------------------------------------ */
/* Radio Stream Presets & Interfaces                                  */
/* ------------------------------------------------------------------ */

export interface RadioChannel {
  id: string;
  name: string;
  frequency: string;
  agency: string;
  description: string;
  activeBroadcast: string;
}

export const RADIO_CHANNELS: RadioChannel[] = [
  {
    id: 'ndrf-net',
    name: 'NDRF National Tactical Command Net',
    frequency: '156.800 MHz VHF',
    agency: 'National Disaster Response Force',
    description: 'Direct operational tactical frequency for regional battalion commanders and field strike squads.',
    activeBroadcast:
      'COMMAND SEC-4: Priority evacuation orders active for sector B-7. Watercraft teams alpha and bravo report at staging bridge. Maintain secondary radio standby on 156.800.',
  },
  {
    id: 'seoc-state',
    name: 'State Emergency Operations Center (SEOC)',
    frequency: '148.250 MHz VHF',
    agency: 'State Disaster Management Authority',
    description: 'Inter-agency coordination channel between district magistrates, fire services, and medical units.',
    activeBroadcast:
      'SEOC DISPATCH: Subdivisional shelters 4 through 9 are at 62% capacity. Additional dry rations and water bowsers en route via National Highway bypass.',
  },
  {
    id: 'air-civil',
    name: 'All India Radio Civil Defense Emergency Relay',
    frequency: '102.400 MHz FM',
    agency: 'Prasar Bharati / Civil Defense',
    description: 'Low-power vernacular civilian emergency advisory loop broadcast for battery-operated transistor receivers.',
    activeBroadcast:
      'CIVIL ADVISORY: Citizens in low-lying riparian sectors must move to concrete multi-purpose shelters immediately. Keep essential identity papers in waterproof pouches.',
  },
  {
    id: 'cg-sar',
    name: 'Indian Coast Guard SAR & Distress Watch',
    frequency: '2182.0 kHz HF',
    agency: 'Indian Coast Guard Maritime Command',
    description: 'Maritime distress and coastal storm surge monitoring channel for fishing communities and harbor operations.',
    activeBroadcast:
      'COAST GUARD OPS: Sea condition rough to phenomenal with swell waves up to 4.2 meters. All trawlers and mechanized craft instructed to remain berthed at safe harbor.',
  },
];

/* ------------------------------------------------------------------ */
/* Real-Time Agency Bulletins Data                                    */
/* ------------------------------------------------------------------ */

export interface AgencyBulletin {
  id: string;
  source: 'IMD' | 'CWC' | 'Police' | 'Citizen';
  agencyName: string;
  severity: 'Urgent' | 'High' | 'Moderate';
  headline: string;
  content: string;
  location: string;
  timestampMinutesAgo: number;
  verificationBadge: boolean;
}

export const SAMPLE_BULLETINS: AgencyBulletin[] = [
  {
    id: 'b-01',
    source: 'IMD',
    agencyName: 'India Meteorological Department (IMD)',
    severity: 'Urgent',
    headline: 'Red Alert: Severe Cyclone Landfall Warning',
    content:
      'Core cyclone circulation centered 85 km east-southeast of coastal line. Squally wind speed reaching 85-95 km/h with gale gusts. Torrential rainfall likely to cause flash waterlogging in urban corridors.',
    location: 'Chennai / Chengalpattu Coastal Belt',
    timestampMinutesAgo: 6,
    verificationBadge: true,
  },
  {
    id: 'b-02',
    source: 'CWC',
    agencyName: 'Central Water Commission (CWC)',
    severity: 'Urgent',
    headline: 'Severe Flood Forecast: River Gauge Above Highest Level',
    content:
      'Brahmaputra river level at Dibrugarh recorded at 105.82 meters, exceeding the highest flood mark by 0.65m. Inflow rate increasing at 2,400 cumecs/hr. High risk of embankment breach along north bank.',
    location: 'Dibrugarh / Brahmaputra Basin, Assam',
    timestampMinutesAgo: 14,
    verificationBadge: true,
  },
  {
    id: 'b-03',
    source: 'Police',
    agencyName: 'State Police & Traffic Management Authority',
    severity: 'High',
    headline: 'Emergency Traffic Diversion: NH45 Causeway Inundated',
    content:
      'Causeway km-marker 42 submerged under 0.8 meters of fast-moving water. All commercial heavy vehicles diverted via State Highway bypass 14. Emergency rescue vehicles provided priority single-lane escort.',
    location: 'Kattankulathur Arterial Highway',
    timestampMinutesAgo: 22,
    verificationBadge: true,
  },
  {
    id: 'b-04',
    source: 'IMD',
    agencyName: 'State Geological & Meteorological Cell',
    severity: 'High',
    headline: 'Slope Subsidence & Rockfall Advisory',
    content:
      'Heavy geotechnical saturation detected across Chamoli and Joshimath slopes. Debris movement observed along NH-7. All non-essential mountain transit halted till daylight inspection.',
    location: 'Joshimath / Chamoli Valley, Uttarakhand',
    timestampMinutesAgo: 38,
    verificationBadge: true,
  },
  {
    id: 'b-05',
    source: 'Citizen',
    agencyName: 'Verified Community Emergency Warden',
    severity: 'Moderate',
    headline: 'Drinking Water Distribution Node Active',
    content:
      'Local civic school shelter campus has received 5,000 liters of treated potable water and 400 nutrient meal packets. Medical inspection room staffed with auxiliary nursing personnel.',
    location: 'Wayanad Riparian Relief Camp',
    timestampMinutesAgo: 45,
    verificationBadge: true,
  },
  {
    id: 'b-06',
    source: 'Police',
    agencyName: 'District Police Control Room',
    severity: 'Moderate',
    headline: 'Emergency Helpline Numbers Operational',
    content:
      'Dedicated round-the-clock lines for boat extraction requests: Dial 112 or local dispatch 044-27427412. Battery charging station established at Taluk Office relief hub.',
    location: 'Chengalpattu District HQ',
    timestampMinutesAgo: 52,
    verificationBadge: true,
  },
];

/* ------------------------------------------------------------------ */
/* Main Field Intelligence Tab Component                              */
/* ------------------------------------------------------------------ */

export const FieldIntelTab: React.FC = () => {
  const { t, currentLanguageMeta } = useLanguage();

  // Radio Stream State
  const [selectedChannel, setSelectedChannel] = useState<RadioChannel>(RADIO_CHANNELS[0]);
  const [isPlayingRadio, setIsPlayingRadio] = useState<boolean>(false);
  const [radioVolume, setRadioVolume] = useState<number>(0.75);
  const [audioSquelch, setAudioSquelch] = useState<boolean>(true);

  // Web Audio Synth references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const stopAudioRef = useRef<(() => void) | null>(null);

  // Bulletins Feed Filter
  const [bulletinFilter, setBulletinFilter] = useState<'All' | 'IMD' | 'CWC' | 'Police' | 'Citizen'>('All');
  const [bulletins] = useState<AgencyBulletin[]>(SAMPLE_BULLETINS);

  // 30-Character Micro-Alert State
  const [alertHazard, setAlertHazard] = useState<string>('Severe Cyclone & Storm Surge');
  const [alertLocation, setAlertLocation] = useState<string>('Kattankulathur Sector');
  const [microAlertText, setMicroAlertText] = useState<string>('CYCLONE: SEEK HIGH SHELTER NOW');
  const [isGeneratingAlert, setIsGeneratingAlert] = useState<boolean>(false);
  const [phoneRecipients, setPhoneRecipients] = useState<string>('9876543210, 9123456780, 9988776655');
  const [isSendingSMS, setIsSendingSMS] = useState<boolean>(false);
  const [smsResult, setSmsResult] = useState<SMSDispatchResult | null>(null);

  /* ------------------------------------------------------------------ */
  /* Audio Simulation (Web Audio API RF Squelch & Telemetry Waveform)  */
  /* ------------------------------------------------------------------ */

  const startRadioAudio = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.08;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1450;
      bandpass.Q.value = 1.8;

      const gain = ctx.createGain();
      gain.gain.value = radioVolume * (audioSquelch ? 0.04 : 0.15);

      whiteNoise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
      gainNodeRef.current = gain;
      setIsPlayingRadio(true);

      if (stopAudioRef.current) {
        stopAudioRef.current();
        stopAudioRef.current = null;
      }
      stopVernacularAudio();

      stopAudioRef.current = playVernacularAudio({
        text: selectedChannel.activeBroadcast,
        language: currentLanguageMeta.code,
        bcp47: currentLanguageMeta.bcp47,
        rate: 1.0,
        onEnd: () => {
          stopAudioRef.current = null;
        },
        onError: () => {
          stopAudioRef.current = null;
        },
      });
    } catch (err) {
      console.warn('Audio simulation notice:', err);
      setIsPlayingRadio(true);
    }
  };

  const stopRadioAudio = () => {
    try {
      if (noiseNodeRef.current) {
        (noiseNodeRef.current as any).stop?.();
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }
      if (stopAudioRef.current) {
        stopAudioRef.current();
        stopAudioRef.current = null;
      }
      stopVernacularAudio();
    } catch {
      // ignore
    }
    setIsPlayingRadio(false);
  };

  const toggleRadioPlayback = () => {
    if (isPlayingRadio) {
      stopRadioAudio();
    } else {
      startRadioAudio();
    }
  };

  const handleSelectChannel = (ch: RadioChannel) => {
    setSelectedChannel(ch);
    if (isPlayingRadio) {
      stopRadioAudio();
      setTimeout(() => {
        startRadioAudio();
      }, 150);
    }
  };

  useEffect(() => {
    return () => {
      stopRadioAudio();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // RF Spectrum Waveform Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#14273E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1E3A5F';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const centerY = canvas.height / 2;
      ctx.beginPath();
      ctx.strokeStyle = isPlayingRadio ? '#7D9D8B' : '#64748B';
      ctx.lineWidth = 2;

      for (let x = 0; x < canvas.width; x++) {
        let y = centerY;
        if (isPlayingRadio) {
          const freq1 = Math.sin(x * 0.04 + phase) * 14;
          const freq2 = Math.sin(x * 0.12 - phase * 1.5) * 6;
          const noise = (Math.random() - 0.5) * 4;
          y = centerY + freq1 + freq2 + noise;
        } else {
          y = centerY + (Math.random() - 0.5) * 2;
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.08;
      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlayingRadio]);

  // Micro-Alert Synthesis
  const handleSynthesizeMicroAlert = async () => {
    setIsGeneratingAlert(true);
    setSmsResult(null);
    try {
      const generated = await generate30CharMicroAlert({
        hazard: alertHazard,
        location: alertLocation,
      });
      setMicroAlertText(generated.slice(0, 30).toUpperCase());
    } catch {
      setMicroAlertText('EVACUATE NOW: DIAL 112');
    } finally {
      setIsGeneratingAlert(false);
    }
  };

  // SMS Dispatch Trigger
  const handleDispatchSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneRecipients.trim() || !microAlertText.trim()) return;

    setIsSendingSMS(true);
    setSmsResult(null);

    try {
      const res = await sendVernacularSMS({
        numbers: phoneRecipients,
        message: microAlertText.slice(0, 30),
        language: currentLanguageMeta.name.toLowerCase(),
      });
      setSmsResult(res);
    } catch (err: any) {
      setSmsResult({
        success: false,
        simulated: true,
        recipientCount: 0,
        message: err?.message || 'Error occurred while contacting dispatch gateway.',
        timestamp: new Date().toLocaleTimeString('en-IN'),
      });
    } finally {
      setIsSendingSMS(false);
    }
  };

  const filteredBulletins = bulletins.filter((b) => {
    if (bulletinFilter === 'All') return true;
    return b.source === bulletinFilter;
  });

  const charCount = microAlertText.length;
  const isOverLimit = charCount > 30;

  return (
    <div className="space-y-8">
      {/* ========================================================= */}
      {/* SECTION 1: EMERGENCY CIVIL DEFENSE RADIO STREAM           */}
      {/* ========================================================= */}
      <section className="apple-glass-panel overflow-hidden">
        {/* Channel Banner */}
        <div className="p-5 sm:p-6 bg-[#14273E] text-white flex flex-wrap items-center justify-between gap-4 border-b border-white/10">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#7D9D8B] border border-white/15 shadow-sm">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  {t('radioTitle')}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border backdrop-blur-md ${
                    isPlayingRadio
                      ? 'bg-[#7D9D8B]/25 text-[#7D9D8B] border-[#7D9D8B]/40'
                      : 'bg-white/10 text-slate-300 border-white/15'
                  }`}
                >
                  {isPlayingRadio ? t('radioLive') : t('radioOff')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{t('radioSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-slate-200 flex items-center space-x-2 shadow-xs">
              <Signal className="w-3.5 h-3.5 text-[#7D9D8B]" />
              <span>RSSI: -58 dBm</span>
              <span className="text-slate-500">•</span>
              <span>SNR: 24 dB</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white/40">
          {/* Radio Channel Selector */}
          <div className="lg:col-span-4 space-y-2.5">
            <label className="block text-xs font-bold text-[#14273E] uppercase tracking-wider">
              {t('radioStationLabel')}
            </label>
            <div className="space-y-2.5">
              {RADIO_CHANNELS.map((ch) => {
                const isSelected = selectedChannel.id === ch.id;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleSelectChannel(ch)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all apple-btn-haptic focus:outline-none focus:ring-2 focus:ring-[#7D9D8B] ${
                      isSelected
                        ? 'bg-white border-[#1D7A82] shadow-md ring-2 ring-[#1D7A82]/20'
                        : 'bg-white/70 hover:bg-white/90 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#14273E]">{ch.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E5ECE7] text-[#14273E] font-bold">
                        {ch.frequency}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{ch.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RF Receiver Telemetry & Waveform Canvas */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
            <div className="bg-[#14273E] rounded-2xl p-4 border border-white/10 shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pb-2 mb-2 border-b border-white/10">
                <span className="flex items-center space-x-1.5 text-[#7D9D8B]">
                  <Waves className="w-3.5 h-3.5" />
                  <span>Carrier Waveform Telemetry</span>
                </span>
                <span className="text-slate-400 font-bold">{selectedChannel.frequency}</span>
              </div>
              <canvas
                ref={canvasRef}
                width={560}
                height={75}
                className="w-full h-16 rounded-xl bg-[#14273E] block"
              />
            </div>

            {/* Active Transmission Transcript Box */}
            <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-[#14273E] mb-1.5">
                <span className="flex items-center space-x-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#1D7A82]" />
                  <span>Monitored Transmission Stream</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">{selectedChannel.agency}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-mono bg-slate-50/90 p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                "{selectedChannel.activeBroadcast}"
              </p>
            </div>

            {/* Audio Control Bar with Spring Haptics */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-3.5 rounded-2xl border border-white/80">
              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={toggleRadioPlayback}
                  className={`min-h-[44px] px-5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all apple-fab-lift apple-btn-haptic shadow-md focus:outline-none focus:ring-2 focus:ring-[#7D9D8B] ${
                    isPlayingRadio
                      ? 'bg-[#C85A4B] text-white hover:bg-[#B94A3E]'
                      : 'bg-[#14273E] text-white hover:bg-[#1E3A5F]'
                  }`}
                >
                  {isPlayingRadio ? (
                    <>
                      <Square className="w-4 h-4 fill-white" />
                      <span>Halt Radio Stream</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Connect Civil Radio Stream</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAudioSquelch(!audioSquelch)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border apple-btn-haptic transition-all ${
                    audioSquelch
                      ? 'bg-[#E5ECE7] text-[#14273E] border-[#7D9D8B]'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                  title="Squelch filters out background RF static"
                >
                  RF Squelch: {audioSquelch ? 'Active' : 'Off'}
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-slate-500" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={radioVolume}
                  onChange={(e) => setRadioVolume(parseFloat(e.target.value))}
                  className="w-24 accent-[#1D7A82]"
                  aria-label="Radio volume control"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2 & 3: BULLETINS (GLASS SPINE) & 30-CHAR ALERT   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real-Time Agency Bulletins (7 Columns) with Vertical Glass Spine */}
        <section className="lg:col-span-7 apple-glass-panel p-6 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3.5 apple-hairline-b gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#14273E] flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#1D7A82]" />
                <span>{t('bulletinsTitle')}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verified meteorological, hydrological, and municipal road alerts
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1 bg-white/80 backdrop-blur-md p-1 rounded-2xl border border-slate-200/80 text-xs">
              {(['All', 'IMD', 'CWC', 'Police', 'Citizen'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setBulletinFilter(filterKey)}
                  className={`px-3 py-1 rounded-xl font-medium transition-all apple-btn-haptic ${
                    bulletinFilter === filterKey
                      ? 'bg-[#14273E] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-[#14273E]'
                  }`}
                >
                  {filterKey === 'All'
                    ? t('filterAll')
                    : filterKey === 'IMD'
                    ? t('filterIMD')
                    : filterKey === 'CWC'
                    ? t('filterCWC')
                    : filterKey === 'Police'
                    ? t('filterPolice')
                    : t('filterCitizen')}
                </button>
              ))}
            </div>
          </div>

          {/* Vertical Glass Spine Feed List */}
          <div className="relative pl-6 space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {/* The Vertical Spine Line */}
            <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#1D7A82] via-[#7D9D8B] to-slate-200 rounded-full" />

            {filteredBulletins.map((bulletin) => {
              const isUrgent = bulletin.severity === 'Urgent';
              const isHigh = bulletin.severity === 'High';

              return (
                <article
                  key={bulletin.id}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    isUrgent
                      ? 'bg-[#C85A4B]/10 border-[#C85A4B]/35 shadow-xs'
                      : isHigh
                      ? 'bg-amber-50/80 border-amber-300/40 shadow-xs'
                      : 'bg-white/80 border-white/90 shadow-xs'
                  }`}
                >
                  {/* Frosted Circular Milestone Chip on the Spine */}
                  <div
                    className={`absolute -left-[27px] top-4 w-4 h-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${
                      isUrgent
                        ? 'bg-[#C85A4B]'
                        : isHigh
                        ? 'bg-amber-500'
                        : 'bg-[#7D9D8B]'
                    }`}
                  />

                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider ${
                          bulletin.source === 'IMD'
                            ? 'bg-[#E5ECE7] text-[#14273E]'
                            : bulletin.source === 'CWC'
                            ? 'bg-[#EBF2EE] text-[#1D7A82]'
                            : bulletin.source === 'Police'
                            ? 'bg-[#14273E] text-white'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {bulletin.source}
                      </span>
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                        <span>{bulletin.agencyName}</span>
                        {bulletin.verificationBadge && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1D7A82]" />
                        )}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{bulletin.timestampMinutesAgo}m ago</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#14273E] mb-1">{bulletin.headline}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2.5">{bulletin.content}</p>

                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/50 text-slate-500">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-slate-700">{bulletin.location}</span>
                    </span>
                    <span
                      className={`font-semibold uppercase tracking-wider text-[10px] ${
                        isUrgent
                          ? 'text-[#C85A4B]'
                          : isHigh
                          ? 'text-[#D97706]'
                          : 'text-[#5E8C71]'
                      }`}
                    >
                      Priority: {bulletin.severity}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 30-Character Micro-Alert Generator & Fast2SMS Dispatch (5 Columns) */}
        <section className="lg:col-span-5 apple-glass-panel p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div>
            <div className="pb-3.5 apple-hairline-b">
              <h2 className="text-base sm:text-lg font-bold text-[#14273E] flex items-center space-x-2">
                <Send className="w-5 h-5 text-[#1D7A82]" />
                <span>{t('microAlertTitle')}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{t('alertConstraintNote')}</p>
            </div>

            <form onSubmit={handleDispatchSMS} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#14273E] mb-1">Hazard Type</label>
                  <input
                    type="text"
                    value={alertHazard}
                    onChange={(e) => setAlertHazard(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D7A82] bg-white/80"
                    placeholder="e.g. Cyclone, Flood"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#14273E] mb-1">Target Sector</label>
                  <input
                    type="text"
                    value={alertLocation}
                    onChange={(e) => setAlertLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D7A82] bg-white/80"
                    placeholder="e.g. Kattankulathur, Dibrugarh"
                  />
                </div>
              </div>

              {/* Synthesize Button */}
              <button
                type="button"
                onClick={handleSynthesizeMicroAlert}
                disabled={isGeneratingAlert}
                className="w-full min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold bg-[#E5ECE7] text-[#14273E] hover:bg-[#7D9D8B] hover:text-white border border-[#7D9D8B]/40 transition-all apple-btn-haptic flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[#1D7A82]"
              >
                {isGeneratingAlert ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#14273E]" />
                    <span>Synthesizing Micro-Alert...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-[#1D7A82]" />
                    <span>{t('synthesizeAlert')}</span>
                  </>
                )}
              </button>

              {/* Editable 30-Char Alert Output Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#14273E] uppercase tracking-wider">
                    Public Alert Text
                  </label>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                      isOverLimit
                        ? 'bg-[#C85A4B]/20 text-[#C85A4B] border border-[#C85A4B]/40'
                        : 'bg-[#7D9D8B]/20 text-[#14273E] border border-[#7D9D8B]/40'
                    }`}
                  >
                    {charCount} / 30 Characters
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={30}
                  value={microAlertText}
                  onChange={(e) => setMicroAlertText(e.target.value.toUpperCase())}
                  className="w-full p-3.5 text-sm font-mono font-bold tracking-wide uppercase rounded-2xl border border-slate-200 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#1D7A82] text-[#14273E] resize-none shadow-xs"
                  placeholder="ALERT TEXT (MAX 30 CHARS)"
                  required
                />
              </div>

              {/* Recipient Numbers Input */}
              <div>
                <label className="block text-xs font-bold text-[#14273E] mb-1">
                  {t('smsRecipientsLabel')}
                </label>
                <textarea
                  rows={2}
                  value={phoneRecipients}
                  onChange={(e) => setPhoneRecipients(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono rounded-xl border border-slate-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#1D7A82] text-slate-800 resize-none shadow-xs"
                  placeholder="9876543210, 9123456780, 9988776655"
                  required
                />
              </div>

              {/* Dispatch Action Button */}
              <button
                type="submit"
                disabled={isSendingSMS || isOverLimit}
                className={`w-full min-h-[48px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all apple-fab-lift apple-btn-haptic shadow-md focus:outline-none focus:ring-2 focus:ring-[#1D7A82] ${
                  isOverLimit
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#14273E] text-white hover:bg-[#1E3A5F]'
                }`}
              >
                {isSendingSMS ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Broadcasting Alert Payload...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#7D9D8B]" />
                    <span>{t('btnSendSMS')}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* SMS Dispatch Gateway Response Card */}
          {smsResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-1.5 transition-all ${
                smsResult.success
                  ? 'bg-[#E5ECE7] border-[#7D9D8B] text-[#14273E]'
                  : 'bg-[#FBEBEA] border-[#C85A4B] text-[#C85A4B]'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center space-x-1.5">
                  {smsResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-[#1D7A82]" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#C85A4B]" />
                  )}
                  <span>{smsResult.success ? 'Dispatch Confirmed' : 'Dispatch Failure'}</span>
                </span>
                <span className="font-mono text-[10px] text-slate-600">{smsResult.timestamp}</span>
              </div>
              <p className="leading-relaxed">{smsResult.message}</p>
              {smsResult.recipientCount > 0 && (
                <div className="text-[11px] font-mono text-slate-700 pt-1 border-t border-slate-300">
                  Target Recipients: {smsResult.recipientCount} Verified Lines | Length: {charCount}/30
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FieldIntelTab;
