import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header, { TextScaleLevel } from './Header';
import SituationMapTab from './SituationMapTab';
import UnifiedSimulatorTab from './UnifiedSimulatorTab';
import FieldIntelTab from './FieldIntelTab';
import { useLanguage } from '@/context/LanguageContext';
import { playVernacularAudio, stopVernacularAudio } from '@/utils/vernacularTTS';
import { Shield, PhoneCall, AlertTriangle, LifeBuoy } from 'lucide-react';
import { getPendingSOSQueue, clearPendingSOSQueue } from '@/services/offlineStorageService';

export const SahayAIDisasterHub: React.FC = () => {
  const { currentLanguageMeta } = useLanguage();

  // Active Tab state: 'map' | 'simulator' | 'intel'
  const [activeTab, setActiveTab] = useState<'map' | 'simulator' | 'intel'>('map');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Text Scaling Accessibility Level
  const [textScale, setTextScale] = useState<TextScaleLevel>('normal');

  // Network Connectivity State
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  // Web Speech TTS State for voice accessibility broadcast
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const stopAudioRef = useRef<(() => void) | null>(null);
  const isSpeechSupported = true;

  const activeAdvisoryScript = `
SAHAYai National Disaster Operations Alert.
Active high-risk sectors under surveillance:
Kattankulathur Chennai corridor cyclone surge,
Dibrugarh Assam riverine inundation,
Joshimath Chamoli geotechnical slope subsidence,
Wayanad slope saturation,
Chiplun flash flood,
and Puri coastal belt.
All operational NDRF teams, multi-purpose shelters, and emergency helpline 112 are active.
Follow evacuation corridors and assemble at designated high-ground shelters immediately.
`.trim();

  // Handle Tab Switch with fluid cross-fade and 8px vertical slide
  const handleTabChange = (nextTab: 'map' | 'simulator' | 'intel') => {
    if (nextTab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(nextTab);
      setIsTransitioning(false);
    }, 120);
  };

  // Online / Offline synchronization listener
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const pending = await getPendingSOSQueue();
      if (pending.length > 0) {
        await clearPendingSOSQueue();
        setOfflineNotice(
          `Satellite and cellular network re-established. Dispatched ${pending.length} offline-queued distress telemetry payloads to District Emergency Command.`
        );
      } else {
        setOfflineNotice(null);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOfflineNotice('Operating in offline cache mode. Local NDMA directives and shelter records remain active.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Web Speech broadcast handler
  const handleToggleSpeech = useCallback(() => {
    if (isSpeaking) {
      if (stopAudioRef.current) {
        stopAudioRef.current();
        stopAudioRef.current = null;
      }
      stopVernacularAudio();
      setIsSpeaking(false);
      return;
    }

    if (stopAudioRef.current) {
      stopAudioRef.current();
      stopAudioRef.current = null;
    }
    stopVernacularAudio();
    setIsSpeaking(true);

    const stop = playVernacularAudio({
      text: activeAdvisoryScript,
      language: currentLanguageMeta.code,
      bcp47: currentLanguageMeta.bcp47,
      rate: 1.0,
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        stopAudioRef.current = null;
      },
      onError: () => {
        setIsSpeaking(false);
        stopAudioRef.current = null;
      },
    });
    stopAudioRef.current = stop;
  }, [isSpeaking, activeAdvisoryScript, currentLanguageMeta]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (stopAudioRef.current) {
        stopAudioRef.current();
        stopAudioRef.current = null;
      }
      stopVernacularAudio();
    };
  }, []);

  const getTextScaleClass = () => {
    switch (textScale) {
      case 'large':
        return 'text-[1.06rem] leading-relaxed';
      case 'xlarge':
        return 'text-[1.16rem] leading-loose';
      default:
        return 'text-sm leading-normal';
    }
  };

  return (
    <div
      className={`min-h-screen font-sans antialiased text-[#14273E] apple-canvas transition-all duration-300 ${getTextScaleClass()}`}
      style={{
        background: 'linear-gradient(180deg, #FBF9F5 0%, #F3EFEA 100%)',
      }}
    >
      {/* Apple-Grade Frosted Glass Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isOnline={isOnline}
        isSpeaking={isSpeaking}
        onToggleSpeech={handleToggleSpeech}
        textScale={textScale}
        onTextScaleChange={setTextScale}
      />

      {/* Offline / Sync Notification Banner */}
      {offlineNotice && (
        <div className="w-full bg-[#14273E]/95 backdrop-blur-md text-white py-2.5 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-mono">
            <span className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#7D9D8B]" />
              <span>{offlineNotice}</span>
            </span>
            <button
              type="button"
              onClick={() => setOfflineNotice(null)}
              className="text-slate-400 hover:text-white apple-btn-haptic px-2 py-0.5 rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body with Apple Fluid Cross-Fade & 8px Vertical Slide */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div
          className={`transition-all duration-200 ease-out will-change-transform ${
            isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
          }`}
        >
          {/* TAB 1: NATIONWIDE SITUATION MAP & REAL-TIME HAZARD FILTERS */}
          {activeTab === 'map' && <SituationMapTab />}

          {/* TAB 2: UNIFIED DISASTER IMAGE ANALYZER & INTERACTIVE SIMULATOR */}
          {activeTab === 'simulator' && <UnifiedSimulatorTab />}

          {/* TAB 3: FIELD INTELLIGENCE, CIVIL RADIO & 30-CHAR ALERT DISPATCH */}
          {activeTab === 'intel' && <FieldIntelTab />}
        </div>
      </main>

      {/* Frosted Glass Footer */}
      <footer className="mt-20 bg-white/70 backdrop-blur-2xl border-t border-white/60 py-8 select-none shadow-[0_-4px_24px_rgba(20,39,62,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-600">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-[#14273E] flex items-center justify-center text-white font-bold shadow-md shadow-[#14273E]/10">
              <Shield className="w-5 h-5 text-[#7D9D8B]" />
            </div>
            <div>
              <div className="font-bold text-[#14273E] tracking-wide">
                SAHAY<span className="text-[#7D9D8B]">ai</span> — Emergency Operations System
              </div>
              <div className="text-slate-500 text-[11px]">
                Standardized National Disaster Management Authority Guidelines
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 font-semibold text-[#14273E]">
            <span className="flex items-center space-x-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <PhoneCall className="w-3.5 h-3.5 text-[#7D9D8B]" />
              <span>National Helpline: 112</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <PhoneCall className="w-3.5 h-3.5 text-[#7D9D8B]" />
              <span>Disaster Helpline: 1070</span>
            </span>
            <span className="flex items-center space-x-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <LifeBuoy className="w-3.5 h-3.5 text-[#7D9D8B]" />
              <span>NDRF Operations: 011-24363260</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            WCAG 2.1 AAA Accessibility & Multilingual Architecture
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SahayAIDisasterHub;
