/** Hand-drawn line icon set (24×24, stroke-based) so the UI doesn't rely on emoji. */

const PATHS: Record<string, string> = {
  plaza: 'M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6M12 5V2.5',
  mapa: 'M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Zm0 0v13m6-10.5v13',
  dex: 'M5 3.5h11a3 3 0 0 1 3 3V20.5H8a3 3 0 0 1-3-3v-14Zm0 14a3 3 0 0 1 3-3h11M9.5 8h5M9.5 11h3',
  tertulia: 'M4 5.5h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3.5v-3.5H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Zm15 4h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v3l-3.5-3H12',
  arena: 'M7 4h10v4a5 5 0 0 1-10 0V4Zm0 2H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 13v4m-4 3.5h8M9.5 17h5',
  mas: 'M4 7h16M4 12h16M4 17h10',
  codice: 'M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Zm0 0v13',
  verbos: 'M4 18 9 6l5 12M5.8 14h6.4M15 9.5h5M15 13h4M15 16.5h5',
  buscar: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4.5 4.5',
  maleta: 'M4 8h16v11H4V8Zm5 0V5.5h6V8M4 12.5h16M9.5 12.5v2M14.5 12.5v2',
  mascaras: 'M4 5h8v6a4 4 0 0 1-8 0V5Zm8 4h8v6a4 4 0 0 1-8 0M6.5 9h.01M9.5 9h.01M14.5 13h.01M17.5 13h.01M6.5 12.5c.8.6 2.2.6 3 0M15 17c.8-.6 2.2-.6 3 0',
  globo: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z',
  medalla: 'M8 3h8l-2 6h-4L8 3Zm4 18a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm0-7.5.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3.9-1.8Z',
  grafica: 'M4 20V4m0 16h16M8 16v-4m4 4V8m4 8v-6',
  ajustes: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7.6 7.6 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7.6 7.6 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.07-.4.1-.8.1-1.2Z',
  tienda: 'M4 9.5 5.5 4h13L20 9.5M4 9.5h16M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5 12v8h14v-8M10 20v-5h4v5',
  racha: 'M12 21c3.9 0 6.5-2.6 6.5-6.3 0-3.2-2.2-5.4-3.6-7.2-.4 1.7-1.2 2.7-2.4 3.1C12.9 7.5 11.5 5 9 3c.2 3.6-3.5 6.2-3.5 11.1C5.5 18 8.1 21 12 21Z',
  energia: 'M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z',
  real: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12.5v9M14.8 9.2c-.5-.8-1.5-1.2-2.8-1.2-1.6 0-2.7.8-2.7 1.9 0 2.6 5.6 1.4 5.6 4.2 0 1.1-1.2 1.9-2.9 1.9-1.4 0-2.5-.5-3-1.3',
  rango: 'M12 3 4 7v5c0 4.4 3.4 8 8 9 4.6-1 8-4.6 8-9V7l-8-4Zm0 5 1.2 2.5 2.8.4-2 2 .5 2.7L12 14.3l-2.5 1.3.5-2.7-2-2 2.8-.4L12 8Z',
  volumen: 'M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5Zm11 0a3.5 3.5 0 0 1 0 5m2.5-8a7 7 0 0 1 0 11',
  lento: 'M3 15.5c0-3.6 3-6.5 7-6.5s7 2.9 7 6.5H3Zm14-1h1.5a2 2 0 0 0 0-4H17M6 15.5V18m8-2.5V18M8.5 9 10 6',
  mic: 'M12 15a3.5 3.5 0 0 0 3.5-3.5v-5a3.5 3.5 0 1 0-7 0v5A3.5 3.5 0 0 0 12 15Zm-6.5-4a6.5 6.5 0 0 0 13 0M12 17.5V21',
  cerrar: 'M6 6l12 12M18 6 6 18',
  flecha: 'M5 12h14m-5-5 5 5-5 5',
  atras: 'M19 12H5m5 5-5-5 5-5',
  check: 'M5 12.5 10 17.5 19.5 7',
  candado: 'M6.5 11h11v9.5h-11V11Zm2.5 0V8a3 3 0 0 1 6 0v3',
  mas_add: 'M12 5v14M5 12h14',
  papelera: 'M5 7h14M10 7V4.5h4V7M6.5 7l1 13h9l1-13M10 10.5v6M14 10.5v6',
  tarjetas: 'M7 4h12v14H7V4Zm-2 3v14h12',
  repetir: 'M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5',
  atajo: 'M5 19 19 5M10 5h9v9',
  play: 'M7 4.5v15l12-7.5-12-7.5Z',
  stop: 'M6.5 6.5h11v11h-11z',
  ojo: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  brujula: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z',
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 22,
  stroke = 1.6,
  className,
  title,
}: {
  name: IconName | string;
  size?: number;
  stroke?: number;
  className?: string;
  title?: string;
}) {
  const d = PATHS[name] ?? PATHS.brujula;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <path d={d} />
    </svg>
  );
}
