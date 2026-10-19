/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { SYM, LETMINO_LOGO_PATH } from './symbols';

// ===== Configuración =====
const CTA_URL =
  'https://teams.letmino.ai/signup?utm_source=caosometro&utm_medium=matchinteractivo&utm_campaign=teams_lanzamiento_es';

const C = {
  azul: '#4995FF',
  verde: '#64DF65',
  amarillo: '#FFDE3F',
  naranja: '#F56D3E',
};

type SymKey = 'fl' | 'bu' | 'ev' | 'tfh';

function SymSvg({ name }: { name: SymKey }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path fill="#0F0F0F" d={SYM[name]} />
    </svg>
  );
}

interface CardItem {
  id: string;
  area: string;
  text: string;
  aside: string;
  bg: string;
  sym: SymKey;
}

const CARDS: CardItem[] = [
  {
    id: 'prod',
    area: 'Productividad',
    text: 'Hacer reuniones de 15 minutos en vez de una hora',
    aside: 'Y que terminen con decisiones.',
    bg: C.azul,
    sym: 'fl',
  },
  {
    id: 'datos',
    area: 'Análisis de datos',
    text: 'Saber medir e interpretar los datos',
    aside: 'Que no se quede en una tabla de números que nadie entienda.',
    bg: C.amarillo,
    sym: 'tfh',
  },
  {
    id: 'lead',
    area: 'Liderazgo',
    text: 'Dar feedback sin que acabe en drama',
    aside: 'Ni en un hilo de cuarenta mensajes.',
    bg: C.verde,
    sym: 'bu',
  },
  {
    id: 'ia',
    area: 'IA aplicada',
    text: 'Usar la IA para algo más que reescribir correos',
    aside: 'Por ejemplo, para pensar mejor.',
    bg: C.naranja,
    sym: 'ev',
  },
  {
    id: 'comm',
    area: 'Comunicación',
    text: 'Presentar resultados sin cuarenta diapositivas',
    aside: 'Tres ideas claras. Una decisión.',
    bg: C.azul,
    sym: 'fl',
  },
  {
    id: 'fin',
    area: 'Finanzas',
    text: 'Entender las cifras antes de la reunión con finanzas',
    aside: 'Y no después.',
    bg: C.verde,
    sym: 'bu',
  },
];

export default function App() {
  const [step, setStep] = useState<'intro' | 'match' | 'calc' | 'result'>('intro');
  const [mi, setMi] = useState<number>(0);
  const [votes, setVotes] = useState<number[]>([]);
  const [copyStatus, setCopyStatus] = useState<string>('Copiar texto');
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);

  const [gameUrl, setGameUrl] = useState<string>('');

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mainRef = useRef<HTMLElement>(null);
  const shareRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.href.split('?')[0].split('#')[0];
      setGameUrl(cleanUrl);
    }
  }, []);

  // Scroll to top when arriving at result screen
  useEffect(() => {
    if (step === 'result' && mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [step]);

  // Handle calculation screen timer
  useEffect(() => {
    if (step === 'calc') {
      const timer = setTimeout(() => {
        setStep('result');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const resetGame = () => {
    setStep('intro');
    setMi(0);
    setVotes([]);
    setDragOffset({ x: 0, y: 0 });
    setExitDirection(null);
    setCopyStatus('Copiar texto');
  };

  const handleStart = () => {
    setStep('match');
    setMi(0);
    setVotes([]);
    setDragOffset({ x: 0, y: 0 });
    setExitDirection(null);
  };

  const submitVote = (voteValue: number, direction?: 'left' | 'right' | 'up') => {
    if (exitDirection) return;

    const dir = direction || (voteValue === 0 ? 'left' : voteValue === 2 ? 'up' : 'right');
    setExitDirection(dir);

    setTimeout(() => {
      const newVotes = [...votes, voteValue];
      setVotes(newVotes);
      setDragOffset({ x: 0, y: 0 });
      setExitDirection(null);

      if (mi + 1 >= CARDS.length) {
        setStep('calc');
      } else {
        setMi(mi + 1);
      }
    }, 280);
  };

  // Pointer drag gestures for Tinder-style swiping
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (exitDirection) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || exitDirection) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || exitDirection) return;
    setIsDragging(false);

    const { x: dx, y: dy } = dragOffset;
    const threshold = 75;

    if (dy < -80 && Math.abs(dx) < 70) {
      // Swiped UP -> Urgente
      submitVote(2, 'up');
    } else if (dx > threshold) {
      // Swiped RIGHT -> Match
      submitVote(1, 'right');
    } else if (dx < -threshold) {
      // Swiped LEFT -> Ahora no
      submitVote(0, 'left');
    } else {
      // Reset position
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleCopy = () => {
    if (shareRef.current) {
      const t = shareRef.current.textContent || '';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(t)
          .then(() => {
            setCopyStatus('Copiado');
            setTimeout(() => setCopyStatus('Copiar texto'), 1600);
          })
          .catch(() => selectShareText());
      } else {
        selectShareText();
      }
    }
  };

  const selectShareText = () => {
    if (shareRef.current) {
      const range = document.createRange();
      range.selectNodeContents(shareRef.current);
      const s = window.getSelection();
      if (s) {
        s.removeAllRanges();
        s.addRange(range);
      }
    }
  };

  // Results calculation
  const urgentCards = CARDS.filter((_, idx) => votes[idx] === 2);
  const matchCards = CARDS.filter((_, idx) => votes[idx] === 1);
  const selectedCards = [...urgentCards, ...matchCards];
  const displayCards = selectedCards.length > 0 ? selectedCards : CARDS.slice(0, 3);

  const topAreas = Array.from(new Set(displayCards.map((c) => c.area))).slice(0, 3);

  const getChaosDiagnosis = (urgentCount: number) => {
    if (urgentCount === 0) return 'Caos bajo control. Por ahora.';
    if (urgentCount <= 2) return 'Caos moderado. Se nota los lunes.';
    if (urgentCount <= 4) return 'Caos alto. Hay prioridades esperando turno.';
    return 'Caos máximo. Todo es para ayer.';
  };

  const formatAreas = (areas: string[]) => {
    if (areas.length === 0) return 'Productividad, Análisis de datos y Finanzas';
    if (areas.length === 1) return areas[0];
    if (areas.length === 2) return `${areas[0]} y ${areas[1]}`;
    return `${areas.slice(0, -1).join(', ')} y ${areas[areas.length - 1]}`;
  };

  const shareLink =
    gameUrl || (typeof window !== 'undefined' ? window.location.href.split('?')[0].split('#')[0] : 'https://caosometro.letmino.ai');
  const shareContent = `Nuestro match en el Caosómetro de Letmino: ${formatAreas(
    topAreas
  )}. ¿Y el de tu equipo? Descúbrelo en 1 minuto: ${shareLink}`;

  // Render progress segments
  const renderSegs = () => {
    return (
      <div className="segs" aria-hidden="true">
        {CARDS.map((_, idx) => (
          <span
            key={idx}
            style={idx <= mi ? { background: CARDS[mi]?.bg || C.azul } : undefined}
          />
        ))}
      </div>
    );
  };

  // Card transform styles
  const getCardStyle = () => {
    if (exitDirection === 'left') {
      return {
        transform: 'translate(-140%, 20px) rotate(-28deg)',
        opacity: 0,
        transition: 'transform 0.28s ease-in, opacity 0.28s ease-in',
      };
    }
    if (exitDirection === 'right') {
      return {
        transform: 'translate(140%, 20px) rotate(28deg)',
        opacity: 0,
        transition: 'transform 0.28s ease-in, opacity 0.28s ease-in',
      };
    }
    if (exitDirection === 'up') {
      return {
        transform: 'translate(0px, -150%) scale(0.9)',
        opacity: 0,
        transition: 'transform 0.28s ease-in, opacity 0.28s ease-in',
      };
    }
    if (isDragging) {
      const rot = dragOffset.x * 0.08;
      return {
        transform: `translate(${dragOffset.x}px, ${dragOffset.y * 0.4}px) rotate(${rot}deg)`,
        transition: 'none',
      };
    }
    return {
      transform: 'translate(0px, 0px) rotate(0deg)',
      transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
    };
  };

  // Stamp badge opacity while dragging
  const showMatchStamp = dragOffset.x > 35;
  const showPassStamp = dragOffset.x < -35;
  const showUrgentStamp = dragOffset.y < -40 && Math.abs(dragOffset.x) < 40;

  return (
    <div className="app">
      <header>
        <div className="brand">
          <svg viewBox="0 0 2078 364.19" role="img" aria-label="Letmino">
            <path fill="#F0F0EE" d={LETMINO_LOGO_PATH} />
          </svg>
          <span className="mono">for Teams</span>
        </div>
        <span className="mono" style={{ letterSpacing: '.12em' }}>
          CAOSÓMETRO
        </span>
      </header>

      <main ref={mainRef} className={step === 'match' ? 'match' : step} aria-live="polite">
        {step === 'intro' && (
          <>
            <div className="stack">
              <span className="label" style={{ color: C.naranja }}>
                Matchmaking para managers · 1 minuto
              </span>
              <h1>Caosómetro</h1>
              <p className="lead">
                ¿Qué necesita aprender tu equipo de verdad? Desliza o vota 6 habilidades clave y descubre por dónde empezar sin rodeos.
              </p>
            </div>

            <div className="stage" aria-hidden="true">
              <div className="stage-composition">
                {[
                  { left: 85, top: 0, size: 116, bg: C.azul, sym: 'fl' as const },
                  { left: 197, top: 0, size: 116, bg: C.verde, sym: 'bu' as const },
                  { left: 85, top: 112, size: 116, bg: C.amarillo, sym: 'tfh' as const },
                  { left: 197, top: 112, size: 116, bg: C.naranja, sym: 'ev' as const },
                  { left: 10, top: 76, size: 72, bg: C.verde, sym: 'bu' as const },
                  { left: 316, top: 64, size: 72, bg: C.amarillo, sym: 'tfh' as const },
                ].map((d, idx) => (
                  <div
                    key={idx}
                    className="dot"
                    style={{
                      width: `${d.size}px`,
                      height: `${d.size}px`,
                      background: d.bg,
                      left: `${d.left}px`,
                      top: `${d.top}px`,
                    }}
                  >
                    <SymSvg name={d.sym} />
                  </div>
                ))}
              </div>
            </div>

            <div className="stack" style={{ gap: '14px' }}>
              <button className="cta" onClick={handleStart}>
                Empezar el match
              </button>
              <span className="mono center">6 cartas · Swipe o clic · Sin registro.</span>
            </div>
          </>
        )}

        {step === 'match' && (
          <>
            <div>
              <div className="meter-head">
                <span className="label" style={{ color: 'var(--muted)' }}>
                  Habilidad {mi + 1} / {CARDS.length}
                </span>
                <span className="label" style={{ color: CARDS[mi].bg }}>
                  {CARDS[mi].area}
                </span>
              </div>
              {renderSegs()}
            </div>

            <p className="body">¿Qué necesita tu equipo de verdad? Elige con criterio.</p>

            <div className="deck">
              <div className="back1" />
              <div className="back2" />

              <div
                className="card"
                style={{
                  background: CARDS[mi].bg,
                  ...getCardStyle(),
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                {showMatchStamp && <div className="card-stamp match">MATCH</div>}
                {showPassStamp && <div className="card-stamp pass">AHORA NO</div>}
                {showUrgentStamp && <div className="card-stamp urgent">URGENTE</div>}

                <div className="card-top">
                  <span className="label" style={{ paddingTop: '6px' }}>
                    {CARDS[mi].area}
                  </span>
                  <SymSvg name={CARDS[mi].sym} />
                </div>
                <span className="card-text">{CARDS[mi].text}</span>
                <span style={{ fontSize: '15px', lineHeight: 1.4 }}>{CARDS[mi].aside}</span>
              </div>
            </div>

            <div className="votes">
              <button className="vote" onClick={() => submitVote(0)}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
                Ahora no
              </button>

              <button className="vote" onClick={() => submitVote(1)}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                Match
              </button>

              <button
                className="vote"
                onClick={() => submitVote(2)}
                style={{ borderColor: CARDS[mi].bg, color: CARDS[mi].bg }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M13 3L5 13.5h6L10 21l8-10.5h-6L13 3z" />
                </svg>
                Urgente
              </button>
            </div>
          </>
        )}

        {step === 'calc' && (
          <>
            <span className="label blink" style={{ color: C.naranja }}>
              Buscando afinidad
            </span>
            <h2>Buscando el match perfecto para tu equipo...</h2>
            <div
              className="chaos wobble"
              style={{ flex: 'none', height: '200px' }}
              aria-hidden="true"
            >
              {[
                { size: 92, bg: C.azul, sym: 'fl' as const, dx: 0, dy: 0 },
                { size: 76, bg: C.verde, sym: 'bu' as const, dx: 20, dy: 30 },
                { size: 100, bg: C.naranja, sym: 'ev' as const, dx: -15, dy: -20 },
                { size: 70, bg: C.amarillo, sym: 'tfh' as const, dx: 10, dy: 35 },
              ].map((d, index) => (
                <div
                  key={index}
                  className="dot"
                  style={{
                    width: `${d.size}px`,
                    height: `${d.size}px`,
                    background: d.bg,
                    left: `calc(50% + ${d.dx}px - ${d.size / 2}px)`,
                    top: `calc(50% + ${d.dy}px - ${d.size / 2}px)`,
                  }}
                >
                  <SymSvg name={d.sym} />
                </div>
              ))}
            </div>
          </>
        )}

        {step === 'result' && (
          <>
            <section className="section">
              <span className="label" style={{ color: 'var(--muted)' }}>
                Resultado del match
              </span>
              {selectedCards.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h2
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: '22px',
                      fontWeight: 600,
                      color: 'var(--blanco)',
                      margin: '4px 0 0',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Nada te convenció. Equipo exigente.
                  </h2>
                  <span className="body" style={{ color: 'var(--muted)' }}>
                    Te dejamos tres áreas por donde empezar.
                  </span>
                  <div style={{ marginTop: '6px' }}>
                    <span
                      className="mono"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        background: 'var(--negro-08)',
                        border: '1px solid var(--negro-15)',
                        color: C.verde,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: C.verde,
                        }}
                      />
                      {getChaosDiagnosis(0)}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="score">
                    <strong style={{ color: C.verde }}>{selectedCards.length}</strong>
                    <span className="mono" style={{ fontSize: '16px' }}>
                      / {CARDS.length} habilidades con match
                    </span>
                  </div>
                  <div style={{ marginTop: '8px', marginBottom: '4px' }}>
                    <span
                      className="mono"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        background: 'var(--negro-08)',
                        border: '1px solid var(--negro-15)',
                        color:
                          urgentCards.length >= 5
                            ? C.naranja
                            : urgentCards.length >= 3
                            ? C.amarillo
                            : urgentCards.length >= 1
                            ? C.azul
                            : C.verde,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background:
                            urgentCards.length >= 5
                              ? C.naranja
                              : urgentCards.length >= 3
                              ? C.amarillo
                              : urgentCards.length >= 1
                              ? C.azul
                              : C.verde,
                        }}
                      />
                      {getChaosDiagnosis(urgentCards.length)}
                    </span>
                  </div>
                  <span className="body">
                    {urgentCards.length} urgente{urgentCards.length === 1 ? '' : 's'} y {matchCards.length} con match.
                  </span>
                </>
              )}
            </section>

            <section className="section divider">
              <span className="label" style={{ color: 'var(--muted)' }}>
                Por dónde empezar con tu equipo
              </span>

              <div className="match-list">
                {displayCards.map((card, idx) => {
                  const cardVote = votes[CARDS.findIndex((c) => c.id === card.id)];
                  const isUrgent = cardVote === 2;
                  const isMatch = cardVote === 1;

                  return (
                    <div key={idx} className="match-item">
                      <div className="match-item-content">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="mono" style={{ color: card.bg }}>
                            {card.area}
                          </span>
                          {isUrgent && <span className="match-badge urgent">Urgente</span>}
                          {isMatch && <span className="match-badge match">Match</span>}
                          {!isUrgent && !isMatch && (
                            <span
                              className="mono"
                              style={{
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'var(--negro-15)',
                                color: 'var(--blanco-10)',
                              }}
                            >
                              Sugerida
                            </span>
                          )}
                        </div>
                        <span className="match-item-title">{card.text}</span>
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                          {card.aside}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="box">
              <span className="label">Cómo lo ordena Letmino Teams</span>
              <ul>
                <li>
                  <strong>Empieza hoy.</strong> 14 días sin tarjeta y 10 asientos para tu equipo.
                </li>
                <li>
                  <strong>Criterio, no volumen.</strong> Contenido multiformato curado y organizado según el área de tu equipo.
                </li>
                <li>
                  <strong>Ves lo que pasa.</strong> Quién aprende, cuánto y qué busca tu equipo sin encontrarlo.
                </li>
              </ul>
              <a className="cta dark" href={CTA_URL} target="_top" rel="noopener">
                Probar con mi equipo
              </a>
              <span className="mono center">
                Prueba de 14 días · Sin tarjeta · Disponible en España
              </span>
            </section>

            <section className="section">
              <span className="label" style={{ color: 'var(--muted)' }}>
                Para compartir
              </span>
              <p className="share" ref={shareRef} id="share">
                {shareContent}
              </p>
              <div className="row">
                <button
                  className="ghost"
                  onClick={handleCopy}
                  style={{ paddingLeft: 0 }}
                >
                  {copyStatus}
                </button>
              </div>
            </section>

            <div className="foot">
              <button className="ghost" onClick={resetGame}>
                Repetir el match
              </button>
              <span
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '14px',
                  color: 'var(--muted)',
                }}
              >
                Letmino. Aprendizaje a la velocidad de la vida.
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
