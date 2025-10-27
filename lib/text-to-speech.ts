// Text-to-Speech Service for reading questions in multiple Indian languages
// Supports English, Hindi, Tamil, Telugu, Kannada, and other Indian languages

export class TextToSpeechService {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis
      this.loadVoices()
    }
  }

  private loadVoices(): void {
    if (!this.synth) return

    // Load voices
    this.voices = this.synth.getVoices()

    // Chrome loads voices asynchronously
    if (this.voices.length === 0) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth!.getVoices()
      }
    }
  }

  private getVoiceForLanguage(language: string): SpeechSynthesisVoice | null {
    if (!this.synth || this.voices.length === 0) {
      this.loadVoices()
    }

    // Map language codes to voice language codes
    const languageMap: Record<string, string[]> = {
      "en-US": ["en-US", "en-GB", "en"],
      "hi-IN": ["hi-IN", "hi"],
      "ta-IN": ["ta-IN", "ta"],
      "te-IN": ["te-IN", "te"],
      "kn-IN": ["kn-IN", "kn"],
      "ml-IN": ["ml-IN", "ml"],
      "mr-IN": ["mr-IN", "mr"],
      "bn-IN": ["bn-IN", "bn"],
      "gu-IN": ["gu-IN", "gu"],
    }

    const possibleLangs = languageMap[language] || [language]

    // Try to find a voice that matches the language
    for (const lang of possibleLangs) {
      const voice = this.voices.find((v) => v.lang.startsWith(lang))
      if (voice) return voice
    }

    // Fallback to default voice
    return this.voices[0] || null
  }

  speak(text: string, language = "en-US", onEnd?: () => void): void {
    if (!this.synth) {
      console.error("Text-to-speech not supported")
      return
    }

    // Cancel any ongoing speech
    this.synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = this.getVoiceForLanguage(language)

    if (voice) {
      utterance.voice = voice
    }

    utterance.lang = language
    utterance.rate = 0.9 // Slightly slower for clarity
    utterance.pitch = 1.0
    utterance.volume = 1.0

    if (onEnd) {
      utterance.onend = onEnd
    }

    this.synth.speak(utterance)
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false
  }
}

// Singleton instance
let ttsInstance: TextToSpeechService | null = null

export function getTextToSpeechService(): TextToSpeechService {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeechService()
  }
  return ttsInstance
}
