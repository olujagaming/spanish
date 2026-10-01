import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { VERBS } from '../content/verbs';
import { conjugate, gerund, IMPERATIVE_PERSONS, participle, PERSONS, TENSES, type Tense } from '../lib/conjugate';
import { BackLink, SpeakButton } from '../components/ui';
import { speak } from '../lib/speech';

export default function VerbPage() {
  const { inf = '' } = useParams();
  const v = VERBS.find((x) => x.inf === decodeURIComponent(inf));
  const [tense, setTense] = useState<Tense>('presente');
  if (!v) return <BackLink to="/verben" />;
  const forms = conjugate(v, tense);
  const persons = tense === 'imperativo' ? IMPERATIVE_PERSONS : PERSONS;
  const info = TENSES.find((t) => t.id === tense)!;
  const imperativeEmpty = tense === 'imperativo' && forms.length === 0;

  return (
    <div>
      <BackLink to="/verben" label="Verben" />
      <div className="row">
        <SpeakButton text={v.inf} />
        <div>
          <h1 style={{ margin: 0 }}>{v.inf}</h1>
          <div className="muted">{v.de}</div>
        </div>
      </div>
      <p className="small muted" style={{ marginTop: 8 }}>
        Partizip: <strong>{participle(v)}</strong> · Gerundium: <strong>{gerund(v)}</strong>
      </p>
      <div className="chips" style={{ marginBottom: 12 }}>
        {TENSES.map((t) => (
          <button key={t.id} type="button" className={`chip ${tense === t.id ? 'active' : ''}`} onClick={() => setTense(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <p className="small">
        <strong>{info.label}</strong> – {info.de} <span className="badge">ab {info.level}</span>
      </p>
      {imperativeEmpty ? (
        <p className="muted">Für reflexive Verben zeigen wir den Imperativ hier nicht (z. B. levántate, siéntate – das Pronomen wird angehängt).</p>
      ) : (
        <div className="table-wrap">
          <table className="conj">
            <tbody>
              {forms.map((f, i) =>
                f === '—' ? null : (
                  <tr key={i} onClick={() => speak(`${persons[i].split('/')[0]} ${f}`)} style={{ cursor: 'pointer' }}>
                    <td>{persons[i]}</td>
                    <td className="es">{f}</td>
                    <td style={{ width: 30 }}>🔊</td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="tiny muted">Tippe auf eine Zeile, um sie zu hören.</p>
    </div>
  );
}
