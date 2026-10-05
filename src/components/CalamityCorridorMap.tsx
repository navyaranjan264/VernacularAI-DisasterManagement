import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CalamityCorridor, VerifiedShelter } from '@/services/ragService';
import { useLanguage } from '@/context/LanguageContext';

interface CalamityCorridorMapProps {
  corridor: CalamityCorridor;
  className?: string;
}

export const CalamityCorridorMap: React.FC<CalamityCorridorMapProps> = ({
  corridor,
  className = 'h-96 w-full',
}) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [corridor.lat, corridor.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    // Standard, completely free public OpenStreetMap tiles (zero API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map contents when corridor or language changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Pan map smoothly to new city coordinates
    map.flyTo([corridor.lat, corridor.lng], 13, { duration: 1.2 });

    // 2. Plot Waterlogged / Danger Zone in Translucent Coral (#E06D53, 20% opacity)
    if (corridor.dangerZone) {
      const dangerCircle = L.circle(
        [corridor.dangerZone.centerLat, corridor.dangerZone.centerLng],
        {
          radius: corridor.dangerZone.radiusMeters,
          color: '#C85A4B',
          weight: 2,
          opacity: 0.85,
          fillColor: '#E06D53',
          fillOpacity: 0.2,
          dashArray: '6, 6',
        }
      );

      const dangerPopupContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px;">
          <div style="background: #C85A4B; color: #ffffff; padding: 6px 10px; border-radius: 6px 6px 0 0; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
            ${t('criticalHazardZone')}
          </div>
          <div style="padding: 10px; background: #ffffff; border-radius: 0 0 6px 6px; font-size: 12px; color: #334155; line-height: 1.4;">
            <div style="font-weight: 600; color: #0E1A2B; margin-bottom: 4px;">${corridor.dangerZone.description}</div>
            <div style="color: #E06D53; font-weight: 600; font-size: 11px;">${t('primaryThreatLabel')}: ${corridor.primaryThreat}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 4px;">${t('perimeterRadius')}: ${corridor.dangerZone.radiusMeters}m</div>
          </div>
        </div>
      `;

      dangerCircle.bindPopup(dangerPopupContent);
      layerGroup.addLayer(dangerCircle);

      // Hazard Center Marker
      const hazardIcon = L.divIcon({
        className: 'custom-hazard-pin',
        html: `
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #E06D53; border: 2px solid #ffffff; box-shadow: 0 4px 12px rgba(224, 109, 83, 0.45); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const hazardMarker = L.marker(
        [corridor.dangerZone.centerLat, corridor.dangerZone.centerLng],
        { icon: hazardIcon }
      ).bindPopup(dangerPopupContent);

      layerGroup.addLayer(hazardMarker);
    }

    // 3. Plot Verified Shelters in Calming Sage Green (#7D9D8B) with Elevation Badges
    corridor.verifiedShelters.forEach((shelter: VerifiedShelter, index: number) => {
      const shelterIcon = L.divIcon({
        className: 'custom-shelter-pin',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background: #7D9D8B; border: 2px solid #ffffff; border-radius: 9999px; padding: 2px 7px; color: #ffffff; font-size: 10px; font-weight: 700; font-family: monospace; box-shadow: 0 2px 8px rgba(125, 157, 139, 0.5); white-space: nowrap; margin-bottom: 2px;">
              ${shelter.elevation}m
            </div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #7D9D8B; border: 2px solid #ffffff; box-shadow: 0 4px 14px rgba(20, 39, 62, 0.25); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
        `,
        iconSize: [36, 52],
        iconAnchor: [18, 52],
        popupAnchor: [0, -50],
      });

      const resourcesHtml = shelter.resourcesAvailable
        .map(
          (r) =>
            `<span style="display: inline-block; background: #EBF2EE; color: #335341; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; margin: 2px 2px 0 0;">${r}</span>`
        )
        .join('');

      // Formatted Leaflet Popups with Muted Mauve Header (#7D6B7D)
      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 240px; max-width: 280px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); border-radius: 8px; overflow: hidden;">
          <div style="background: #7D6B7D; color: #ffffff; padding: 10px 12px; font-weight: 700; font-size: 12px; display: flex; justify-content: space-between; align-items: center;">
            <span>${t('mapVerifiedShelter').toUpperCase()}</span>
            <span style="background: rgba(255,255,255,0.25); padding: 1px 6px; border-radius: 4px; font-size: 10px; font-mono;">${shelter.elevation}m ${t('mapElevation')}</span>
          </div>
          <div style="padding: 12px; background: #ffffff; font-size: 12px; color: #14273E; line-height: 1.45;">
            <div style="font-weight: 700; font-size: 13px; color: #0E1A2B; margin-bottom: 3px;">${shelter.name}</div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">${shelter.address}</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px; padding: 6px; background: #F9F8F5; border-radius: 6px; font-size: 11px;">
              <div>
                <span style="color: #64748b; display: block; font-size: 9px; text-transform: uppercase;">${t('mapCapacity')}</span>
                <span style="font-weight: 700; color: #0E1A2B;">${shelter.capacity.toLocaleString('en-IN')} ${t('personsLabel')}</span>
              </div>
              <div>
                <span style="color: #64748b; display: block; font-size: 9px; text-transform: uppercase;">${t('directDesk')}</span>
                <span style="font-weight: 700; color: #1D7A82; font-size: 10px;">${shelter.contact}</span>
              </div>
            </div>

            <div style="margin-top: 4px;">
              <span style="color: #64748b; font-size: 10px; font-weight: 600; display: block; margin-bottom: 2px;">${t('deployedLogistics')}</span>
              <div>${resourcesHtml}</div>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([shelter.lat, shelter.lng], { icon: shelterIcon }).bindPopup(
        popupHtml
      );

      layerGroup.addLayer(marker);

      // 4. Draw Evacuation Corridor via Animated Dashed Polyline in Coastal Teal (#1D7A82)
      const originLat = corridor.dangerZone ? corridor.dangerZone.centerLat : corridor.lat;
      const originLng = corridor.dangerZone ? corridor.dangerZone.centerLng : corridor.lng;

      // Intermediate midpoint with slight realistic curve for realistic road corridor
      const midLat = (originLat + shelter.lat) / 2 + (index % 2 === 0 ? 0.005 : -0.005);
      const midLng = (originLng + shelter.lng) / 2 + (index % 2 === 0 ? -0.005 : 0.005);

      const routePoints: [number, number][] = [
        [originLat, originLng],
        [midLat, midLng],
        [shelter.lat, shelter.lng],
      ];

      const corridorPolyline = L.polyline(routePoints, {
        color: '#1D7A82',
        weight: 4,
        dashArray: '8, 12',
        dashOffset: '0',
        opacity: 0.95,
        className: 'animated-evacuation-corridor',
      });

      corridorPolyline.bindPopup(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 6px 10px; font-size: 11px;">
          <div style="font-weight: 700; color: #1D7A82; text-transform: uppercase; font-size: 10px;">${t('mapSafeCorridor')}</div>
          <div style="color: #0E1A2B; font-weight: 600;">${t('nearestSafeShelter')}: ${shelter.name}</div>
          <div style="color: #64748b; font-size: 10px; margin-top: 2px;">${corridor.evacuationCorridors[0]?.primaryRouteName || t('highGroundBypass')}</div>
        </div>
      `);

      layerGroup.addLayer(corridorPolyline);
    });
  }, [corridor, t]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/60 shadow-md">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className={className} />

      {/* Floating Map Legend & Sector Badge */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none">
        <div className="apple-glass-card px-3.5 py-2 rounded-xl border border-white/80 shadow-sm pointer-events-auto flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1D7A82] animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-[#0E1A2B]">{corridor.city}</span>
            <span className="text-slate-500 ml-1.5 text-[11px] font-mono">({corridor.elevationMeters}m MSL)</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 z-[1000] pointer-events-none">
        <div className="apple-glass-card px-3 py-2 rounded-xl border border-white/80 shadow-sm pointer-events-auto flex items-center space-x-3 text-[11px] font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7D9D8B]" />
            <span className="text-slate-700">{t('mapVerifiedShelter')}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E06D53]" />
            <span className="text-slate-700">{t('mapDangerZone')}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-4 h-1 bg-[#1D7A82] rounded-full inline-block" />
            <span className="text-slate-700">{t('mapSafeCorridor')}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dashflow {
          to {
            stroke-dashoffset: -40;
          }
        }
        .animated-evacuation-corridor {
          animation: dashflow 1.8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CalamityCorridorMap;
