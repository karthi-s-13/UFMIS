import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Polyfill fetch if not available (Node.js < 18)
if (typeof fetch === 'undefined') {
  const nodeFetch = await import('node-fetch');
  // @ts-ignore
  global.fetch = nodeFetch.default;
  // @ts-ignore
  global.Headers = nodeFetch.Headers;
  // @ts-ignore
  global.Request = nodeFetch.Request;
  // @ts-ignore
  global.Response = nodeFetch.Response;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Global fetch availability check for Node.js
  if (typeof fetch === 'undefined') {
    console.warn('Warning: Global fetch is not available. API routes relying on external fetch may fail.');
  }

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // --- Data Loading ---
  const historicalDataPath = path.join(__dirname, "src/data/chennai_rainfall.json");
  let historicalRainfall = [];
  try {
    const data = fs.readFileSync(historicalDataPath, "utf8");
    historicalRainfall = JSON.parse(data);
  } catch (err) {
    console.error("Error loading historical data:", err);
  }

  // Calculate Seasonal Average (Oct-Dec is Monsoon in Chennai)
  const monsoonAvg = historicalRainfall.length > 0 
    ? historicalRainfall.reduce((acc, curr) => {
        return acc + (Number(curr.Oct || 0) + Number(curr.Nov || 0) + Number(curr.Dec || 0));
      }, 0) / historicalRainfall.length
    : 785; // Fallback to historical average if data loading fails

  console.log(`Monsoon Average calculated: ${monsoonAvg}`);

  // --- Mock Data & Logic ---
  
  const wards = [
    { id: 1, name: "Adyar", center: [13.0012, 80.2565], baseRisk: 0.4 },
    { id: 2, name: "Anna Nagar", center: [13.0850, 80.2101], baseRisk: 0.3 },
    { id: 3, name: "Teynampet", center: [13.0405, 80.2500], baseRisk: 0.6 },
    { id: 4, name: "Kodambakkam", center: [13.0513, 80.2206], baseRisk: 0.5 },
    { id: 5, name: "Mylapore", center: [13.0333, 80.2667], baseRisk: 0.7 },
    { id: 6, name: "Velachery", center: [12.9792, 80.2206], baseRisk: 0.9 },
    { id: 7, name: "Perambur", center: [13.1067, 80.2375], baseRisk: 0.5 },
    { id: 8, name: "Ambattur", center: [13.1144, 80.1569], baseRisk: 0.4 },
    { id: 9, name: "Royapuram", center: [13.1137, 80.2954], baseRisk: 0.6 },
    { id: 10, name: "Thiru-Vi-Ka Nagar", center: [13.1080, 80.2320], baseRisk: 0.5 },
    { id: 11, name: "Madhavaram", center: [13.1488, 80.2306], baseRisk: 0.4 },
    { id: 12, name: "Manali", center: [13.1667, 80.2667], baseRisk: 0.7 },
    { id: 13, name: "Tiruvottiyur", center: [13.1600, 80.3000], baseRisk: 0.8 },
    { id: 14, name: "Alandur", center: [12.9975, 80.2006], baseRisk: 0.5 },
    { id: 15, name: "Sholinganallur", center: [12.9010, 80.2279], baseRisk: 0.8 },
    { id: 16, name: "Perungudi", center: [12.9654, 80.2461], baseRisk: 0.7 },
    { id: 17, name: "T. Nagar", center: [13.0418, 80.2341], baseRisk: 0.75 },
    { id: 18, name: "Nungambakkam", center: [13.0587, 80.2433], baseRisk: 0.55 },
    { id: 19, name: "Saidapet", center: [13.0213, 80.2231], baseRisk: 0.85 },
    { id: 20, name: "Guindy", center: [13.0067, 80.2206], baseRisk: 0.65 },
    { id: 21, name: "Egmore", center: [13.0732, 80.2609], baseRisk: 0.5 },
    { id: 22, name: "Chetpet", center: [13.0694, 80.2456], baseRisk: 0.45 },
    { id: 23, name: "Kilpauk", center: [13.0827, 80.2431], baseRisk: 0.4 },
    { id: 24, name: "Purasaiwakkam", center: [13.0917, 80.2561], baseRisk: 0.6 },
    { id: 25, name: "Triplicane", center: [13.0587, 80.2757], baseRisk: 0.7 },
    { id: 26, name: "Besant Nagar", center: [12.9975, 80.2675], baseRisk: 0.35 },
  ];

  const majorStreets = [
    { id: "s1", type: "major", name: "Anna Salai (Mount Road)", coords: [[13.08, 80.27], [13.06, 80.25], [13.02, 80.22], [12.99, 80.18]], elevation: 6.5, drainage_condition: 0.4, traffic_density: 0.9 },
    { id: "s2", type: "major", name: "Old Mahabalipuram Road (OMR)", coords: [[12.99, 80.24], [12.95, 80.23], [12.85, 80.22]], elevation: 4.2, drainage_condition: 0.6, traffic_density: 0.7 },
    { id: "s3", type: "major", name: "East Coast Road (ECR)", coords: [[12.98, 80.26], [12.90, 80.25], [12.80, 80.24]], elevation: 5.8, drainage_condition: 0.8, traffic_density: 0.4 },
    { id: "s4", type: "major", name: "Poonamallee High Road", coords: [[13.08, 80.27], [13.07, 80.20], [13.05, 80.10]], elevation: 7.2, drainage_condition: 0.3, traffic_density: 0.8 },
    { id: "s5", type: "major", name: "Inner Ring Road", coords: [[13.15, 80.20], [13.05, 80.20], [12.98, 80.20]], elevation: 5.1, drainage_condition: 0.5, traffic_density: 0.6 }
  ];

  const smallStreets = [
    { id: "n1", type: "small", name: "G.N. Chetty Road (T. Nagar)", coords: [[13.045, 80.240], [13.040, 80.245]], elevation: 3.8, drainage_condition: 0.2, traffic_density: 0.85 },
    { id: "n2", type: "small", name: "Venkatanarayana Road", coords: [[13.040, 80.235], [13.035, 80.240]], elevation: 4.1, drainage_condition: 0.3, traffic_density: 0.7 },
    { id: "n3", type: "small", name: "Lake Area 4th Cross St", coords: [[13.055, 80.235], [13.058, 80.238]], elevation: 2.9, drainage_condition: 0.15, traffic_density: 0.4 },
    { id: "n4", type: "small", name: "Bazullah Road", coords: [[13.048, 80.232], [13.045, 80.238]], elevation: 3.5, drainage_condition: 0.25, traffic_density: 0.6 },
    { id: "n5", type: "small", name: "Burkit Road", coords: [[13.038, 80.230], [13.042, 80.235]], elevation: 3.2, drainage_condition: 0.2, traffic_density: 0.5 },
    { id: "n6", type: "small", name: "Velachery Main Road (Interior)", coords: [[12.975, 80.215], [12.980, 80.225]], elevation: 2.5, drainage_condition: 0.1, traffic_density: 0.65 },
    { id: "n7", type: "small", name: "100 Feet Road (Taramani)", coords: [[12.985, 80.235], [12.995, 80.245]], elevation: 3.0, drainage_condition: 0.3, traffic_density: 0.75 },
    { id: "n8", type: "small", name: "Mylapore Bazaar Road", coords: [[13.032, 80.265], [13.035, 80.272]], elevation: 4.5, drainage_condition: 0.4, traffic_density: 0.9 },
    { id: "n9", type: "small", name: "Kutchery Road", coords: [[13.035, 80.268], [13.038, 80.275]], elevation: 4.8, drainage_condition: 0.5, traffic_density: 0.8 },
    { id: "n10", type: "small", name: "Adyar Bridge Road (Service)", coords: [[13.005, 80.252], [13.008, 80.258]], elevation: 5.2, drainage_condition: 0.6, traffic_density: 0.4 },
    { id: "n11", type: "small", name: "Sardar Patel Road (Service)", coords: [[13.002, 80.245], [13.005, 80.250]], elevation: 4.8, drainage_condition: 0.5, traffic_density: 0.3 },
    { id: "n12", type: "small", name: "Dr. Radhakrishnan Salai (Interior)", coords: [[13.042, 80.260], [13.045, 80.265]], elevation: 4.2, drainage_condition: 0.4, traffic_density: 0.5 },
    { id: "n13", type: "small", name: "Cathedral Road (Service)", coords: [[13.045, 80.250], [13.048, 80.255]], elevation: 4.0, drainage_condition: 0.3, traffic_density: 0.4 },
    { id: "n14", type: "small", name: "Peters Road", coords: [[13.052, 80.258], [13.055, 80.262]], elevation: 3.8, drainage_condition: 0.2, traffic_density: 0.6 },
    { id: "n15", type: "small", name: "Whites Road", coords: [[13.058, 80.255], [13.062, 80.260]], elevation: 3.5, drainage_condition: 0.2, traffic_density: 0.7 },
    { id: "n16", type: "small", name: "Greams Road", coords: [[13.065, 80.250], [13.068, 80.255]], elevation: 3.2, drainage_condition: 0.15, traffic_density: 0.8 },
    { id: "n17", type: "small", name: "College Road", coords: [[13.068, 80.240], [13.072, 80.245]], elevation: 3.4, drainage_condition: 0.2, traffic_density: 0.5 },
    { id: "n18", type: "small", name: "Haddows Road", coords: [[13.062, 80.242], [13.065, 80.248]], elevation: 3.6, drainage_condition: 0.3, traffic_density: 0.4 },
    { id: "n19", type: "small", name: "Nungambakkam High Road (Service)", coords: [[13.058, 80.235], [13.062, 80.240]], elevation: 3.9, drainage_condition: 0.4, traffic_density: 0.6 },
    { id: "n20", type: "small", name: "Sterling Road", coords: [[13.065, 80.230], [13.068, 80.235]], elevation: 3.7, drainage_condition: 0.3, traffic_density: 0.5 },
    { id: "n21", type: "small", name: "Valluvar Kottam High Road (Service)", coords: [[13.055, 80.225], [13.058, 80.230]], elevation: 3.5, drainage_condition: 0.2, traffic_density: 0.7 },
    { id: "n22", type: "small", name: "Arcot Road (Interior)", coords: [[13.048, 80.215], [13.052, 80.220]], elevation: 3.2, drainage_condition: 0.1, traffic_density: 0.8 },
    { id: "n23", type: "small", name: "Kodambakkam High Road (Service)", coords: [[13.052, 80.225], [13.055, 80.230]], elevation: 3.4, drainage_condition: 0.2, traffic_density: 0.6 },
    { id: "n24", type: "small", name: "Nelson Manickam Road (Service)", coords: [[13.068, 80.220], [13.072, 80.225]], elevation: 3.1, drainage_condition: 0.15, traffic_density: 0.7 }
  ];

  const allStreets = [...majorStreets, ...smallStreets];

  const drainageLines = [
    { id: "d1", name: "Buckingham Canal", coords: [[13.15, 80.29], [13.10, 80.28], [13.05, 80.27], [13.00, 80.26], [12.90, 80.25]], capacity: 0.8, type: "canal" },
    { id: "d2", name: "Adyar River", coords: [[13.01, 80.15], [13.00, 80.20], [13.01, 80.25], [13.01, 80.27]], capacity: 0.9, type: "river" },
    { id: "d3", name: "Cooum River", coords: [[13.07, 80.15], [13.07, 80.20], [13.08, 80.25], [13.08, 80.29]], capacity: 0.7, type: "river" },
    { id: "d4", name: "Otteri Nullah", coords: [[13.10, 80.20], [13.09, 80.25], [13.10, 80.27]], capacity: 0.5, type: "canal" },
    { id: "d5", name: "Mambalam Canal", coords: [[13.05, 80.22], [13.04, 80.23], [13.03, 80.24]], capacity: 0.4, type: "drain" }
  ];

  const infrastructure = [
    { id: "p1", name: "Velachery Pump Station", type: "pump", lat: 12.9792, lng: 80.2206, status: "active", capacity: 5000, health: 0.92 },
    { id: "p2", name: "T. Nagar Smart Pump", type: "pump", lat: 13.0418, lng: 80.2341, status: "active", capacity: 3500, health: 0.85 },
    { id: "p3", name: "Saidapet River Pump", type: "pump", lat: 13.0213, lng: 80.2231, status: "standby", capacity: 4500, health: 0.78 },
    { id: "s1", name: "Adyar Level Sensor", type: "sensor", lat: 13.0100, lng: 80.2500, status: "active", reading: 2.4, unit: "m" },
    { id: "s2", name: "Cooum Level Sensor", type: "sensor", lat: 13.0800, lng: 80.2500, status: "active", reading: 1.8, unit: "m" },
    { id: "r1", name: "Anna Nagar Relief Center", type: "relief", lat: 13.0850, lng: 80.2101, status: "open", occupancy: 0.15 }
  ];

  const resources = [
    { id: "team1", name: "NDRF Team Alpha", type: "rescue", location: [13.0827, 80.2707], status: "available", personnel: 12 },
    { id: "team2", name: "State Fire Service B", type: "rescue", location: [13.0405, 80.2500], status: "deployed", personnel: 8 },
    { id: "pump1", name: "Mobile Pump Unit 01", type: "equipment", location: [12.9792, 80.2206], status: "active", capacity: 1200 },
    { id: "pump2", name: "Mobile Pump Unit 02", type: "equipment", location: [13.0513, 80.2206], status: "available", capacity: 1200 }
  ];

  // --- Hydrology Engine ---
  // Simulates water accumulation and flow dynamics
  const simulateHydrology = (rainfall24h: number, rainfall7d: number) => {
    // 1. Calculate Runoff Coefficient (simplified)
    // Urban areas have high runoff (0.7-0.9)
    const runoffCoeff = 0.85;
    
    // 2. Calculate Total Water Volume (mm)
    const totalWater = (rainfall24h + (rainfall7d * 0.1)) * runoffCoeff;
    
    // 3. Calculate Drainage Efficiency
    // Based on active pumps and canal capacities
    const activePumps = infrastructure.filter(i => i.type === 'pump' && i.status === 'active');
    const totalPumpCapacity = activePumps.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
    const drainageEfficiency = Math.min(0.9, (totalPumpCapacity / 20000) + 0.3);

    // 4. Net Accumulation
    const netAccumulation = Math.max(0, totalWater * (1 - drainageEfficiency));
    
    return {
      totalWater,
      drainageEfficiency,
      netAccumulation,
      floodDepthEstimate: netAccumulation / 10, // cm
      status: netAccumulation > 50 ? "Critical" : netAccumulation > 20 ? "Warning" : "Stable"
    };
  };

  // Helper to calculate distance between a point and a line segment (simplified for mock)
  const getMinDistanceToDrain = (streetCoords: [number, number][]) => {
    // For mock purposes, we'll just check distance to the first point of each drain
    // In a real app, we'd use turf.js or similar
    let minDistance = 999;
    let nearestDrain = null;

    const streetCenter = streetCoords[0]; // Simplified

    drainageLines.forEach(drain => {
      drain.coords.forEach(coord => {
        const dist = Math.sqrt(Math.pow(streetCenter[0] - coord[0], 2) + Math.pow(streetCenter[1] - coord[1], 2));
        if (dist < minDistance) {
          minDistance = dist;
          nearestDrain = drain;
        }
      });
    });

    return { distance: minDistance, drain: nearestDrain };
  };

  // --- Random Forest Simulation Engine ---
  // Simulates a forest of decision trees for street-level flood risk
  const predictStreetRisk = (street: any, rainfall: number) => {
    const drainInfo = getMinDistanceToDrain(street.coords);
    const proximityFactor = Math.max(0, 1 - (drainInfo.distance / 0.05)); // 0.05 deg ~ 5km
    const drainCapacity = drainInfo.drain ? (drainInfo.drain as any).capacity : 0.5;

    // Tree 1: Elevation Focus
    const tree1 = (s: any, r: number) => {
      if (s.elevation < 5) return r > 30 ? 0.9 : 0.6;
      return r > 100 ? 0.7 : 0.2;
    };

    // Tree 2: Drainage Focus (Internal Street Drainage)
    const tree2 = (s: any, r: number) => {
      if (s.drainage_condition < 0.4) return r > 20 ? 0.85 : 0.5;
      return r > 80 ? 0.6 : 0.1;
    };

    // Tree 3: Traffic & Disruption Focus
    const tree3 = (s: any, r: number) => {
      if (s.traffic_density > 0.8) return r > 50 ? 0.95 : 0.4;
      return r > 150 ? 0.8 : 0.15;
    };

    // Tree 4: Interaction (Elevation + Drainage)
    const tree4 = (s: any, r: number) => {
      const combined = (10 - s.elevation) + (1 - s.drainage_condition) * 10;
      return Math.min(0.99, (combined * r) / 500);
    };

    // Tree 5: Drainage Network Proximity (New)
    const tree5 = (s: any, r: number) => {
      // If close to a low-capacity drain, risk increases during heavy rain
      if (proximityFactor > 0.7 && drainCapacity < 0.5) return r > 40 ? 0.9 : 0.5;
      // If close to a high-capacity drain, risk decreases slightly
      if (proximityFactor > 0.7 && drainCapacity > 0.7) return r > 100 ? 0.5 : 0.1;
      return r > 150 ? 0.7 : 0.2;
    };

    // Ensemble Average (Random Forest logic)
    const forest = [tree1, tree2, tree3, tree4, tree5];
    const votes = forest.map(tree => tree(street, rainfall));
    return votes.reduce((a, b) => a + b, 0) / forest.length;
  };

  // API Endpoints
  
  app.get("/api/historical", (req, res) => {
    res.json({
      data: historicalRainfall,
      monsoonAvg: Math.round(monsoonAvg)
    });
  });

  app.get("/api/wards", (req, res) => {
    res.json(wards);
  });

  app.get("/api/streets", (req, res) => {
    const { rainfall_24h } = req.query;
    const rainfall = Number(rainfall_24h) || 0;

    const streetPredictions = allStreets.map(street => {
      const prob = predictStreetRisk(street, rainfall);
      let riskLevel = "Low";
      if (prob > 0.7) riskLevel = "High";
      else if (prob > 0.4) riskLevel = "Medium";

      return {
        ...street,
        probability: prob,
        riskLevel
      };
    });

    res.json(streetPredictions);
  });

  app.get("/api/weather/chennai", async (req, res) => {
    try {
      // Fetch precipitation data for the last 7 days + today from Open-Meteo
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=13.0827&longitude=80.2707&daily=precipitation_sum&timezone=auto&past_days=7"
      );
      
      if (!response.ok) throw new Error("Failed to fetch from Open-Meteo");
      
      const data = await response.json();
      const dailyPrecip = data.daily.precipitation_sum; // Array of 8 values (7 past + 1 today)
      
      // Last 24h is the most recent value (today)
      const rainfall_24h = dailyPrecip[dailyPrecip.length - 1] || 0;
      
      // Last 7 days is the sum of the previous 7 days (excluding today)
      const rainfall_7d = dailyPrecip.slice(0, 7).reduce((a: number, b: number) => a + b, 0);

      res.json({
        rainfall_24h: Math.round(rainfall_24h * 10) / 10,
        rainfall_7d: Math.round(rainfall_7d * 10) / 10,
        source: "Open-Meteo Live API",
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Weather API Error:", err);
      res.status(500).json({ 
        error: "Failed to fetch live weather data", 
        details: err instanceof Error ? err.message : String(err) 
      });
    }
  });

  app.post("/api/predict", (req, res) => {
    const { rainfall_24h, rainfall_7d } = req.body;
    
    // Refined Logic using Historical Context
    const seasonalThreshold = monsoonAvg * 0.2;
    
    const wardResults = wards.map(ward => {
      const intensity = rainfall_24h / 100; 
      const saturation = rainfall_7d / seasonalThreshold; 
      
      const prob = Math.min(0.98, (intensity * 0.6 + saturation * 0.3 + ward.baseRisk * 0.1));
      
      let riskLevel = "Low";
      if (prob > 0.7) riskLevel = "High";
      else if (prob > 0.4) riskLevel = "Medium";

      return {
        ...ward,
        probability: prob,
        riskLevel,
        readinessScore: Math.round((1 - prob) * 100)
      };
    });

    const streetResults = allStreets.map(street => {
      const prob = predictStreetRisk(street, rainfall_24h);
      let riskLevel = "Low";
      if (prob > 0.7) riskLevel = "High";
      else if (prob > 0.4) riskLevel = "Medium";

      return {
        ...street,
        probability: prob,
        riskLevel
      };
    });

    res.json({
      wards: wardResults,
      streets: streetResults,
      drainage: drainageLines,
      hydrology: simulateHydrology(rainfall_24h, rainfall_7d),
      timestamp: new Date().toISOString()
    });
  });

  app.get("/api/infrastructure", (req, res) => {
    res.json(infrastructure);
  });

  app.get("/api/resources", (req, res) => {
    res.json(resources);
  });

  app.post("/api/deploy", (req, res) => {
    const { resourceId, targetArea } = req.body;
    const resource = resources.find(r => r.id === resourceId);
    if (resource) {
      resource.status = "deployed";
      console.log(`Resource ${resourceId} deployed to ${targetArea}`);
      res.json({ success: true, message: `Resource ${resource.name} deployed successfully.` });
    } else {
      res.status(404).json({ error: "Resource not found" });
    }
  });

  app.get("/api/report", (req, res) => {
    // Generate a mock government report
    const report = {
      title: "Chennai Urban Flood Situation Report",
      date: new Date().toLocaleDateString(),
      summary: "Monitoring active across 26 zones. High risk detected in Velachery and Saidapet.",
      metrics: {
        activePumps: infrastructure.filter(i => i.type === 'pump' && i.status === 'active').length,
        deployedTeams: resources.filter(r => r.status === 'deployed').length,
        criticalStreets: 12, // Mock
        totalRainfall24h: 45 // Mock
      },
      recommendations: [
        "Activate standby pumps in Saidapet.",
        "Deploy additional mobile units to T. Nagar.",
        "Issue citizen alerts for low-lying areas in Velachery."
      ]
    };
    res.json(report);
  });

  app.get("/api/hotspots", (req, res) => {
    // Return high-risk areas
    const hotspots = [
      { id: "h1", lat: 12.9792, lng: 80.2206, radius: 500, intensity: 0.95, name: "Velachery Lake Area" },
      { id: "h2", lat: 13.0405, lng: 80.2500, radius: 400, intensity: 0.82, name: "Teynampet Lowlands" },
      { id: "h3", lat: 13.0333, lng: 80.2667, radius: 350, intensity: 0.78, name: "Mylapore Canal Zone" },
      { id: "h4", lat: 12.9249, lng: 80.1000, radius: 600, intensity: 0.98, name: "Mudichur Lowlands" },
      { id: "h5", lat: 12.9229, lng: 80.1273, radius: 450, intensity: 0.88, name: "Tambaram West" },
      { id: "h6", lat: 12.9428, lng: 80.2117, radius: 550, intensity: 0.92, name: "Pallikaranai Marsh" },
      { id: "h7", lat: 13.0213, lng: 80.2231, radius: 400, intensity: 0.85, name: "Saidapet River Bank" },
    ];
    res.json(hotspots);
  });

  // Catch-all for unmatched API routes to prevent HTML fallback
  app.all("/api/*", (req, res) => {
    console.warn(`Unmatched API route: ${req.method} ${req.url}`);
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // --- Vite Integration ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UFMIS Server running on http://localhost:${PORT}`);
  });
}

startServer();
