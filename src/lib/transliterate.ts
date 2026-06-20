// Standard Greek-to-Latin transliteration map.
// Applied to school names on English pages when no Latin name exists.
const MAP: Record<string, string> = {
  // uppercase
  "Α": "A", "Β": "V", "Γ": "G", "Δ": "D", "Ε": "E", "Ζ": "Z", "Η": "I",
  "Θ": "Th", "Ι": "I", "Κ": "K", "Λ": "L", "Μ": "M", "Ν": "N", "Ξ": "X",
  "Ο": "O", "Π": "P", "Ρ": "R", "Σ": "S", "Τ": "T", "Υ": "Y",
  "Φ": "F", "Χ": "Ch", "Ψ": "Ps", "Ω": "O",
  // uppercase accented
  "Ά": "A", "Έ": "E", "Ή": "I", "Ί": "I", "Ό": "O", "Ύ": "Y", "Ώ": "O",
  "Ϊ": "I", "Ϋ": "Y",
  // lowercase
  "α": "a", "β": "v", "γ": "g", "δ": "d", "ε": "e", "ζ": "z", "η": "i",
  "θ": "th", "ι": "i", "κ": "k", "λ": "l", "μ": "m", "ν": "n", "ξ": "x",
  "ο": "o", "π": "p", "ρ": "r", "σ": "s", "ς": "s", "τ": "t", "υ": "y",
  "φ": "f", "χ": "ch", "ψ": "ps", "ω": "o",
  // lowercase accented
  "ά": "a", "έ": "e", "ή": "i", "ί": "i", "ό": "o", "ύ": "y", "ώ": "o",
  "ϊ": "i", "ϋ": "y", "ΐ": "i", "ΰ": "y",
};

const GREEK_RE = /[ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρσςτυφχψωΆΈΉΊΌΎΏάέήίόύώΐΰϊϋΪΫ]/;

export function containsGreek(text: string): boolean {
  return GREEK_RE.test(text);
}

export function transliterateGreek(text: string): string {
  return [...text].map((ch) => MAP[ch] ?? ch).join("");
}
