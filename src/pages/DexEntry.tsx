import { Link, useParams } from 'react-router-dom';
import { useAppState } from '../lib/store';
import { DEX, dexNumber, examplesFor, masteryOf, MASTERY, MASTERY_DE, RARITY, REGIONS, unitTitle } from '../lib/progression';
import { getLesson } from '../content';
import { BackLink, Gems, RegionalNote, SpeakButton } from '../components/ui';

export default function DexEntryPage() {
  const { no = '' } = useParams();
  const s = useAppState();
  const entry = DEX.find((e) => e.no === Number(no));
  if (!entry) return <BackLink to="/dex" label="Dex" />;
  const { word } = entry;
  const card = s.cards[word.key];
  const m = masteryOf(card);
  const rar = RARITY[word.level];
  const lesson = getLesson(word.lessonId);
  const examples = examplesFor(word);
  const prev = DEX[entry.no - 2];
  const next = DEX[entry.no];

  if (m === 0) {
    return (
      <div>
        <BackLink to="/dex" label="Dex" />
        <div className="dex-hero" style={{ ['--rar' as string]: rar.color }}>
          <div className="tiny muted">{dexNumber(entry.no)}</div>
          <div className="word">???</div>
          <p className="muted">Dieses Wort wartet in {REGIONS[word.level].place} auf dich.</p>
          {lesson && (
            <Link to={`/mision/${lesson.id}`} className="btn small">
              Zur Misión „{lesson.title}“
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackLink to="/dex" label="Dex" />
      <div className="dex-hero" style={{ ['--rar' as string]: rar.color }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="tiny muted">{dexNumber(entry.no)}</span>
          <span className="rarity">◆ {rar.label}</span>
        </div>
        <div className="word">{word.es}</div>
        <div style={{ fontSize: '1.1rem', marginBottom: 12 }}>{word.de}</div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <SpeakButton text={word.es} />
          <SpeakButton text={word.es} slow />
        </div>
        <div style={{ marginTop: 10 }}>
          <RegionalNote note={word.note} />
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div className="stat-box">
          <Gems n={m} of={4} />
          <div className="serif" style={{ fontWeight: 600, marginTop: 6 }}>
            {MASTERY[m]}
          </div>
          <div className="lbl">{MASTERY_DE[m]}</div>
        </div>
        <div className="stat-box">
          <div className="num">{card ? (card.interval === 0 ? 'heute' : `${card.interval} T`) : '–'}</div>
          <div className="lbl">nächste Wiederholung in · {card?.reps ?? 0}× richtig</div>
        </div>
      </div>

      {examples.length > 0 && (
        <div className="card">
          <div className="kicker">Ejemplos</div>
          <div className="list">
            {examples.map((p) => (
              <div key={p.es} className="row">
                <SpeakButton text={p.es} />
                <div>
                  <div className="es">{p.es}</div>
                  <div className="small muted">{p.de}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lesson && (
        <Link to={`/mision/${lesson.id}`} className="card card-link">
          <div className="kicker">Gefunden in</div>
          <div className="serif" style={{ fontWeight: 600 }}>
            {lesson.emoji} {lesson.title}
          </div>
          <div className="tiny muted">
            {REGIONS[word.level].place} · Etapa „{unitTitle(lesson.unitId)}“
          </div>
        </Link>
      )}

      <div className="row" style={{ justifyContent: 'space-between' }}>
        {prev ? (
          <Link to={`/dex/${prev.no}`} className="btn ghost small">
            ← {dexNumber(prev.no)}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/dex/${next.no}`} className="btn ghost small">
            {dexNumber(next.no)} →
          </Link>
        )}
      </div>
    </div>
  );
}
