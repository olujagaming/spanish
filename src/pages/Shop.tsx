import { useState } from 'react';
import { setState, useAppState } from '../lib/store';
import { available, buyDecoration, decoById, DECORATIONS, placeDecoration, type DecoShape } from '../lib/progression';
import { Plaza, DecoGraphic } from '../components/Plaza';
import { BackLink, PageHead } from '../components/ui';
import { Icon } from '../components/Icon';
import { playSound } from '../lib/sound';

function Preview({ shape }: { shape: DecoShape }) {
  return (
    <svg className="deco-preview" viewBox="-30 -50 60 60" aria-hidden="true">
      <DecoGraphic shape={shape} x={0} y={0} />
    </svg>
  );
}

export default function Shop() {
  const s = useAppState();
  const [slot, setSlot] = useState<string | null>(null);
  const owned = DECORATIONS.filter((d) => (s.inventory[d.id] ?? 0) > 0);
  const inSlot = slot ? s.plaza[slot] : undefined;

  return (
    <div>
      <BackLink to="/" label="Plaza" />
      <PageHead kicker="Tienda" icon="tienda" title="Gestalte deine Plaza">
        Mit jeder XP verdienst du einen <strong>Real</strong>. Kaufe Dekorationen und stelle sie auf die freien Plätze rund um den Brunnen.
      </PageHead>

      <div className="row" style={{ marginBottom: 10 }}>
        <span className="stat-pill">
          <Icon name="real" size={15} /> {s.reales} Reales
        </span>
        <span className="small muted">Tippe einen Platz auf der Plaza an, um etwas hinzustellen.</span>
      </div>

      <Plaza state={s} editing selectedSlot={slot} onSlot={(id) => setSlot(id === slot ? null : id)} />

      {slot && (
        <div className="card gold pop">
          <div className="row" style={{ marginBottom: 10 }}>
            <div className="spacer">
              <div className="kicker">Platz gewählt</div>
              <div className="small muted">
                {inSlot ? `Hier steht: ${decoById(inSlot)?.name}` : 'Leerer Platz – wähle eine Dekoration aus deinem Besitz.'}
              </div>
            </div>
            <button type="button" className="icon-btn" onClick={() => setSlot(null)} aria-label="Schließen">
              <Icon name="cerrar" size={18} />
            </button>
          </div>
          {owned.length === 0 ? (
            <p className="small muted" style={{ margin: 0 }}>
              Du besitzt noch keine Dekoration. Kaufe unten etwas!
            </p>
          ) : (
            <div className="chips">
              {owned.map((d) => {
                const free = available(s, d.id) + (inSlot === d.id ? 1 : 0);
                return (
                  <button
                    key={d.id}
                    type="button"
                    className={`chip ${inSlot === d.id ? 'active' : ''}`}
                    disabled={free <= 0}
                    style={{ opacity: free <= 0 ? 0.4 : 1 }}
                    onClick={() => {
                      setState((cur) => placeDecoration(cur, slot, d.id));
                      playSound('tap');
                    }}
                  >
                    {d.name} · {free}
                  </button>
                );
              })}
              {inSlot && (
                <button type="button" className="chip" onClick={() => setState((cur) => placeDecoration(cur, slot, null))}>
                  Entfernen
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="section-title">
        <h2>Dekorationen</h2>
      </div>
      <div className="grid-2 wide-3">
        {DECORATIONS.map((d) => {
          const can = s.reales >= d.price;
          const count = s.inventory[d.id] ?? 0;
          return (
            <div key={d.id} className="shop-item">
              <Preview shape={d.id} />
              <div className="serif" style={{ fontWeight: 600 }}>
                {d.name}
              </div>
              <div className="tiny muted">{d.de}</div>
              {count > 0 && <div className="tiny" style={{ color: 'var(--jade)' }}>im Besitz: {count}</div>}
              <button
                type="button"
                className="btn small block"
                disabled={!can}
                onClick={() => {
                  setState((cur) => buyDecoration(cur, d.id));
                  playSound('good');
                }}
              >
                <Icon name="real" size={14} /> {d.price}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
