import type { GrammarTopic } from '../types';

export const GRAMMAR_ADVANCED: GrammarTopic[] = [
  {
    id: 'futuro',
    level: 'B1',
    title: 'Futuro simple',
    emoji: '🔭',
    summary: 'Hablaré, tendré – Zukunft und Vermutungen.',
    sections: [
      {
        heading: 'Bildung',
        text: 'Ganz einfach: **Infinitiv + Endung** (é, ás, á, emos, éis, án) – für alle drei Gruppen gleich.',
        table: [
          ['', 'hablar'],
          ['yo', 'hablaré'],
          ['tú', 'hablarás'],
          ['él/ella', 'hablará'],
          ['nosotros', 'hablaremos'],
          ['vosotros', 'hablaréis'],
          ['ellos', 'hablarán'],
        ],
      },
      {
        heading: 'Unregelmäßige Stämme',
        text: 'tener → **tendr**é, poder → **podr**é, salir → **saldr**é, venir → **vendr**é, poner → **pondr**é, hacer → **har**é, decir → **dir**é, saber → **sabr**é, querer → **querr**é, haber → **habr**á.',
      },
      {
        heading: 'Vermutungen',
        text: 'Das Futur drückt auch aus, was **wahrscheinlich gerade** so ist.',
        examples: [
          ['¿Dónde está Ana? – Estará en casa.', 'Wo ist Ana? – Sie ist wohl zu Hause.'],
          ['Tendrá unos cuarenta años.', 'Er ist wohl um die vierzig.'],
        ],
      },
    ],
    exercises: [
      { q: 'Mañana ___ sol. (hacer)', options: ['hacerá', 'hará', 'hace'], answer: 1 },
      { q: 'El año que viene ___ a Chile. (ir, nosotros)', options: ['iremos', 'vamos a', 'iríamos'], answer: 0 },
      { q: 'No ___ tiempo. (tener, yo)', options: ['teneré', 'tendré', 'tenré'], answer: 1 },
      { q: '¿Qué hora es? – ___ las cinco.', options: ['Serán', 'Son siendo', 'Fueron'], answer: 0, explain: 'Vermutung → Futur' },
      { q: '¿Me lo ___? (decir, tú)', options: ['decirás', 'dirás', 'dices'], answer: 1 },
    ],
  },
  {
    id: 'condicional',
    level: 'B1',
    title: 'Condicional',
    emoji: '💡',
    summary: 'Me gustaría, podrías, yo que tú… – höflich und hypothetisch.',
    sections: [
      {
        heading: 'Bildung',
        text: '**Infinitiv + ía, ías, ía, íamos, íais, ían**. Die unregelmäßigen Stämme sind dieselben wie im Futur: tendría, podría, haría, diría …',
        examples: [
          ['Me gustaría viajar a Cuba.', 'Ich würde gern nach Kuba reisen.'],
          ['¿Podrías ayudarme?', 'Könntest du mir helfen?'],
        ],
      },
      {
        heading: 'Verwendung',
        text: '**Wünsche**: me gustaría, me encantaría. **Höfliche Bitten**: ¿Podría…? ¿Le importaría…? **Ratschläge**: Yo que tú… / Deberías… **Hypothesen**: Si tuviera dinero, compraría…',
        examples: [
          ['Yo que tú, no lo haría.', 'An deiner Stelle würde ich es nicht tun.'],
          ['¿Le importaría cerrar la ventana?', 'Würde es Ihnen etwas ausmachen, das Fenster zu schließen?'],
        ],
      },
    ],
    exercises: [
      { q: 'Me ___ ir contigo. (gustar)', options: ['gustaría', 'gustará', 'gusta'], answer: 0 },
      { q: '¿___ abrir la puerta? (poder, tú)', options: ['Poderías', 'Podrías', 'Puedrías'], answer: 1 },
      { q: 'Yo que tú, ___ con él. (hablar)', options: ['hablaré', 'hablaría', 'hable'], answer: 1 },
      { q: 'Yo no ___ eso. (hacer)', options: ['hacería', 'haría', 'haré'], answer: 1 },
    ],
  },
  {
    id: 'imperativo',
    level: 'B1',
    title: 'Imperativ',
    emoji: '📣',
    summary: '¡Ven! ¡Dime! ¡No te preocupes! – Aufforderungen.',
    sections: [
      {
        heading: 'Bejahter Imperativ (tú)',
        text: 'Die **tú**-Form entspricht der 3. Person Präsens: habla, come, escribe. Unregelmäßig: **ven** (venir), **ten** (tener), **pon** (poner), **sal** (salir), **haz** (hacer), **di** (decir), **ve** (ir), **sé** (ser).',
        examples: [
          ['¡Habla más alto!', 'Sprich lauter!'],
          ['Ven aquí.', 'Komm her.'],
          ['Haz los deberes.', 'Mach die Hausaufgaben.'],
        ],
      },
      {
        heading: 'usted, ustedes, vosotros',
        text: '**usted/ustedes** nehmen die Formen des Subjuntivo: hable, coma, venga. **vosotros**: Infinitiv -r → -d: hablad, comed, venid.',
        examples: [
          ['Pase, por favor.', 'Kommen Sie herein, bitte.'],
          ['¡Venid a cenar!', 'Kommt zum Abendessen!'],
        ],
      },
      {
        heading: 'Verneinter Imperativ & Pronomen',
        text: 'Verneint nimmt man **immer den Subjuntivo**: no hables, no comas, no vengas. Pronomen werden beim bejahten Imperativ **angehängt**, beim verneinten stehen sie **davor**.',
        examples: [
          ['Dímelo. – No me lo digas.', 'Sag es mir. – Sag es mir nicht.'],
          ['¡No te preocupes!', 'Mach dir keine Sorgen!'],
          ['Siéntate.', 'Setz dich.'],
        ],
      },
    ],
    exercises: [
      { q: '¡___ aquí! (venir, tú)', options: ['Viene', 'Ven', 'Vienes'], answer: 1 },
      { q: '___ la verdad. (decir, tú)', options: ['Di', 'Dice', 'Diga'], answer: 0 },
      { q: 'No ___ eso. (hacer, tú)', options: ['haz', 'hagas', 'haces'], answer: 1, explain: 'Verneint → Subjuntivo' },
      { q: '___, por favor. (pasar, usted)', options: ['Pasa', 'Pase', 'Pasad'], answer: 1 },
      { q: '¡No ___ preocupes!', options: ['te', 'tú', 'se'], answer: 0 },
      { q: 'El libro: ¡___! (dar → mir, tú)', options: ['Dámelo', 'Me lo da', 'Dalo me'], answer: 0 },
    ],
  },
  {
    id: 'subjuntivo',
    level: 'B1',
    title: 'Subjuntivo – die Grundlagen',
    emoji: '🌈',
    summary: 'Wünsche, Gefühle, Zweifel: espero que vengas.',
    sections: [
      {
        heading: 'Bildung',
        text: 'Nimm die **yo**-Form im Präsens, entferne das -o und hänge die „umgekehrten“ Endungen an: **-ar → -e**, **-er/-ir → -a**.',
        table: [
          ['', 'hablar', 'comer', 'tener (tengo)'],
          ['yo', 'hable', 'coma', 'tenga'],
          ['tú', 'hables', 'comas', 'tengas'],
          ['él/ella', 'hable', 'coma', 'tenga'],
          ['nosotros', 'hablemos', 'comamos', 'tengamos'],
          ['vosotros', 'habléis', 'comáis', 'tengáis'],
          ['ellos', 'hablen', 'coman', 'tengan'],
        ],
      },
      {
        heading: 'Unregelmäßig',
        text: 'ser → **sea**, ir → **vaya**, estar → **esté**, saber → **sepa**, haber → **haya**, dar → **dé**.',
      },
      {
        heading: 'Wann? – W.E.I.R.D.O.',
        text: 'Der Subjuntivo steht im Nebensatz mit **que**, wenn der Hauptsatz ausdrückt: **W**ünsche (quiero que, espero que), **E**motionen (me alegro de que, me molesta que), **I**mpersonales (es importante que), **R**ecomendaciones (te recomiendo que), **D**udas / Zweifel (no creo que, dudo que), **O**jalá.\nWichtig: Nur wenn die Subjekte verschieden sind! Gleiches Subjekt → Infinitiv: Quiero ir. / Quiero que vayas.',
        examples: [
          ['Espero que estés bien.', 'Ich hoffe, dir geht es gut.'],
          ['Es importante que lo sepas.', 'Es ist wichtig, dass du es weißt.'],
          ['¡Ojalá venga!', 'Hoffentlich kommt er!'],
          ['No creo que sea verdad.', 'Ich glaube nicht, dass es stimmt.'],
        ],
      },
    ],
    exercises: [
      { q: 'Espero que ___ bien. (estar, tú)', options: ['estás', 'estés', 'estar'], answer: 1 },
      { q: 'Quiero que ___ conmigo. (venir, tú)', options: ['vienes', 'vengas', 'venir'], answer: 1 },
      { q: 'Quiero ___ al cine. (ir, ich selbst)', options: ['que vaya', 'ir', 'voy'], answer: 1, explain: 'Gleiches Subjekt → Infinitiv' },
      { q: 'Creo que ___ razón. (tener, tú)', options: ['tienes', 'tengas'], answer: 0, explain: 'creo que → Indikativ' },
      { q: 'No creo que ___ razón. (tener, tú)', options: ['tienes', 'tengas'], answer: 1, explain: 'no creo que → Subjuntivo' },
      { q: '¡Ojalá ___ buen tiempo! (hacer)', options: ['hace', 'haga', 'hará'], answer: 1 },
      { q: 'Es importante que ___ agua. (beber, vosotros)', options: ['bebéis', 'bebáis', 'bebed'], answer: 1 },
    ],
  },
  {
    id: 'subjuntivo-conjunciones',
    level: 'B1',
    title: 'Subjuntivo nach cuando, para que …',
    emoji: '🔗',
    summary: 'Cuando llegues, para que lo sepas, antes de que …',
    sections: [
      {
        heading: 'Cuando + Zukunft',
        text: 'Bezieht sich **cuando** (wenn/sobald) auf die Zukunft, folgt der Subjuntivo. Bei Gewohnheiten oder Vergangenheit der Indikativ. Genauso: **en cuanto** (sobald), **hasta que** (bis), **mientras** (solange).',
        examples: [
          ['Cuando llegues, llámame.', 'Wenn du ankommst, ruf mich an.'],
          ['Cuando llego a casa, me ducho.', 'Wenn ich heimkomme, dusche ich (immer).'],
          ['Espera hasta que vuelva.', 'Warte, bis ich zurückkomme.'],
        ],
      },
      {
        heading: 'Immer Subjuntivo',
        text: '**para que** (damit), **antes de que** (bevor), **sin que** (ohne dass), **a no ser que** (es sei denn), **en caso de que** (falls).',
        examples: [
          ['Te lo explico para que lo entiendas.', 'Ich erkläre es dir, damit du es verstehst.'],
          ['Vámonos antes de que llueva.', 'Lass uns gehen, bevor es regnet.'],
        ],
      },
    ],
    exercises: [
      { q: 'Cuando ___ dinero, me compraré un coche. (tener)', options: ['tengo', 'tenga', 'tendré'], answer: 1 },
      { q: 'Cuando ___ pequeño, vivía en Lima. (ser)', options: ['era', 'sea', 'fuera'], answer: 0, explain: 'Vergangenheit → Indikativ' },
      { q: 'Te llamo para que ___. (saberlo, tú)', options: ['lo sabes', 'lo sepas', 'saberlo'], answer: 1 },
      { q: 'Salgamos antes de que ___ de noche. (ser)', options: ['es', 'sea', 'será'], answer: 1 },
      { q: 'En cuanto ___, te aviso. (terminar, yo)', options: ['termine', 'termino', 'terminaré'], answer: 0 },
    ],
  },
  {
    id: 'pasados',
    level: 'B1',
    title: 'Erzählen: die Vergangenheitszeiten im Zusammenspiel',
    emoji: '🧵',
    summary: 'Indefinido, Imperfecto und Pluscuamperfecto kombinieren.',
    sections: [
      {
        heading: 'Pluscuamperfecto',
        text: '**había, habías, había, habíamos, habíais, habían** + Partizip. Für etwas, das **vor** einem anderen Ereignis in der Vergangenheit passiert ist (Vorvergangenheit).',
        examples: [
          ['Cuando llegué, la película ya había empezado.', 'Als ich ankam, hatte der Film schon angefangen.'],
          ['Nunca había visto algo así.', 'So etwas hatte ich noch nie gesehen.'],
        ],
      },
      {
        heading: 'Das Bühnenbild-Prinzip',
        text: 'Stell dir eine Bühne vor: Das **Imperfecto** ist die Kulisse (Wetter, Uhrzeit, Gefühle, was gerade lief). Das **Indefinido** sind die Aktionen der Schauspieler. Das **Pluscuamperfecto** erzählt, was vor der Szene geschah.',
        examples: [
          ['Era tarde y llovía. De repente, alguien llamó a la puerta.', 'Es war spät und regnete. Plötzlich klopfte jemand an die Tür.'],
          ['Estaba nerviosa porque no había dormido.', 'Sie war nervös, weil sie nicht geschlafen hatte.'],
        ],
      },
    ],
    exercises: [
      { q: 'Cuando llegamos, el tren ya ___. (salir)', options: ['salió', 'había salido', 'salía'], answer: 1 },
      { q: '___ las diez cuando me llamó. (ser)', options: ['Fueron', 'Eran', 'Habían sido'], answer: 1, explain: 'Uhrzeit als Hintergrund → Imperfecto' },
      { q: 'Mientras cocinaba, ___ la luz. (irse)', options: ['se iba', 'se fue', 'se había ido'], answer: 1 },
      { q: 'Nunca ___ en Asia antes de ese viaje. (estar, yo)', options: ['estuve', 'había estado', 'estaba'], answer: 1 },
    ],
  },
  {
    id: 'si-condicional',
    level: 'B2',
    title: 'Bedingungssätze (si …)',
    emoji: '🎲',
    summary: 'Real, möglich, irreal: si tengo, si tuviera, si hubiera tenido.',
    sections: [
      {
        heading: 'Die drei Typen',
        table: [
          ['Typ', 'si-Satz', 'Hauptsatz'],
          ['real', 'si + Präsens', 'Präsens / Futur / Imperativ'],
          ['irreal (Gegenwart)', 'si + Subj. imperfecto', 'Condicional'],
          ['irreal (Vergangenheit)', 'si + Subj. pluscuamperfecto', 'Condicional compuesto'],
        ],
        text: 'Nach **si** steht nie das Futur, Konditional oder der Subjuntivo Präsens!',
        examples: [
          ['Si tengo tiempo, te llamo.', 'Wenn ich Zeit habe, rufe ich dich an.'],
          ['Si tuviera tiempo, te llamaría.', 'Wenn ich Zeit hätte, würde ich dich anrufen.'],
          ['Si hubiera tenido tiempo, te habría llamado.', 'Wenn ich Zeit gehabt hätte, hätte ich dich angerufen.'],
        ],
      },
      {
        heading: 'Subjuntivo imperfecto',
        text: 'Nimm die **ellos**-Form des Indefinido, entferne **-ron** und hänge **-ra, -ras, -ra, -ramos, -rais, -ran** an.\ntuvieron → **tuviera**, fueron → **fuera**, pudieron → **pudiera**, hicieron → **hiciera**, hablaron → **hablara**.',
        examples: [
          ['Si fuera rico, viajaría por el mundo.', 'Wenn ich reich wäre, würde ich um die Welt reisen.'],
          ['Si pudiera, me quedaría.', 'Wenn ich könnte, würde ich bleiben.'],
        ],
      },
    ],
    exercises: [
      { q: 'Si ___ dinero, compraría una casa. (tener)', options: ['tengo', 'tendría', 'tuviera'], answer: 2 },
      { q: 'Si llueve, ___ en casa. (quedarse, nosotros)', options: ['nos quedamos', 'nos quedaríamos', 'nos quedáramos'], answer: 0 },
      { q: 'Si fuera tú, no lo ___. (hacer)', options: ['hago', 'haría', 'hiciera'], answer: 1 },
      { q: 'Si ___ sabido, te lo habría dicho.', options: ['habría', 'hubiera', 'había'], answer: 1 },
      { q: 'Si ___ más alto, jugaría al baloncesto. (ser)', options: ['sería', 'fuera', 'soy'], answer: 1 },
    ],
  },
  {
    id: 'estilo-indirecto',
    level: 'B2',
    title: 'Indirekte Rede',
    emoji: '🗨️',
    summary: 'Dice que…, me dijo que… – was andere gesagt haben.',
    sections: [
      {
        heading: 'Im Präsens eingeleitet',
        text: 'Mit **dice que** bleibt die Zeit gleich, nur Personen und Pronomen ändern sich.',
        examples: [['„Estoy cansado.“ → Dice que está cansado.', '„Ich bin müde.“ → Er sagt, er ist müde.']],
      },
      {
        heading: 'In der Vergangenheit eingeleitet',
        text: 'Mit **dijo que** verschieben sich die Zeiten: Präsens → Imperfecto, Indefinido/Perfecto → Pluscuamperfecto, Futur → Condicional, Imperativ → Subj. imperfecto.',
        table: [
          ['direkt', 'indirekt (dijo que…)'],
          ['„Vivo en Lima.“', 'vivía en Lima'],
          ['„Fui al médico.“', 'había ido al médico'],
          ['„Te llamaré.“', 'me llamaría'],
          ['„¡Ven!“', 'que fuera'],
        ],
      },
    ],
    exercises: [
      { q: '„Tengo hambre.“ → Dice que ___ hambre.', options: ['tengo', 'tiene', 'tenía'], answer: 1 },
      { q: '„Tengo hambre.“ → Dijo que ___ hambre.', options: ['tiene', 'tenía', 'tuviera'], answer: 1 },
      { q: '„Vendré mañana.“ → Dijo que ___ al día siguiente.', options: ['vendrá', 'vendría', 'venía'], answer: 1 },
      { q: '„¡Llámame!“ → Me pidió que la ___.', options: ['llamo', 'llamara', 'llamaría'], answer: 1 },
    ],
  },
  {
    id: 'conectores',
    level: 'B2',
    title: 'Konnektoren',
    emoji: '🧱',
    summary: 'Texte und Argumente elegant verbinden.',
    sections: [
      {
        heading: 'Nach Funktion',
        table: [
          ['Funktion', 'Konnektoren'],
          ['hinzufügen', 'además, también, incluso, encima (umg.)'],
          ['Gegensatz', 'pero, sin embargo, no obstante, en cambio, aunque'],
          ['Grund', 'porque, ya que, puesto que, como (am Satzanfang)'],
          ['Folge', 'así que, por lo tanto, por eso, de modo que'],
          ['ordnen', 'en primer lugar, por un lado / por otro, finalmente'],
          ['zusammenfassen', 'en resumen, en definitiva, total (umg.)'],
        ],
        text: '„Como“ für Gründe steht immer am Satzanfang: **Como** llovía, nos quedamos en casa.',
        examples: [
          ['Como no tenía dinero, no fui.', 'Da ich kein Geld hatte, bin ich nicht gegangen.'],
          ['Es caro; sin embargo, vale la pena.', 'Es ist teuer; trotzdem lohnt es sich.'],
          ['Llegué tarde y encima sin regalo.', 'Ich kam zu spät und obendrein ohne Geschenk.'],
        ],
      },
    ],
    exercises: [
      { q: '___ estaba cansado, me acosté pronto.', options: ['Porque', 'Como', 'Así que'], answer: 1 },
      { q: 'No estudió; ___, suspendió.', options: ['por lo tanto', 'sin embargo', 'aunque'], answer: 0 },
      { q: 'Es barato; ___, la calidad es mala.', options: ['además', 'en cambio', 'por eso'], answer: 1 },
      { q: 'Me encanta el pueblo, ___ está lejos.', options: ['aunque', 'como', 'por lo tanto'], answer: 0 },
    ],
  },
  {
    id: 'relativos',
    level: 'B2',
    title: 'Relativsätze',
    emoji: '🪢',
    summary: 'que, quien, donde, lo que, el que …',
    sections: [
      {
        heading: 'Die wichtigsten Relativpronomen',
        text: '**que** – das häufigste, für Personen und Sachen. **donde** – für Orte. **lo que** – „was“ (bezieht sich auf einen ganzen Satz). **quien** – für Personen nach Präpositionen. **el/la que** – nach Präpositionen.',
        examples: [
          ['El chico que vive enfrente es actor.', 'Der Junge, der gegenüber wohnt, ist Schauspieler.'],
          ['La ciudad donde nací es pequeña.', 'Die Stadt, in der ich geboren bin, ist klein.'],
          ['No entiendo lo que dices.', 'Ich verstehe nicht, was du sagst.'],
          ['La amiga con quien viajé…', 'Die Freundin, mit der ich gereist bin …'],
        ],
      },
      {
        heading: 'Relativsatz mit Subjuntivo',
        text: 'Wenn das Bezugswort **unbekannt oder nicht existent** ist, folgt der Subjuntivo.',
        examples: [
          ['Busco un piso que tenga terraza.', 'Ich suche eine Wohnung, die eine Terrasse hat (egal welche).'],
          ['No conozco a nadie que hable chino.', 'Ich kenne niemanden, der Chinesisch spricht.'],
        ],
      },
    ],
    exercises: [
      { q: 'El libro ___ me regalaste es genial.', options: ['que', 'lo que', 'donde'], answer: 0 },
      { q: 'Haz ___ quieras.', options: ['que', 'lo que', 'el que'], answer: 1 },
      { q: 'El bar ___ nos conocimos ha cerrado.', options: ['que', 'donde', 'quien'], answer: 1 },
      { q: 'Busco a alguien que ___ alemán. (hablar)', options: ['habla', 'hable'], answer: 1 },
      { q: 'Tengo un amigo que ___ en Bogotá. (vivir)', options: ['vive', 'viva'], answer: 0, explain: 'Bekannte, existierende Person → Indikativ' },
    ],
  },
  {
    id: 'se-impersonal',
    level: 'B2',
    title: 'Se unpersönlich & Passiv',
    emoji: '👥',
    summary: 'Se habla español, se venden pisos – „man“ auf Spanisch.',
    sections: [
      {
        heading: 'Se = man',
        text: 'Mit **se** + 3. Person drückt man allgemeine Aussagen aus. Bei einem Nomen in der Mehrzahl steht das Verb in der Mehrzahl (passives se).',
        examples: [
          ['Aquí se come muy bien.', 'Hier isst man sehr gut.'],
          ['Se habla español.', 'Hier wird Spanisch gesprochen.'],
          ['Se alquilan habitaciones.', 'Zimmer zu vermieten.'],
          ['¿Cómo se dice „Kuchen“?', 'Wie sagt man „Kuchen“?'],
        ],
      },
      {
        heading: 'Alternativen',
        text: 'Im Alltag benutzt man auch die **3. Person Plural** (Dicen que va a llover = Man sagt …) oder **uno** (Uno nunca sabe = Man weiß nie). Das echte Passiv mit **ser + Partizip** ist eher schriftlich: El museo fue construido en 1900.',
      },
    ],
    exercises: [
      { q: 'En este restaurante ___ muy bien.', options: ['se come', 'se comen', 'come'], answer: 0 },
      { q: '___ pisos en el centro.', options: ['Se vende', 'Se venden', 'Venden se'], answer: 1 },
      { q: '¿Cómo ___ „Danke“ en español?', options: ['se dice', 'dice', 'se dicen'], answer: 0 },
      { q: 'La catedral ___ en el siglo XV.', options: ['fue construida', 'fue construido', 'se construyeron'], answer: 0 },
    ],
  },
];
