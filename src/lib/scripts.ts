/**
 * Which writing system a piece of text is in. The chatbot answers in English,
 * Telugu, Kannada and Hindi; Telugu and Kannada look alike to the model, so
 * the server decides the reply's script itself instead of trusting the model
 * to match the guest.
 */
export type IndicScript = "telugu" | "kannada" | "devanagari";
export type Script = IndicScript | "latin";

const INDIC_RANGES: Record<IndicScript, RegExp> = {
  telugu: /[ఀ-౿]/g,
  kannada: /[ಀ-೿]/g,
  devanagari: /[ऀ-ॿ]/g,
};

export const SCRIPT_LANGUAGE: Record<Script, { language: string; script: string }> = {
  telugu: { language: "Telugu", script: "Telugu script (తెలుగు)" },
  kannada: { language: "Kannada", script: "Kannada script (ಕನ್ನಡ)" },
  devanagari: { language: "Hindi", script: "Devanagari (हिन्दी)" },
  latin: { language: "English", script: "English (Latin) letters" },
};

export function indicCounts(text: string): Record<IndicScript, number> {
  return {
    telugu: text.match(INDIC_RANGES.telugu)?.length ?? 0,
    kannada: text.match(INDIC_RANGES.kannada)?.length ?? 0,
    devanagari: text.match(INDIC_RANGES.devanagari)?.length ?? 0,
  };
}

/** The Indian script with the most letters in `text`, or "latin" when there are none. */
export function dominantScript(text: string): Script {
  const counts = indicCounts(text);
  let best: Script = "latin";
  let bestCount = 0;
  for (const script of Object.keys(counts) as IndicScript[]) {
    if (counts[script] > bestCount) {
      best = script;
      bestCount = counts[script];
    }
  }
  return best;
}

/**
 * Drops an English spelling given in brackets right after a Telugu, Kannada
 * or Hindi word: "तरुण्या (Tarunya) और आशीष (Ashish)" -> "तरुण्या और आशीष".
 * The model adds these despite being asked not to, and read aloud every such
 * name was said twice. Brackets with anything else in them are left alone.
 */
export function dropBracketedEnglish(text: string) {
  return text.replace(/([ऀ-ॿఀ-೿]+)\s*\(\s*[A-Za-z][A-Za-z .,'&-]*\)/g, "$1");
}

/**
 * How many letters of `text` are in an Indian script that doesn't belong in a
 * reply written in `target`. For an English-letters reply, only a mix of two
 * or more Indian scripts counts, so quoting one word in its own script
 * ("thank you is ధన్యవాదాలు") isn't treated as a mistake.
 */
export function strayScriptLetters(text: string, target: Script) {
  const counts = indicCounts(text);
  if (target === "latin") {
    const present = (Object.values(counts) as number[]).filter((n) => n > 0);
    return present.length > 1 ? present.reduce((a, b) => a + b, 0) - Math.max(...present) : 0;
  }
  return (Object.keys(counts) as IndicScript[]).filter((s) => s !== target).reduce((sum, s) => sum + counts[s], 0);
}
