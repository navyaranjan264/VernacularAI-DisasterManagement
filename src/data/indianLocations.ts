/**
 * Comprehensive Indian Geographical Database
 * Contains major metropolitan landmarks, sub-localities, high-risk disaster districts,
 * and civil defense zones across Indian States and Union Territories.
 */

export interface IndianLocationItem {
  id: string;
  name: string;
  city: string;
  state: string;
  district?: string;
  pincode?: string;
  disasterProneTo?: string[];
}

export const INDIAN_LOCATIONS: IndianLocationItem[] = [
  // Bihar (including Kankarbagh)
  { id: 'in-pat-1', name: 'Kankarbagh', city: 'Patna', state: 'Bihar', district: 'Patna', disasterProneTo: ['Urban Inundation', 'Flood'] },
  { id: 'in-pat-2', name: 'Boring Road', city: 'Patna', state: 'Bihar', district: 'Patna', disasterProneTo: ['Waterlogging'] },
  { id: 'in-pat-3', name: 'Bailey Road', city: 'Patna', state: 'Bihar', district: 'Patna', disasterProneTo: ['Inundation'] },
  { id: 'in-pat-4', name: 'Rajendra Nagar', city: 'Patna', state: 'Bihar', district: 'Patna', disasterProneTo: ['Severe Waterlogging'] },
  { id: 'in-pat-5', name: 'Danapur Cantonment', city: 'Patna', state: 'Bihar', district: 'Patna', disasterProneTo: ['Ganga River Flood'] },
  { id: 'in-pat-6', name: 'Patliputra Colony', city: 'Patna', state: 'Bihar', district: 'Patna', disasterProneTo: ['Waterlogging'] },
  { id: 'in-pat-7', name: 'Gandhi Maidan & Riverfront', city: 'Patna', state: 'Bihar', district: 'Patna', disasterProneTo: ['Riverine Flood'] },
  { id: 'in-bih-1', name: 'Muzaffarpur Sadar', city: 'Muzaffarpur', state: 'Bihar', district: 'Muzaffarpur', disasterProneTo: ['Burhi Gandak Flood'] },
  { id: 'in-bih-2', name: 'Darbhanga Lowlands', city: 'Darbhanga', state: 'Bihar', district: 'Darbhanga', disasterProneTo: ['Bagmati Flood'] },
  { id: 'in-bih-3', name: 'Bhagalpur Ganga Ghats', city: 'Bhagalpur', state: 'Bihar', district: 'Bhagalpur', disasterProneTo: ['River Erosion', 'Flood'] },
  { id: 'in-bih-4', name: 'Gaya Town & Falgu Basin', city: 'Gaya', state: 'Bihar', district: 'Gaya', disasterProneTo: ['Flash Inundation'] },
  { id: 'in-bih-5', name: 'Saharsa Kosi Embankment', city: 'Saharsa', state: 'Bihar', district: 'Saharsa', disasterProneTo: ['Kosi River Flood'] },
  { id: 'in-bih-6', name: 'Purnia East', city: 'Purnia', state: 'Bihar', district: 'Purnia', disasterProneTo: ['Flood', 'Waterlogging'] },

  // Delhi NCR
  { id: 'in-del-1', name: 'Connaught Place & Central Ridge', city: 'New Delhi', state: 'Delhi', district: 'New Delhi', disasterProneTo: ['Urban Flood'] },
  { id: 'in-del-2', name: 'Rohini Sector 1-25', city: 'Delhi', state: 'Delhi', district: 'North West Delhi', disasterProneTo: ['Waterlogging'] },
  { id: 'in-del-3', name: 'Karol Bagh & Pusa', city: 'Delhi', state: 'Delhi', district: 'Central Delhi', disasterProneTo: ['Urban Flood'] },
  { id: 'in-del-4', name: 'Lajpat Nagar & Defence Colony', city: 'New Delhi', state: 'Delhi', district: 'South Delhi', disasterProneTo: ['Drainage Choke'] },
  { id: 'in-del-5', name: 'Chandni Chowk & Old Delhi', city: 'Delhi', state: 'Delhi', district: 'North Delhi', disasterProneTo: ['Building Collapse', 'Fire'] },
  { id: 'in-del-6', name: 'Dwarka Sector 1-22', city: 'New Delhi', state: 'Delhi', district: 'South West Delhi', disasterProneTo: ['Waterlogging'] },
  { id: 'in-del-7', name: 'Yamuna Floodplain (ITO / Kashmere Gate)', city: 'Delhi', state: 'Delhi', district: 'East Delhi', disasterProneTo: ['Yamuna Riverine Flood'] },
  { id: 'in-ncr-1', name: 'Noida Sector 62 & 18', city: 'Noida', state: 'Uttar Pradesh', district: 'Gautam Buddha Nagar', disasterProneTo: ['Waterlogging'] },
  { id: 'in-ncr-2', name: 'Cyber City & DLF Phase 1-5', city: 'Gurugram', state: 'Haryana', district: 'Gurugram', disasterProneTo: ['Flash Waterlogging'] },

  // Maharashtra
  { id: 'in-mum-1', name: 'Andheri East & West (S.V. Road)', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', disasterProneTo: ['Mithi River Flood', 'Waterlogging'] },
  { id: 'in-mum-2', name: 'Bandra Kurla Complex (BKC)', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', disasterProneTo: ['Tidal Surge', 'Inundation'] },
  { id: 'in-mum-3', name: 'Dadar TT Circle & Hindmata', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai City', disasterProneTo: ['Chronic Waterlogging'] },
  { id: 'in-mum-4', name: 'Borivali & Sanjay Gandhi Park Periphery', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', disasterProneTo: ['Landslide', 'Flash Flood'] },
  { id: 'in-mum-5', name: 'Kurla West (LBS Marg)', city: 'Mumbai', state: 'Maharashtra', district: 'Mumbai Suburban', disasterProneTo: ['Severe Flood'] },
  { id: 'in-mum-6', name: 'Thane Ghodbunder Road', city: 'Thane', state: 'Maharashtra', district: 'Thane', disasterProneTo: ['Landslide', 'Inundation'] },
  { id: 'in-pun-1', name: 'Kothrud & Karve Road', city: 'Pune', state: 'Maharashtra', district: 'Pune', disasterProneTo: ['Mutha River Surge'] },
  { id: 'in-pun-2', name: 'Hinjewadi IT Park Phase 1-3', city: 'Pune', state: 'Maharashtra', district: 'Pune', disasterProneTo: ['Waterlogging'] },
  { id: 'in-pun-3', name: 'Shivajinagar & Sangamwadi', city: 'Pune', state: 'Maharashtra', district: 'Pune', disasterProneTo: ['Flash Flood'] },
  { id: 'in-mah-1', name: 'Nagpur Sitabuldi & Ambazari', city: 'Nagpur', state: 'Maharashtra', district: 'Nagpur', disasterProneTo: ['Nag River Inundation'] },
  { id: 'in-mah-2', name: 'Kolhapur Panchganga Basin', city: 'Kolhapur', state: 'Maharashtra', district: 'Kolhapur', disasterProneTo: ['Severe Riverine Flood'] },
  { id: 'in-mah-3', name: 'Raigad Mahad Sector', city: 'Raigad', state: 'Maharashtra', district: 'Raigad', disasterProneTo: ['Landslide', 'Flood'] },

  // West Bengal
  { id: 'in-kol-1', name: 'Salt Lake (Bidhannagar) Sector 1-5', city: 'Kolkata', state: 'West Bengal', district: 'North 24 Parganas', disasterProneTo: ['Waterlogging'] },
  { id: 'in-kol-2', name: 'Howrah Station & Foreshore Road', city: 'Howrah', state: 'West Bengal', district: 'Howrah', disasterProneTo: ['Hooghly Tidal Surge'] },
  { id: 'in-kol-3', name: 'New Town Action Area 1-3', city: 'Kolkata', state: 'West Bengal', district: 'North 24 Parganas', disasterProneTo: ['Drainage Choke'] },
  { id: 'in-kol-4', name: 'Park Street & Central Avenue', city: 'Kolkata', state: 'West Bengal', district: 'Kolkata', disasterProneTo: ['Urban Flood'] },
  { id: 'in-wb-1', name: 'Sundarbans Gosaba Island', city: 'Canning', state: 'West Bengal', district: 'South 24 Parganas', disasterProneTo: ['Cyclone Landfall', 'Storm Surge'] },
  { id: 'in-wb-2', name: 'Digha Coastal Esplanade', city: 'Digha', state: 'West Bengal', district: 'Purba Medinipur', disasterProneTo: ['Cyclone', 'Coastal Inundation'] },
  { id: 'in-wb-3', name: 'Siliguri Mahananda Basin', city: 'Siliguri', state: 'West Bengal', district: 'Darjeeling', disasterProneTo: ['Flash Flood', 'Debris Flow'] },
  { id: 'in-wb-4', name: 'Darjeeling Mall & Hill Slopes', city: 'Darjeeling', state: 'West Bengal', district: 'Darjeeling', disasterProneTo: ['Severe Landslide'] },

  // Karnataka
  { id: 'in-blr-1', name: 'Koramangala 4th & 6th Block', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', disasterProneTo: ['Severe Waterlogging'] },
  { id: 'in-blr-2', name: 'Whitefield & ITPL Main Road', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', disasterProneTo: ['Urban Flood'] },
  { id: 'in-blr-3', name: 'Indiranagar & 100ft Road', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', disasterProneTo: ['Drainage Overflow'] },
  { id: 'in-blr-4', name: 'Electronic City Phase 1 & 2', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', disasterProneTo: ['Inundation'] },
  { id: 'in-blr-5', name: 'Bellandur & Eco-Space Lake Basin', city: 'Bengaluru', state: 'Karnataka', district: 'Bengaluru Urban', disasterProneTo: ['Toxic Foam', 'Flood'] },
  { id: 'in-kar-1', name: 'Mangaluru Panambur Coastal Belt', city: 'Mangaluru', state: 'Karnataka', district: 'Dakshina Kannada', disasterProneTo: ['Coastal Surge', 'Landslide'] },
  { id: 'in-kar-2', name: 'Kodagu (Coorg) Madikeri Hills', city: 'Madikeri', state: 'Karnataka', district: 'Kodagu', disasterProneTo: ['Catastrophic Landslide'] },

  // Tamil Nadu
  { id: 'in-chn-1', name: 'Kattankulathur & SRM Campus Sector', city: 'Chennai / Chengalpattu', state: 'Tamil Nadu', district: 'Chengalpattu', disasterProneTo: ['GST Lowland Flood', 'Cyclone'] },
  { id: 'in-chn-2', name: 'T. Nagar (Usman Road & Panagal Park)', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', disasterProneTo: ['Urban Flood'] },
  { id: 'in-chn-3', name: 'Velachery & Madipakkam Lowlands', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', disasterProneTo: ['Pallikaranai Overflow', 'Severe Flood'] },
  { id: 'in-chn-4', name: 'Adyar & Kotturpuram River Basin', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', disasterProneTo: ['Adyar River Surge'] },
  { id: 'in-chn-5', name: 'Anna Nagar & Thirumangalam', city: 'Chennai', state: 'Tamil Nadu', district: 'Chennai', disasterProneTo: ['Drainage Choke'] },
  { id: 'in-tn-1', name: 'Cuddalore Coastal Old Town', city: 'Cuddalore', state: 'Tamil Nadu', district: 'Cuddalore', disasterProneTo: ['Severe Cyclone Landfall', 'Tsunami'] },
  { id: 'in-tn-2', name: 'Nagapattinam Port & Velankanni', city: 'Nagapattinam', state: 'Tamil Nadu', district: 'Nagapattinam', disasterProneTo: ['Storm Surge', 'Tsunami'] },
  { id: 'in-tn-3', name: 'Nilgiris (Ooty / Coonoor Ghats)', city: 'Ooty', state: 'Tamil Nadu', district: 'Nilgiris', disasterProneTo: ['Severe Landslide'] },

  // Kerala
  { id: 'in-koc-1', name: 'Aluva Periyar Riverfront', city: 'Kochi', state: 'Kerala', district: 'Ernakulam', disasterProneTo: ['Periyar Dam Spillway Flood'] },
  { id: 'in-koc-2', name: 'Kakkanad Infopark Zone', city: 'Kochi', state: 'Kerala', district: 'Ernakulam', disasterProneTo: ['Flash Inundation'] },
  { id: 'in-koc-3', name: 'Fort Kochi Coastal Pier', city: 'Kochi', state: 'Kerala', district: 'Ernakulam', disasterProneTo: ['High Tide Surge'] },
  { id: 'in-ker-1', name: 'Wayanad (Meppadi / Chooralmala / Mundakkai)', city: 'Kalpetta', state: 'Kerala', district: 'Wayanad', disasterProneTo: ['Massive Debris Flow Landslide'] },
  { id: 'in-ker-2', name: 'Idukki Dam Catchment & Munnar', city: 'Munnar', state: 'Kerala', district: 'Idukki', disasterProneTo: ['Flash Mountain Flood', 'Landslide'] },
  { id: 'in-ker-3', name: 'Kuttanad & Alappuzha Backwaters', city: 'Alappuzha', state: 'Kerala', district: 'Alappuzha', disasterProneTo: ['Sub-Sea Level Inundation'] },
  { id: 'in-ker-4', name: 'Kozhikode Beach & Beypore', city: 'Kozhikode', state: 'Kerala', district: 'Kozhikode', disasterProneTo: ['Sea Erosion', 'Heavy Deluge'] },

  // Assam & Northeast
  { id: 'in-asm-1', name: 'Dispur Capital Complex', city: 'Guwahati', state: 'Assam', district: 'Kamrup Metropolitan', disasterProneTo: ['Artificial Flood'] },
  { id: 'in-asm-2', name: 'Jalukbari & Guwahati University', city: 'Guwahati', state: 'Assam', district: 'Kamrup Metropolitan', disasterProneTo: ['Brahmaputra Flood'] },
  { id: 'in-asm-3', name: 'Paltan Bazaar & Panbazar', city: 'Guwahati', state: 'Assam', district: 'Kamrup Metropolitan', disasterProneTo: ['Flash Waterlogging'] },
  { id: 'in-asm-4', name: 'Kaziranga Kohora Range', city: 'Bokakhat', state: 'Assam', district: 'Golaghat', disasterProneTo: ['Catastrophic Brahmaputra Deluge'] },
  { id: 'in-asm-5', name: 'Silchar Barak Valley Basin', city: 'Silchar', state: 'Assam', district: 'Cachar', disasterProneTo: ['Barak River Flood'] },
  { id: 'in-asm-6', name: 'Majuli River Island', city: 'Majuli', state: 'Assam', district: 'Majuli', disasterProneTo: ['Island Inundation', 'Erosion'] },

  // Telangana & Andhra Pradesh
  { id: 'in-hyd-1', name: 'Banjara Hills & Jubilee Hills', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', disasterProneTo: ['Flash Downpour Flood'] },
  { id: 'in-hyd-2', name: 'Gachibowli & Hitech City (Madhapur)', city: 'Hyderabad', state: 'Telangana', district: 'Rangareddy', disasterProneTo: ['Urban Inundation'] },
  { id: 'in-hyd-3', name: 'Secunderabad & Begumpet (Nala Basin)', city: 'Hyderabad', state: 'Telangana', district: 'Hyderabad', disasterProneTo: ['Severe Inundation'] },
  { id: 'in-ap-1', name: 'Visakhapatnam RK Beach Coastal Belt', city: 'Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', disasterProneTo: ['Severe Cyclone (Hudhud)'] },
  { id: 'in-ap-2', name: 'Vijayawada Krishna River Basin', city: 'Vijayawada', state: 'Andhra Pradesh', district: 'NTR', disasterProneTo: ['Prakasam Barrage Spillway Flood'] },
  { id: 'in-ap-3', name: 'Machilipatnam Coastal Sector', city: 'Machilipatnam', state: 'Andhra Pradesh', district: 'Krishna', disasterProneTo: ['Storm Surge Landfall'] },

  // Gujarat
  { id: 'in-guj-1', name: 'Navrangpura & Ashram Road', city: 'Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', disasterProneTo: ['Sabarmati Basin Flood'] },
  { id: 'in-guj-2', name: 'Surat Ring Road & Tapi Floodplain', city: 'Surat', state: 'Gujarat', district: 'Surat', disasterProneTo: ['Ukai Dam Spillway Flood'] },
  { id: 'in-guj-3', name: 'Vadodara Vishwamitri River Corridor', city: 'Vadodara', state: 'Gujarat', district: 'Vadodara', disasterProneTo: ['Vishwamitri River Inundation'] },
  { id: 'in-guj-4', name: 'Kutch Gandhidham & Mandvi Coast', city: 'Kutch', state: 'Gujarat', district: 'Kutch', disasterProneTo: ['Cyclone Biparjoy', 'Earthquake Zone 5'] },

  // Uttarakhand & Himachal Pradesh
  { id: 'in-uk-1', name: 'Joshimath Subsidence Zone', city: 'Joshimath', state: 'Uttarakhand', district: 'Chamoli', disasterProneTo: ['Slope Failure', 'Land Subsidence'] },
  { id: 'in-uk-2', name: 'Kedarnath Valley & Gaurikund', city: 'Kedarnath', state: 'Uttarakhand', district: 'Rudraprayag', disasterProneTo: ['Cloudburst', 'Glacial Outburst'] },
  { id: 'in-uk-3', name: 'Rishikesh Ganga Ghats & Muni Ki Reti', city: 'Rishikesh', state: 'Uttarakhand', district: 'Dehradun', disasterProneTo: ['Ganga River Surge'] },
  { id: 'in-uk-4', name: 'Dehradun Sahastradhara Lowlands', city: 'Dehradun', state: 'Uttarakhand', district: 'Dehradun', disasterProneTo: ['Flash Inundation'] },
  { id: 'in-hp-1', name: 'Shimla Mall Road & Ridge Subsidence', city: 'Shimla', state: 'Himachal Pradesh', district: 'Shimla', disasterProneTo: ['Landslide', 'Structural Collapse'] },
  { id: 'in-hp-2', name: 'Kullu-Manali Beas Riverbank Highway', city: 'Manali', state: 'Himachal Pradesh', district: 'Kullu', disasterProneTo: ['Flash Flood Torrent', 'Landslide'] },

  // Odisha
  { id: 'in-odi-1', name: 'Puri Grand Road & Beach Sector', city: 'Puri', state: 'Odisha', district: 'Puri', disasterProneTo: ['Cyclone Fani Landfall', 'Storm Surge'] },
  { id: 'in-odi-2', name: 'Paradip Port & Industrial Belt', city: 'Paradip', state: 'Odisha', district: 'Jagatsinghpur', disasterProneTo: ['Super Cyclone', 'Chemical Hazard'] },
  { id: 'in-odi-3', name: 'Cuttack Mahanadi Embankment', city: 'Cuttack', state: 'Odisha', district: 'Cuttack', disasterProneTo: ['Mahanadi River Flood'] },
  { id: 'in-odi-4', name: 'Bhubaneswar Nayapalli Lowlands', city: 'Bhubaneswar', state: 'Odisha', district: 'Khurda', disasterProneTo: ['Urban Inundation'] },

  // Uttar Pradesh
  { id: 'in-up-1', name: 'Lucknow Gomti Riverfront & Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', disasterProneTo: ['Gomti Inundation'] },
  { id: 'in-up-2', name: 'Varanasi Dashashwamedh & Assi Ghats', city: 'Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', disasterProneTo: ['Ganga Flood'] },
  { id: 'in-up-3', name: 'Prayagraj Sangam & Civil Lines', city: 'Prayagraj', state: 'Uttar Pradesh', district: 'Prayagraj', disasterProneTo: ['Ganga-Yamuna Confluence Flood'] },
  { id: 'in-up-4', name: 'Gorakhpur Rapti Basin', city: 'Gorakhpur', state: 'Uttar Pradesh', district: 'Gorakhpur', disasterProneTo: ['Rapti River Flood'] },
];

/**
 * Fast prefix and fuzzy matcher over local Indian geographical database
 */
export function searchLocalIndianLocations(query: string, maxResults = 12): IndianLocationItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return INDIAN_LOCATIONS.slice(0, maxResults);

  return INDIAN_LOCATIONS.filter((item) => {
    const combined = `${item.name} ${item.city} ${item.state} ${item.district || ''}`.toLowerCase();
    return combined.includes(q);
  }).slice(0, maxResults);
}

/**
 * Fallback to OpenStreetMap Nominatim for any specific Indian landmark, town or village
 */
export async function searchNominatimIndia(query: string): Promise<IndianLocationItem[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=8&q=${encodeURIComponent(
        q
      )}`,
      {
        headers: {
          'Accept-Language': 'en-IN,en;q=0.9',
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any, idx: number) => {
      const parts = (item.display_name || '').split(',').map((s: string) => s.trim());
      const name = parts[0] || item.name || q;
      const state = parts.find((p: string) =>
        ['Bihar', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Assam', 'West Bengal', 'Gujarat', 'Uttar Pradesh', 'Telangana', 'Andhra Pradesh', 'Odisha', 'Uttarakhand', 'Himachal Pradesh'].some((st) => p.includes(st))
      ) || (parts.length > 2 ? parts[parts.length - 2] : 'India');
      const city = parts.length > 1 ? parts[1] : name;

      return {
        id: `osm-${idx}-${Date.now()}`,
        name,
        city,
        state,
      };
    });
  } catch {
    return [];
  }
}
