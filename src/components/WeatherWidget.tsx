import React, { useState, useEffect, useRef } from 'react';
import {
  Cloud, Droplets, Wind, Thermometer, AlertCircle, Eye, MapPin,
  Sunrise, Sunset, Gauge, CloudRain, CloudSnow, CloudDrizzle,
  CloudFog, Zap, Snowflake, Sun, Moon, Umbrella, Navigation, Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherData, WeatherAlert, Location } from '@/types';
import { searchLocation } from '@/utils/api';
import { ResponsiveContainer, Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';
import { VERNACULAR_WEATHER } from '@/utils/vernacularData';
import {
  localizeLocationName,
  getAirQualityData,
  getUVData,
  getComfortData,
  getLocalizedWindDirection,
  translateSeverityGrade,
  translateDisasterTitle,
  translateDisasterDescription,
} from '@/utils/vernacularHelpers';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading?: boolean;
  onLocationChange?: (location: Location) => void;
  userLocation?: Location | null;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, loading, onLocationChange, userLocation }) => {
  const { language } = useLanguage();
  const wDict = VERNACULAR_WEATHER[language] || VERNACULAR_WEATHER.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for city suggestions
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocation(searchQuery);
        setSearchResults(results.slice(0, 5));
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setShowDropdown(false);
      }
      setIsSearching(false);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const handleSelectLocation = (location: Location) => {
    if (onLocationChange) {
      onLocationChange(location);
    }
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const translateCondition = (condition?: string): string => {
    if (!condition) return '';
    const lower = condition.toLowerCase();
    for (const [key, val] of Object.entries(wDict.conditions || {})) {
      if (lower.includes(key)) return val as string;
    }
    return condition;
  };

  const getWindDirection = (deg?: number) => {
    return getLocalizedWindDirection(deg, language);
  };

  const formatTime = (timestamp: number) => {
    const locale = language === 'en' ? 'en-IN' : `${language}-IN`;
    return new Date(timestamp * 1000).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateStr: string) => {
    const locale = language === 'en' ? 'en-IN' : `${language}-IN`;
    return new Date(dateStr).toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAirQualityColor = (aqi?: number) => {
    if (aqi === undefined || aqi === null) return 'bg-sky-50/50 dark:bg-slate-900/40 border-sky-100 dark:border-slate-800';
    if (aqi <= 50) return 'bg-sky-50/80 dark:bg-emerald-950/20 border-sky-200 dark:border-emerald-800/30';
    if (aqi <= 100) return 'bg-blue-50/80 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30';
    if (aqi <= 150) return 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30';
    if (aqi <= 200) return 'bg-orange-50/80 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/30';
    return 'bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-800/30';
  };

  const getAQIAdvice = (aqi?: number) => {
    return getAirQualityData(aqi, language).advice;
  };

  const getUVColor = (uv?: number) => {
    if (!uv) return 'bg-sky-50/50 dark:bg-slate-900/40 border-sky-100 dark:border-slate-800';
    if (uv < 3) return 'bg-sky-50/80 dark:bg-slate-900/40 border-sky-200 dark:border-slate-800';
    if (uv < 6) return 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30';
    return 'bg-red-50/80 dark:bg-red-950/20 border-red-200 dark:border-red-900/30';
  };

  const getUVLabel = (uv?: number) => {
    return getUVData(uv, language).label;
  };

  const getUVAdvice = (uv?: number) => {
    return getUVData(uv, language).advice;
  };

  const getComfortLevel = (temp: number) => {
    return getComfortData(temp, language).label;
  };

  const getComfortAdvice = (temp: number) => {
    return getComfortData(temp, language).advice;
  };

  const renderWeatherIcon = (conditionStr?: string, className = "w-8 h-8 text-primary") => {
    const lower = (conditionStr || '').toLowerCase();
    if (lower.includes('rain') || lower.includes('drizzle')) return <CloudRain className={className} />;
    if (lower.includes('snow')) return <Snowflake className={className} />;
    if (lower.includes('thunder')) return <Zap className={className} />;
    if (lower.includes('cloud')) return <Cloud className={className} />;
    if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) return <CloudFog className={className} />;
    return <Sun className={className} />;
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card className="bg-card/50 backdrop-blur-md border-2 border-border p-3 sm:p-4 shadow-sm">
          <Skeleton className="h-10 w-full rounded-md" />
        </Card>
        <Card className="bg-card backdrop-blur-md border-2 border-border p-4 sm:p-6 shadow-md">
          <div className="flex items-start justify-between mb-6">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-12 w-24 ml-auto" />
              <Skeleton className="h-4 w-20 ml-auto" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-sky-100/30 dark:bg-slate-800/40 border border-sky-100/50 dark:border-slate-700/30">
                <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!weather) {
    return (
      <Card className="bg-sky-50/50 dark:bg-slate-900/50 border-2 border-sky-100 dark:border-slate-800 p-8 text-center">
        <Cloud className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2 text-sky-900 dark:text-sky-100">{wDict.weatherUnavailable}</h3>
        <p className="text-muted-foreground text-sm">{wDict.checkLocationSettings}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* City Search */}
      <Card className="bg-card/50 backdrop-blur-md border-2 border-border p-3 sm:p-4 shadow-sm">
        <div className="space-y-3">
          <div ref={searchContainerRef} className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={wDict.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-2 border-border focus:border-primary text-foreground font-medium"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            )}

            {/* Dropdown Results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectLocation(result)}
                    className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition-colors border-b border-border last:border-0"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.trim() && !isSearching && searchResults.length === 0 && showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 p-3">
                <p className="text-sm text-muted-foreground text-center">{wDict.noCitiesFound}</p>
              </div>
            )}
          </div>

          {userLocation && weather && (
            <p className="text-xs text-muted-foreground text-center">
              {wDict.showingWeatherFor} {localizeLocationName(weather.location.name, language) || `${weather.location.lat.toFixed(4)}, ${weather.location.lng.toFixed(4)}`}
            </p>
          )}
        </div>
      </Card>

      {/* Current Weather - Glass Card */}
      <Card className="bg-card backdrop-blur-md border-2 border-border p-4 sm:p-6 shadow-md shadow-primary/5">
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-black text-foreground flex items-center gap-2 tracking-tight">
              <Cloud className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0 text-primary" />
              <span className="truncate">{wDict.climateIntelligence}</span>
            </h2>
            <p className="text-muted-foreground flex items-center gap-1 mt-1 text-xs sm:text-sm">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{localizeLocationName(weather.location.name, language) || `${weather.location.lat.toFixed(4)}, ${weather.location.lng.toFixed(4)}`}</span>
            </p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <div className="text-3xl sm:text-5xl font-bold text-primary">{weather.temperature}°C</div>
            <p className="text-xs sm:text-sm text-muted-foreground capitalize mt-1">
              {translateCondition(weather.condition)}
            </p>
            {weather.feelsLike && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                {wDict.feelsLike} {weather.feelsLike}°C
              </p>
            )}
          </div>
        </div>

        {/* Detailed Weather Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-100/30 dark:bg-slate-800/40 border border-sky-100/50 dark:border-slate-700/30 transition-all hover:bg-sky-100/50 dark:hover:bg-slate-800/60">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/10">
              <Droplets className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{wDict.humidity}</p>
              <p className="font-mono text-lg font-bold text-sky-900 dark:text-sky-50">{weather.humidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-100/30 dark:bg-slate-800/40 border border-sky-100/50 dark:border-slate-700/30 transition-all hover:bg-sky-100/50 dark:hover:bg-slate-800/60">
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/10">
              <Wind className="h-5 w-5 text-sky-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{wDict.windVelocity}</p>
              <p className="font-mono text-lg font-bold text-sky-900 dark:text-sky-50">{weather.windSpeed} km/h</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-100/30 dark:bg-slate-800/40 border border-sky-100/50 dark:border-slate-700/30 transition-all hover:bg-sky-100/50 dark:hover:bg-slate-800/60">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
              <CloudRain className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{wDict.precipitation}</p>
              <p className="font-mono text-lg font-bold text-sky-900 dark:text-sky-50">{weather.rainfall} mm</p>
            </div>
          </div>

          {weather.visibility !== undefined && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-100/30 dark:bg-slate-800/40 border border-sky-100/50 dark:border-slate-700/30 transition-all hover:bg-sky-100/50 dark:hover:bg-slate-800/60">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/10">
                <Eye className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{wDict.visibility}</p>
                <p className="font-mono text-lg font-bold text-sky-900 dark:text-sky-50">{weather.visibility} km</p>
              </div>
            </div>
          )}

          {weather.pressure && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-100/30 dark:bg-slate-800/40 border border-sky-100/50 dark:border-slate-700/30">
              <div className="p-2 rounded-lg bg-sky-500/10">
                <Gauge className="h-5 w-5 text-sky-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{wDict.pressure}</p>
                <p className="font-semibold text-lg text-sky-900 dark:text-sky-50">{weather.pressure} hPa</p>
              </div>
            </div>
          )}

          {weather.sunrise && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-100/30 dark:bg-slate-800/40 border border-sky-100/50 dark:border-slate-700/30">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Sunrise className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{wDict.sunrise}</p>
                <p className="font-semibold text-lg text-sky-900 dark:text-sky-50">{formatTime(weather.sunrise)}</p>
              </div>
            </div>
          )}

          {weather.sunset && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-100/30 dark:bg-slate-800/40 border border-sky-100/50 dark:border-slate-700/30">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Sunset className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{wDict.sunset}</p>
                <p className="font-semibold text-lg text-sky-900 dark:text-sky-50">{formatTime(weather.sunset)}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-lg bg-sky-100/30 dark:bg-slate-800/40 border border-sky-100/50 dark:border-slate-700/30">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Navigation className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{wDict.windDir}</p>
              <p className="font-semibold text-lg text-sky-900 dark:text-sky-50">{getWindDirection(weather.windDirection)}</p>
            </div>
          </div>
        </div>

        {/* UV Index & Air Quality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {weather.uvIndex !== undefined && (
            <div className={`p-4 rounded-xl border ${getUVColor(weather.uvIndex)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">{wDict.uvIndex}</span>
                </div>
                <Badge variant="outline" className={getUVColor(weather.uvIndex)}>
                  {getUVLabel(weather.uvIndex)}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-bold">{weather.uvIndex.toFixed(1)}</span>
                </div>
                <Progress value={Math.min(weather.uvIndex * 10, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {getUVAdvice(weather.uvIndex)}
                </p>
              </div>
            </div>
          )}

          {weather.airQuality && (
            <div className={`p-4 rounded-xl border ${getAirQualityColor(weather.airQuality.aqi)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wind className="h-5 w-5" />
                  <span className="font-semibold">{wDict.airQuality}</span>
                </div>
                <Badge variant="outline" className={getAirQualityColor(weather.airQuality.aqi)}>
                  {getAirQualityData(weather.airQuality.aqi, language).label}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-3xl font-bold">{weather.airQuality.aqi}</span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {language === 'ml' ? 'വായു സൂചിക (AQI)' : language === 'hi' ? 'वायु सूचकांक (AQI)' : 'AQI'}
                  </span>
                </div>
                <Progress value={Math.min((weather.airQuality.aqi / 500) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {getAQIAdvice(weather.airQuality.aqi)}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div>{language === 'ml' ? 'സൂക്ഷ്മ കണങ്ങൾ' : 'PM2.5'}: {weather.airQuality.pm25.toFixed(1)} µg/m³</div>
                  <div>{language === 'ml' ? 'ധൂളീപടലം' : 'PM10'}: {weather.airQuality.pm10.toFixed(1)} µg/m³</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Comfort Index */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-white dark:from-slate-800/50 dark:to-slate-900/50 border border-sky-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-sky-500" />
              <span className="font-semibold text-sky-900 dark:text-sky-100 uppercase text-xs tracking-wider">{wDict.comfortLevel}</span>
            </div>
            <span className="text-xs font-black uppercase text-sky-600 dark:text-sky-400">
              {getComfortLevel(weather.temperature)}
            </span>
          </div>
          <Progress
            value={Math.max(0, Math.min(100, (35 - Math.abs(weather.temperature - 25)) * 2))}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {getComfortAdvice(weather.temperature)}
          </p>
        </div>
      </Card>

      {/* Hourly Forecast - Next 24 Hours */}
      {weather.hourlyForecast && weather.hourlyForecast.length > 0 && (
        <Card className="bg-card backdrop-blur-md border-2 border-border p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-black text-xs sm:text-sm uppercase tracking-[0.2em] text-foreground">{wDict.nearTermForecast}</h3>
          </div>

          {/* Temperature Chart */}
          <div className="mb-4 sm:mb-6 h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weather.hourlyForecast.map(hour => ({
                time: formatTime(hour.time),
                temperature: hour.temperature,
                precipitation: hour.precipitation,
              }))}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: '°C', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="hsl(var(--primary))"
                  fill="url(#tempGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Details Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 max-h-72 sm:max-h-96 overflow-y-auto">
            {weather.hourlyForecast.map((hour, index) => (
              <div
                key={index}
                className="text-center p-3 rounded-lg bg-sky-100/20 dark:bg-slate-800/40 border border-sky-100/50 dark:border-slate-700/30 hover:border-sky-500/50 transition-all shadow-sm"
              >
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  {formatTime(hour.time)}
                </p>
                <div className="flex justify-center mb-2">
                  {renderWeatherIcon(hour.condition, "w-8 h-8 text-sky-500")}
                </div>
                <p className="font-bold text-lg mb-1 text-sky-900 dark:text-sky-50">{hour.temperature}°</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-semibold">{translateCondition(hour.condition)}</p>
                {hour.precipitation > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-2 p-1 rounded bg-sky-500/10">
                    <Droplets className="h-3 w-3 text-sky-500" />
                    <p className="text-[10px] font-bold text-sky-500">{hour.precipitation}%</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Weather Alerts */}
      {weather.alerts.length > 0 && (
        <Card className="p-6 border-2 bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-lg animate-pulse bg-red-100 dark:bg-red-900/50">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-widest text-red-900 dark:text-red-100">{wDict.criticalAlerts}</h3>
              <p className="text-[10px] uppercase font-bold text-red-600/60 dark:text-red-400/60">
                {weather.alerts.length} {wDict.activeWarnings}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {weather.alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-5 rounded-xl border-2 transition-all hover:shadow-lg bg-white/40 dark:bg-red-950/30 border-red-200 dark:border-red-900/40"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-red-500" />
                    <h4 className="font-bold text-base text-red-900 dark:text-red-100 tracking-tight">
                      {translateDisasterTitle(alert.title, language)}
                    </h4>
                  </div>
                  <Badge variant="outline" className="font-black border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 px-2 py-0 text-[10px]">
                    {translateSeverityGrade(alert.severity, language)}
                  </Badge>
                </div>
                <p className="text-sm mb-4 leading-relaxed text-red-900/80 dark:text-red-100/80">
                  {translateDisasterDescription(alert.description, language)}
                </p>
                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-red-100/30 dark:bg-red-900/20">
                  <div>
                    <p className="text-[10px] mb-1 font-bold uppercase text-red-900/40 dark:text-red-100/40">{wDict.starts}</p>
                    <p className="text-xs font-bold text-red-900 dark:text-red-100">{new Date(alert.start).toLocaleString(language === 'en' ? 'en-IN' : `${language}-IN`)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] mb-1 font-bold uppercase text-red-900/40 dark:text-red-100/40">{wDict.ends}</p>
                    <p className="text-xs font-bold text-red-900 dark:text-red-100">{new Date(alert.end).toLocaleString(language === 'en' ? 'en-IN' : `${language}-IN`)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 5-Day Forecast */}
      <Card className="bg-card backdrop-blur-md border-2 border-border p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Cloud className="h-5 w-5 text-primary" />
          <h3 className="font-black text-xs sm:text-sm uppercase tracking-[0.2em] text-foreground">{wDict.weeklyOutlook}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
          {weather.forecast.slice(0, 5).map((day, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-xl bg-gradient-to-br from-white/40 to-sky-100/20 dark:from-slate-800 dark:to-slate-900 border border-sky-100 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500/50 transition-all hover:shadow-lg shadow-sm"
            >
              <p className="text-xs font-bold text-sky-900 dark:text-sky-50 mb-2 uppercase tracking-wide">
                {formatDate(day.date)}
              </p>
              <div className="flex justify-center mb-3 drop-shadow-md">
                {renderWeatherIcon(day.condition, "w-10 h-10 text-primary")}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Thermometer className="h-4 w-4 text-red-500" />
                  <p className="font-black text-xl text-sky-900 dark:text-sky-50">{day.temperature.max}°</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Snowflake className="h-4 w-4 text-sky-400" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{day.temperature.min}°</p>
                </div>
                {day.rainfall > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-2 p-1 rounded bg-sky-500/10">
                    <Umbrella className="h-3 w-3 text-sky-500" />
                    <p className="text-[10px] font-bold text-sky-500">{day.rainfall}mm</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WeatherWidget;
