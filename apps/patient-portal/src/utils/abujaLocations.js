/**
 * abujaLocations.js
 * ──────────────────────────────────────────────────────────────
 * Centralized Abuja location data for proximity-based search.
 *
 * Each area has:
 *   • name       — display name
 *   • latitude   — center-point latitude
 *   • longitude  — center-point longitude
 *   • aliases    — alternative names / sub-areas that should
 *                  resolve to this location
 *
 * These are real Abuja coordinates sourced from the clinic data
 * in supabase_maps_migration.sql and public geographic data.
 *
 * The structure is designed so it can later be replaced with a
 * geocoding API (e.g. Google Maps Geocoding) without rewriting
 * the search system — just swap the resolve function.
 * ──────────────────────────────────────────────────────────────
 */

export const ABUJA_AREAS = [
  {
    name: 'Wuse',
    latitude: 9.0624,
    longitude: 7.4876,
    aliases: [
      'wuse', 'wuse 1', 'wuse 2', 'wuse i', 'wuse ii',
      'wuse zone 1', 'wuse zone 2', 'wuse zone 3',
      'wuse zone 4', 'wuse zone 5', 'wuse zone 6',
      'wuse district', 'wuse area',
    ],
  },
  {
    name: 'Maitama',
    latitude: 9.0820,
    longitude: 7.4920,
    aliases: [
      'maitama', 'maitama district', 'maitama area',
    ],
  },
  {
    name: 'Garki',
    latitude: 9.0400,
    longitude: 7.4870,
    aliases: [
      'garki', 'garki 1', 'garki 2', 'garki i', 'garki ii',
      'garki area', 'garki district', 'area 1', 'area 2',
      'area 3', 'area 7', 'area 8', 'area 10', 'area 11',
    ],
  },
  {
    name: 'Life Camp',
    latitude: 9.0835,
    longitude: 7.4020,
    aliases: [
      'life camp', 'lifecamp', 'life camp junction',
      'life camp area', 'life camp abuja',
    ],
  },
  {
    name: 'Gwarinpa',
    latitude: 9.1048,
    longitude: 7.3879,
    aliases: [
      'gwarinpa', 'gwarimpa', 'gwarinpa estate',
      'gwarinpa 1', 'gwarinpa 2', 'gwarinpa district',
    ],
  },
  {
    name: 'Central Business District',
    latitude: 9.0408,
    longitude: 7.4942,
    aliases: [
      'central business district', 'cbd', 'central district',
      'central area', 'central business',
    ],
  },
  {
    name: 'Apo',
    latitude: 9.0167,
    longitude: 7.5094,
    aliases: [
      'apo', 'apo district', 'apo legislative',
      'apo legislative quarters', 'apo area',
      'apo resettlement', 'apo mechanic village',
    ],
  },
  {
    name: 'Jabi',
    latitude: 9.0660,
    longitude: 7.4300,
    aliases: [
      'jabi', 'jabi district', 'jabi area', 'jabi lake',
    ],
  },
  {
    name: 'Utako',
    latitude: 9.0730,
    longitude: 7.4470,
    aliases: [
      'utako', 'utako district', 'utako area',
    ],
  },
  {
    name: 'Asokoro',
    latitude: 9.0370,
    longitude: 7.5160,
    aliases: [
      'asokoro', 'asokoro district', 'asokoro area',
      'asokoro extension',
    ],
  },
  {
    name: 'Kubwa',
    latitude: 9.1537,
    longitude: 7.3291,
    aliases: [
      'kubwa', 'kubwa area', 'kubwa district',
    ],
  },
  {
    name: 'Lugbe',
    latitude: 8.9878,
    longitude: 7.4725,
    aliases: [
      'lugbe', 'lugbe area', 'lugbe district',
    ],
  },
  {
    name: 'Karu',
    latitude: 9.0153,
    longitude: 7.5764,
    aliases: [
      'karu', 'karu area', 'karu site', 'new karu',
    ],
  },
  {
    name: 'Nyanya',
    latitude: 9.0078,
    longitude: 7.5497,
    aliases: [
      'nyanya', 'nyanya area',
    ],
  },
  {
    name: 'Gwagwalada',
    latitude: 8.9431,
    longitude: 7.0784,
    aliases: [
      'gwagwalada', 'gwagwalada area',
    ],
  },
  {
    name: 'Wuye',
    latitude: 9.0720,
    longitude: 7.4650,
    aliases: [
      'wuye', 'wuye district', 'wuye area',
    ],
  },
  {
    name: 'Gudu',
    latitude: 9.0250,
    longitude: 7.4950,
    aliases: [
      'gudu', 'gudu district', 'gudu area',
    ],
  },
  {
    name: 'Durumi',
    latitude: 9.0200,
    longitude: 7.4800,
    aliases: [
      'durumi', 'durumi district', 'durumi area',
    ],
  },
  {
    name: 'Katampe',
    latitude: 9.0900,
    longitude: 7.4600,
    aliases: [
      'katampe', 'katampe extension', 'katampe area',
    ],
  },
  {
    name: 'Lokogoma',
    latitude: 9.0050,
    longitude: 7.4600,
    aliases: [
      'lokogoma', 'lokogoma district', 'lokogoma area',
    ],
  },
  {
    name: 'Mpape',
    latitude: 9.1100,
    longitude: 7.4900,
    aliases: [
      'mpape', 'mpape area',
    ],
  },
];

// ── Pre-built alias → area lookup ───────────────────────────
const _areaAliasMap = new Map();
ABUJA_AREAS.forEach((area) => {
  // Map each alias to its area
  area.aliases.forEach((alias) => {
    _areaAliasMap.set(alias.toLowerCase(), area);
  });
  // Also map the display name
  _areaAliasMap.set(area.name.toLowerCase(), area);
});

/**
 * Resolve a location query string to an Abuja area with coordinates.
 * Tries exact alias match first, then substring matching.
 *
 * @param {string} locationQuery
 * @returns {{ name: string, latitude: number, longitude: number } | null}
 */
export function resolveAbujaLocation(locationQuery) {
  if (!locationQuery) return null;

  const q = locationQuery.toLowerCase().trim();

  // 1. Exact alias match
  const exact = _areaAliasMap.get(q);
  if (exact) return exact;

  // 2. Check if query is contained within an alias or vice versa
  for (const area of ABUJA_AREAS) {
    for (const alias of area.aliases) {
      if (alias.includes(q) || q.includes(alias)) {
        return area;
      }
    }
    // Also check against display name
    if (area.name.toLowerCase().includes(q) || q.includes(area.name.toLowerCase())) {
      return area;
    }
  }

  return null;
}

/**
 * Check whether a clinic's address text matches a given location query.
 * More forgiving than strict equality — handles partial matches.
 *
 * @param {string} address - the clinic's full address string
 * @param {string} locationQuery - the user's location search
 * @returns {boolean}
 */
export function addressMatchesLocation(address, locationQuery) {
  if (!address || !locationQuery) return false;
  const addr = address.toLowerCase();
  const q = locationQuery.toLowerCase().trim();

  // Direct substring match
  if (addr.includes(q)) return true;

  // Resolve the query to an area name and check that
  const area = resolveAbujaLocation(q);
  if (area) {
    const areaName = area.name.toLowerCase();
    if (addr.includes(areaName)) return true;

    // Also check aliases against the address
    for (const alias of area.aliases) {
      if (addr.includes(alias)) return true;
    }
  }

  return false;
}
