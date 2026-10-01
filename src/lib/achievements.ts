import type { AppState } from './state';
import { isMastered } from './srs';

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  test: (s: AppState) => boolean;
}

const lessonsDone = (s: AppState) => Object.keys(s.lessons).length;
const masteredCount = (s: AppState) => Object.values(s.cards).filter(isMastered).length;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', emoji: '🌱', title: '¡Primer paso!', desc: 'Erste Lektion abgeschlossen', test: (s) => lessonsDone(s) >= 1 },
  { id: 'lessons-10', emoji: '📗', title: 'Fleißig', desc: '10 Lektionen abgeschlossen', test: (s) => lessonsDone(s) >= 10 },
  { id: 'lessons-30', emoji: '📚', title: 'Bücherwurm', desc: '30 Lektionen abgeschlossen', test: (s) => lessonsDone(s) >= 30 },
  { id: 'lessons-all', emoji: '🎓', title: 'Maestro', desc: '60 Lektionen abgeschlossen', test: (s) => lessonsDone(s) >= 60 },
  { id: 'perfect', emoji: '💯', title: 'Perfecto', desc: 'Eine Lektion ohne Fehler', test: (s) => s.stats.perfectLessons >= 1 },
  { id: 'streak-3', emoji: '🔥', title: 'Am Ball', desc: '3 Tage in Folge gelernt', test: (s) => s.bestStreak >= 3 },
  { id: 'streak-7', emoji: '🔥', title: 'Eine Woche!', desc: '7 Tage in Folge gelernt', test: (s) => s.bestStreak >= 7 },
  { id: 'streak-30', emoji: '🏆', title: 'Imparable', desc: '30 Tage in Folge gelernt', test: (s) => s.bestStreak >= 30 },
  { id: 'xp-500', emoji: '⭐', title: '500 XP', desc: '500 Erfahrungspunkte gesammelt', test: (s) => s.xp >= 500 },
  { id: 'xp-2000', emoji: '🌟', title: '2000 XP', desc: '2000 Erfahrungspunkte gesammelt', test: (s) => s.xp >= 2000 },
  { id: 'xp-10000', emoji: '💫', title: '10 000 XP', desc: 'Wahnsinn!', test: (s) => s.xp >= 10000 },
  { id: 'reviews-100', emoji: '🗂️', title: 'Kartenprofi', desc: '100 Karteikarten wiederholt', test: (s) => s.stats.reviews >= 100 },
  { id: 'reviews-1000', emoji: '🧠', title: 'Gedächtniskünstler', desc: '1000 Karteikarten wiederholt', test: (s) => s.stats.reviews >= 1000 },
  { id: 'mastered-50', emoji: '💪', title: 'Sitzt!', desc: '50 Wörter langfristig gelernt', test: (s) => masteredCount(s) >= 50 },
  { id: 'mastered-300', emoji: '🦾', title: 'Wortschatz-Riese', desc: '300 Wörter langfristig gelernt', test: (s) => masteredCount(s) >= 300 },
  { id: 'conv-1', emoji: '💬', title: '¡Hablamos!', desc: 'Erstes Gespräch geführt', test: (s) => Object.keys(s.conversations).length >= 1 },
  { id: 'conv-10', emoji: '🗣️', title: 'Plaudertasche', desc: '10 Gespräche geführt', test: (s) => Object.keys(s.conversations).length >= 10 },
  { id: 'grammar-5', emoji: '🧩', title: 'Regelkenner', desc: '5 Grammatik-Themen geübt', test: (s) => Object.keys(s.grammar).length >= 5 },
  { id: 'games-10', emoji: '🎮', title: 'Spielkind', desc: '10 Spiele gespielt', test: (s) => s.stats.gamesPlayed >= 10 },
  { id: 'speaker', emoji: '🎤', title: 'Stimme', desc: '20 Sätze laut gesprochen', test: (s) => s.stats.wordsSpoken >= 20 },
];

export function checkAchievements(s: AppState): { state: AppState; unlocked: Achievement[] } {
  const unlocked = ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.test(s));
  if (!unlocked.length) return { state: s, unlocked };
  const achievements = { ...s.achievements };
  const now = Date.now();
  for (const a of unlocked) achievements[a.id] = now;
  return { state: { ...s, achievements }, unlocked };
}
