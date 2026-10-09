import { useEffect, useMemo, useRef, useState } from 'react';
import { PatternPiece } from './components/PatternPiece';
import { Robot } from './components/Robot';
import { Artwork } from './components/Artwork';
import { TOTAL_CHALLENGES, WORLDS } from './data/challenges';
import { DEFAULT_PROGRESS, loadProgress, resetProgress, saveProgress } from './lib/progress';
import { speak } from './lib/speech';
import type { Choice, PlayerProgress, World } from './types';

type Screen = 'welcome' | 'map' | 'chapters' | 'play' | 'summary';
type Feedback = 'idle' | 'wrong' | 'correct';
type StoryMoment = 'read' | 'solve';

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
  const [storyMoment, setStoryMoment] = useState<StoryMoment>('solve');
  const scheduledTimers = useRef<Set<number>>(new Set());

  const world = WORLDS[worldIndex];
  const challenge = world.challenges[challengeIndex];
  const completedCount = progress.completedChallenges.length;

  useEffect(() => saveProgress(progress), [progress]);

  useEffect(() => () => {
    scheduledTimers.current.forEach((timer) => window.clearTimeout(timer));
    scheduledTimers.current.clear();
  }, []);

  const currentMissingIndex = useMemo(
    () => challenge?.sequence.findIndex((piece) => piece === null) ?? -1,
    [challenge],
  );

  const playInstruction = (message = challenge?.instruction) => {
    if (!message) return;
    const didSpeak = speak(message);
    setAudioUnavailable(!didSpeak);
  };

  const schedule = (callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      scheduledTimers.current.delete(timer);
      callback();
    }, delay);
    scheduledTimers.current.add(timer);
  };

  const resetPagePosition = () => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const openMap = () => {
    window.speechSynthesis?.cancel();
    setScreen('map');
    setFeedback('idle');
    resetPagePosition();
  };

  const startWorld = (selectedWorld: World) => {
    const isStoryWorld = selectedWorld.patternType === 'MIXTO';
    if (!isStoryWorld && selectedWorld.number > progress.unlockedWorld) return;
    const selectedWorldIndex = selectedWorld.number - 1;
    setWorldIndex(selectedWorldIndex);
    setProgress((current) => ({ ...current, lastWorld: selectedWorld.number }));
    resetPagePosition();

    if (isStoryWorld) {
      window.speechSynthesis?.cancel();
      setScreen('chapters');
      return;
    }

    const firstIncomplete = selectedWorld.challenges.findIndex(
      (item) => !progress.completedChallenges.includes(item.id),
    );
    const targetIndex = firstIncomplete >= 0 ? firstIncomplete : 0;
    const targetChallenge = selectedWorld.challenges[targetIndex];
    setChallengeIndex(targetIndex);
    setStoryMoment(targetChallenge.story ? 'read' : 'solve');
    setWrongAttempts(0);
    setFeedback('idle');
    setSelectedChoice(null);
    setScreen('play');
    schedule(() => playInstruction(targetChallenge.story?.narrative ?? targetChallenge.instruction), 120);
  };

  const openChapter = (index: number) => {
    const targetChallenge = world.challenges[index];
    setChallengeIndex(index);
    setStoryMoment('read');
    setWrongAttempts(0);
    setFeedback('idle');
    setSelectedChoice(null);
    setScreen('play');
    resetPagePosition();
    schedule(() => playInstruction(targetChallenge.story?.narrative ?? targetChallenge.instruction), 100);
  };

  const openChapterLibrary = () => {
    window.speechSynthesis?.cancel();
    setScreen('chapters');
    setFeedback('idle');
    resetPagePosition();
  };

  const browseChapter = (direction: -1 | 1) => {
    const nextIndex = challengeIndex + direction;
    if (nextIndex < 0 || nextIndex >= world.challenges.length) return;
    openChapter(nextIndex);
  };

  const beginPattern = () => {
    setStoryMoment('solve');
    setFeedback('idle');
    setSelectedChoice(null);
    resetPagePosition();
    playInstruction('Ahora mira con atención. ¿Qué pieza sigue en el patrón?');
  };

  const returnToStory = () => {
    if (!challenge.story) return;
    setStoryMoment('read');
    resetPagePosition();
    playInstruction(challenge.story.narrative);
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
    schedule(() => {
      setFeedback('idle');
      setSelectedChoice(null);
    }, 650);
  };

  const nextChallenge = () => {
    if (challengeIndex < world.challenges.length - 1) {
      const next = challengeIndex + 1;
      const nextChallengeItem = world.challenges[next];
      setChallengeIndex(next);
      setStoryMoment(nextChallengeItem.story ? 'read' : 'solve');
      setWrongAttempts(0);
      setFeedback('idle');
      setSelectedChoice(null);
      resetPagePosition();
      schedule(() => playInstruction(nextChallengeItem.story?.narrative ?? nextChallengeItem.instruction), 100);
      return;
    }

    const nextUnlocked = Math.min(WORLDS.length, Math.max(progress.unlockedWorld, world.number + 1));
    setProgress((current) => ({ ...current, unlockedWorld: nextUnlocked }));
    setScreen('summary');
    resetPagePosition();
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
    resetPagePosition();
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
              const unlocked = item.patternType === 'MIXTO' || item.number <= progress.unlockedWorld;
              const done = item.challenges.every((task) => progress.completedChallenges.includes(task.id));
              return (
                <button
                  key={item.id}
                  className={`world-card ${unlocked ? '' : 'is-locked'} ${done ? 'is-done' : ''}`}
                  style={{ '--world-primary': item.colors[0], '--world-soft': item.colors[1] } as React.CSSProperties}
                  disabled={!unlocked}
                  onClick={() => startWorld(item)}
                  aria-label={`${item.name}, ${item.patternType === 'MIXTO' ? 'aventura con patrones variados' : `patrón ${item.patternType}`}${!unlocked ? ', bloqueado' : ''}`}
                >
                  <span className="world-card__number">{done ? '✓' : item.number}</span>
                  <span className="world-card__scene">
                    {unlocked ? (
                      <Artwork src={item.coverImagePath} alt={item.coverImageAlt ?? item.name} emoji={item.emoji} variant="world" />
                    ) : (
                      <span className="world-card__emoji">🔒</span>
                    )}
                    <span className="world-card__sparkle">✦</span>
                  </span>
                  <span className="world-card__body">
                    <strong>{item.name}</strong>
                    <small>{item.patternType === 'MIXTO' ? 'Aventura ilustrada' : `Patrón ${item.patternType}`}</small>
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

      {screen === 'chapters' && (
        <section className="chapters page" aria-labelledby="chapters-title">
          <header className="topbar">
            <button className="icon-button icon-button--back" onClick={openMap} aria-label="Volver a los mundos">←</button>
            <div className="mini-brand"><Robot size="small" /><span>Nido</span></div>
            <div className="progress-chip" aria-label={`${world.challenges.filter((item) => progress.completedChallenges.includes(item.id)).length} de 6 capítulos resueltos`}>
              <span>★</span> {world.challenges.filter((item) => progress.completedChallenges.includes(item.id)).length}<small>/6</small>
            </div>
          </header>
          <div className="chapters__heading">
            <p className="eyebrow">Elige cualquier capítulo</p>
            <h2 id="chapters-title">{world.name}</h2>
            <p>Todos los cuentos están abiertos. Puedes leerlos en el orden que quieras.</p>
          </div>
          <div className="chapter-grid">
            {world.challenges.map((item, index) => {
              const story = item.story!;
              const completed = progress.completedChallenges.includes(item.id);
              return (
                <button
                  key={item.id}
                  className={`chapter-card ${completed ? 'is-completed' : ''}`}
                  onClick={() => openChapter(index)}
                  aria-label={`Capítulo ${story.chapter}: ${story.title}${completed ? ', resuelto' : ''}`}
                >
                  <Artwork src={story.imagePath} alt="" emoji={story.placeholderEmoji} variant="chapter" />
                  <span className="chapter-card__number">{completed ? '✓' : story.chapter}</span>
                  <span className="chapter-card__copy">
                    <small>Capítulo {story.chapter}</small>
                    <strong>{story.title}</strong>
                    <span>{completed ? 'Leer otra vez' : 'Leer capítulo'} <b>→</b></span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {screen === 'play' && challenge && (
        <section className="play page" aria-labelledby={challenge.story && storyMoment === 'read' ? 'story-title' : 'challenge-title'}>
          <header className="playbar">
            <button className="icon-button icon-button--back" onClick={openMap} aria-label="Volver a los mundos">←</button>
            <div className="lesson-progress">
              <div className="lesson-progress__labels"><span>{world.name}</span><strong>{challengeIndex + 1} de 6</strong></div>
              <div className="lesson-progress__track"><span style={{ width: `${((challengeIndex + 1) / 6) * 100}%` }} /></div>
            </div>
            <button
              className="icon-button icon-button--sound"
              onClick={() => playInstruction(challenge.story && storyMoment === 'read' ? challenge.story.narrative : 'Mira con atención. ¿Qué pieza sigue en el patrón?')}
              aria-label={challenge.story && storyMoment === 'read' ? 'Escuchar historia' : 'Escuchar instrucción'}
            >🔊</button>
          </header>

          {audioUnavailable && <div className="audio-note" role="status">El audio no está disponible. Puedes seguir las pistas visuales.</div>}

          {challenge.story && storyMoment === 'read' ? (
            <article className="story-reader">
              <div className="story-reader__image">
                <Artwork
                  src={challenge.story.imagePath}
                  alt={challenge.story.imageAlt}
                  emoji={challenge.story.placeholderEmoji}
                  variant="reader"
                />
                <span className="story-reader__chapter">Capítulo {challenge.story.chapter} de 6</span>
              </div>
              <div className="story-reader__copy">
                <p className="eyebrow">{world.name} · Una historia de Nido</p>
                <h2 id="story-title">{challenge.story.title}</h2>
                <p>{challenge.story.narrative}</p>
                <nav className="story-reader__navigation" aria-label="Navegación de capítulos">
                  <button onClick={() => browseChapter(-1)} disabled={challengeIndex === 0}>← Anterior</button>
                  <button onClick={openChapterLibrary}>Todos los capítulos</button>
                  <button onClick={() => browseChapter(1)} disabled={challengeIndex === world.challenges.length - 1}>Siguiente →</button>
                </nav>
                <div className="story-reader__actions">
                  <button className="button button--quiet story-listen" onClick={() => playInstruction(challenge.story?.narrative)}>
                    <span>🔊</span> Escuchar otra vez
                  </button>
                  <button className="button button--primary story-next" onClick={beginPattern}>
                    Resolver el patrón <span>→</span>
                  </button>
                </div>
              </div>
            </article>
          ) : (
          <div className="play__stage">
            <aside className="guide">
              <Robot mood={feedback === 'correct' ? 'cheering' : feedback === 'wrong' ? 'thinking' : 'happy'} />
              <div className={`guide__message guide__message--${feedback}`} aria-live="polite">
                {feedback === 'correct' ? '¡Lo lograste!' : feedback === 'wrong' ? '¡Casi! Mira otra vez' : 'Busca la pieza que falta'}
              </div>
            </aside>

            <div className={`challenge-card ${challenge.story ? 'challenge-card--story' : ''}`}>
              <div className="challenge-card__topline">
                <span className="pattern-badge">Patrón {challenge.patternType}</span>
                {challenge.story ? (
                  <button className="story-return" onClick={returnToStory}>← Volver al cuento</button>
                ) : (
                  <span className="challenge-card__stars">✦　✦　✦</span>
                )}
              </div>
              {challenge.story && (
                <div className="story-pattern-context">
                  <Artwork
                    src={challenge.story.imagePath}
                    alt={challenge.story.imageAlt}
                    emoji={challenge.story.placeholderEmoji}
                    variant="pattern"
                  />
                  <span className="story-pattern-context__label">
                    <small>Capítulo {challenge.story.chapter}</small>
                    <strong>{challenge.story.title}</strong>
                  </span>
                </div>
              )}
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
          )}
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
              <span><strong>{world.patternType === 'MIXTO' ? 'Historia' : world.patternType}</strong><small>{world.patternType === 'MIXTO' ? 'aventura' : 'patrón'}</small></span>
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
