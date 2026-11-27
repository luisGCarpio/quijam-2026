import type { Lang } from "@/types/bq360";

const LANG_TO_BCP47: Record<Lang, string> = {
  es: "es-CO",
  en: "en-US",
  pt: "pt-BR",
  fr: "fr-FR",
};

export function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined"
  );
}

export function speakAlert(text: string, lang: Lang): void {
  if (!isSpeechSupported()) {
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return;
  }

  try {
    const synthesis = window.speechSynthesis;
    synthesis.cancel();

    const bcp47 = LANG_TO_BCP47[lang];
    const utterance = new window.SpeechSynthesisUtterance(trimmed);
    utterance.lang = bcp47;
    utterance.rate = 1.0;

    const voices = synthesis.getVoices();
    if (voices.length > 0) {
      const exactVoice = voices.find(
        (voice) => voice.lang.toLowerCase() === bcp47.toLowerCase()
      );
      const langPrefixVoice = voices.find((voice) =>
        voice.lang.toLowerCase().startsWith(lang.toLowerCase())
      );
      const selectedVoice = exactVoice ?? langPrefixVoice;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    synthesis.speak(utterance);
  } catch {
    // Ignore browser speech synthesis failures cleanly.
  }
}

export function stopSpeech(): void {
  if (!isSpeechSupported()) {
    return;
  }

  try {
    window.speechSynthesis.cancel();
  } catch {
    // Ignore browser speech synthesis failures cleanly.
  }
}
