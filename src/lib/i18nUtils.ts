import type { Locale } from "./types";

// Greek day names to English (exact strings from Google Places hours)
const DAY_MAP: Record<string, string> = {
  "Δευτέρα":    "Monday",
  "Τρίτη":     "Tuesday",
  "Τετάρτη":   "Wednesday",
  "Πέμπτη":    "Thursday",
  "Παρασκευή": "Friday",
  "Σάββατο":   "Saturday",
  "Κυριακή":   "Sunday",
};

// Greek→Latin character map for transliterating street names
const CHAR_MAP: Record<string, string> = {
  Α:"A", α:"a", Β:"V", β:"v", Γ:"G", γ:"g", Δ:"D", δ:"d",
  Ε:"E", ε:"e", Ζ:"Z", ζ:"z", Η:"I", η:"i", Θ:"Th",θ:"th",
  Ι:"I", ι:"i", Κ:"K", κ:"k", Λ:"L", λ:"l", Μ:"M", μ:"m",
  Ν:"N", ν:"n", Ξ:"X", ξ:"x", Ο:"O", ο:"o", Π:"P", π:"p",
  Ρ:"R", ρ:"r", Σ:"S", σ:"s", ς:"s", Τ:"T", τ:"t",
  Υ:"Y", υ:"y", Φ:"F", φ:"f", Χ:"Ch",χ:"ch",Ψ:"Ps",ψ:"ps",
  Ω:"O", ω:"o",
  // Accented vowels
  Ά:"A", ά:"a", Έ:"E", έ:"e", Ή:"I", ή:"i", Ί:"I", ί:"i",
  Ό:"O", ό:"o", Ύ:"Y", ύ:"y", Ώ:"O", ώ:"o", Ϊ:"I", ϊ:"i",
  Ϋ:"Y", ϋ:"y", ΐ:"i", ΰ:"y",
};

// Well-known Cypriot place names where transliteration diverges from English usage
const PLACE_MAP: Record<string, string> = {
  "Κύπρος":    "Cyprus",
  "Λευκωσία":  "Nicosia",
  "Λεμεσός":   "Limassol",
  "Λεμεσό":    "Limassol",
  "Λάρνακα":   "Larnaca",
  "Πάφος":     "Paphos",
  "Παραλίμνι": "Paralimni",
  "Λάρνακος":  "Larnaca",
  "Αμμόχωστος":"Famagusta",
  "Λατσιά":    "Latsia",
  "Στρόβολος": "Strovolos",
  "Έγκωμη":    "Engomi",
  "Αγλαντζιά": "Aglandjia",
};

function transliterateWord(word: string): string {
  // Check known place names first (case-insensitive for city names)
  const place = PLACE_MAP[word];
  if (place) return place;
  // Character-by-character transliteration
  return [...word].map(ch => CHAR_MAP[ch] ?? ch).join("");
}

/**
 * Translate a formatted_address that may contain Greek text.
 * Known city/country names get proper English spellings; other Greek words
 * are transliterated character-by-character.
 */
export function translateAddress(address: string | null, locale: Locale): string | null {
  if (!address || locale !== "en") return address;
  return address
    .split(/(\s+|,)/)
    .map(token => /\p{Script=Greek}/u.test(token) ? transliterateWord(token) : token)
    .join("");
}

/**
 * Translate a single opening-hours line from Greek to English.
 * Input: "Δευτέρα: 8:00 π.μ. – 5:00 μ.μ."
 * Output: "Monday: 8:00 AM – 5:00 PM"
 */
export function translateHoursLine(line: string, locale: Locale): string {
  if (locale !== "en") return line;
  let out = line;
  for (const [el, en] of Object.entries(DAY_MAP)) {
    if (out.startsWith(el)) { out = en + out.slice(el.length); break; }
  }
  return out
    .replace(/π\.μ\./g, "AM")
    .replace(/μ\.μ\./g, "PM")
    .replace(/Κλειστά/g, "Closed");
}
