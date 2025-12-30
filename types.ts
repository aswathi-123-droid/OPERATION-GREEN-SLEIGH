export type PollutionLevel = 'High' | 'Medium' | 'Low';
export type MissionStatus = 'Pending' | 'Dispatching' | 'Cleaned';

export interface Mission {
  _id: string; // Simulating MongoDB ObjectId
  sector: string;
  pollutionLevel: PollutionLevel;
  wasteType: string;
  elfAssigned: string;
  status: MissionStatus;
  isSafeForReindeer: boolean;
  createdAt: string;
  coordinates?: { lat: number; lon: number };
}

export interface Stats {
  totalMissions: number;
  activePollution: number;
  elvesDeployed: number;
  sectorsCleaned: number;
}