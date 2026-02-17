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

const API_BASE_URL = 'http://localhost:5000/api';

export async function findDepartment(query: string, lang: "en" | "ta" = "en"): Promise<Department | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&lang=${lang}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Search error:', error);
    return null;
  }
}

export async function getAllDepartments(): Promise<Department[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
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

export function getBotGreeting(lang: "en" | "ta"): string {
  if (lang === "ta") {
    return "🏥 வணக்கம்! நான் உங்கள் மருத்துவமனை வழிகாட்டி.\n\nஎந்த பிரிவுக்கு செல்ல வேண்டும்? தட்டச்சு செய்யவும் அல்லது பேசவும்.\n\nஉதாரணம்: \"ICU எங்க இருக்கு?\" அல்லது \"கண் டாக்டர்\"";
  }
  return "🏥 Welcome! I'm your Hospital Navigation Assistant.\n\nType or speak the department you're looking for.\n\nExample: \"Where is Cardiology OPD?\" or \"ICU\"";
}
