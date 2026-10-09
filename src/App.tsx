import { useEffect, useMemo, useState } from 'react';
import { PatternPiece } from './components/PatternPiece';
import { Robot } from './components/Robot';
import { TOTAL_CHALLENGES, WORLDS } from './data/challenges';
import { DEFAULT_PROGRESS, loadProgress, resetProgress, saveProgress } from './lib/progress';
import { speak } from './lib/speech';
import type { Choice, PlayerProgress, World } from './types';

type Screen = 'welcome' | 'map' | 'play' | 'summary';
type Feedback = 'idle' | 'wrong' | 'correct';

function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [progress, setProgress] = useState<PlayerProgress>(() => loadProgress());
  const [worldIndex, setWorldIndex] = useState(0);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const [showReset, setShowReset] = useState(false);

  const world = WORLDS[worldIndex];
  const challenge = world.challenges[challengeIndex];
  const completedCount = progress.completedChallenges.length;

  useEffect(() => saveProgress(progress), [progress]);

  const currentMissingIndex = useMemo(
    () => challenge?.sequence.findIndex((piece) => piece === null) ?? -1,
    [challenge],
  );

  const playInstruction = (message = challenge?.instruction) => {
    if (!message) return;
    const didSpeak = speak(message);
    setAudioUnavailable(!didSpeak);
  };

  const openMap = () => {
    window.speechSynthesis?.cancel();
    setScreen('map');
    setFeedback('idle');
  };

  const startWorld = (selectedWorld: World) => {
    if (selectedWorld.number > progress.unlockedWorld) return;
    const selectedWorldIndex = selectedWorld.number - 1;
    const firstIncomplete = selectedWorld.challenges.findIndex(
      (item) => !progress.completedChallenges.includes(item.id),
    );
    setWorldIndex(selectedWorldIndex);
    setChallengeIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
    setWrongAttempts(0);
    setFeedback('idle');
    setSelectedChoice(null);
    setProgress((current) => ({ ...current, lastWorld: selectedWorld.number }));
    setScreen('play');
    window.setTimeout(() => playInstruction(selectedWorld.challenges[firstIncomplete >= 0 ? firstIncomplete : 0].instruction), 120);
  };

  const choose = (choice: Choice) => {
    if (feedback === 'correct') return;
    setSelectedChoice(choice.id);

    if (choice.isCorrect) {
      setFeedback('correct');
      const completedChallenges = progress.completedChallenges.includes(challenge.id)
        ? progress.completedChallenges
        : [...progress.completedChallenges, challenge.id];
      setProgress({ ...progress, completedChallenges });
      playInstruction('¡Muy bien! Encontraste la pieza que faltaba.');
      return;
    }

    const nextAttempts = wrongAttempts + 1;
    setWrongAttempts(nextAttempts);
    setFeedback('wrong');
    playInstruction(nextAttempts >= 2 ? 'Mira las piezas que se repiten. Tú puedes.' : 'Casi. Mira otra vez el patrón.');
    window.setTimeout(() => {
      setFeedback('idle');
      setSelectedChoice(null);
    }, 650);
  };

  const nextChallenge = () => {
    if (challengeIndex < world.challenges.length - 1) {
      const next = challengeIndex + 1;
      setChallengeIndex(next);
      setWrongAttempts(0);
      setFeedback('idle');
      setSelectedChoice(null);
      window.setTimeout(() => playInstruction(world.challenges[next].instruction), 100);
      return;
    }

    const nextUnlocked = Math.min(WORLDS.length, Math.max(progress.unlockedWorld, world.number + 1));
    setProgress((current) => ({ ...current, unlockedWorld: nextUnlocked }));
    setScreen('summary');
    playInstruction('¡Misión cumplida! Tu robot está muy feliz.');
  };

  const onDrop = (choice: Choice) => (event: React.DragEvent) => {
    event.preventDefault();
    choose(choice);
  };

  const confirmReset = () => {
    resetProgress();
    setProgress(DEFAULT_PROGRESS);
    setShowReset(false);
    setScreen('welcome');
  };

  return (
    <main className={`app app--${screen}`}>
      <div className="sky-decor sky-decor--one" />
      <div className="sky-decor sky-decor--two" />

      {screen === 'welcome' && (
        <section className="welcome page" aria-labelledby="welcome-title">
          <div className="brand-pill"><span>✦</span> Pequeñas mentes, grandes patrones</div>
          <div className="welcome__content">
            <div className="welcome__copy">
              <p className="eyebrow">Una aventura para observar y descubrir</p>
              <h1 id="welcome-title">Bienvenido a<br /><span>Nido</span></h1>
              <p className="welcome__lead">¡Hola! Soy <strong>Lumi</strong>. Juntos encontraremos la pieza que sigue.</p>
              <button className="button button--primary button--wide" onClick={openMap}>
                <span>Empezar aventura</span><span className="button__icon">→</span>
              </button>
              {completedCount > 0 && <p className="saved-note">★ Tu aventura está guardada</p>}
            </div>
            <div className="welcome__hero" aria-label="Lumi, el robot guía">
              <div className="orbit orbit--one">●</div>
              <div className="orbit orbit--two">★</div>
              <Robot mood="cheering" />
              <div className="speech-bubble">¿Jugamos?</div>
              <div className="hero-platform" />
            </div>
          </div>
          <p className="welcome__footer">Hecho con cariño para aprender jugando <span>♥</span></p>
        </section>
      )}

      {screen === 'map' && (
        <section className="map page" aria-labelledby="map-title">
          <header className="topbar">
            <div className="mini-brand"><Robot size="small" /><span>Nido</span></div>
            <div className="topbar__actions">
              <div className="progress-chip" aria-label={`${completedCount} de ${TOTAL_CHALLENGES} estrellas`}>
                <span>★</span> {completedCount}<small>/{TOTAL_CHALLENGES}</small>
              </div>
              <button className="icon-button" aria-label="Reiniciar progreso" onClick={() => setShowReset(true)}>⚙</button>
            </div>
          </header>
          <div className="map__heading">
            <p className="eyebrow">Elige tu próxima misión</p>
            <h2 id="map-title">Mundos de patrones</h2>
            <p>Cada mundo tiene nuevas sorpresas para ti.</p>
          </div>
          <div className="world-grid">
            {WORLDS.map((item) => {
              const unlocked = item.number <= progress.unlockedWorld;
              const done = item.challenges.every((task) => progress.completedChallenges.includes(task.id));
              return (
                <button
                  key={item.id}
                  className={`world-card ${unlocked ? '' : 'is-locked'} ${done ? 'is-done' : ''}`}
                  style={{ '--world-primary': item.colors[0], '--world-soft': item.colors[1] } as React.CSSProperties}
                  disabled={!unlocked}
                  onClick={() => startWorld(item)}
                  aria-label={`${item.name}, patrón ${item.patternType}${!unlocked ? ', bloqueado' : ''}`}
                >
                  <span className="world-card__number">{done ? '✓' : item.number}</span>
                  <span className="world-card__scene">
                    <span className="world-card__emoji">{unlocked ? item.emoji : '🔒'}</span>
                    <span className="world-card__sparkle">✦</span>
                  </span>
                  <span className="world-card__body">
                    <strong>{item.name}</strong>
                    <small>Patrón {item.patternType}</small>
                    <span>{unlocked ? item.subtitle : 'Completa el mundo anterior'}</span>
                  </span>
                  <span className="world-card__go" aria-hidden="true">{unlocked ? '→' : '•'}</span>
                </button>
              );
            })}
          </div>
          <div className="map__tip"><span>💡</span><p><strong>Consejo de Lumi:</strong> observa qué piezas se repiten.</p></div>
        </section>
      )}

      {screen === 'play' && challenge && (
        <section className="play page" aria-labelledby="challenge-title">
          <header className="playbar">
            <button className="icon-button icon-button--back" onClick={openMap} aria-label="Volver a los mundos">←</button>
            <div className="lesson-progress">
              <div className="lesson-progress__labels"><span>{world.name}</span><strong>{challengeIndex + 1} de 6</strong></div>
              <div className="lesson-progress__track"><span style={{ width: `${((challengeIndex + 1) / 6) * 100}%` }} /></div>
            </div>
            <button className="icon-button icon-button--sound" onClick={() => playInstruction()} aria-label="Escuchar instrucción">🔊</button>
          </header>

          {audioUnavailable && <div className="audio-note" role="status">El audio no está disponible. Puedes seguir las pistas visuales.</div>}

          <div className="play__stage">
            <aside className="guide">
              <Robot mood={feedback === 'correct' ? 'cheering' : feedback === 'wrong' ? 'thinking' : 'happy'} />
              <div className={`guide__message guide__message--${feedback}`} aria-live="polite">
                {feedback === 'correct' ? '¡Lo lograste!' : feedback === 'wrong' ? '¡Casi! Mira otra vez' : 'Busca la pieza que falta'}
              </div>
            </aside>

            <div className="challenge-card">
              <div className="challenge-card__topline">
                <span className="pattern-badge">Patrón {challenge.patternType}</span>
                <span className="challenge-card__stars">✦　✦　✦</span>
              </div>
              <h2 id="challenge-title">¿Qué pieza sigue?</h2>
              <p>Toca una pieza para completar el patrón.</p>

              <div className={`sequence ${wrongAttempts >= 2 ? 'show-hint' : ''}`} aria-label="Secuencia incompleta">
                {challenge.sequence.map((piece, index) => {
                  const inRepeatUnit = index < challenge.repeatUnitLength;
                  if (piece) {
                    return <span className={inRepeatUnit ? 'hint-unit' : ''} key={`${piece.id}-${index}`}><PatternPiece item={piece} /></span>;
                  }
                  const correct = challenge.choices.find((choice) => choice.isCorrect)!;
                  return (
                    <span
                      key="missing"
                      className={`pattern-slot ${feedback === 'correct' ? 'is-filled' : ''}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        const id = event.dataTransfer.getData('text/plain');
                        const dropped = challenge.choices.find((choice) => choice.id === id);
                        if (dropped) onDrop(dropped)(event);
                      }}
                      aria-label={`Espacio vacío, posición ${currentMissingIndex + 1}`}
                    >
                      {feedback === 'correct' ? <PatternPiece item={correct} /> : <span>?</span>}
                    </span>
                  );
                })}
              </div>

              {wrongAttempts >= 2 && feedback !== 'correct' && (
                <p className="hint-text" role="status"><span>💡</span> Mira el grupo iluminado. Después vuelve a empezar.</p>
              )}

              <div className="choices" aria-label="Opciones de respuesta">
                {challenge.choices.map((choice) => (
                  <button
                    key={choice.id}
                    className={`choice ${selectedChoice === choice.id ? `is-${feedback}` : ''}`}
                    aria-label={choice.label}
                    onClick={() => choose(choice)}
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData('text/plain', choice.id)}
                    disabled={feedback === 'correct'}
                  >
                    <PatternPiece item={choice} size="choice" />
                  </button>
                ))}
              </div>

              {feedback === 'correct' && (
                <button className="button button--primary continue-button" onClick={nextChallenge} autoFocus>
                  {challengeIndex === 5 ? 'Ver mi premio' : 'Siguiente reto'} <span>→</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {screen === 'summary' && (
        <section className="summary page" aria-labelledby="summary-title">
          <div className="confetti" aria-hidden="true"><span>★</span><span>●</span><span>▲</span><span>★</span><span>■</span></div>
          <div className="summary__card">
            <p className="eyebrow">¡Misión cumplida!</p>
            <h2 id="summary-title">¡Eres una estrella<br />de los patrones!</h2>
            <div className="summary__robot"><Robot mood="cheering" /><div className="medal">★</div></div>
            <div className="summary__stats">
              <span><strong>6</strong><small>retos</small></span>
              <span><strong>★</strong><small>gran trabajo</small></span>
              <span><strong>{world.patternType}</strong><small>patrón</small></span>
            </div>
            <p>Lumi está muy orgulloso de ti.</p>
            <button className="button button--primary button--wide" onClick={openMap}>Volver a los mundos <span>→</span></button>
          </div>
        </section>
      )}

      {showReset && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowReset(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reset-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal__icon">↻</div>
            <h2 id="reset-title">¿Empezar de nuevo?</h2>
            <p>Se borrarán las estrellas y los mundos volverán a cerrarse.</p>
            <div className="modal__actions">
              <button className="button button--quiet" onClick={() => setShowReset(false)}>Cancelar</button>
              <button className="button button--danger" onClick={confirmReset}>Sí, reiniciar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
