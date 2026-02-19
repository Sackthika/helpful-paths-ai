import campusMap from './dataset/campus.json';
import hospitalLayout from './dataset/hospital_layout.json';
import departmentsDir from './dataset/departments.json';
import patientsDir from './dataset/patients.json';
import floorMaps from './dataset/floor_maps.json';

export interface Department {
  id: string;
  name: string;
  nameTA: string; // Tamil name
  floor: number;
  block: string;
  side: string;
  sideTA: string;
  room: string;
  category: string;
  keywords: string;
  keywordsTA: string;
  x: number; // position on floor map (percentage)
  y: number;
  occupancy?: number;
  waitTime?: number;
}

export interface Patient {
  id: string;
  name: string;
  room: string;
  floor: number;
  phoneNumber?: string;
  ward?: string;
  dept?: Department;
}

export interface FloorInfo {
  floor: number;
  label: string;
  labelTA: string;
  blocks: string[];
}

export const floors: FloorInfo[] = [
  { floor: 0, label: "Ground Floor", labelTA: "தரை தளம்", blocks: ["A", "B"] },
  { floor: 1, label: "1st Floor", labelTA: "முதல் தளம்", blocks: ["A", "B", "C"] },
  { floor: 2, label: "2nd Floor", labelTA: "இரண்டாம் தளம்", blocks: ["A", "B", "C"] },
  { floor: 3, label: "3rd Floor", labelTA: "மூன்றாம் தளம்", blocks: ["A", "B"] },
];

const API_URL = 'http://localhost:5000/api';

export const getAllDepartments = async (): Promise<Department[]> => {
  try {
    const response = await fetch(`${API_URL}/departments`);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Error fetching departments:', error);
    return [];
  }
};

export const findDepartment = async (query: string, lang: 'en' | 'ta'): Promise<Department | null> => {
  // Try backend first
  try {
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}&lang=${lang}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.id) return data as Department;
    }
  } catch (error) {
    console.warn('Backend unavailable, falling back to local search:', error);
  }

  // Local JSON fallback — search departments.json directly
  const q = query.toLowerCase().trim();
  const departments = departmentsDir as Department[];

  // 1. Exact ID match
  let found = departments.find(d => d.id === q);
  if (found) return found;

  // 2. Name / Tamil name match
  found = departments.find(d =>
    d.name.toLowerCase().includes(q) ||
    d.nameTA.includes(q)
  );
  if (found) return found;

  // 3. Keywords match
  found = departments.find(d => {
    const kw = d.keywords.split(',').map(k => k.trim().toLowerCase());
    const kwTA = d.keywordsTA.split(',').map(k => k.trim());
    return kw.some(k => q.includes(k) || k.includes(q)) ||
      kwTA.some(k => q.includes(k) || k.includes(q));
  });
  if (found) return found;

  // 4. Room number match
  found = departments.find(d => d.room.toLowerCase().includes(q));
  return found || null;
};

export async function findPatient(criteria: { q?: string; name?: string; id?: string; phone?: string; ward?: string }): Promise<Patient | null> {
  try {
    const params = new URLSearchParams();
    if (criteria.q) params.append('q', criteria.q);
    if (criteria.name) params.append('name', criteria.name);
    if (criteria.id) params.append('id', criteria.id);
    if (criteria.phone) params.append('phone', criteria.phone);
    if (criteria.ward) params.append('ward', criteria.ward);

    const response = await fetch(`${API_URL}/patients/search?${params.toString()}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Patient search error:', error);
    return null;
  }
}

export function getDirections(dept: Department, lang: "en" | "ta"): string {
  if (lang === "ta") {
    return `📍 **${dept.nameTA}**\n\n🏷️ **வார்டு / அறை எண்:** ${dept.room}\n🏢 **தளம்:** ${dept.floor === 0 ? "தரை தளம்" : `தளம் ${dept.floor}`}\n🧱 **பிளாக்:** ${dept.block}\n🧭 **பக்கம்:** ${dept.sideTA}\n📂 **வகை:** ${dept.category}\n\n➡️ **வழிகாட்டுதல்:**\n${dept.floor === 0
      ? `1. நுழைவாயிலிலிருந்து நேராக செல்லுங்கள்\n2. பிளாக் ${dept.block} (${dept.sideTA}) அடையாளத்தைப் பின்பற்றுங்கள்\n3. அறை ${dept.room} - ${dept.nameTA}`
      : `1. லிஃப்ட் / படிக்கட்டு வழியாக தளம் ${dept.floor}க்கு செல்லுங்கள்\n2. பிளாக் ${dept.block} (${dept.sideTA}) பக்கம் திரும்புங்கள்\n3. அறை ${dept.room} - ${dept.nameTA}`
      }`;
  }

  return `📍 **${dept.name}**\n\n🏷️ **Ward / Room No:** ${dept.room}\n🏢 **Floor:** ${dept.floor === 0 ? "Ground Floor" : `Floor ${dept.floor}`}\n🧱 **Block:** ${dept.block}\n🧭 **Side:** ${dept.side}\n📂 **Category:** ${dept.category}\n\n➡️ **Directions:**\n${dept.floor === 0
    ? `1. From the main entrance, walk straight ahead\n2. Follow signs to Block ${dept.block} (${dept.side})\n3. Room ${dept.room} — ${dept.name}`
    : `1. Take the elevator/stairs to Floor ${dept.floor}\n2. Turn towards Block ${dept.block} (${dept.side})\n3. Room ${dept.room} — ${dept.name}`
    }`;
}

export function getBilingualDirections(dept: Department): { ta: string; en: string } {
  return {
    ta: getDirections(dept, "ta"),
    en: getDirections(dept, "en")
  };
}

export function getBotGreeting(lang: "en" | "ta"): string {
  if (lang === "ta") {
    return "🏥 வணக்கம்! நான் உங்கள் மருத்துவமனை வழிகாட்டி.\n\nஎந்த பிரிவுக்கு செல்ல வேண்டும்? தட்டச்சு செய்யவும் அல்லது பேசவும்.\n\nஉதாரணம்: \"ICU எங்க இருக்கு?\" அல்லது \"கண் டாக்டர்\"";
  }
  return "🏥 Welcome! I'm your Hospital Navigation Assistant.\n\nType or speak the department you're looking for.\n\nExample: \"Where is Cardiology OPD?\" or \"ICU\"";
}

export function getBilingualGreeting(): { ta: string; en: string } {
  return {
    ta: getBotGreeting("ta"),
    en: getBotGreeting("en")
  };
}

export const HospitalDataset = {
  campus: campusMap,
  layout: hospitalLayout,
  departments: departmentsDir as Department[],
  patients: patientsDir as Patient[],
  floorMaps: floorMaps,
  floors: floors
};
