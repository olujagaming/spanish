/** Tiny sound effects generated with the Web Audio API (no audio files needed). */

import { getState } from './store';

let ctx: AudioContext | undefined;

function audio(): AudioContext | undefined {
  if (typeof window === 'undefined') return undefined;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return undefined;
    ctx = new Ctor();
  }
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', gain = 0.12) {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, a.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + duration);
  osc.connect(g).connect(a.destination);
  osc.start(a.currentTime + start);
  osc.stop(a.currentTime + start + duration + 0.05);
}

export function playSound(kind: 'good' | 'bad' | 'done' | 'tap'): void {
  if (!getState().settings.sound) return;
  switch (kind) {
    case 'good':
      tone(660, 0, 0.12);
      tone(880, 0.09, 0.18);
      break;
    case 'bad':
      tone(220, 0, 0.25, 'triangle', 0.1);
      break;
    case 'done':
      [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.25));
      break;
    case 'tap':
      tone(500, 0, 0.05, 'sine', 0.05);
      break;
  }
}
