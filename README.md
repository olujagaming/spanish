# Hablemos – Spanisch auf Reisen lernen

Eine Lern-App für **natürliches Alltagsspanisch** – von absolut null bis zu einem fortgeschrittenen Niveau (A0 → B2).
Läuft im **Browser** und auf dem **Handy** (als installierbare, offline-fähige Web-App / PWA).

## Das Konzept

Du **reist durch die spanischsprachige Welt** – von Madrid über Andalusien, Ciudad de México und Buenos Aires bis nach
Bogotá & Cartagena – und baust dir unterwegs deine eigene **Plaza** auf: eine kleine schwebende Insel, auf der mit jeder
abgeschlossenen Etappe ein neues Gebäude entsteht. Mit verdienten **Reales** kaufst du Dekorationen und gestaltest sie selbst.
Jedes gelernte Wort wird ein Eintrag in deinem **Dex** – mit Seltenheit und Meisterungsstufe. Deine XP bringen dich vom
*Turista* bis zur *Leyenda*.

| Bereich | Was es ist |
| --- | --- |
| **Plaza** | Startseite mit deiner Insel, nächster Misión, Rang und Energía (Tagesziel) |
| **Mapa** | Reiseroute: 5 Regionen → Etappen → Misiones; „Atajo“ zum Überspringen |
| **Dex** | Sammlung aller Wörter (#001–#978), Seltenheit Común → Legendaria, Meisterung per Spaced Repetition, „Repasar“ |
| **Tertulias** | Alltagsgespräche zum Anhören und als Rollenspiel |
| **Arena** | 7 Spiele gegen die Uhr |
| **Códice** | Grammatik, kurz und alltagsnah |
| **Tienda** | Dekorationen für die Plaza |

Design: „Noche y oro“ – dunkel und edel (helles Thema „Día“ wählbar), Schriften Fraunces & Sora (lokal eingebunden,
funktionieren offline), eigene Linien-Icons, alle Grafiken als SVG.

## Was drin ist

| Bereich | Inhalt |
| --- | --- |
| 📚 **Lernpfad** | 62 Lektionen in 5 Stufen (A0 Start bei null · A1 · A2 · B1 · B2), fast 1 000 Wörter & Ausdrücke, 345 Beispielsätze, Mini-Dialoge und Tipps |
| ✍️ **Übungen** | automatisch gemischt: Bedeutung wählen, Hören, Tippen, Satz bauen, Paare finden, Lückentext, Nachsprechen (Spracherkennung) |
| 💬 **Gespräche** | 38 Alltagssituationen (Café, Arzt, Wohnungssuche, Vorstellungsgespräch, Asado in Buenos Aires …) – zum Anhören und als **interaktives Rollenspiel** |
| 🧩 **Grammatik** | 30 kurze, alltagsnahe Themen mit Tabellen, Beispielen (mit Audio) und Quiz – wichtig, aber nicht im Vordergrund |
| 🔤 **Verb-Trainer** | 78 Verben, 8 Zeiten, automatisch konjugiert (inkl. unregelmäßiger Verben) |
| 🗂️ **Karteikarten** | Spaced Repetition (SM-2): Wörter aus Lektionen landen automatisch im Stapel; eigene Karten; ES→DE, DE→ES, Hören |
| 🎮 **Spiele** | Memory, Blitz-Quiz, El Ahorcado (Galgenmännchen), Satzbaumeister, Hör-Challenge, Konjugations-Duell, Wort-Regen |
| 🏆 **Motivation** | XP, Level, Tagesziel, Tagesserie 🔥, 20 Erfolge, Statistik |
| ➕ **Extras** | Frase del día, Reise-Phrasebook (inkl. Notfall), falsche Freunde, Kultur-Infos, Wörterbuch-Suche |

**Spanisch-Variante:** neutral mit Basis Spanien – wo Lateinamerika andere Wörter benutzt, gibt es einen 🌎-Hinweis
(z. B. *el coche* → LatAm: *el carro*). Die Stimme lässt sich auf Spanien oder Lateinamerika umstellen.

## Auf dem Handy installieren

1. Die App-URL im Handy-Browser öffnen (Chrome auf Android, Safari auf iPhone).
2. **Android:** Menü ⋮ → „App installieren“ / „Zum Startbildschirm hinzufügen“.
   **iPhone:** Teilen-Symbol → „Zum Home-Bildschirm“.
3. Die App startet jetzt wie eine normale App – auch offline.

Der Fortschritt wird lokal auf dem Gerät gespeichert. Unter *Mehr → Einstellungen → Backup* kann er exportiert und auf
einem anderen Gerät importiert werden.

> Sprachausgabe nutzt die Stimmen des Geräts (Web Speech API). Spracherkennung für Sprechübungen funktioniert am besten in
> Chrome (Android/Desktop).

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver
npm test           # Tests (Logik + Content-Validierung)
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
```

Technik: Vite · React · TypeScript · vite-plugin-pwa · Vitest. Keine Server-Komponente nötig.

## Veröffentlichen (GitHub Pages)

Der Workflow `.github/workflows/deploy.yml` baut und veröffentlicht die App bei jedem Push auf `main`.
Einmalig nötig: im Repository unter **Settings → Pages → Build and deployment → Source** „**GitHub Actions**“ wählen.
Danach ist die App unter `https://<benutzer>.github.io/spanish/` erreichbar.

## Ideen für später

- KI-Gesprächspartner für freie Unterhaltungen
- Kurze Lesegeschichten mit Antippen unbekannter Wörter
- Synchronisierung zwischen Geräten (Konto)
- Mehr regionale Kurse (Mexiko, Argentinien, Karibik)
