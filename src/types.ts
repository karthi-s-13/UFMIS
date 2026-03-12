export interface Ward {
  id: number;
  name: string;
  center: [number, number];
  baseRisk: number;
  probability?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
  readinessScore?: number;
  boundary?: any; // GeoJSON Polygon
}

export interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  intensity: number;
  name: string;
}

export interface Street {
  id: string;
  name: string;
  type: 'major' | 'small';
  coords: [number, number][];
  elevation: number;
  drainage_condition: number;
  traffic_density: number;
  probability?: number;
  riskLevel?: 'Low' | 'Medium' | 'High';
}

export interface DrainageLine {
  id: string;
  name: string;
  coords: [number, number][];
  capacity: number;
  type: 'river' | 'canal' | 'drain';
}

export interface Infrastructure {
  id: string;
  name: string;
  type: 'pump' | 'sensor' | 'relief';
  lat: number;
  lng: number;
  status: 'active' | 'standby' | 'inactive' | 'open' | 'closed';
  capacity?: number;
  health?: number;
  reading?: number;
  unit?: string;
  occupancy?: number;
}

export interface Resource {
  id: string;
  name: string;
  type: 'rescue' | 'equipment';
  location: [number, number];
  status: 'available' | 'deployed' | 'active';
  personnel?: number;
  capacity?: number;
}

export interface HydrologyData {
  totalWater: number;
  drainageEfficiency: number;
  netAccumulation: number;
  floodDepthEstimate: number;
  status: string;
}

export interface PredictionResponse {
  wards: Ward[];
  streets: Street[];
  drainage: DrainageLine[];
  hydrology: HydrologyData;
  timestamp: string;
}

export interface PredictionRequest {
  rainfall_24h: number;
  rainfall_7d: number;
}
