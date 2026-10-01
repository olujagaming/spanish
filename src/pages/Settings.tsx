import { useEffect, useRef, useState } from 'react';
import { exportState, replaceState, resetState, setState, useAppState } from '../lib/store';
import type { Settings as S } from '../lib/state';
import { recognitionAvailable, speak, spanishVoices, ttsAvailable } from '../lib/speech';
import { BackLink, Switch } from '../components/ui';

export default function Settings() {
  const s = useAppState();
  const st = s.settings;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = () => setVoices(spanishVoices());
    load();
    if (ttsAvailable()) speechSynthesis.addEventListener?.('voiceschanged', load);
    return () => {
      if (ttsAvailable()) speechSynthesis.removeEventListener?.('voiceschanged', load);
    };
  }, []);

  const set = (patch: Partial<S>) => setState((cur) => ({ ...cur, settings: { ...cur.settings, ...patch } }));

  const download = () => {
    const blob = new Blob([exportState()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `hablemos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const upload = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      if (!data || typeof data !== 'object' || !('xp' in data)) throw new Error('invalid');
      if (confirm('Fortschritt aus der Datei laden? Der aktuelle Fortschritt wird ersetzt.')) replaceState(data);
    } catch {
      alert('Die Datei konnte nicht gelesen werden.');
    }
  };

  return (
    <div>
      <BackLink />
      <h1>⚙️ Einstellungen</h1>

      <div className="card">
        <h3>Profil & Ziel</h3>
        <div className="settings-row">
          <span>Name</span>
          <input className="input" style={{ maxWidth: 200, minHeight: 40 }} value={st.name} onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div className="settings-row">
          <span>Tagesziel</span>
          <select className="input" value={st.dailyGoal} onChange={(e) => set({ dailyGoal: Number(e.target.value) })}>
            <option value={10}>10 XP – locker</option>
            <option value={30}>30 XP – normal</option>
            <option value={50}>50 XP – ernsthaft</option>
            <option value={80}>80 XP – intensiv</option>
          </select>
        </div>
        <div className="settings-row">
          <div>
            <div>Freier Modus</div>
            <div className="tiny muted">Alle Lektionen ohne Reihenfolge öffnen</div>
          </div>
          <Switch label="Freier Modus" checked={st.freeMode} onChange={(v) => set({ freeMode: v })} />
        </div>
      </div>

      <div className="card">
        <h3>Sprache & Aussprache</h3>
        {!ttsAvailable() && <p className="small muted">Dein Browser unterstützt keine Sprachausgabe.</p>}
        <div className="settings-row">
          <span>Akzent der Stimme</span>
          <select className="input" value={st.region} onChange={(e) => set({ region: e.target.value as S['region'], voiceURI: undefined })}>
            <option value="es">🇪🇸 Spanien</option>
            <option value="latam">🌎 Lateinamerika</option>
          </select>
        </div>
        {voices.length > 0 && (
          <div className="settings-row">
            <span>Stimme</span>
            <select className="input" value={st.voiceURI ?? ''} onChange={(e) => set({ voiceURI: e.target.value || undefined })}>
              <option value="">Automatisch</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="settings-row">
          <span>Sprechtempo</span>
          <input type="range" min={0.5} max={1.2} step={0.05} value={st.rate} onChange={(e) => set({ rate: Number(e.target.value) })} />
        </div>
        <div className="settings-row">
          <span />
          <button type="button" className="btn secondary small" onClick={() => speak('¡Hola! ¿Qué tal? Estoy aprendiendo español.')}>
            🔊 Stimme testen
          </button>
        </div>
        <div className="settings-row">
          <span>Wörter automatisch vorlesen</span>
          <Switch label="Autoplay" checked={st.autoplay} onChange={(v) => set({ autoplay: v })} />
        </div>
        <div className="settings-row">
          <div>
            <div>Lateinamerika-Hinweise</div>
            <div className="tiny muted">z. B. „LatAm: el carro“</div>
          </div>
          <Switch label="Regionale Hinweise" checked={st.showRegional} onChange={(v) => set({ showRegional: v })} />
        </div>
        <p className="tiny muted" style={{ marginBottom: 0 }}>
          Spracherkennung (Sprechübungen): {recognitionAvailable() ? '✅ verfügbar' : '❌ in diesem Browser nicht verfügbar (am besten Chrome/Android)'}
        </p>
      </div>

      <div className="card">
        <h3>Darstellung</h3>
        <div className="settings-row">
          <span>Design</span>
          <select className="input" value={st.theme} onChange={(e) => set({ theme: e.target.value as S['theme'] })}>
            <option value="auto">Automatisch</option>
            <option value="light">☀️ Hell</option>
            <option value="dark">🌙 Dunkel</option>
          </select>
        </div>
        <div className="settings-row">
          <span>Soundeffekte</span>
          <Switch label="Sound" checked={st.sound} onChange={(v) => set({ sound: v })} />
        </div>
      </div>

      <div className="card">
        <h3>Backup</h3>
        <p className="small muted">
          Dein Fortschritt wird nur auf diesem Gerät gespeichert. Mit einem Backup kannst du ihn auf ein anderes Gerät (z. B. vom PC aufs
          Handy) übertragen.
        </p>
        <div className="list">
          <button type="button" className="btn secondary block" onClick={download}>
            💾 Fortschritt exportieren
          </button>
          <button type="button" className="btn secondary block" onClick={() => fileRef.current?.click()}>
            📂 Fortschritt importieren
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            className="btn ghost block"
            style={{ color: 'var(--bad)' }}
            onClick={() => {
              if (confirm('Wirklich ALLES zurücksetzen? Dein gesamter Fortschritt geht verloren.')) resetState();
            }}
          >
            Alles zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
}
