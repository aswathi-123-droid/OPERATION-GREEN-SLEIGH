import { Mission } from './types';

export const INITIAL_MISSIONS: Mission[] = [
  {
    _id: '1',
    sector: 'Sector 7 (New York)',
    pollutionLevel: 'High',
    wasteType: 'Plastic Wrappers & Coffee Cups',
    elfAssigned: 'Waiting for Santa...',
    status: 'Pending',
    isSafeForReindeer: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    sector: 'Sector 4 (London)',
    pollutionLevel: 'Medium',
    wasteType: 'Discarded Electronics',
    elfAssigned: 'Agent Peppermint',
    status: 'Dispatching',
    isSafeForReindeer: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '3',
    sector: 'Sector 12 (Tokyo)',
    pollutionLevel: 'Low',
    wasteType: 'Synthetic Ribbons',
    elfAssigned: 'Agent Snowball',
    status: 'Cleaned',
    isSafeForReindeer: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '4',
    sector: 'Sector 9 (Sydney)',
    pollutionLevel: 'High',
    wasteType: 'Beach Microplastics',
    elfAssigned: 'Waiting for Santa...',
    status: 'Pending',
    isSafeForReindeer: false,
    createdAt: new Date().toISOString(),
  }
];

export const ELVES = [
  "Agent Peppermint",
  "Agent Snowball",
  "Commander Tinsel",
  "Ranger Evergreen",
  "SpecOps Gingerbread",
  "Scout Frost",
  "Tech-Elf Sparky"
];

// Approximate coordinates for known sectors
export const SECTOR_COORDINATES: Record<string, { lat: number, lon: number }> = {
  "Sector 7 (New York)": { lat: 40.7128, lon: -74.0060 },
  "Sector 4 (London)": { lat: 51.5074, lon: -0.1278 },
  "Sector 12 (Tokyo)": { lat: 35.6762, lon: 139.6917 },
  "Sector 9 (Sydney)": { lat: -33.8688, lon: 151.2093 },
  // Defaults for potential user inputs if they match cities, otherwise we randomize in component
  "Paris": { lat: 48.8566, lon: 2.3522 },
  "Berlin": { lat: 52.5200, lon: 13.4050 },
  "Moscow": { lat: 55.7558, lon: 37.6173 },
  "Beijing": { lat: 39.9042, lon: 116.4074 },
  "Rio de Janeiro": { lat: -22.9068, lon: -43.1729 },
  "Cairo": { lat: 30.0444, lon: 31.2357 },
};