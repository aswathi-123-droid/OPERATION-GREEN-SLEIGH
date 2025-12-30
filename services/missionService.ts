import { Mission, MissionStatus } from '../types';
import { INITIAL_MISSIONS } from '../constants';

// This service mocks a MERN backend by using LocalStorage as the database.
const STORAGE_KEY = 'green_sleigh_missions_v1';

const getStoredMissions = (): Mission[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MISSIONS));
    return INITIAL_MISSIONS;
  }
  return JSON.parse(stored);
};

const saveMissions = (missions: Mission[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(missions));
};

export const fetchMissions = async (): Promise<Mission[]> => {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getStoredMissions());
    }, 500);
  });
};

export const createMission = async (mission: Omit<Mission, '_id' | 'createdAt'>): Promise<Mission> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const missions = getStoredMissions();
      const newMission: Mission = {
        ...mission,
        _id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      missions.push(newMission);
      saveMissions(missions);
      resolve(newMission);
    }, 600);
  });
};

export const updateMissionStatus = async (id: string, status: MissionStatus, elfAssigned?: string): Promise<Mission> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const missions = getStoredMissions();
      const index = missions.findIndex(m => m._id === id);
      if (index === -1) {
        reject(new Error("Mission not found"));
        return;
      }
      
      const updatedMission = { ...missions[index], status };
      if (elfAssigned) {
        updatedMission.elfAssigned = elfAssigned;
      }
      // Logic: If cleaned, it becomes safe for reindeer
      if (status === 'Cleaned') {
        updatedMission.isSafeForReindeer = true;
      }

      missions[index] = updatedMission;
      saveMissions(missions);
      resolve(updatedMission);
    }, 400);
  });
};

export const deleteMission = async (id: string): Promise<void> => {
   return new Promise((resolve) => {
    setTimeout(() => {
      const missions = getStoredMissions();
      const filtered = missions.filter(m => m._id !== id);
      saveMissions(filtered);
      resolve();
    }, 400);
   });
}