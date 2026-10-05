import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Cloud,
  AlertTriangle,
  Bot,
  Camera,
  Menu,
  X,
  Hospital,
  Shield,
  Flame,
  Activity,
  ChevronRight,
  Download,
  BellRing,
  History,
  MessageSquare,
  Zap,
  Users,
  Brain,
  Tent,
  Satellite,
  Compass,
  Radio,
  Send,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useLanguage, SupportedLanguageCode } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EmergencyFacility, Location } from '@/types';
import { getCurrentLocation } from '@/utils/api';
import OfflineSOS from '@/components/OfflineSOS';

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onFacilityClick: (facility: EmergencyFacility) => void;
  onLocationUpdate: (location: Location) => void;
  language?: SupportedLanguageCode;
  onLanguageChange?: (language: SupportedLanguageCode) => void;
  children?: React.ReactNode;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  onFacilityClick,
  onLocationUpdate,
  language: propLanguage,
  onLanguageChange,
  children,
}) => {
  const navigate = useNavigate();
  const { language: ctxLanguage, setLanguage: setCtxLanguage, supportedLanguages, t } = useLanguage();
  const activeLang = propLanguage || ctxLanguage;
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const navItems = [
    {
      id: 'overview',
      label: t('navOverview'),
      icon: Activity,
      gradient: 'from-primary to-teal-600',
      description: t('descOverview'),
    },
    {
      id: 'early-alerts',
      label: t('navEarlyAlerts'),
      icon: BellRing,
      gradient: 'from-destructive to-amber-600',
      description: t('descEarlyAlerts'),
    },
    {
      id: 'weather',
      label: t('navWeather'),
      icon: Cloud,
      gradient: 'from-primary to-emerald-500',
      description: t('descWeather'),
    },
    {
      id: 'disasters',
      label: t('navDisasters'),
      icon: AlertTriangle,
      gradient: 'from-amber-600 to-destructive',
      description: t('descDisasters'),
    },
    {
      id: 'emergency-services',
      label: t('navEmergencyHub'),
      icon: Hospital,
      gradient: 'from-success to-emerald-700',
      description: t('descEmergencyHub'),
    },
    {
      id: 'guidelines',
      label: t('navSafetyGuide'),
      icon: Shield,
      gradient: 'from-primary to-accent',
      description: t('descSafetyGuide'),
    },
    {
      id: 'resource-coordination',
      label: t('navVolunteerHub'),
      icon: Users,
      gradient: 'from-emerald-700 to-teal-700',
      description: t('descVolunteerHub'),
    },
    {
      id: 'ai-insights',
      label: t('navAiInsights'),
      icon: Bot,
      gradient: 'from-primary via-emerald-600 to-teal-500',
      description: t('descAiInsights'),
    },
    {
      id: 'disaster-assessment',
      label: t('disasterAssessmentTab'),
      icon: Sparkles,
      gradient: 'from-amber-600 via-rose-600 to-emerald-700',
      description: t('descDisasterAssessment'),
    },
    {
      id: 'micro-alert',
      label: t('tab3Title'),
      icon: Send,
      gradient: 'from-emerald-700 to-teal-800',
      description: t('descMicroAlert'),
    },
    {
      id: 'alert-history',
      label: t('alertHistory'),
      icon: History,
      gradient: 'from-slate-400 to-primary',
      description: t('descAlertHistory'),
    },
  ];

  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);
        onLocationUpdate(location);
      } catch (error) {
        console.error('[ERROR] [DashboardSidebar] Geolocation failed, using fallback:', error);
        // Fallback to New Delhi if geolocation is blocked or fails
        const fallback: Location = { lat: 28.6139, lng: 77.2090, name: 'New Delhi, Delhi' };
        setUserLocation(fallback);
        onLocationUpdate(fallback);
      }
    };

    loadUserLocation();
  }, [onLocationUpdate]);

  // PWA Install prompt handling
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // If no install prompt available, redirect to install page
      navigate('/install');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };



  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Hospital className="h-4 w-4" />;
      case 'police':
        return <Shield className="h-4 w-4" />;
      case 'fire_station':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (type: string) => {
    switch (type) {
      case 'hospital':
        return 'bg-success/10 text-success-foreground border-success/30';
      case 'police':
        return 'bg-ocean-blue/10 text-primary-foreground border-ocean-blue/30';
      case 'fire_station':
        return 'bg-destructive/10 text-destructive-foreground border-destructive/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <aside
      className={`fixed md:relative left-0 top-0 bottom-0 z-[6000] md:z-10 flex flex-col transition-all duration-300 ease-out overflow-hidden border-r border-border/20 shadow-2xl bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl ${isCollapsed ? 'w-16 -translate-x-full md:translate-x-0' : 'w-72 translate-x-0'
        }`}
    >
      {/* Multi-layer glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 pointer-events-none" />

      {/* Refined dot pattern texture */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 0.5px, transparent 0.5px)',
        backgroundSize: '20px 20px'
      }} />

      {/* Content */}
      <div className="flex flex-col h-full relative z-10">
        {/* Header */}
        <div className="p-4 border-b border-border/20 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl border border-primary/30 backdrop-blur-sm shadow-lg">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-foreground">SAHAYai</h2>
                  <p className="text-xs text-muted-foreground">
                    {t('emergencyOperations')}
                  </p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-lg"
            >
              {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <TooltipProvider delayDuration={200}>
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              const buttonContent = (
                <button
                  key={item.id}
                  onClick={() => { onTabChange(item.id); if (window.innerWidth < 768) onToggleCollapse(); }}
                  className={`
                    group w-full rounded-xl transition-all duration-200 relative overflow-hidden
                    ${isCollapsed ? 'p-2 flex items-center justify-center' : 'p-3.5'}
                    ${isActive
                      ? 'bg-gradient-to-r from-primary/15 to-accent/10 backdrop-blur-sm text-primary shadow-lg border border-primary/20'
                      : 'hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:border hover:border-border/30'
                    }
                  `}
                >
                  {isActive && !isCollapsed && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
                  )}
                  <div className={`flex items-center relative z-10 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className={`flex items-center justify-center rounded-lg transition-all duration-200 ${isActive && !isCollapsed ? 'bg-primary/20 p-1.5' : isCollapsed ? 'p-1.5' : 'p-0'} ${isActive && isCollapsed ? 'bg-primary/30' : ''}`}>
                      <Icon className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    </div>
                    {!isCollapsed && (
                      <div className="flex flex-col items-start flex-1">
                        <span className={`font-semibold text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>{item.label}</span>
                        <span className="text-[10px] text-muted-foreground/70">{item.description}</span>
                      </div>
                    )}
                  </div>
                </button>
              );

              return isCollapsed ? (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" sideOffset={8} className="bg-popover/95 backdrop-blur-xl border-border/50">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ) : (
                buttonContent
              );
            })}
          </nav>
        </TooltipProvider>

        {/* Footer */}
        <div className="p-4 border-t border-border/20 bg-gradient-to-r from-transparent to-primary/5 backdrop-blur-sm space-y-3">
          {/* 9-Language Vernacular Selector */}
          <div className="w-full">
            {isCollapsed ? (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const currentIndex = supportedLanguages.findIndex((l) => l.code === ctxLanguage);
                        const nextLang = supportedLanguages[(currentIndex + 1) % supportedLanguages.length];
                        setCtxLanguage(nextLang.code);
                        onLanguageChange?.(nextLang.code);
                      }}
                      className="w-full h-10 border-primary/30"
                      aria-label="Cycle vernacular language"
                    >
                      <Globe className="w-4 h-4 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center" sideOffset={8} className="bg-popover/95 backdrop-blur-xl border-border/50">
                    <p className="font-semibold text-sm">
                      {supportedLanguages.find((l) => l.code === ctxLanguage)?.nativeName || 'Language'}
                    </p>
                    <p className="text-xs text-muted-foreground">Click to cycle 9 vernacular languages</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3 text-primary" />
                    <span>{t('vernacularLanguage')}</span>
                  </span>
                  <span className="text-[10px] font-mono text-primary font-bold">
                    {ctxLanguage.toUpperCase()}
                  </span>
                </div>
                <select
                  value={ctxLanguage}
                  onChange={(e) => {
                    const code = e.target.value as SupportedLanguageCode;
                    setCtxLanguage(code);
                    onLanguageChange?.(code);
                  }}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-border/40 bg-background/80 text-foreground backdrop-blur-md focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer shadow-xs"
                >
                  {supportedLanguages.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Offline SOS */}
          <div className="w-full">
            <OfflineSOS language={activeLang === 'hi' ? 'hi' : 'en'} isCollapsed={isCollapsed} />
          </div>

          {/* Offline Indicator */}
          {children}

          {/* Install Button */}
          {!isInstalled && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleInstall}
                    variant="outline"
                    size={isCollapsed ? "icon" : "sm"}
                    className={`${isCollapsed ? 'w-full h-10' : 'w-full'} bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border-primary/30 hover:border-primary/50 transition-all duration-200`}
                  >
                    <Download className={`${isCollapsed ? 'h-4 w-4' : 'h-4 w-4 mr-2'}`} />
                    {!isCollapsed && (
                      <span className="font-semibold text-xs">
                        {t('installApp')}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" align="center" sideOffset={8} className="bg-popover/95 backdrop-blur-xl border-border/50">
                    <p className="font-semibold text-sm">{t('installApp')}</p>
                    <p className="text-xs text-muted-foreground">{t('useOffline')}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}

          {/* System Status */}
          {!isCollapsed && (
            <div className="flex items-center justify-between text-xs bg-muted/30 rounded-lg p-2.5 border border-border/20">
              <span className="text-muted-foreground font-medium">
                {t('systemStatus')}
              </span>
              <Badge variant="outline" className="text-success border-success/40 text-[10px] bg-success/10 px-2 uppercase tracking-widest font-bold">
                <Activity className="h-3 w-3 mr-1" />
                {t('activeStatus')}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
