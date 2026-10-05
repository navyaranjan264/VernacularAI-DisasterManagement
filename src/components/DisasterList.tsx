import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radio,
  Waves,
  Wind,
  Flame,
  Mountain,
  Sun,
  AlertCircle,
  Database,
  Zap,
  Globe,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DisasterEvent, Location } from '@/types';
import { calculateDistance } from '@/utils/api';
import { useLanguage } from '@/context/LanguageContext';
import { VERNACULAR_DISASTERS } from '@/utils/vernacularData';
import {
  translateDisasterTitle,
  translateDisasterDescription,
  localizeLocationName,
  translateSeverityGrade,
} from '@/utils/vernacularHelpers';

interface DisasterListProps {
  disasters: DisasterEvent[];
  onDisasterClick: (disaster: DisasterEvent) => void;
  loading?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

const DisasterList: React.FC<DisasterListProps> = ({ disasters, onDisasterClick, loading, userLocation }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { language } = useLanguage();
  const dDict = VERNACULAR_DISASTERS[language] || VERNACULAR_DISASTERS.en;

  // Show only verified disasters (with trusted source URLs)
  const verifiedDisasters = disasters.filter((d) => {
    if (d.isPrediction) return false;
    if (!d.url) return false;
    try {
      const url = new URL(d.url);
      const trustedDomains = [
        'earthquake.usgs.gov',
        'gdacs.org',
        'www.gdacs.org',
        'reliefweb.int',
        'imd.gov.in',
        'ndma.gov.in',
      ];
      return trustedDomains.some((domain) => url.hostname.includes(domain));
    } catch {
      return false;
    }
  });

  // AI risk predictions shown in their own section
  const predictions = disasters.filter((d) => d.isPrediction === true);

  const nearbyDisasters = userLocation
    ? verifiedDisasters.filter((d) => {
        const distance = calculateDistance(userLocation, d.location);
        return distance <= 1000;
      })
    : [];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="premium-card p-4 rounded-2xl border-slate-200/50 dark:border-white/5">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-5 w-28 rounded-lg" />
                    <Skeleton className="h-5 w-24 rounded-lg" />
                    <Skeleton className="h-5 w-16 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (verifiedDisasters.length === 0) {
    return (
      <Card className="glass p-6 sm:p-8 text-center">
        <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-success mx-auto mb-3 sm:mb-4" />
        <h3 className="font-semibold text-base sm:text-lg mb-2">{dDict.noActiveDisasters}</h3>
        <p className="text-sm text-muted-foreground">{dDict.noActiveDesc}</p>
      </Card>
    );
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getDisasterIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'earthquake':
        return <Zap className="h-5 w-5 text-amber-500" />;
      case 'flood':
        return <Waves className="h-5 w-5 text-blue-500" />;
      case 'cyclone':
        return <Wind className="h-5 w-5 text-teal-500" />;
      case 'fire':
      case 'wildfire':
        return <Flame className="h-5 w-5 text-rose-500" />;
      case 'landslide':
        return <Mountain className="h-5 w-5 text-stone-500" />;
      case 'drought':
        return <Sun className="h-5 w-5 text-amber-600" />;
      case 'tsunami':
        return <Waves className="h-5 w-5 text-cyan-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-primary" />;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'border-destructive/20 bg-destructive/10 text-destructive';
      case 'high':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400';
      default:
        return 'border-primary/20 bg-primary/10 text-primary';
    }
  };

  const getSourceName = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      if (hostname.includes('usgs.gov')) return 'USGS';
      if (hostname.includes('gdacs.org')) return 'GDACS';
      if (hostname.includes('reliefweb.int')) return 'ReliefWeb';
      if (hostname.includes('imd.gov.in')) return 'IMD';
      if (hostname.includes('ndma.gov.in')) return 'NDMA';
      return dDict.officialSource || 'Official';
    } catch {
      return dDict.reportSource || 'Report';
    }
  };

  const renderDisasterGroup = (disastersList: DisasterEvent[]) => {
    const grouped = disastersList.reduce((acc, disaster) => {
      if (!acc[disaster.type]) acc[disaster.type] = [];
      acc[disaster.type].push(disaster);
      return acc;
    }, {} as Record<string, DisasterEvent[]>);

    if (disastersList.length === 0) {
      return (
        <Card className="bg-white/40 dark:bg-slate-900/40 border-slate-200/50 dark:border-white/5 p-8 text-center rounded-2xl">
          <AlertTriangle className="h-8 w-8 text-primary mx-auto mb-3 opacity-20" />
          <h3 className="font-black text-xs tracking-wider mb-1 uppercase text-primary/60">{dDict.noRegionalActivity}</h3>
          <p className="text-xs text-muted-foreground">{dDict.scanningTelemetry}</p>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(grouped).map(([type, typeDisasters]) => {
          const typeName = dDict.types[type.toLowerCase()] || type.replace('_', ' ');
          return (
            <div key={type} className="space-y-2">
              <h3 className="font-bold text-base sm:text-lg capitalize flex items-center gap-2">
                <span className="p-1 rounded-lg bg-primary/10 flex items-center justify-center">
                  {getDisasterIcon(type)}
                </span>
                <span>{typeName}</span>
                <span className="text-sm font-mono text-muted-foreground">({typeDisasters.length})</span>
              </h3>

              <div className="space-y-2 sm:space-y-3">
                {typeDisasters.map((disaster) => {
                  const isExpanded = expandedItems.has(disaster.id);
                  const distance = userLocation ? calculateDistance(userLocation, disaster.location) : null;
                  const severityStyle = getSeverityStyle(disaster.severity);
                  const translatedSeverity = translateSeverityGrade(disaster.severity, language);

                  return (
                    <Card
                      key={disaster.id}
                      className="premium-card p-4 hover:bg-slate-100/40 dark:hover:bg-slate-900/60 cursor-pointer rounded-2xl group border-slate-200/50 dark:border-white/5"
                      onClick={() => onDisasterClick(disaster)}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-slate-800/50 flex items-center justify-center border border-primary/20 dark:border-white/5 shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform">
                            {getDisasterIcon(disaster.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-sm sm:text-base text-foreground leading-tight">
                                {translateDisasterTitle(disaster.title, language)}
                              </h4>
                              <Badge variant="outline" className={`${severityStyle} text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full`}>
                                {translatedSeverity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-1">
                              {translateDisasterDescription(disaster.description, language)}
                            </p>

                            {/* Meta info */}
                            <div className="flex items-center flex-wrap gap-2 sm:gap-3 mt-3 text-xs text-muted-foreground font-semibold">
                              <div className="flex items-center gap-1.5 bg-slate-100/60 dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-border/40">
                                <Clock className="h-3 w-3 text-primary opacity-60" />
                                <span>{disaster.time ? new Date(disaster.time).toLocaleString(language === 'en' ? 'en-IN' : `${language}-IN`, { dateStyle: 'medium', timeStyle: 'short' }) : (dDict.unknownTime || 'Unknown')}</span>
                              </div>
                              {disaster.location.name && (
                                <div className="flex items-center gap-1.5 bg-slate-100/60 dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-border/40">
                                  <MapPin className="h-3 w-3 text-primary opacity-60" />
                                  <span className="truncate max-w-[140px]">{localizeLocationName(disaster.location.name, language)}</span>
                                </div>
                              )}
                              {distance !== null && (
                                <div className="flex items-center gap-1.5 bg-slate-100/60 dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-border/40 font-mono">
                                  <Radio className="h-3 w-3 text-primary opacity-60" />
                                  <span>{distance.toFixed(0)} {dDict.kmUnit || 'KM'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Report link - always visible */}
                        <div className="flex items-center gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                            className="bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-foreground text-xs font-bold h-8 px-3"
                          >
                            <a href={disaster.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1.5 opacity-60" />
                              {getSourceName(disaster.url!)} {dDict.docsBtn}
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDisasterClick(disaster)}
                            className="text-slate-600 dark:text-slate-400 hover:text-foreground text-xs font-bold h-8 px-3"
                          >
                            <MapPin className="h-3 w-3 mr-1.5 text-primary opacity-70" />
                            {dDict.telemetryMapBtn}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded(disaster.id);
                            }}
                            className="h-8 w-8 p-0 ml-auto"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="border-t border-border/20 pt-3 space-y-3">
                            {disaster.magnitude && (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs sm:text-sm">{dDict.magnitude}</span>
                                <Badge variant="secondary">{disaster.magnitude}</Badge>
                              </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                              <div>
                                <span className="font-semibold">{dDict.coordinates}</span>
                                <p className="text-muted-foreground font-mono text-xs">
                                  {disaster.location.lat.toFixed(4)}, {disaster.location.lng.toFixed(4)}
                                </p>
                              </div>
                              <div>
                                <span className="font-semibold">{dDict.eventId}</span>
                                <p className="text-muted-foreground font-mono text-xs break-all">{disaster.id}</p>
                              </div>
                            </div>

                            {disaster.isPrediction && (
                              <div className="flex items-center gap-2 flex-wrap text-xs">
                                {disaster.timeframeDays !== undefined && (
                                  <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-xs">
                                    {dDict.expectedIn} {disaster.timeframeDays} {dDict.dayUnit || 'd'}
                                  </Badge>
                                )}
                                {disaster.probability !== undefined && (
                                  <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-xs font-mono">
                                    {(disaster.probability * 100).toFixed(0)}% {dDict.probBadge}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Nearby Disasters */}
      {userLocation && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-primary uppercase flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {dDict.regionalTelemetry}
            </h2>
            <Badge variant="outline" className="bg-primary/10 text-xs font-bold border-primary/20 py-1 px-3">
              {nearbyDisasters.length} {dDict.localizedBadge}
            </Badge>
          </div>
          {renderDisasterGroup(nearbyDisasters)}
        </div>
      )}

      {/* All India Verified */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xs sm:text-sm font-black tracking-wider text-slate-700 dark:text-slate-300 uppercase flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" /> {dDict.nationalFeed}
          </h2>
          <Badge variant="outline" className="bg-slate-100/50 dark:bg-slate-900/40 text-xs font-bold border-border/40 py-1 px-3">
            {verifiedDisasters.length} {dDict.totalBadge}
          </Badge>
        </div>
        {renderDisasterGroup(verifiedDisasters)}
      </div>

      {/* ML Risk Predictions */}
      {predictions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs sm:text-sm font-black tracking-wider text-slate-700 dark:text-slate-300 uppercase flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> {dDict.neuralPredictions}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions.map((disaster) => {
              const distance = userLocation ? calculateDistance(userLocation, disaster.location) : null;
              const translatedSeverity = translateSeverityGrade(disaster.severity, language);

              return (
                <Card
                  key={disaster.id}
                  className="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all group shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-slate-800/50 flex items-center justify-center border border-primary/20 dark:border-white/5 shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-bold text-sm text-foreground leading-tight">
                          {translateDisasterTitle(disaster.title, language)}
                        </h4>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase border-slate-300 dark:border-white/10 dark:bg-slate-900/60 bg-slate-200 dark:text-slate-300 text-slate-700 px-2 py-0.5 rounded-full">
                          {translatedSeverity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-3">
                        {translateDisasterDescription(disaster.description, language)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {disaster.probability !== undefined && (
                          <div className="text-[10px] font-bold uppercase font-mono bg-slate-100 dark:bg-slate-900/60 border border-border/40 px-2 py-1 rounded">
                            {(disaster.probability * 100).toFixed(0)}% {dDict.probBadge}
                          </div>
                        )}
                        <div className="text-[10px] font-bold uppercase bg-primary/10 border border-primary/20 px-2 py-1 rounded text-primary flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          <span>{dDict.mlInferenceBadge}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DisasterList;
