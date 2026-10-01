import { describe, expect, it } from 'vitest';
import { conjugate, gerund, participle, type Tense } from './conjugate';
import { VERBS } from '../content/verbs';

const verb = (inf: string) => {
  const v = VERBS.find((x) => x.inf === inf);
  if (!v) throw new Error(`missing verb ${inf}`);
  return v;
};

const cases: [string, Tense, string[]][] = [
  ['hablar', 'presente', ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan']],
  ['comer', 'indefinido', ['comí', 'comiste', 'comió', 'comimos', 'comisteis', 'comieron']],
  ['vivir', 'imperfecto', ['vivía', 'vivías', 'vivía', 'vivíamos', 'vivíais', 'vivían']],
  ['tener', 'presente', ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen']],
  ['tener', 'indefinido', ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron']],
  ['tener', 'futuro', ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán']],
  ['hacer', 'indefinido', ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron']],
  ['decir', 'presente', ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen']],
  ['decir', 'indefinido', ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron']],
  ['poder', 'presente', ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden']],
  ['pensar', 'subjuntivo', ['piense', 'pienses', 'piense', 'pensemos', 'penséis', 'piensen']],
  ['dormir', 'subjuntivo', ['duerma', 'duermas', 'duerma', 'durmamos', 'durmáis', 'duerman']],
  ['dormir', 'indefinido', ['dormí', 'dormiste', 'durmió', 'dormimos', 'dormisteis', 'durmieron']],
  ['pedir', 'presente', ['pido', 'pides', 'pide', 'pedimos', 'pedís', 'piden']],
  ['pedir', 'subjuntivo', ['pida', 'pidas', 'pida', 'pidamos', 'pidáis', 'pidan']],
  ['seguir', 'presente', ['sigo', 'sigues', 'sigue', 'seguimos', 'seguís', 'siguen']],
  ['jugar', 'presente', ['juego', 'juegas', 'juega', 'jugamos', 'jugáis', 'juegan']],
  ['jugar', 'subjuntivo', ['juegue', 'juegues', 'juegue', 'juguemos', 'juguéis', 'jueguen']],
  ['buscar', 'indefinido', ['busqué', 'buscaste', 'buscó', 'buscamos', 'buscasteis', 'buscaron']],
  ['empezar', 'subjuntivo', ['empiece', 'empieces', 'empiece', 'empecemos', 'empecéis', 'empiecen']],
  ['leer', 'indefinido', ['leí', 'leíste', 'leyó', 'leímos', 'leísteis', 'leyeron']],
  ['construir', 'presente', ['construyo', 'construyes', 'construye', 'construimos', 'construís', 'construyen']],
  ['conocer', 'subjuntivo', ['conozca', 'conozcas', 'conozca', 'conozcamos', 'conozcáis', 'conozcan']],
  ['elegir', 'presente', ['elijo', 'eliges', 'elige', 'elegimos', 'elegís', 'eligen']],
  ['levantarse', 'presente', ['me levanto', 'te levantas', 'se levanta', 'nos levantamos', 'os levantáis', 'se levantan']],
  ['vestirse', 'indefinido', ['me vestí', 'te vestiste', 'se vistió', 'nos vestimos', 'os vestisteis', 'se vistieron']],
  ['hablar', 'perfecto', ['he hablado', 'has hablado', 'ha hablado', 'hemos hablado', 'habéis hablado', 'han hablado']],
  ['volver', 'perfecto', ['he vuelto', 'has vuelto', 'ha vuelto', 'hemos vuelto', 'habéis vuelto', 'han vuelto']],
  ['salir', 'condicional', ['saldría', 'saldrías', 'saldría', 'saldríamos', 'saldríais', 'saldrían']],
  ['tener', 'imperativo', ['—', 'ten', 'tenga', 'tengamos', 'tened', 'tengan']],
  ['hablar', 'imperativo', ['—', 'habla', 'hable', 'hablemos', 'hablad', 'hablen']],
  ['traer', 'indefinido', ['traje', 'trajiste', 'trajo', 'trajimos', 'trajisteis', 'trajeron']],
  ['oír', 'indefinido', ['oí', 'oíste', 'oyó', 'oímos', 'oísteis', 'oyeron']],
  ['oír', 'futuro', ['oiré', 'oirás', 'oirá', 'oiremos', 'oiréis', 'oirán']],
  ['caer', 'presente', ['caigo', 'caes', 'cae', 'caemos', 'caéis', 'caen']],
  ['morir', 'indefinido', ['morí', 'moriste', 'murió', 'morimos', 'moristeis', 'murieron']],
  ['pagar', 'subjuntivo', ['pague', 'pagues', 'pague', 'paguemos', 'paguéis', 'paguen']],
];

describe('conjugate', () => {
  it.each(cases)('%s – %s', (inf, tense, forms) => {
    expect(conjugate(verb(inf), tense)).toEqual(forms);
  });

  it('builds participles and gerunds', () => {
    expect(participle(verb('leer'))).toBe('leído');
    expect(participle(verb('hacer'))).toBe('hecho');
    expect(participle(verb('construir'))).toBe('construido');
    expect(gerund(verb('leer'))).toBe('leyendo');
    expect(gerund(verb('dormir'))).toBe('durmiendo');
    expect(gerund(verb('pedir'))).toBe('pidiendo');
    expect(gerund(verb('hablar'))).toBe('hablando');
  });

  it('produces six forms for every verb and tense', () => {
    const tenses: Tense[] = ['presente', 'indefinido', 'imperfecto', 'perfecto', 'futuro', 'condicional', 'subjuntivo'];
    for (const v of VERBS) {
      for (const t of tenses) {
        const forms = conjugate(v, t);
        expect(forms, `${v.inf} ${t}`).toHaveLength(6);
        forms.forEach((f) => expect(f, `${v.inf} ${t}`).toMatch(/^[a-záéíóúüñ /]+$/));
      }
    }
  });
});
