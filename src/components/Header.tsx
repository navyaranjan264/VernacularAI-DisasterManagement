import React from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Map,
  Camera,
  Radio,
  PhoneCall,
} from 'lucide-react';
import { useLanguage, LanguageMeta } from '@/context/LanguageContext';

export type TextScaleLevel = 'normal' | 'large' | 'xlarge';

interface HeaderProps {
  activeTab: 'map' | 'simulator' | 'intel';
  onTabChange: (tab: 'map' | 'simulator' | 'intel') => void;
  isOnline: boolean;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  textScale: TextScaleLevel;
  onTextScaleChange: (scale: TextScaleLevel) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isOnline,
  isSpeaking,
  onToggleSpeech,
  textScale,
  onTextScaleChange,
}) => {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  // Tab index calculation for sliding indicator (0 = map, 1 = simulator, 2 = intel)
  const tabIndex = activeTab === 'map' ? 0 : activeTab === 'simulator' ? 1 : 2;

  return (
    <header className="sticky top-0 z-50 select-none transition-all duration-300">
      {/* Top Glass Administrative & Accessibility Ribbon */}
      <div className="w-full bg-[#14273E]/90 backdrop-blur-xl border-b border-white/10 text-xs py-2 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Identity & Status */}
          <div className="flex items-center space-x-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold bg-[#7D9D8B]/20 text-[#7D9D8B] border border-[#7D9D8B]/40">
              National Crisis System
            </span>
            <span className="text-slate-300 font-medium hidden md:inline">
              SAHAYai — Integrated Disaster Response Command
            </span>
          </div>

          {/* Quick Voice Broadcast & Font Scaler Controls */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Font Scaler (A- / A / A+) with Apple haptic spring */}
            <div className="flex items-center space-x-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15">
              <span className="text-[10px] text-slate-300 px-1 font-mono">Font:</span>
              <button
                type="button"
                onClick={() => onTextScaleChange('normal')}
                className={`min-w-[36px] min-h-[34px] px-2 py-0.5 rounded-lg text-xs font-bold transition-all apple-btn-haptic focus:outline-none focus:ring-2 focus:ring-[#7D9D8B] ${
                  textScale === 'normal'
                    ? 'bg-white text-[#14273E] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Standard Text (100%)"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => onTextScaleChange('large')}
                className={`min-w-[36px] min-h-[34px] px-2 py-0.5 rounded-lg text-xs font-bold transition-all apple-btn-haptic focus:outline-none focus:ring-2 focus:ring-[#7D9D8B] ${
                  textScale === 'large'
                    ? 'bg-white text-[#14273E] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Large Text (112%)"
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => onTextScaleChange('xlarge')}
                className={`min-w-[36px] min-h-[34px] px-2 py-0.5 rounded-lg text-xs font-bold transition-all apple-btn-haptic focus:outline-none focus:ring-2 focus:ring-[#7D9D8B] ${
                  textScale === 'xlarge'
                    ? 'bg-white text-[#14273E] shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Extra Large Text (125%)"
              >
                A++
              </button>
            </div>

            {/* Voice Broadcast Action Button with Lift */}
            <button
              type="button"
              onClick={onToggleSpeech}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 apple-fab-lift apple-btn-haptic backdrop-blur-md border ${
                isSpeaking
                  ? 'bg-[#C85A4B] border-[#B94A3E] text-white shadow-lg shadow-[#C85A4B]/20'
                  : 'bg-white/15 border-white/20 text-white hover:bg-white/25 shadow-sm'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-4 h-4 text-white" />
                  <span>{t('voiceStop')}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#7D9D8B]" />
                  <span>{t('voiceListen')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Frosted Glass Nav Surface */}
      <div className="bg-white/70 backdrop-blur-2xl border-b border-white/60 shadow-[0_4px_24px_rgba(20,39,62,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Identity & Helplines */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#14273E] flex items-center justify-center text-white shadow-md shadow-[#14273E]/10">
              <Shield className="w-5 h-5 text-[#7D9D8B]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-[#14273E]">
                  SAHAY<span className="text-[#7D9D8B]">ai</span>
                </span>
                <span className="text-slate-400 text-xs font-mono font-medium hidden sm:inline">
                  | {t('platformTitle')}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-500 font-medium">
                <span className="flex items-center space-x-1 text-[#14273E] font-semibold">
                  <PhoneCall className="w-3 h-3 text-[#7D9D8B]" />
                  <span>{t('helplineNational')}</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[#14273E] font-semibold">{t('helplineState')}</span>
              </div>
            </div>
          </div>

          {/* Online Pill & 8-Language Switcher */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Status Indicator */}
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold flex items-center space-x-1.5 border backdrop-blur-md ${
                isOnline
                  ? 'bg-[#7D9D8B]/15 text-[#14273E] border-[#7D9D8B]/40'
                  : 'bg-[#C85A4B]/15 text-[#C85A4B] border-[#C85A4B]/40'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-[#7D9D8B]" />
                  <span>{t('statusOnline')}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-[#C85A4B]" />
                  <span>{t('statusOffline')}</span>
                </>
              )}
            </div>

            {/* 8 Indian Regional Languages Frosted Capsule */}
            <div className="flex flex-wrap gap-1 bg-white/80 backdrop-blur-lg p-1 rounded-2xl border border-slate-200/80 shadow-sm">
              {supportedLanguages.map((l: LanguageMeta) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`min-h-[34px] px-2.5 py-1 text-xs rounded-xl font-medium transition-all apple-btn-haptic focus:outline-none focus:ring-2 focus:ring-[#7D9D8B] ${
                    language === l.code
                      ? 'bg-[#14273E] text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-[#14273E] hover:bg-slate-100/60'
                  }`}
                  title={`${l.name} (${l.bcp47})`}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Segmented Pill Dock */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 pt-1 flex justify-center">
          <nav
            className="relative flex items-center p-1.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/80 shadow-[0_4px_20px_rgba(20,39,62,0.06)] overflow-hidden"
            aria-label="Disaster Intelligence Tabs"
          >
            {/* Sliding Glass Thumb Background */}
            <div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-[#14273E] text-white shadow-md transition-all duration-300"
              style={{
                left: `calc(${tabIndex * 33.333}% + 6px)`,
                width: `calc(33.333% - 12px)`,
                transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            />

            {/* Tab 1 Trigger */}
            <button
              type="button"
              onClick={() => onTabChange('map')}
              className={`relative z-10 flex items-center justify-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors apple-btn-haptic whitespace-nowrap min-h-[44px] min-w-[150px] sm:min-w-[200px] ${
                activeTab === 'map' ? 'text-white' : 'text-slate-600 hover:text-[#14273E]'
              }`}
            >
              <Map className={`w-4 h-4 ${activeTab === 'map' ? 'text-[#7D9D8B]' : 'text-slate-500'}`} />
              <span>{t('tab1Title')}</span>
            </button>

            {/* Tab 2 Trigger */}
            <button
              type="button"
              onClick={() => onTabChange('simulator')}
              className={`relative z-10 flex items-center justify-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors apple-btn-haptic whitespace-nowrap min-h-[44px] min-w-[150px] sm:min-w-[200px] ${
                activeTab === 'simulator' ? 'text-white' : 'text-slate-600 hover:text-[#14273E]'
              }`}
            >
              <Camera
                className={`w-4 h-4 ${activeTab === 'simulator' ? 'text-[#7D9D8B]' : 'text-slate-500'}`}
              />
              <span>{t('tab2Title')}</span>
            </button>

            {/* Tab 3 Trigger */}
            <button
              type="button"
              onClick={() => onTabChange('intel')}
              className={`relative z-10 flex items-center justify-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-colors apple-btn-haptic whitespace-nowrap min-h-[44px] min-w-[150px] sm:min-w-[200px] ${
                activeTab === 'intel' ? 'text-white' : 'text-slate-600 hover:text-[#14273E]'
              }`}
            >
              <Radio className={`w-4 h-4 ${activeTab === 'intel' ? 'text-[#7D9D8B]' : 'text-slate-500'}`} />
              <span>{t('tab3Title')}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
