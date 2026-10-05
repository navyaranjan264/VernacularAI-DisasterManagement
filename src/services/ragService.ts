/**
 * Grounding Service for Disaster Response Operations
 * 
 * Sources authoritative NDMA 2026 standards, designated multi-purpose cyclone/flood
 * shelters across Indian coastal and riverine states, and district emergency helplines.
 * 
 * Zero-emoji standard enforced throughout.
 */

import knowledgeBase from '@/data/disasterKnowledgeBase.json';
import shelterRegistry from '@/data/shelterRegistry.json';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VerifiedShelter {
  name: string;
  address: string;
  capacity: number;
  contact: string;
  elevation: number;
  lat: number;
  lng: number;
  resourcesAvailable: string[];
}

export interface EvacuationCorridor {
  primaryRouteName: string;
  avoidAreas: string[];
  targetElevationMeters: number;
}

export interface ActiveVolunteerHub {
  hubName: string;
  coordinatorPhone: string;
  volunteerCapacity: number;
}

export interface CalamityCorridor {
  id: string;
  city: string;
  state: string;
  disasterHistory: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  primaryThreat: string;
  dangerZone: {
    centerLat: number;
    centerLng: number;
    radiusMeters: number;
    description: string;
  };
  verifiedShelters: VerifiedShelter[];
  evacuationCorridors: EvacuationCorridor[];
  activeVolunteerHubs: ActiveVolunteerHub[];
}

/**
 * Returns all 10 high-risk calamity corridor zones across India.
 */
export function getAllCalamityCorridors(): CalamityCorridor[] {
  return shelterRegistry as CalamityCorridor[];
}

/**
 * Matches user location or nearest city within the 10-city database.
 */
export function findSheltersByLocation(query = ''): CalamityCorridor {
  const q = query.toLowerCase().trim();
  const corridors = shelterRegistry as CalamityCorridor[];

  if (!q) return corridors[0]; // Default to Chennai / Kattankulathur

  const match = corridors.find((c) => {
    const cityTerms = c.city.toLowerCase().split(/[\s,/]+/);
    const stateTerms = c.state.toLowerCase().split(/[\s,/]+/);
    return (
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      cityTerms.some((term) => term.length > 2 && q.includes(term)) ||
      stateTerms.some((term) => term.length > 2 && q.includes(term)) ||
      c.disasterHistory.toLowerCase().includes(q) ||
      c.primaryThreat.toLowerCase().includes(q)
    );
  });

  return match || corridors[0];
}

/**
 * Grounded injection function feeding exact coordinates, safe corridors,
 * elevation, and shelter capacities into the generative prompt.
 */
export function buildGroundedPrompt(
  location: string,
  headcount: number,
  language: string,
  scriptName?: string
): string {
  const corridor = findSheltersByLocation(location);
  const n = Math.max(1, Math.round(headcount));
  const waterLiters = (n * 3.5 * 3).toLocaleString('en-IN');
  const dryRations = (n * 6).toLocaleString('en-IN');
  const traumaKits = Math.max(1, Math.ceil(n / 10));

  const sheltersStr = corridor.verifiedShelters
    .map(
      (s, idx) =>
        `   ${idx + 1}. ${s.name} (${s.address}) | Coordinates: [${s.lat}, ${s.lng}] | Elevation: ${s.elevation}m | Capacity: ${s.capacity} persons | Contact: ${s.contact} | Resources: ${s.resourcesAvailable.join(', ')}`
    )
    .join('\n');

  const corridorsStr = corridor.evacuationCorridors
    .map(
      (ec) =>
        `   - Primary Route: ${ec.primaryRouteName} | Avoid: ${ec.avoidAreas.join(', ')} | Target Elevation: ${ec.targetElevationMeters}m`
    )
    .join('\n');

  const hubsStr = corridor.activeVolunteerHubs
    .map((vh) => `   - Hub: ${vh.hubName} | Coordinator: ${vh.coordinatorPhone} | Capacity: ${vh.volunteerCapacity} volunteers`)
    .join('\n');

  const targetScript = scriptName || `${language} script`;

  return `
--- AUTHORITATIVE GROUND-TRUTH CALAMITY CORRIDOR CONTEXT ---
Target Location: ${corridor.city}, ${corridor.state} (Center Coordinates: [${corridor.lat}, ${corridor.lng}], Base Elevation: ${corridor.elevationMeters}m)
Primary Threat Profile: ${corridor.primaryThreat}
Historical Precedent: ${corridor.disasterHistory}
Critical Hazard Zone: ${corridor.dangerZone.description} (Center: [${corridor.dangerZone.centerLat}, ${corridor.dangerZone.centerLng}], Radius: ${corridor.dangerZone.radiusMeters}m)

MATHEMATICAL RESOURCE ALLOCATION (Headcount N = ${n} Individuals over 72-Hour Operational Window):
- Potable Drinking Water: ${waterLiters} Liters (Standard: 3.5 Liters/person/day × 3 days)
- Calorie-Dense Ready-to-Eat Rations: ${dryRations} Packets (2 meals/day × 3 days)
- Modular Trauma Kits: ${traumaKits} Kit(s) (1 kit per 10 persons)
- Thermal Protection Blankets: ${n} Units

VERIFIED SAFE SHELTERS & HIGH-GROUND HUBS:
${sheltersStr}

EVACUATION CORRIDORS & HAZARD BYPASS PATHS:
${corridorsStr}

ACTIVE CIVIL VOLUNTEER & LOGISTICS HUBS:
${hubsStr}

CRITICAL VERNACULAR REQUIREMENT:
You MUST generate ALL textual outputs (damage observations, evacuation directions, before/after safety tips, live news bulletins, and social media updates) STRICTLY and FLUENTLY in ${language} using its native script (${targetScript}). Do NOT use English transliteration or mixed language. Non-English speaking citizens must be able to read every word directly in their native script.
--- END GROUND-TRUTH CONTEXT ---
`.trim();
}

export interface DesignatedShelter {
  shelterId: string;
  name: string;
  district: string;
  coordinates: { lat: number; lng: number };
  elevationMeters: number;
  capacityPersons: number;
  facilities: string[];
  nodalOfficer: string;
  contactPhone: string;
}

export interface DistrictCentre {
  district: string;
  deocNumber: string;
  alternate: string;
  policeControl: string;
}

export interface StateDisasterProfile {
  stateName: string;
  capital: string;
  stateHelpline: string;
  stateDisasterAuthority: string;
  primaryHazards: string[];
  policeJurisdictionFormat: string;
  sdrfBattalions: { unit: string; contact: string; specialization: string }[];
  designatedShelters: DesignatedShelter[];
  districtEmergencyCentres: DistrictCentre[];
}

export interface PreparednessKitItem {
  name: string;
  quantity: string;
  category: 'Hydration' | 'Nutrition' | 'Medical' | 'Power' | 'Communication';
  criticalDirectives: string;
}

export interface PreparednessKit {
  headcount: number;
  potableWaterLiters: number;
  dryRationPackets: number;
  items: PreparednessKitItem[];
}

export interface KnowledgeQueryResult {
  matchedState: StateDisasterProfile;
  shelters: DesignatedShelter[];
  districtCentres: DistrictCentre[];
  policeJurisdictionFormat: string;
  standardRatios: typeof knowledgeBase.ndmaStandardProtocols;
}

/**
 * Identify matching Indian state and district assets based on free-form
 * location string or landmark keywords.
 */
export function queryKnowledgeBase(locationQuery = ''): KnowledgeQueryResult {
  const query = locationQuery.toLowerCase();
  const states = knowledgeBase.states as Record<string, StateDisasterProfile>;

  let matchedStateKey = 'tamilnadu'; // Default coastal baseline

  if (
    query.includes('assam') ||
    query.includes('brahmaputra') ||
    query.includes('guwahati') ||
    query.includes('kaziranga') ||
    query.includes('silchar') ||
    query.includes('cachar') ||
    query.includes('dibrugarh')
  ) {
    matchedStateKey = 'assam';
  } else if (
    query.includes('uttarakhand') ||
    query.includes('chamoli') ||
    query.includes('joshimath') ||
    query.includes('gopeshwar') ||
    query.includes('dehradun')
  ) {
    matchedStateKey = 'uttarakhand';
  } else if (
    query.includes('tamil') ||
    query.includes('chennai') ||
    query.includes('cuddalore') ||
    query.includes('chengalpattu') ||
    query.includes('kattankulathur') ||
    query.includes('nagapattinam')
  ) {
    matchedStateKey = 'tamilnadu';
  } else if (
    query.includes('odisha') ||
    query.includes('orissa') ||
    query.includes('puri') ||
    query.includes('paradip') ||
    query.includes('bhubaneswar') ||
    query.includes('jagatsinghpur')
  ) {
    matchedStateKey = 'odisha';
  } else if (
    query.includes('kerala') ||
    query.includes('wayanad') ||
    query.includes('alappuzha') ||
    query.includes('idukki') ||
    query.includes('meppadi')
  ) {
    matchedStateKey = 'kerala';
  } else if (
    query.includes('maharashtra') ||
    query.includes('chiplun') ||
    query.includes('ratnagiri') ||
    query.includes('mumbai') ||
    query.includes('khed')
  ) {
    matchedStateKey = 'maharashtra';
  } else if (
    query.includes('gujarat') ||
    query.includes('bharuch') ||
    query.includes('kutch') ||
    query.includes('narmada') ||
    query.includes('kandla') ||
    query.includes('gandhidham')
  ) {
    matchedStateKey = 'gujarat';
  }

  const profile = states[matchedStateKey] || states['tamilnadu'];

  return {
    matchedState: profile,
    shelters: profile.designatedShelters,
    districtCentres: profile.districtEmergencyCentres,
    policeJurisdictionFormat: profile.policeJurisdictionFormat,
    standardRatios: knowledgeBase.ndmaStandardProtocols,
  };
}

/**
 * Retrieve designated multi-purpose shelters matching a location.
 */
export function getDesignatedShelters(locationQuery = ''): DesignatedShelter[] {
  return queryKnowledgeBase(locationQuery).shelters;
}

/**
 * Mathematically scale custom emergency preparedness kit for N persons.
 * Formula baseline: 3.5 Liters potable water/person/day for 72 hours.
 */
export function calculatePreparednessKit(headcount: number): PreparednessKit {
  const n = Math.max(1, Math.round(headcount));
  const waterLiters = n * 3.5 * 3; // 3-day buffer
  const rationPackets = n * 6; // 2 meals/day for 3 days
  const traumaKits = Math.max(1, Math.ceil(n / 10));
  const chlorineTablets = n * 15;
  const powerBanks = Math.max(1, Math.ceil(n / 4));
  const blankets = n;

  return {
    headcount: n,
    potableWaterLiters: waterLiters,
    dryRationPackets: rationPackets,
    items: [
      {
        name: 'Potable Drinking Water Containers',
        quantity: `${waterLiters.toLocaleString('en-IN')} Liters (3.5L/day × ${n} persons × 3 days)`,
        category: 'Hydration',
        criticalDirectives: 'Store in sealed food-grade containers above ground flood mark.',
      },
      {
        name: 'High-Calorie Ready-to-Eat Ration Packs',
        quantity: `${rationPackets.toLocaleString('en-IN')} Packets (2,100 kcal/person/day)`,
        category: 'Nutrition',
        criticalDirectives: 'Non-perishable vacuum-sealed nutrient bars and dry roasted pulses.',
      },
      {
        name: 'Chlorine Water Purification Tablets',
        quantity: `${chlorineTablets.toLocaleString('en-IN')} Tablets (1 tab treats 20L water)`,
        category: 'Hydration',
        criticalDirectives: 'Wait 30 minutes after tablet dissolution before human consumption.',
      },
      {
        name: 'Emergency Trauma & First-Aid Modules',
        quantity: `${traumaKits} Modular Trauma Kit${traumaKits > 1 ? 's' : ''}`,
        category: 'Medical',
        criticalDirectives: 'Includes sterile gauze, antiseptic wash, burn dressings, and ORS packets.',
      },
      {
        name: 'High-Capacity Power Banks & Radio Battery',
        quantity: `${powerBanks} Heavy-Duty Battery Unit${powerBanks > 1 ? 's' : ''} (20,000mAh)`,
        category: 'Power',
        criticalDirectives: 'Maintain fully charged in waterproof sealable dry pouches.',
      },
      {
        name: 'Thermal Waterproof Ground Mats & Blankets',
        quantity: `${blankets} Foil Thermal Blanket${blankets > 1 ? 's' : ''}`,
        category: 'Medical',
        criticalDirectives: 'Prevents hypothermia and shock during wet evacuations.',
      },
    ],
  };
}

/**
 * Build deterministic grounding prompt injecting NDMA 2026 guidelines,
 * local shelter inventory, and population formulas into the generative context.
 */
export function buildRAGGroundingPrompt(params: {
  hazard: string;
  locationOrLandmark: string;
  severity: string;
  population: number;
}): string {
  const kb = queryKnowledgeBase(params.locationOrLandmark);
  const pop = params.population || 50000;
  const state = kb.matchedState;

  const totalWaterRequiredLiters = (pop * kb.standardRatios.potableWaterLitersPerPersonPerDay).toLocaleString('en-IN');
  const totalRationsKcal = (pop * kb.standardRatios.dryRationKcalPerPersonPerDay).toLocaleString('en-IN');
  const requiredIRBRescueBoats = Math.max(2, Math.ceil((pop / 5000) * kb.standardRatios.irbBoatRatioPerFiveThousandImpacted));

  const sheltersFormatted = kb.shelters
    .map(
      (s) =>
        `   - [${s.shelterId}] ${s.name} (${s.district}) | Elevation: ${s.elevationMeters}m | Capacity: ${s.capacityPersons.toLocaleString(
          'en-IN'
        )} persons | Facilities: ${s.facilities.join(', ')} | Nodal: ${s.nodalOfficer} (${s.contactPhone})`
    )
    .join('\n');

  const battalionsFormatted = state.sdrfBattalions
    .map((b) => `   - ${b.unit} (Contact: ${b.contact}) | Specialization: ${b.specialization}`)
    .join('\n');

  const deocFormatted = state.districtEmergencyCentres
    .map((d) => `   - ${d.district} DEOC: ${d.deocNumber} (Direct: ${d.alternate}) | Police: ${d.policeControl}`)
    .join('\n');

  return `
--- AUTHORITATIVE NDMA 2026 DISASTER PROTOCOL GROUNDING ---
Authority: ${knowledgeBase.authority}
Standards: ${knowledgeBase.standardsRevision}
Jurisdiction: ${state.stateName} State Disaster Management Authority (${state.stateDisasterAuthority})
Emergency Line: Dial ${state.stateHelpline}

1. Target Population Scaling (Baseline for ${pop.toLocaleString('en-IN')} individuals):
   - Daily Potable Water: ${totalWaterRequiredLiters} Liters/day (Rate: ${kb.standardRatios.potableWaterLitersPerPersonPerDay} L/capita)
   - Daily Dry Rations: ${totalRationsKcal} kcal/day (Rate: ${kb.standardRatios.dryRationKcalPerPersonPerDay} kcal/capita)
   - Inflatable Rescue Boats (IRBs): ${requiredIRBRescueBoats} motorized boat units
   - Shelter Space: ${(pop * kb.standardRatios.shelterAreaSqMetersPerPerson).toLocaleString('en-IN')} sq. meters

2. Pre-Designated Multi-Purpose Flood/Cyclone Shelters:
${sheltersFormatted}

3. Mobilized SDRF Battalions:
${battalionsFormatted}

4. District Operations Centre Directory:
${deocFormatted}
--- END NDMA GROUNDING CONTEXT ---
`.trim();
}

/**
 * Generate standard police district missing persons search manifest.
 */
export function generateMissingPersonManifest(params: {
  location: string;
  reportedMissingCount?: number;
  reporterContact?: string;
}): {
  manifestId: string;
  policeJurisdictionCode: string;
  locationSector: string;
  estimatedCount: number;
  timestamp: string;
  fieldSearchDirectives: string[];
} {
  const kb = queryKnowledgeBase(params.location);
  const year = new Date().getFullYear();
  const serial = Math.floor(1000 + Math.random() * 9000);
  const districtName = kb.districtCentres[0]?.district.toUpperCase().replace(/\s+/g, '_') || 'CENTRAL';

  const jurisdictionCode = kb.policeJurisdictionFormat
    .replace('{DISTRICT}', districtName)
    .replace('{YEAR}', String(year))
    .replace('{SERIAL}', String(serial));

  return {
    manifestId: `MPM-${year}-${serial}`,
    policeJurisdictionCode: jurisdictionCode,
    locationSector: params.location || `${kb.matchedState.stateName} Primary Sector`,
    estimatedCount: params.reportedMissingCount || 1,
    timestamp: new Date().toISOString(),
    fieldSearchDirectives: [
      `Register official GD entry under jurisdictional police authority: ${jurisdictionCode}`,
      `Coordinate physical canine and acoustic search passes along designated sector: ${params.location}`,
      `Cross-check registered evacuees at designated shelter: ${kb.shelters[0]?.name || 'District Shelter'}`,
      `Notify District Emergency Operation Centre (DEOC ${kb.districtCentres[0]?.deocNumber || '1077'}) within 60 minutes`,
    ],
  };
}

/**
 * Synthesizes an urgent, actionable public alert strictly constrained to 30 characters or fewer.
 * Fallback to deterministic template if offline or error occurs.
 */
export async function generate30CharMicroAlert(params: {
  hazard: string;
  location: string;
  severity?: string;
}): Promise<string> {
  const defaultAlerts: Record<string, string> = {
    flood: 'FLOOD: MOVE TO HIGH GROUND NOW',
    cyclone: 'CYCLONE: EVACUATE TO SHELTER',
    landslide: 'LANDSLIDE: LEAVE VALLEY NOW',
    fire: 'FIRE: EVACUATE UPWIND NOW',
    default: 'EVACUATE NOW: DIAL 112',
  };

  const h = params.hazard.toLowerCase();
  let fallback = defaultAlerts.default;
  if (h.includes('flood') || h.includes('inundation') || h.includes('water')) {
    fallback = defaultAlerts.flood;
  } else if (h.includes('cyclone') || h.includes('storm') || h.includes('wind')) {
    fallback = defaultAlerts.cyclone;
  } else if (h.includes('landslide') || h.includes('seismic') || h.includes('debris')) {
    fallback = defaultAlerts.landslide;
  } else if (h.includes('fire')) {
    fallback = defaultAlerts.fire;
  }

  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey.includes('your_') || apiKey.length < 10) {
    return fallback.slice(0, 30);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    let attempts = 0;
    while (attempts < 3) {
      try {
        attempts++;
        const res = await model.generateContent(
          `Synthesize an emergency disaster micro-alert for "${params.hazard}" at "${params.location}".
CRITICAL CONSTRAINT: You must return ONLY uppercase text that is STRICTLY 30 CHARACTERS OR FEWER. No punctuation other than colon. No emojis. Example: "FLOOD: SEEK HIGH GROUND NOW".`
        );
        const text = res.response.text().trim().replace(/[\r\n"']/g, '').toUpperCase();
        if (text && text.length <= 30) {
          return text;
        }
        if (text && text.length > 30) {
          return text.slice(0, 30);
        }
      } catch (err: any) {
        if ((err?.message?.includes('503') || err?.message?.includes('429')) && attempts < 3) {
          await new Promise((r) => setTimeout(r, 2000));
        } else {
          break;
        }
      }
    }
  } catch {
    // return fallback
  }

  return fallback.slice(0, 30);
}
