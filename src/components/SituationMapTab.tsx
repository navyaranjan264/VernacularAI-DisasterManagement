import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Waves,
  Wind,
  Droplets,
  Activity,
  Shield,
  PhoneCall,
  Tent,
  Users,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Maximize2,
  Filter,
  Eye,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { queryKnowledgeBase } from '@/services/ragService';
import AppleTiltCard from './AppleTiltCard';

export interface SectorHazardProfile {
  id: string;
  name: string;
  state: string;
  hazardType: string;
  severityLevel: 'Guarded' | 'Moderate' | 'High' | 'Severe';
  precipitationMmHr: number;
  riverGaugeLevel: 'Normal' | 'Warning' | 'Danger' | 'Extreme';
  seismicZone: 'Zone II' | 'Zone III' | 'Zone IV' | 'Zone V';
  windSpeedKmph: number;
  ndrfDeployment: {
    unit: string;
    personnel: number;
    equipment: string;
  };
  mapCoords: { x: number; y: number }; // SVG map coordinates
  sheltersCount: number;
  helpline: string;
  policeJurisdiction: string;
  bulletinSummary: string;
}

export const SECTOR_PROFILES: SectorHazardProfile[] = [
  {
    id: 'kattankulathur',
    name: 'Kattankulathur / Chennai Corridor',
    state: 'Tamil Nadu',
    hazardType: 'Bay of Bengal Cyclone & Storm Surge',
    severityLevel: 'Severe',
    precipitationMmHr: 125,
    riverGaugeLevel: 'Danger',
    seismicZone: 'Zone III',
    windSpeedKmph: 85,
    ndrfDeployment: {
      unit: '4th NDRF Bn Arakkonam / Avadi Strike Unit',
      personnel: 65,
      equipment: 'Inflatable rescue boats, high-output tree cutters, and mobile satellite comms',
    },
    mapCoords: { x: 420, y: 390 },
    sheltersCount: 14,
    helpline: '044-27427412 (Chengalpattu DEOC)',
    policeJurisdiction: 'TN-POL-CHENGALPATTU-GD/2026/042',
    bulletinSummary:
      'Gale force winds 85 km/h recorded along NH45 corridor with road inundation at three culvert crossings. Multi-purpose shelters opened for low-lying coastal habitations.',
  },
  {
    id: 'dibrugarh',
    name: 'Dibrugarh / Brahmaputra Basin',
    state: 'Assam',
    hazardType: 'Severe Monsoon Riverine Flood',
    severityLevel: 'Severe',
    precipitationMmHr: 160,
    riverGaugeLevel: 'Extreme',
    seismicZone: 'Zone V',
    windSpeedKmph: 45,
    ndrfDeployment: {
      unit: '1st SDRF / 12th NDRF Bn Guwahati Regional Center',
      personnel: 80,
      equipment: 'Deep-water motorized rescue craft, mobile RO purifiers, and emergency pontoon bridges',
    },
    mapCoords: { x: 575, y: 175 },
    sheltersCount: 18,
    helpline: '0373-2312224 (Dibrugarh DEOC)',
    policeJurisdiction: 'AS-POL-DIBRUGARH-FIR/2026/119',
    bulletinSummary:
      'Brahmaputra river gauge 1.8 meters above highest danger mark. Embankment erosion observed near river bends; evacuation of island and riverbed circles underway.',
  },
  {
    id: 'joshimath',
    name: 'Joshimath / Chamoli Valley',
    state: 'Uttarakhand',
    hazardType: 'Seismic Landslide & Slope Subsidence',
    severityLevel: 'Severe',
    precipitationMmHr: 95,
    riverGaugeLevel: 'Warning',
    seismicZone: 'Zone V',
    windSpeedKmph: 35,
    ndrfDeployment: {
      unit: 'Uttarakhand SDRF High Altitude Rescue Team Joshimath',
      personnel: 45,
      equipment: 'Acoustic listening equipment, hydraulic cutters, and mountain ropeway evacuation kits',
    },
    mapCoords: { x: 345, y: 155 },
    sheltersCount: 8,
    helpline: '01372-251437 (Chamoli DEOC)',
    policeJurisdiction: 'UK-POL-CHAMOLI-FIR/2026/088',
    bulletinSummary:
      'Continuous geotechnical slope movement detected across Ravigram ridge. Badrinath arterial highway blocked by rock debris; high-altitude camps mobilized.',
  },
  {
    id: 'wayanad',
    name: 'Wayanad Hill Sector',
    state: 'Kerala',
    hazardType: 'High-Precipitation Hill Slope Saturation',
    severityLevel: 'High',
    precipitationMmHr: 140,
    riverGaugeLevel: 'Danger',
    seismicZone: 'Zone III',
    windSpeedKmph: 55,
    ndrfDeployment: {
      unit: 'Kerala Police SDRF North Range / 4th NDRF Battalion',
      personnel: 50,
      equipment: 'Earthmoving backhoes, trauma stabilization ambulances, and satellite telemetry relays',
    },
    mapCoords: { x: 370, y: 430 },
    sheltersCount: 12,
    helpline: '04936-204151 (Wayanad DEOC)',
    policeJurisdiction: 'KL-POL-WAYANAD-FIR/2026/204',
    bulletinSummary:
      'Cumulative rainfall exceeded 220mm in 24 hours. Lateral slope mudflow warning active across Meppadi and Chooralmala tea estate sectors.',
  },
  {
    id: 'chiplun',
    name: 'Chiplun / Vashishti Basin',
    state: 'Maharashtra',
    hazardType: 'Reservoir Discharge & Flash Inundation',
    severityLevel: 'High',
    precipitationMmHr: 110,
    riverGaugeLevel: 'Extreme',
    seismicZone: 'Zone IV',
    windSpeedKmph: 60,
    ndrfDeployment: {
      unit: 'Maharashtra SDRF Konkan Coastal Quick Response Unit',
      personnel: 40,
      equipment: 'High-capacity mobile dewatering pumps, rubber boats, and portable floodlights',
    },
    mapCoords: { x: 330, y: 330 },
    sheltersCount: 10,
    helpline: '02355-252044 (Ratnagiri DEOC)',
    policeJurisdiction: 'MH-POL-RATNAGIRI-FIR/2026/301',
    bulletinSummary:
      'Koyna dam outflow increased to 80,000 cusecs during high tide. Vashishti river water level entered municipal market wards; low-lying sectors evacuated.',
  },
  {
    id: 'puri',
    name: 'Puri Coastal Belt',
    state: 'Odisha',
    hazardType: 'Maritime Cyclone Velocity & Sea Swell',
    severityLevel: 'Moderate',
    precipitationMmHr: 70,
    riverGaugeLevel: 'Normal',
    seismicZone: 'Zone III',
    windSpeedKmph: 75,
    ndrfDeployment: {
      unit: 'ODRAF 1st Battalion / Paradip Strike Group',
      personnel: 55,
      equipment: 'Mechanized chainsaw squads, satellite phones, and community shelter kits',
    },
    mapCoords: { x: 460, y: 295 },
    sheltersCount: 16,
    helpline: '06752-223237 (Puri DEOC)',
    policeJurisdiction: 'OD-POL-PURI-FIR/2026/047',
    bulletinSummary:
      'IMD coastal cyclone bulletin indicates wind velocities 75 km/h. Sea waves reaching 3.5m; fishing operations suspended and coastal alerts active.',
  },
];

export const SituationMapTab: React.FC = () => {
  const { t } = useLanguage();

  // Active Selected Sector
  const [selectedSectorId, setSelectedSectorId] = useState<string>(SECTOR_PROFILES[0].id);

  // Filter Matrix State
  const [minPrecipitation, setMinPrecipitation] = useState<number>(0);
  const [selectedRiverGauge, setSelectedRiverGauge] = useState<string>('All');
  const [selectedSeismicZone, setSelectedSeismicZone] = useState<string>('All');
  const [minWindSpeed, setMinWindSpeed] = useState<number>(0);

  // Filtered Sectors
  const filteredSectors = useMemo(() => {
    return SECTOR_PROFILES.filter((sector) => {
      if (sector.precipitationMmHr < minPrecipitation) return false;
      if (sector.windSpeedKmph < minWindSpeed) return false;
      if (selectedRiverGauge !== 'All' && sector.riverGaugeLevel !== selectedRiverGauge) return false;
      if (selectedSeismicZone !== 'All' && sector.seismicZone !== selectedSeismicZone) return false;
      return true;
    });
  }, [minPrecipitation, minWindSpeed, selectedRiverGauge, selectedSeismicZone]);

  const activeSector =
    SECTOR_PROFILES.find((s) => s.id === selectedSectorId) || SECTOR_PROFILES[0];

  const getSeverityBadgeClass = (level: SectorHazardProfile['severityLevel']) => {
    switch (level) {
      case 'Guarded':
        return 'bg-[#7D9D8B]/20 text-[#14273E] border-[#7D9D8B]/40';
      case 'Moderate':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'High':
        return 'bg-[#C85A4B]/15 text-[#C85A4B] border-[#C85A4B]/40';
      case 'Severe':
        return 'bg-[#C85A4B] text-white border-[#C85A4B]';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getRiverGaugeBadgeClass = (level: SectorHazardProfile['riverGaugeLevel']) => {
    switch (level) {
      case 'Normal':
        return 'bg-[#7D9D8B]/20 text-[#14273E]';
      case 'Warning':
        return 'bg-amber-100 text-amber-900';
      case 'Danger':
        return 'bg-[#C85A4B]/20 text-[#C85A4B]';
      case 'Extreme':
        return 'bg-[#C85A4B] text-white font-bold';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* FILTER MATRIX STRIP (Apple Frosted Glass Panel)           */}
      {/* ========================================================= */}
      <section className="apple-glass-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 apple-hairline-b">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#14273E] text-[#7D9D8B] flex items-center justify-center shadow-xs">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#14273E] tracking-tight">
                Hazard Surveillance Filter Matrix
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Multi-parameter meteorological, hydrological, and geotechnical filters
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setMinPrecipitation(0);
              setSelectedRiverGauge('All');
              setSelectedSeismicZone('All');
              setMinWindSpeed(0);
            }}
            className="text-xs text-slate-600 hover:text-[#14273E] font-semibold apple-btn-haptic px-3 py-1 rounded-xl bg-white/70 border border-slate-200/80"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Precipitation Slider */}
          <div className="bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#14273E]">
              <span className="flex items-center space-x-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#1D7A82]" />
                <span>Precipitation</span>
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200">
                &ge; {minPrecipitation} mm/hr
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={minPrecipitation}
              onChange={(e) => setMinPrecipitation(Number(e.target.value))}
              className="w-full accent-[#1D7A82]"
              aria-label="Precipitation threshold"
            />
          </div>

          {/* River Basin Gauge Level */}
          <div className="bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#14273E]">
              <span className="flex items-center space-x-1.5">
                <Waves className="w-3.5 h-3.5 text-[#1D7A82]" />
                <span>River Gauge Level</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-normal">
                {selectedRiverGauge}
              </span>
            </div>
            <select
              value={selectedRiverGauge}
              onChange={(e) => setSelectedRiverGauge(e.target.value)}
              className="w-full text-xs font-semibold p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D7A82]"
            >
              <option value="All">All Gauge Levels</option>
              <option value="Normal">Normal</option>
              <option value="Warning">Warning</option>
              <option value="Danger">Danger</option>
              <option value="Extreme">Extreme</option>
            </select>
          </div>

          {/* Seismic Zone */}
          <div className="bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#14273E]">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-[#1D7A82]" />
                <span>Seismic Zone</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-normal">
                {selectedSeismicZone}
              </span>
            </div>
            <select
              value={selectedSeismicZone}
              onChange={(e) => setSelectedSeismicZone(e.target.value)}
              className="w-full text-xs font-semibold p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1D7A82]"
            >
              <option value="All">All Seismic Zones</option>
              <option value="Zone II">Zone II (Low)</option>
              <option value="Zone III">Zone III (Moderate)</option>
              <option value="Zone IV">Zone IV (Severe)</option>
              <option value="Zone V">Zone V (Very High / Himalayan)</option>
            </select>
          </div>

          {/* Wind Speed Slider */}
          <div className="bg-white/70 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#14273E]">
              <span className="flex items-center space-x-1.5">
                <Wind className="w-3.5 h-3.5 text-[#1D7A82]" />
                <span>Cyclone Wind Speed</span>
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white border border-slate-200">
                &ge; {minWindSpeed} km/h
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={minWindSpeed}
              onChange={(e) => setMinWindSpeed(Number(e.target.value))}
              className="w-full accent-[#1D7A82]"
              aria-label="Wind speed threshold"
            />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6 REAL-WORLD HAZARD SECTOR PRESET CARDS WITH 3D TILT      */}
      {/* ========================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-[#14273E] uppercase tracking-wider">
            High-Risk Operational Sectors ({filteredSectors.length} of {SECTOR_PROFILES.length} Matched)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Click any sector to inspect tactical telemetry
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSectors.map((sector) => {
            const isSelected = selectedSectorId === sector.id;
            return (
              <AppleTiltCard
                key={sector.id}
                onClick={() => setSelectedSectorId(sector.id)}
                className={`p-4 rounded-3xl cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-white/95 border-[#1D7A82] shadow-lg shadow-[#1D7A82]/10 ring-2 ring-[#1D7A82]/30'
                    : 'apple-glass-card hover:bg-white/90'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {sector.state}
                    </span>
                    <h4 className="text-sm font-bold text-[#14273E] leading-snug">
                      {sector.name}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider border shrink-0 ${getSeverityBadgeClass(
                      sector.severityLevel
                    )}`}
                  >
                    {sector.severityLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {sector.hazardType}
                </p>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 apple-hairline-t">
                  <div className="bg-slate-100/70 p-1.5 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500">Rain:</span>
                    <span className="font-bold text-[#14273E]">{sector.precipitationMmHr} mm/h</span>
                  </div>
                  <div className="bg-slate-100/70 p-1.5 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500">Wind:</span>
                    <span className="font-bold text-[#14273E]">{sector.windSpeedKmph} km/h</span>
                  </div>
                  <div className="bg-slate-100/70 p-1.5 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500">Gauge:</span>
                    <span className="font-bold text-[#14273E]">{sector.riverGaugeLevel}</span>
                  </div>
                  <div className="bg-slate-100/70 p-1.5 rounded-xl flex items-center justify-between">
                    <span className="text-slate-500">Zone:</span>
                    <span className="font-bold text-[#14273E]">{sector.seismicZone}</span>
                  </div>
                </div>
              </AppleTiltCard>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TACTICAL MAP & ACTIVE SECTOR DETAIL PANEL                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Tactical Map SVG (7 Columns) */}
        <div className="lg:col-span-7 apple-glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 apple-hairline-b text-xs">
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#1D7A82]" />
              <span className="font-bold text-[#14273E]">
                Nationwide Hazard Surveillance Map
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-mono">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C85A4B]" />
                <span>Severe</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7D9D8B]" />
                <span>Shelters</span>
              </span>
            </div>
          </div>

          {/* SVG Map of India with Sector Points */}
          <div className="relative w-full rounded-2xl bg-white/80 border border-slate-200/80 overflow-hidden shadow-inner p-2">
            <svg
              viewBox="200 80 460 420"
              className="w-full h-80 sm:h-96 select-none block"
              aria-label="Nationwide Disaster Surveillance Map"
            >
              {/* Generalized India Peninsula Vector Outlines */}
              <path
                d="M 320,100 L 370,120 L 420,135 L 490,140 L 590,150 L 610,180 L 580,210 L 540,210 L 500,240 L 480,280 L 460,330 L 420,380 L 390,430 L 360,470 L 340,430 L 320,370 L 300,320 L 280,270 L 260,230 L 290,190 L 300,140 Z"
                fill="#F3EFEA"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />

              {/* Major Rivers (Brahmaputra, Ganga, Vashishti) */}
              <path
                d="M 500,160 Q 560,165 600,175"
                fill="none"
                stroke="#1D7A82"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />
              <path
                d="M 330,135 Q 420,200 480,250"
                fill="none"
                stroke="#1D7A82"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Interactive Sector Hotspots */}
              {SECTOR_PROFILES.map((sector) => {
                const isSelected = selectedSectorId === sector.id;
                const isSevere = sector.severityLevel === 'Severe';

                return (
                  <g
                    key={sector.id}
                    onClick={() => setSelectedSectorId(sector.id)}
                    className="cursor-pointer transition-transform hover:scale-110"
                  >
                    {/* Concentric Pulsing Ring for Selected or Severe Sectors */}
                    {isSelected && (
                      <circle
                        cx={sector.mapCoords.x}
                        cy={sector.mapCoords.y}
                        r="20"
                        fill="none"
                        stroke={isSevere ? '#C85A4B' : '#1D7A82'}
                        strokeWidth="2"
                        opacity="0.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    {/* Sector Marker Circle */}
                    <circle
                      cx={sector.mapCoords.x}
                      cy={sector.mapCoords.y}
                      r={isSelected ? 10 : 7}
                      fill={isSevere ? '#C85A4B' : isSelected ? '#1D7A82' : '#7D9D8B'}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                    />

                    {/* Center Core */}
                    <circle
                      cx={sector.mapCoords.x}
                      cy={sector.mapCoords.y}
                      r="3"
                      fill="#FFFFFF"
                    />

                    {/* Marker Text Tag */}
                    <text
                      x={sector.mapCoords.x + 12}
                      y={sector.mapCoords.y + 4}
                      fontSize="10"
                      fontWeight="bold"
                      fill="#14273E"
                      fontFamily="-apple-system, sans-serif"
                    >
                      {sector.name.split('/')[0].trim()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Sector Tactical Inspector (5 Columns) */}
        <div className="lg:col-span-5 apple-glass-panel p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 apple-hairline-b space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Tactical Deployment Inspector
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono tracking-wider border ${getSeverityBadgeClass(
                    activeSector.severityLevel
                  )}`}
                >
                  {activeSector.severityLevel}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#14273E]">
                {activeSector.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                {activeSector.hazardType}
              </p>
            </div>

            {/* Official Bulletin Quote */}
            <div className="my-3.5 p-3.5 rounded-2xl bg-white/80 border border-slate-200 text-xs leading-relaxed text-slate-700 font-medium">
              "{activeSector.bulletinSummary}"
            </div>

            {/* NDRF & SDRF Deployment Status */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-[#E5ECE7] border border-[#7D9D8B]/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#14273E] flex items-center space-x-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#1D7A82]" />
                    <span>NDRF Strike Deployment</span>
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#14273E] text-white">
                    {activeSector.ndrfDeployment.personnel} Personnel
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#14273E]">
                  {activeSector.ndrfDeployment.unit}
                </div>
                <div className="text-[11px] text-slate-600">
                  {activeSector.ndrfDeployment.equipment}
                </div>
              </div>

              {/* Verified Multi-Purpose Shelters */}
              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#14273E]">
                  <span className="flex items-center space-x-1.5">
                    <Tent className="w-3.5 h-3.5 text-[#1D7A82]" />
                    <span>Verified Multi-Purpose Shelters</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1D7A82]">
                    {activeSector.sheltersCount} Active Centers
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Equipped with auxiliary generator banks, RO filtration, and medical triaging units.
                </p>
              </div>

              {/* Helplines and Police Authority */}
              <div className="p-3 rounded-2xl bg-white/80 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600 flex items-center space-x-1">
                    <PhoneCall className="w-3 h-3 text-[#7D9D8B]" />
                    <span>DEOC Helpline:</span>
                  </span>
                  <span className="font-mono font-bold text-[#14273E]">
                    {activeSector.helpline}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                  <span>GD Ref:</span>
                  <span>{activeSector.policeJurisdiction}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <a
              href="#simulator"
              onClick={() => {
                const simBtn = document.querySelector('button[title*="Simulator"]') as HTMLButtonElement;
                simBtn?.click();
              }}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl text-xs font-bold bg-[#14273E] text-white hover:bg-[#1E3A5F] apple-btn-haptic flex items-center justify-center space-x-2 transition-all shadow-sm"
            >
              <span>Launch Evacuation Simulator for this Sector</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SituationMapTab;
