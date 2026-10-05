import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardSidebar from '@/components/DashboardSidebar';
import WeatherWidget from '@/components/WeatherWidget';
import AnimatedBackground from '@/components/AnimatedBackground';
import DisasterList from '@/components/DisasterList';
import CopilotChat from '@/components/CopilotChat';
import DisasterGuidelines from '@/components/DisasterGuidelines';
import EarlyAlerts from '@/components/EarlyAlerts';
import NotificationHistory from '@/components/NotificationHistory';
import HeatmapOverview from '@/components/HeatmapOverview';
import VolunteerHub from '@/components/VolunteerHub';
import EmergencyServicesMap from '@/components/EmergencyServicesMap';
import OfflineIndicator from '@/components/OfflineIndicator';
import DisasterAssessmentTab from "@/components/DisasterAssessmentTab";
import MicroAlertTab from "@/components/MicroAlertTab";
import VisionIAPGenerator from "@/components/VisionIAPGenerator";
import MobileBottomNav from '@/components/MobileBottomNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { Menu, Globe, TrendingUp, ChevronDown, ChevronUp, Database, Radio } from 'lucide-react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import {
  getCachedDisasters,
  getCachedFacilities,
  getCachedWeather
} from '@/utils/offlineStorage';
import {
  DisasterEvent,
  EmergencyFacility,
  WeatherData,
  Location
} from '@/types';
import {
  fetchDisasterData,
  fetchWeatherData,
  getCurrentLocation,
  predictDisastersWithAI,
  calculateDistance,
  fetchEmergencyFacilities
} from '@/utils/api';
import { loadMLModels } from '@/utils/mlModels';

import { useLanguage } from '@/context/LanguageContext';

const VALID_TABS = new Set([
  'overview',
  'disaster-assessment',
  'micro-alert',
  'early-alerts',
  'weather',
  'disasters',
  'emergency-services',
  'resource-coordination',
  'ai-insights',
  'guidelines',
  'alert-history',
  // Backwards-compatible aliases
  'damage-simulator',
  'unified-simulator',
  'image-analyzer',
  'vision-iap',
]);

const Dashboard: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showIntelDetails, setShowIntelDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState<Location>({ lat: 20.5937, lng: 78.9629 }); // Center of India
  const [disasters, setDisasters] = useState<DisasterEvent[]>([]);
  const [predictions, setPredictions] = useState<DisasterEvent[]>([]);
  const [facilities, setFacilities] = useState<EmergencyFacility[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState({
    disasters: false,
    predictions: false,
    facilities: false,
    weather: false,
  });

  const { cacheDataForOffline } = useOfflineSync();

  // Load initial data
  useEffect(() => {
    loadDisasterData();
    loadMLModels();
  }, []);

  // Keep the visible tab aligned with the URL (share links + back/forward)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') || 'overview';
    setActiveTab(VALID_TABS.has(tabFromUrl) ? tabFromUrl : 'overview');
  }, [searchParams]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Listen for tab change events from Dynamic Island
  useEffect(() => {
    const handleIslandTabChange = (event: CustomEvent<string>) => {
      const nextTab = event.detail;
      if (!nextTab || !VALID_TABS.has(nextTab)) return;
      setActiveTab(nextTab);
      setSearchParams({ tab: nextTab });
    };

    window.addEventListener('changeTab', handleIslandTabChange as EventListener);
    return () => window.removeEventListener('changeTab', handleIslandTabChange as EventListener);
  }, [setSearchParams]);

  // SAHAYai Centralized Event Bus for Operations
  useEffect(() => {
    const handleLayerChange = (event: CustomEvent) => {
      const type = event.detail;
      console.log(`[SAHAYai] Switching Map Layer to ${type}`);
      // If we had a layer state in Dashboard, we'd update it here.
      // For now, we'll dispatch it to the HeatmapOverview/Map component.
      window.dispatchEvent(new CustomEvent('syncMapLayer', { detail: type }));
    };

    window.addEventListener('changeMapLayer', handleLayerChange as EventListener);
    return () => window.removeEventListener('changeMapLayer', handleLayerChange as EventListener);
  }, []);



  // Update data when user location changes
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      loadWeatherData(userLocation);
      loadNearbyFacilities(userLocation);
      loadPredictions(userLocation);
    }
  }, [userLocation]);

  const loadDisasterData = async () => {
    setLoading(prev => ({ ...prev, disasters: true }));
    try {
      // Try to fetch from API
      const disasterData = await fetchDisasterData();
      setDisasters(disasterData);

      // Cache for offline use
      await cacheDataForOffline(disasterData);
    } catch (error) {
      console.error('Error loading disaster data:', error);

      // Fall back to cached data if offline
      if (!navigator.onLine) {
        const cached = await getCachedDisasters();
        if (cached.length > 0) {
          setDisasters(cached);
        }
      }
    }
    setLoading(prev => ({ ...prev, disasters: false }));
  };

  const loadWeatherData = async (location: Location) => {
    setLoading(prev => ({ ...prev, weather: true }));
    try {
      const weatherData = await fetchWeatherData(location);
      setWeather(weatherData);

      // Cache for offline use
      const locationKey = `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
      await cacheDataForOffline(undefined, undefined, { location: locationKey, data: weatherData });
    } catch (error) {
      console.error('Error loading weather data:', error);

      // Fall back to cached data if offline
      if (!navigator.onLine) {
        const locationKey = `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
        const cached = await getCachedWeather(locationKey);
        if (cached) {
          setWeather(cached);
        }
      }
    }
    setLoading(prev => ({ ...prev, weather: false }));
  };

  const loadNearbyFacilities = async (location: Location) => {
    setLoading(prev => ({ ...prev, facilities: true }));
    try {
      const facilityData = await fetchEmergencyFacilities(location);
      setFacilities(facilityData);

      // Cache for offline use
      await cacheDataForOffline(undefined, facilityData);
    } catch (error) {
      console.error('Error loading facilities:', error);

      // Fall back to cached data if offline
      if (!navigator.onLine) {
        const cached = await getCachedFacilities();
        if (cached.length > 0) {
          setFacilities(cached);
        }
      }
    }
    setLoading(prev => ({ ...prev, facilities: false }));
  };

  const loadPredictions = async (location: Location) => {
    setLoading(prev => ({ ...prev, predictions: true }));
    try {
      const predictionData = await predictDisastersWithAI(location);
      setPredictions(predictionData);
    } catch (error) {
      console.error('Error loading predictions:', error);
      setPredictions([]);
    }
    setLoading(prev => ({ ...prev, predictions: false }));
  };

  const handleLocationUpdate = useCallback((location: Location) => {
    setUserLocation(location);
  }, []);

  const handleLocationSearch = useCallback((location: Location) => {
    setMapCenter(location);
    loadWeatherData(location);
    // NOTE: Do NOT call loadNearbyFacilities here — facilities must stay
    // tied to the user's real GPS location so the chatbot always shows
    // hospitals near the user, not near the searched city.
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  }, [setSearchParams]);

  const handleDisasterClick = useCallback((disaster: DisasterEvent) => {
    // Navigate to overview and center on disaster
    handleTabChange('overview');

    // Brief timeout to ensure tab switch completes before centering
    setTimeout(() => {
      console.log("[SAHAYai] Dispatching centerMap event for specialized telemetry:", disaster.location);
      const event = new CustomEvent('centerMap', { detail: disaster.location });
      window.dispatchEvent(event);
    }, 300);
  }, [handleTabChange]);

  const handleFacilityClick = useCallback((facility: EmergencyFacility | any) => {
    // Handle both EmergencyService and EmergencyFacility types
    const location = facility.location
      ? facility.location
      : { lat: facility.lat, lng: facility.lng };

    setMapCenter(location);
    handleTabChange('overview');
  }, [handleTabChange]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="h-full pb-14 md:pb-0">
            <HeatmapOverview
              disasters={disasters}
              userLocation={userLocation}
              nearbyDisasters={disasters.filter(d => {
                if (!userLocation) return false;
                const distance = calculateDistance(userLocation, d.location);
                return distance < 1000;
              })}
            />
          </div>
        );

      case 'early-alerts':
        return (
          <div className="h-full overflow-y-auto p-3 pt-4 pb-20 md:pb-3 sm:p-6 md:pt-6">
            <EarlyAlerts userLocation={userLocation} language={language} />
          </div>
        );

      case 'weather':
        return (
          <div className="h-full overflow-y-auto p-3 pt-4 pb-20 md:pb-3 sm:p-6 md:pt-6">
            <WeatherWidget
              weather={weather}
              loading={loading.weather}
              onLocationChange={handleLocationSearch}
              userLocation={userLocation}
            />
          </div>
        );

      case 'disasters':
        return (
          <div className="h-full overflow-y-auto p-3 pt-4 pb-20 md:pb-3 sm:p-6 md:pt-6">
            <DisasterList
              disasters={[...disasters, ...predictions]}
              onDisasterClick={handleDisasterClick}
              loading={loading.disasters || loading.predictions}
              userLocation={userLocation}
            />
          </div>
        );

      case 'emergency-services':
        return (
          <div className="h-full pb-14 md:pb-0">
            <EmergencyServicesMap onFacilityClick={handleFacilityClick} userLocation={userLocation} disasters={disasters} />
          </div>
        );

      case 'resource-coordination':
        return (
          <div className="h-full overflow-y-auto p-3 pt-4 pb-20 md:pb-3 sm:p-6 md:pt-6">
            <VolunteerHub />
          </div>
        );

      case 'ai-insights':
        return (
          <div className="h-full pb-14 md:pb-0">
            <CopilotChat userLocation={userLocation} facilities={facilities} />
          </div>
        );

      case 'disaster-assessment':
      case 'damage-simulator':
      case 'unified-simulator':
      case 'image-analyzer':
      case 'vision-iap':
        return (
          <div className="h-full pb-14 md:pb-0 overflow-y-auto">
            <DisasterAssessmentTab />
          </div>
        );

      case 'micro-alert':
        return (
          <div className="h-full pb-14 md:pb-0 overflow-y-auto">
            <MicroAlertTab />
          </div>
        );
      case 'guidelines':
        return (
          <div className="h-full overflow-y-auto p-3 pt-4 pb-20 md:pb-3 sm:p-6 md:pt-6">
            <DisasterGuidelines />
          </div>
        );

      case 'alert-history':
        return (
          <div className="h-full overflow-y-auto p-3 pt-4 pb-20 md:pb-3 sm:p-6 md:pt-6">
            <NotificationHistory />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />



      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onFacilityClick={handleFacilityClick}
          onLocationUpdate={handleLocationUpdate}
          language={language}
          onLanguageChange={setLanguage}
        >
          <OfflineIndicator isCollapsed={sidebarCollapsed} />
        </DashboardSidebar>

        {/* Mobile: Overlay when sidebar is open */}
        {!sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-background/60 z-[5500] md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 w-full h-full overflow-hidden relative">

          <div className="h-full w-full">
            {renderTabContent()}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenMenu={() => setSidebarCollapsed(false)}
          language={language}
        />

      </div>
    </div>
  );
};

export default Dashboard;
