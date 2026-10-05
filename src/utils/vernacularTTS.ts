/**
 * Vernacular Text-to-Speech (TTS) Engine
 * Provides crystal-clear native audio broadcast playback for all 9 Indian languages.
 * Uses high-fidelity native cloud audio streaming with seamless sentence queueing
 * and resilient local Web Speech API fallback.
 */

export interface VernacularTTSOptions {
  text: string;
  language?: string; // e.g. 'ml', 'hi', 'ta', 'te', 'mr', 'gu', 'bn', 'as', 'en'
  bcp47?: string;    // e.g. 'ml-IN', 'hi-IN', 'ta-IN'
  rate?: number;     // 0.8 to 1.2
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: any) => void;
}

// Map application language codes to Google TTS engine language codes
const LANG_MAP: Record<string, string> = {
  ml: 'ml',
  malayalam: 'ml',
  hi: 'hi',
  hindi: 'hi',
  ta: 'ta',
  tamil: 'ta',
  te: 'te',
  telugu: 'te',
  mr: 'mr',
  marathi: 'mr',
  gu: 'gu',
  gujarati: 'gu',
  bn: 'bn',
  bengali: 'bn',
  as: 'bn', // Assamese script & phonetics share Bengali TTS engine
  assamese: 'bn',
  kn: 'kn',
  kannada: 'kn',
  pa: 'pa',
  punjabi: 'pa',
  en: 'en',
  english: 'en',
};

/**
 * Remove emojis, markdown tags, URLs, and formatting characters that confuse TTS engines.
 */
export function cleanTextForSpeech(input: string): string {
  if (!input) return '';
  return input
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '') // Emojis
    .replace(/\[ACTION:[^\]]+\]/g, '')                            // Action badges
    .replace(/```[\s\S]*?```/g, ' ')                              // Code blocks
    .replace(/`([^`]+)`/g, '$1')                                  // Inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')                        // Images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')                      // Links
    .replace(/[*_#~>]+/g, ' ')                                    // Markdown symbols
    .replace(/https?:\/\/\S+/g, ' ')                              // URLs
    .replace(/\s+/g, ' ')                                         // Collapse whitespace
    .trim();
}

/**
 * Resolve standard language code from input
 */
export function resolveTTSLanguage(lang?: string, bcp47?: string): string {
  const candidate = (lang || (bcp47 ? bcp47.split('-')[0] : '') || 'en').toLowerCase().trim();
  return LANG_MAP[candidate] || 'en';
}

/**
 * Split text into naturally paced segments of <= 170 characters at sentence / phrase boundaries
 */
export function splitIntoTTSChunks(text: string, maxLen = 170): string[] {
  const clean = cleanTextForSpeech(text);
  if (!clean) return [];

  // Split by sentence delimiters: period, exclamation, question mark, Indian danda (।), or newline
  const rawSentences = clean.split(/([.!?।\n]+)/);
  const combined: string[] = [];

  for (let i = 0; i < rawSentences.length; i += 2) {
    const sentence = (rawSentences[i] || '') + (rawSentences[i + 1] || '');
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxLen) {
      combined.push(trimmed);
    } else {
      // Further split by comma, semicolon or space
      const subparts = trimmed.split(/([,;،]+|\s+)/);
      let buffer = '';
      for (const part of subparts) {
        if ((buffer + part).length <= maxLen) {
          buffer += part;
        } else {
          if (buffer.trim()) combined.push(buffer.trim());
          buffer = part;
        }
      }
      if (buffer.trim()) combined.push(buffer.trim());
    }
  }

  return combined.length > 0 ? combined : [clean];
}

// Active playback session controller
let activeSessionId = 0;
let activeAudioElement: HTMLAudioElement | null = null;

/**
 * Stop any ongoing vernacular speech playback across the entire application
 */
export function stopVernacularAudio(): void {
  activeSessionId++;
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
    } catch {
      // ignore
    }
    activeAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/**
 * Play authentic, fluent vernacular audio for emergency broadcasts and advisories.
 * Automatically tries high-quality native cloud stream first, then falls back to Web Speech API.
 * Returns a cancellation callback function.
 */
export function playVernacularAudio(options: VernacularTTSOptions): () => void {
  const { text, language, bcp47, rate = 1.0, onStart, onEnd, onError } = options;

  // Cancel any prior speech
  stopVernacularAudio();

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    onEnd?.();
    return () => {};
  }

  const sessionId = ++activeSessionId;
  const ttsLang = resolveTTSLanguage(language, bcp47);
  const targetBcp47 = bcp47 || `${ttsLang}-IN`;
  const chunks = splitIntoTTSChunks(clean, 170);

  if (chunks.length === 0) {
    onEnd?.();
    return () => {};
  }

  let chunkIndex = 0;
  let hasStarted = false;

  // Fallback to Web Speech API if streaming fails
  const playWebSpeechFallback = () => {
    if (sessionId !== activeSessionId) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onError?.(new Error('Speech synthesis not available'));
      onEnd?.();
      return;
    }

    try {
      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = targetBcp47;
      utterance.rate = Math.max(0.8, Math.min(1.2, rate * 0.95));

      const voices = synth.getVoices();
      const langPrefix = ttsLang.toLowerCase();

      // Look for a voice matching this specific language (NOT generic English fallback)
      const matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === targetBcp47.toLowerCase() ||
          v.lang.toLowerCase().startsWith(langPrefix) ||
          v.name.toLowerCase().includes(langPrefix)
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      } else if (ttsLang !== 'en') {
        // If no native voice exists on this OS and it's non-English, speaking with English voice produces gibberish.
        console.warn(`[VernacularTTS] Notice: No native browser voice found for ${ttsLang} on this OS.`);
      }

      utterance.onstart = () => {
        if (sessionId === activeSessionId && !hasStarted) {
          hasStarted = true;
          onStart?.();
        }
      };

      utterance.onend = () => {
        if (sessionId === activeSessionId) {
          onEnd?.();
        }
      };

      utterance.onerror = (e) => {
        if (sessionId === activeSessionId) {
          console.warn('[VernacularTTS] SpeechSynthesis error:', e);
          onError?.(e);
          onEnd?.();
        }
      };

      synth.speak(utterance);
    } catch (err) {
      console.warn('[VernacularTTS] Fallback error:', err);
      onError?.(err);
      onEnd?.();
    }
  };

  // Play next chunk via Google Translate TTS audio stream
  const playNextChunk = () => {
    if (sessionId !== activeSessionId) return;

    if (chunkIndex >= chunks.length) {
      activeAudioElement = null;
      onEnd?.();
      return;
    }

    const currentText = chunks[chunkIndex];
    chunkIndex++;

    const encodedText = encodeURIComponent(currentText);
    const proxyUrl = `/tts-proxy?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodedText}`;
    const directUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${ttsLang}&client=tw-ob&q=${encodedText}`;
    
    // On localhost, prioritize the Vite /tts-proxy route to guarantee 100% bypass of Referer blocks
    const primaryUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? proxyUrl
      : directUrl;

    try {
      const audio = new Audio();
      activeAudioElement = audio;
      audio.playbackRate = Math.max(0.8, Math.min(1.3, rate));

      let triedDirect = false;
      const tryFallbackSource = () => {
        if (!triedDirect && primaryUrl === proxyUrl) {
          triedDirect = true;
          audio.src = directUrl;
          const retryPromise = audio.play();
          if (retryPromise !== undefined) {
            retryPromise.catch(() => playWebSpeechFallback());
          }
        } else {
          playWebSpeechFallback();
        }
      };

      audio.onplay = () => {
        if (sessionId === activeSessionId && !hasStarted) {
          hasStarted = true;
          onStart?.();
        }
      };

      audio.onended = () => {
        if (sessionId === activeSessionId) {
          playNextChunk();
        }
      };

      audio.onerror = (e) => {
        console.warn('[VernacularTTS] Audio stream error on chunk, attempting fallback:', e);
        if (sessionId === activeSessionId) {
          if (!hasStarted) {
            tryFallbackSource();
          } else {
            onEnd?.();
          }
        }
      };

      audio.src = primaryUrl;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[VernacularTTS] Audio play promise rejected, attempting fallback:', err);
          if (sessionId === activeSessionId) {
            if (!hasStarted) {
              tryFallbackSource();
            } else {
              onEnd?.();
            }
          }
        });
      }
    } catch (err) {
      console.warn('[VernacularTTS] Audio initialization failed:', err);
      playWebSpeechFallback();
    }
  };

  // Start playback
  playNextChunk();

  return () => {
    if (activeSessionId === sessionId) {
      stopVernacularAudio();
    }
  };
}
