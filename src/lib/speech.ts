/** Text-to-speech and speech recognition via the Web Speech API. */

export type Region = 'es' | 'latam';

let voices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (typeof speechSynthesis === 'undefined') return;
  voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('es'));
}

if (typeof speechSynthesis !== 'undefined') {
  loadVoices();
  speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

export function ttsAvailable(): boolean {
  return typeof speechSynthesis !== 'undefined';
}

export function spanishVoices(): SpeechSynthesisVoice[] {
  loadVoices();
  return voices;
}

function pickVoice(region: Region, voiceURI?: string): SpeechSynthesisVoice | undefined {
  if (!voices.length) loadVoices();
  if (voiceURI) {
    const v = voices.find((x) => x.voiceURI === voiceURI);
    if (v) return v;
  }
  const preferred = region === 'es' ? ['es-es'] : ['es-mx', 'es-us', 'es-419', 'es-co', 'es-ar'];
  for (const lang of preferred) {
    const v = voices.find((x) => x.lang.toLowerCase().replace('_', '-') === lang);
    if (v) return v;
  }
  return voices[0];
}

export interface SpeakOptions {
  rate?: number;
  region?: Region;
  voiceURI?: string;
  onEnd?: () => void;
}

/** Global defaults, updated from the settings. */
export const speechDefaults: { rate: number; region: Region; voiceURI?: string } = {
  rate: 0.9,
  region: 'es',
};

export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!ttsAvailable()) return;
  speechSynthesis.cancel();
  // Drop speaker labels / brackets that should not be read aloud.
  const clean = text.replace(/\([^)]*\)/g, '').replace(/\s\/\s/g, ', ');
  const u = new SpeechSynthesisUtterance(clean);
  const region = opts.region ?? speechDefaults.region;
  const voice = pickVoice(region, opts.voiceURI ?? speechDefaults.voiceURI);
  u.lang = voice?.lang ?? (region === 'es' ? 'es-ES' : 'es-MX');
  if (voice) u.voice = voice;
  u.rate = opts.rate ?? speechDefaults.rate;
  if (opts.onEnd) u.onend = opts.onEnd;
  speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (ttsAvailable()) speechSynthesis.cancel();
}

/* ---------- Speech recognition ---------- */

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionCtor = new () => RecognitionLike;

function recognitionCtor(): RecognitionCtor | undefined {
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export function recognitionAvailable(): boolean {
  return typeof window !== 'undefined' && !!recognitionCtor();
}

/** Listens once and resolves with the possible transcripts. */
export function listen(region: Region = speechDefaults.region): {
  result: Promise<string[]>;
  cancel: () => void;
} {
  const Ctor = recognitionCtor();
  if (!Ctor) return { result: Promise.reject(new Error('unsupported')), cancel: () => {} };
  const rec = new Ctor();
  rec.lang = region === 'es' ? 'es-ES' : 'es-MX';
  rec.interimResults = false;
  rec.maxAlternatives = 5;
  const result = new Promise<string[]>((resolve, reject) => {
    let done = false;
    rec.onresult = (e) => {
      done = true;
      const alts: string[] = [];
      const first = e.results[0];
      for (let i = 0; i < first.length; i++) alts.push(first[i].transcript);
      resolve(alts);
    };
    rec.onerror = (e) => {
      done = true;
      reject(new Error(e.error));
    };
    rec.onend = () => {
      if (!done) resolve([]);
    };
  });
  rec.start();
  return { result, cancel: () => rec.abort() };
}
