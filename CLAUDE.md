# ¡Hablemos! – Projektnotizen

Spanisch-Lern-PWA für deutschsprachige Lernende (UI auf Deutsch). Vite + React + TypeScript, keine Backend-Komponente.

## Befehle
- `npm test` – Vitest (inkl. `src/content/content.test.ts`, die alle Inhalte validiert)
- `npm run lint`, `npm run typecheck`, `npm run build`

## Struktur
- `src/content/` – alle Lerninhalte als Daten
  - `lessons/a0.ts … b2.ts` – Stufen → Einheiten → Lektionen. Wörter als Tupel `[es, de, note?]`
    (`note` = Lateinamerika-Hinweis), Sätze `[es, de]`, Dialoge `[sprecher, es, de]`.
    Alternativen in der deutschen Übersetzung mit ` / ` trennen (werden beim Tippen akzeptiert).
  - `grammar/` – Grammatikthemen mit Abschnitten und Quiz (`answer` = Index in `options`)
  - `conversations/` – Rollenspiele; `you` ist der Sprecher, den die lernende Person spielt
  - `verbs.ts` – Verbdefinitionen für `lib/conjugate.ts` (Stammwechsel, unregelmäßige Stämme, Overrides)
  - `extras.ts` – Frase del día, Phrasebook, falsche Freunde, Kultur
- `src/lib/` – Logik: `exercises.ts` (Übungsgenerator), `srs.ts` (SM-2), `state.ts`/`store.ts` (Fortschritt in localStorage),
  `answer.ts` (tolerante Antwortprüfung), `speech.ts` (TTS/STT), `conjugate.ts`
- `src/lib/progression.ts` – Spielschicht: Regionen (Stufen), Ränge, Plaza-Gebäude (eins pro Unit), Dekorationen/Reales, Dex
- `src/components/Plaza.tsx` – isometrische SVG-Plaza; `Icon.tsx` – eigene Linien-Icons (keine Emojis in der UI-Chrome)
- `src/pages/` – Seiten (HashRouter, spanische Routen: `/mapa`, `/mision/:id`, `/dex`, `/tertulias`, `/arena`, `/codice`, `/tienda` …),
  `src/pages/games/` – Spiele
- `src/styles/global.css` – Design-Tokens (hell/dunkel) und alle Styles

## Konventionen
- Neue Inhalte: nur Daten ergänzen; `npm test` prüft IDs, Grammatik-Verweise, ¿-Zeichen und Übungsgenerierung.
- Spanisch neutral mit Basis Spanien, LatAm-Unterschiede als `note`.
- Eigenständige Identität: keine Duolingo-typischen Elemente (bunte 3D-Buttons, Sterne, Flammen, Emoji-Navigation).
  Naming spanisch (Misión, Etapa, Racha, Energía, Reales, Logros), deutsche Erklärungen darunter.
- Neue Unit → in `BUILDINGS` (progression.ts) ein Gebäude auf einem freien Rasterfeld ergänzen (Test prüft das).
