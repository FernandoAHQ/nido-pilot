import type { Challenge, Choice, GradeLevel, PatternItem, PatternRound, World } from '../types';

const item = (
  id: string,
  label: string,
  symbol: string,
  color: string,
  kind: PatternItem['kind'] = 'object',
): PatternItem => ({ id, label, symbol, color, kind });

export const ITEMS = {
  apple: item('apple', 'manzana', '🍎', '#F15B5D'),
  leaf: item('leaf', 'hoja', '🍃', '#55A86C'),
  fish: item('fish', 'pez', '🐟', '#4D90D9'),
  flower: item('flower', 'flor', '🌼', '#E8B82E'),
  moon: item('moon', 'luna', '🌙', '#766BC0'),
  sun: item('sun', 'sol', '☀️', '#EBAF26'),
  star: item('star', 'estrella', '★', '#F2C438'),
  heart: item('heart', 'corazón', '♥', '#E85570'),
  firefly: item('firefly', 'luciérnaga', '✨', '#F4C84E'),
  acorn: item('acorn', 'bellota', '🌰', '#A96E42'),
  berry: item('berry', 'mora', '🫐', '#6672C9'),
  bird: item('bird', 'pájaro', '🐦', '#55AFC6'),
  lantern: item('lantern', 'farol', '🏮', '#EC6957'),
  balloon: item('balloon', 'globo', '🎈', '#E75B75'),
  gift: item('gift', 'regalo', '🎁', '#8B68C8'),
  drum: item('drum', 'tambor', '🥁', '#D77845'),
  cupcake: item('cupcake', 'pastelito', '🧁', '#DB78A5'),
  flag: item('flag', 'banderín', '🚩', '#EE675A'),
  shell: item('shell', 'concha', '🐚', '#E79BB1'),
  pearl: item('pearl', 'perla', '●', '#B9E6EB'),
  coral: item('coral', 'coral', '🪸', '#EE7668'),
  bubble: item('bubble', 'burbuja', '○', '#70CDE3'),
  seaweed: item('seaweed', 'alga', '🌿', '#48A77A'),
  starfish: item('starfish', 'estrella de mar', '⭐', '#F39A4B'),
  turtle: item('turtle', 'tortuga', '🐢', '#63A96C'),
  wave: item('wave', 'ola', '🌊', '#4A9ED6'),
  blossom: item('blossom', 'flor de primavera', '🌸', '#EB8EAF'),
  snowflake: item('snowflake', 'copo de nieve', '❄️', '#83BCE2'),
  gear: item('gear', 'engranaje', '⚙️', '#C78A3A'),
  bolt: item('bolt', 'tornillo', '🔩', '#7890A0'),
  wheel: item('wheel', 'rueda', '🛞', '#9B6A3D'),
  pinwheel: item('pinwheel', 'molinillo', '✥', '#47A9B7'),
  bell: item('bell', 'campana', '🔔', '#D99D2B'),
  bulb: item('bulb', 'bombilla', '💡', '#F4C84E'),
  magnet: item('magnet', 'imán', '🧲', '#DF5B55'),
} as const;

type ItemKey = keyof typeof ITEMS;

interface StoryChallengeSpec {
  patternType: Challenge['patternType'];
  unit: ItemKey[];
  distractors: ItemKey[];
  missing: number;
  title: string;
  narrative: string;
  imagePath: string;
  imageAlt: string;
  placeholderEmoji: string;
}

const makePatternRound = (
  id: string,
  unit: ItemKey[],
  distractors: ItemKey[],
  sequenceLength: number,
  missingIndex: number,
  correctPosition: number,
  difficulty: PatternRound['difficulty'],
): PatternRound => {
  const fullSequence = Array.from({ length: sequenceLength }, (_, position) => ITEMS[unit[position % unit.length]]);
  const answer = fullSequence[missingIndex];
  const incorrectChoices: Choice[] = distractors.map((key) => ({ ...ITEMS[key], isCorrect: false }));
  const choices = [...incorrectChoices];
  choices.splice(correctPosition, 0, { ...answer, isCorrect: true });
  const sequence: Array<PatternItem | null> = [...fullSequence];
  sequence[missingIndex] = null;

  return { id, sequence, choices, repeatUnitLength: unit.length, difficulty };
};

const LEVELS: GradeLevel[] = ['k1', 'k2', 'k3', 'grade1'];

const storyLevelSettings: Record<GradeLevel, { lengths: number[]; difficulties: PatternRound['difficulty'][] }> = {
  k1: { lengths: [4, 5, 5], difficulties: [1, 1, 2] },
  k2: { lengths: [5, 6, 6], difficulties: [1, 2, 3] },
  k3: { lengths: [5, 6, 7, 7], difficulties: [2, 3, 3, 4] },
  grade1: { lengths: [6, 7, 7, 8, 8], difficulties: [3, 3, 4, 4, 5] },
};

const missingIndexForDifficulty = (
  difficulty: PatternRound['difficulty'],
  sequenceLength: number,
  unitLength: number,
  seed: number,
) => {
  if (difficulty === 1) return sequenceLength - 1;
  if (difficulty === 2) return Math.max(unitLength, sequenceLength - 2);
  if (difficulty === 3) return Math.max(unitLength, sequenceLength - 3);
  const unitOffset = difficulty === 4 ? seed % unitLength : (seed + 1) % unitLength;
  return Math.min(sequenceLength - 1, unitLength + unitOffset);
};

const makeLevelRounds = (
  id: string,
  spec: Pick<StoryChallengeSpec, 'unit' | 'distractors' | 'missing'>,
  seed: number,
): Record<GradeLevel, PatternRound[]> => Object.fromEntries(
  LEVELS.map((level, levelIndex) => {
    const settings = storyLevelSettings[level];
    const rounds = settings.lengths.map((sequenceLength, roundIndex) => {
      const difficulty = settings.difficulties[roundIndex];
      const missingIndex = missingIndexForDifficulty(difficulty, sequenceLength, spec.unit.length, spec.missing);
      return makePatternRound(
        `${id}-${level}-round-${roundIndex + 1}`,
        spec.unit,
        spec.distractors,
        sequenceLength,
        missingIndex,
        (seed + levelIndex + roundIndex) % 3,
        difficulty,
      );
    });
    return [level, rounds];
  }),
) as Record<GradeLevel, PatternRound[]>;

const makeStoryChallenges = (worldId: string, storySpecs: StoryChallengeSpec[]): Challenge[] =>
  storySpecs.map((spec, index) => {
    const id = `${worldId}-${index + 1}`;
    const roundsByLevel = makeLevelRounds(id, spec, index);
    const firstRound = roundsByLevel.k1[0];

    return {
      ...firstRound,
      id,
      worldId,
      patternType: spec.patternType,
      instruction: `${spec.narrative} ¿Qué pieza sigue?`,
      roundsByLevel,
      story: {
        chapter: index + 1,
        title: spec.title,
        narrative: spec.narrative,
        imagePath: spec.imagePath,
        imageAlt: spec.imageAlt,
        placeholderEmoji: spec.placeholderEmoji,
      },
    };
  });

const fireflyStory: StoryChallengeSpec[] = [
  { patternType: 'AB', unit: ['firefly', 'leaf'], distractors: ['flower', 'moon'], missing: 4, title: 'Una luz en el sendero', narrative: 'Lila perdió el camino a casa cuando una ráfaga apagó las luces del bosque. Lumi la encontró escondida bajo una hoja y prometió acompañarla hasta el gran roble donde vive su familia. Para descubrir el primer tramo del sendero, necesitan encender las lucecitas siguiendo el orden que dejó el viento.', imagePath: '/firefly-01-path.webp', imageAlt: 'Lumi y Lila frente a un sendero oscuro entre hojas', placeholderEmoji: '🌙' },
  { patternType: 'AAB', unit: ['acorn', 'acorn', 'leaf'], distractors: ['berry', 'flower'], missing: 5, title: 'El puente de bellotas', narrative: 'El sendero llevó a Lumi y Lila hasta un arroyo que brillaba bajo la luna, pero al pequeño puente le faltaba una tabla. Las ardillas constructoras habían marcado cada paso seguro con bellotas y hojas antes de irse a dormir. Si completan correctamente sus señales, podrán cruzar sin despertar a los peces.', imagePath: '/firefly-02-bridge.webp', imageAlt: 'Un puente de madera decorado con bellotas y hojas', placeholderEmoji: '🌰' },
  { patternType: 'ABB', unit: ['flower', 'berry', 'berry'], distractors: ['apple', 'leaf'], missing: 3, title: 'La merienda del bosque', narrative: 'Al otro lado del puente encontraron a una familia de conejos que recogía una merienda derramada por el viento. Lila quería seguir deprisa, pero Lumi recordó que un buen amigo siempre se detiene a ayudar. Al ordenar las flores y las moras como estaban en la manta, los conejos les mostrarán un atajo hacia el gran roble.', imagePath: '/firefly-03-picnic.webp', imageAlt: 'Animales del bosque preparando una merienda con flores y moras', placeholderEmoji: '🫐' },
  { patternType: 'ABC', unit: ['bird', 'flower', 'firefly'], distractors: ['leaf', 'moon'], missing: 4, title: 'La canción secreta', narrative: 'El atajo terminaba frente a unos arbustos tan altos que no dejaban ver el camino. Desde una rama, el pájaro Azulín explicó que las ramas solo se abren al escuchar la canción secreta del bosque. Lumi y Lila deben completar el turno de pájaros, flores y luciérnagas para que el bosque reconozca la melodía.', imagePath: '/firefly-04-song.webp', imageAlt: 'Un pájaro cantando junto a flores y luciérnagas', placeholderEmoji: '🐦' },
  { patternType: 'AAB', unit: ['lantern', 'lantern', 'star'], distractors: ['moon', 'firefly'], missing: 2, title: 'Faroles para la noche', narrative: 'La canción abrió las ramas y reveló la última colina, pero una neblina espesa cubría la subida. Azulín les prestó varios faroles y les dijo que las estrellas del suelo señalaban dónde colocarlos. Cuando cada farol esté en su lugar, Lila podrá volar junto a Lumi sin perderse otra vez.', imagePath: '/firefly-05-lanterns.webp', imageAlt: 'Faroles rojos iluminando una colina bajo las estrellas', placeholderEmoji: '🏮' },
  { patternType: 'ABC', unit: ['star', 'moon', 'firefly'], distractors: ['lantern', 'sun'], missing: 5, title: 'El hogar de Lila', narrative: 'Desde la cima, Lila por fin vio el gran roble y las luces de su familia esperando entre las ramas. Solo faltaba completar una última señal en el cielo para avisarles que estaba a salvo. Al terminarla, cientos de luciérnagas iluminarán el bosque y celebrarán que Lumi ayudó a una nueva amiga a volver a casa.', imagePath: '/firefly-06-home.webp', imageAlt: 'Lila reuniéndose con su familia de luciérnagas bajo la luna', placeholderEmoji: '✨' },
];

const festivalStory: StoryChallengeSpec[] = [
  { patternType: 'AB', unit: ['flag', 'balloon'], distractors: ['gift', 'star'], missing: 3, title: 'La plaza despierta', narrative: 'Una mañana, Lumi encontró una invitación para organizar el primer Festival de Nido antes de que saliera la luna. La plaza estaba vacía y los vecinos no sabían por dónde comenzar, así que Lumi propuso trabajar todos juntos. Su primera misión es completar la fila de banderines y globos que dará la bienvenida a cada visitante.', imagePath: '/festival-01-square.webp', imageAlt: 'Lumi decorando una plaza con banderines y globos', placeholderEmoji: '🎈' },
  { patternType: 'AAB', unit: ['cupcake', 'cupcake', 'apple'], distractors: ['berry', 'flower'], missing: 4, title: 'La mesa de sabores', narrative: 'Mientras la plaza se llenaba de color, Mara la mapache llegó empujando un carrito de pastelitos y frutas. Un bache hizo que toda la merienda se mezclara, y Mara temió no terminar antes de que llegaran los invitados. Lumi puede ayudarla a reconstruir el orden de la mesa para que haya un bocadito especial en cada lugar.', imagePath: '/festival-02-table.webp', imageAlt: 'Una mesa festiva con pastelitos, frutas y manteles coloridos', placeholderEmoji: '🧁' },
  { patternType: 'ABB', unit: ['drum', 'star', 'star'], distractors: ['balloon', 'heart'], missing: 5, title: 'Ensayo de la banda', narrative: 'Con la merienda preparada, un fuerte redoble anunció la llegada de la banda del bosque. Cada músico tocaba a una velocidad diferente y el ensayo sonaba como una tormenta de ruidos. Lumi descubrió que las estrellas del escenario marcaban el ritmo correcto, así que deben completar la secuencia para que todos puedan tocar juntos.', imagePath: '/festival-03-band.webp', imageAlt: 'Una banda de animales ensayando con tambores y estrellas', placeholderEmoji: '🥁' },
  { patternType: 'ABC', unit: ['balloon', 'gift', 'flower'], distractors: ['flag', 'heart'], missing: 1, title: 'Sorpresas para todos', narrative: 'La música ya estaba lista cuando llegaron más invitados de los que Lumi esperaba. Había sorpresas suficientes, pero las cajas se habían quedado sin etiquetas y nadie sabía cómo repartirlas. Al ordenar cada globo, regalo y flor siguiendo el plan de Lumi, todos recibirán una bienvenida alegre y diferente.', imagePath: '/festival-04-gifts.webp', imageAlt: 'Lumi preparando globos, regalos y flores para los invitados', placeholderEmoji: '🎁' },
  { patternType: 'AAB', unit: ['bird', 'bird', 'drum'], distractors: ['firefly', 'flag'], missing: 3, title: 'Comienza el desfile', narrative: 'Cuando el sol comenzó a bajar, Azulín reunió a los pájaros para encabezar el gran desfile. Todos estaban tan emocionados que salieron al mismo tiempo y olvidaron la formación que habían practicado. Lumi debe recuperar el orden de pájaros y tambores para que el desfile recorra la plaza sin dejar a nadie atrás.', imagePath: '/festival-05-parade.webp', imageAlt: 'Pájaros marchando detrás de un tambor en un desfile', placeholderEmoji: '🎉' },
  { patternType: 'ABC', unit: ['heart', 'star', 'lantern'], distractors: ['gift', 'balloon'], missing: 4, title: 'La gran celebración', narrative: 'El desfile llegó a la plaza justo cuando apareció la primera estrella, pero la guirnalda principal todavía no encendía. Lumi recordó cada ayuda recibida durante el día y comprendió que el festival solo fue posible porque todos colaboraron. Al completar la última fila de corazones, estrellas y faroles, Nido se llenará de luz y la celebración podrá comenzar.', imagePath: '/festival-06-finale.webp', imageAlt: 'Todos los amigos celebrando con Lumi bajo luces y estrellas', placeholderEmoji: '🎊' },
];

const reefStory: StoryChallengeSpec[] = [
  { patternType: 'AB', unit: ['shell', 'bubble'], distractors: ['fish', 'starfish'], missing: 3, title: 'La perla perdida', narrative: 'Nara cuidaba la perla luminosa que guía a los animales del arrecife durante la noche, pero esa mañana encontró su gran concha vacía. Lumi vio un rastro de conchas y burbujas que se alejaba por la arena y prometió ayudarla a buscar. Si siguen ese orden sin saltarse ninguna señal, descubrirán hacia dónde llevó la corriente la perla perdida.', imagePath: '/reef-01-pearl.jpg', imageAlt: 'Lumi y Nara descubren una concha vacía y un rastro submarino', placeholderEmoji: '🐚' },
  { patternType: 'AAB', unit: ['coral', 'coral', 'fish'], distractors: ['shell', 'bubble'], missing: 4, title: 'El jardín de coral', narrative: 'El rastro terminó en un jardín donde la corriente había movido varias señales de coral y cerrado el paso. Nara sabía que no debían pisar las plantas vivas, así que Lumi buscó otra pista entre los peces que nadaban en formación. Al completar el orden de corales y peces, podrán reconstruir el sendero seguro y cuidar el jardín al mismo tiempo.', imagePath: '/reef-02-garden.jpg', imageAlt: 'Lumi y Nara restauran un sendero en el jardín de coral', placeholderEmoji: '🪸' },
  { patternType: 'ABB', unit: ['seaweed', 'bubble', 'bubble'], distractors: ['fish', 'shell'], missing: 5, title: 'El bosque de algas', narrative: 'Más allá del jardín comenzaba un bosque de algas tan altas que ocultaban la luz. Un grupo de pececitos recordó haber visto un destello cruzar por allí, pero solo conocía el camino si todos nadaban juntos. Lumi y Nara deben continuar la ruta de algas y burbujas para atravesar el bosque sin separar al cardumen.', imagePath: '/reef-03-seaweed.jpg', imageAlt: 'Lumi y Nara siguen burbujas por un bosque de algas', placeholderEmoji: '🌿' },
  { patternType: 'ABC', unit: ['fish', 'starfish', 'shell'], distractors: ['bubble', 'coral'], missing: 2, title: 'La cueva de los ecos', narrative: 'El bosque desembocó en una cueva que repetía cada sonido como una canción. En las paredes brillaban peces, estrellas de mar y conchas, y al fondo aparecía el mismo resplandor suave de la perla. Cuando Lumi y Nara completen la secuencia de símbolos luminosos, el eco les mostrará la entrada correcta y podrán recuperar su tesoro.', imagePath: '/reef-04-cave.jpg', imageAlt: 'Lumi y Nara encuentran la perla en una cueva luminosa', placeholderEmoji: '⭐' },
  { patternType: 'AAB', unit: ['turtle', 'turtle', 'wave'], distractors: ['bubble', 'fish'], missing: 4, title: 'La corriente arcoíris', narrative: 'Con la perla a salvo, una corriente de muchos colores comenzó a girar entre ellos y el camino de regreso. Nara quiso luchar contra el agua sola, pero Lumi llamó a los peces para que todos avanzaran como un equipo. Siguiendo el turno de tortugas y olas, encontrarán los momentos tranquilos de la corriente y cruzarán juntos.', imagePath: '/reef-05-current.jpg', imageAlt: 'Lumi, Nara y los peces cruzan juntos una corriente arcoíris', placeholderEmoji: '🌊' },
  { patternType: 'ABC', unit: ['pearl', 'coral', 'starfish'], distractors: ['shell', 'wave'], missing: 5, title: 'La luz del arrecife', narrative: 'Lumi y Nara regresaron justo cuando el arrecife comenzaba a oscurecer y todos esperaban preocupados. Nara colocó la perla dentro de su gran concha, pero necesitaba una última señal para despertar su luz. Al ordenar perlas, corales y estrellas de mar, el arrecife volverá a brillar y cada amigo celebrará lo que lograron juntos.', imagePath: '/reef-06-home.jpg', imageAlt: 'Nara devuelve la perla y todo el arrecife celebra', placeholderEmoji: '🫧' },
];

const seasonsStory: StoryChallengeSpec[] = [
  { patternType: 'AB', unit: ['blossom', 'leaf'], distractors: ['sun', 'snowflake'], missing: 3, title: 'Un boleto especial', narrative: 'Tico, el conductor, llegó a Nido con una noticia: el Tren de las Estaciones había perdido las cuatro señales que mantenían su ruta en orden. Sin ellas, la primavera, el verano, el otoño y el invierno no podían visitar sus estaciones. Lumi subió al tren con un boleto de hoja y juntos comenzaron a reconstruir el camino siguiendo flores y hojas.', imagePath: '/seasons-01-ticket.jpg', imageAlt: 'Tico entrega a Lumi un boleto junto al Tren de las Estaciones', placeholderEmoji: '🎫' },
  { patternType: 'AB', unit: ['blossom', 'leaf'], distractors: ['berry', 'snowflake'], missing: 4, title: 'El puente de primavera', narrative: 'La primera parada estaba cubierta de flores nuevas, pero unas enredaderas habían cerrado el puente del tren. Tico encontró una puerta de jardín que solo se abría al reconocer el ritmo de la primavera. Lumi debe continuar el camino de flores y hojas para liberar el puente sin arrancar ninguna planta.', imagePath: '/seasons-02-spring.jpg', imageAlt: 'Lumi y Tico encuentran un puente cubierto de flores de primavera', placeholderEmoji: '🌸' },
  { patternType: 'AAB', unit: ['sun', 'sun', 'berry'], distractors: ['leaf', 'blossom'], missing: 5, title: 'El sol del verano', narrative: 'El tren llegó después a un huerto caluroso donde la rueda de agua se había detenido y los árboles tenían mucha sed. Entre las piedras había pequeñas señales de soles y frutas que indicaban por dónde debía correr el arroyo. Al completar ese orden, Lumi y Tico podrán devolver el agua al huerto y encontrar la señal del verano.', imagePath: '/seasons-03-summer.jpg', imageAlt: 'Lumi y Tico reparan una rueda de agua en un huerto de verano', placeholderEmoji: '☀️' },
  { patternType: 'ABB', unit: ['leaf', 'acorn', 'acorn'], distractors: ['berry', 'snowflake'], missing: 3, title: 'El viento de otoño', narrative: 'En la siguiente estación, el viento había cubierto las vías con una alfombra de hojas y bellotas. Debajo estaba la palanca que cambiaba la dirección del tren, pero Tico no podía encontrarla. Lumi comenzó a ordenar las hojas y bellotas que el viento repetía, y poco a poco apareció el camino hacia la señal del otoño.', imagePath: '/seasons-04-autumn.jpg', imageAlt: 'Lumi y Tico ordenan hojas y bellotas en una estación de otoño', placeholderEmoji: '🍂' },
  { patternType: 'AB', unit: ['snowflake', 'lantern'], distractors: ['moon', 'sun'], missing: 4, title: 'Faroles en la nieve', narrative: 'La última señal esperaba en una estación de montaña donde la nieve había escondido todos los faroles. El cielo se oscurecía, pero Tico sabía que cada copo señalaba el lugar de una luz cálida. Si Lumi completa el turno de copos y faroles, el tren podrá atravesar el invierno sin perder su camino.', imagePath: '/seasons-05-winter.jpg', imageAlt: 'Lumi y Tico encienden faroles en una estación nevada', placeholderEmoji: '❄️' },
  { patternType: 'ABC', unit: ['blossom', 'sun', 'leaf'], distractors: ['snowflake', 'lantern'], missing: 5, title: 'Todas las estaciones', narrative: 'Con las cuatro señales recuperadas, el tren volvió a la estación de Nido mientras el paisaje mostraba flores, sol, hojas doradas y nieve a la vez. El gran reloj todavía necesitaba recordar en qué orden viajaría cada estación. Lumi y Tico completarán la última secuencia para que el año vuelva a girar y cada estación llegue cuando le corresponde.', imagePath: '/seasons-06-home.jpg', imageAlt: 'Lumi y Tico celebran frente al reloj de las cuatro estaciones', placeholderEmoji: '🚂' },
];

const inventionsStory: StoryChallengeSpec[] = [
  { patternType: 'AB', unit: ['gear', 'bolt'], distractors: ['wheel', 'bulb'], missing: 3, title: 'Un plan para ayudar', narrative: 'Mía soñaba con construir una máquina que pudiera llevar herramientas y plantas a quienes las necesitaran en la ciudad. Tenía muchas piezas, pero su plano se había mezclado y no sabía por dónde comenzar. Lumi descubrió una fila de engranajes y tornillos en la mesa; al completar su orden, podrán armar el corazón del nuevo ayudante.', imagePath: '/inventions-01-plan.jpg', imageAlt: 'Lumi y Mía comienzan a construir un ayudante de madera', placeholderEmoji: '⚙️' },
  { patternType: 'AAB', unit: ['wheel', 'wheel', 'bolt'], distractors: ['gear', 'magnet'], missing: 4, title: 'Ruedas para rodar', narrative: 'El ayudante abrió los ojos y saludó, pero todavía no podía moverse fuera del taller. Mía encontró cuatro ruedas de madera y Lumi revisó cuáles encajaban con los tornillos correctos. Al continuar el patrón de ruedas y tornillos, la máquina podrá dar su primer paseo sin tambalearse.', imagePath: '/inventions-02-wheels.jpg', imageAlt: 'Lumi y Mía colocan ruedas al ayudante de madera', placeholderEmoji: '🛞' },
  { patternType: 'ABB', unit: ['pinwheel', 'gear', 'gear'], distractors: ['wheel', 'bolt'], missing: 5, title: 'El puente de viento', narrative: 'Durante la prueba, el grupo llegó a un canal cuyo puente estaba levantado. Mía explicó que los molinillos atrapaban el viento y movían los engranajes, pero una pieza del mecanismo se había detenido. Lumi debe completar el orden de molinillos y engranajes para bajar el puente y enseñar al ayudante a cruzar con cuidado.', imagePath: '/inventions-03-bridge.jpg', imageAlt: 'Lumi y Mía prueban un puente de viento con su ayudante', placeholderEmoji: '✥' },
  { patternType: 'ABC', unit: ['bell', 'gear', 'bulb'], distractors: ['bolt', 'magnet'], missing: 2, title: 'Una voz musical', narrative: 'Al otro lado del canal, el ayudante quiso avisar que estaba listo, pero de su boca no salió ningún sonido. Mía reunió campanas, engranajes y bombillas para crear una voz amable que pudiera escucharse sin asustar a nadie. Cuando Lumi complete la secuencia, la máquina dará su primer saludo musical.', imagePath: '/inventions-04-voice.jpg', imageAlt: 'El ayudante toca campanas mientras Lumi y Mía escuchan', placeholderEmoji: '🔔' },
  { patternType: 'AAB', unit: ['magnet', 'magnet', 'bolt'], distractors: ['gear', 'wheel'], missing: 4, title: 'El error que enseñó', narrative: 'La siguiente prueba parecía perfecta hasta que el imán del ayudante atrajo cucharas, tornillos y herramientas de toda la plaza. Mía se sintió triste, pero Lumi le recordó que cada error muestra algo nuevo. Al comparar los imanes y tornillos del diseño, encontrarán la pieza equivocada y harán que la máquina sea más segura.', imagePath: '/inventions-05-test.jpg', imageAlt: 'Lumi y Mía aprenden de una prueba divertida con imanes', placeholderEmoji: '🧲' },
  { patternType: 'ABC', unit: ['heart', 'gear', 'bulb'], distractors: ['bell', 'bolt'], missing: 5, title: 'El gran ayudante', narrative: 'Por fin, el ayudante recorrió la ciudad llevando macetas, herramientas y sonrisas a cada vecino. Mía comprendió que su mejor invento no era solo una máquina, sino una forma de cuidar a los demás. Lumi completará la señal de corazones, engranajes y luces para celebrar que una buena idea crece cuando se prueba, se corrige y se comparte.', imagePath: '/inventions-06-helper.jpg', imageAlt: 'Lumi, Mía y el ayudante colaboran con toda la ciudad', placeholderEmoji: '💡' },
];

export const WORLDS: World[] = [
  { id: 'luciérnagas', number: 1, name: 'Bosque de Luz', subtitle: 'Ayuda a Lila a volver a casa', patternType: 'MIXTO', emoji: '✨', colors: ['#2F8273', '#B7E4BF'], coverImagePath: '/firefly-world-cover.webp', coverImageAlt: 'Lumi y Lila entrando a un bosque iluminado por luciérnagas', challenges: makeStoryChallenges('luciérnagas', fireflyStory) },
  { id: 'festival', number: 2, name: 'Festival de Nido', subtitle: 'Prepara una fiesta con Lumi', patternType: 'MIXTO', emoji: '🎪', colors: ['#D06173', '#F5C6A8'], coverImagePath: '/festival-world-cover.webp', coverImageAlt: 'Lumi y sus amigos preparando el colorido Festival de Nido', challenges: makeStoryChallenges('festival', festivalStory) },
  { id: 'arrecife', number: 3, name: 'Arrecife Arcoíris', subtitle: 'Devuelve la perla con Nara', patternType: 'MIXTO', emoji: '🐢', colors: ['#188DA2', '#A9E8E4'], coverImagePath: '/reef-world-cover.jpg', coverImageAlt: 'Lumi y Nara nadando por un arrecife de muchos colores', challenges: makeStoryChallenges('arrecife', reefStory) },
  { id: 'estaciones', number: 4, name: 'Tren de las Estaciones', subtitle: 'Recupera las señales con Tico', patternType: 'MIXTO', emoji: '🚂', colors: ['#3D7D55', '#E9C66C'], coverImagePath: '/seasons-world-cover.jpg', coverImageAlt: 'Lumi y Tico viajando en el Tren de las Estaciones', challenges: makeStoryChallenges('estaciones', seasonsStory) },
  { id: 'inventos', number: 5, name: 'Ciudad de los Inventos', subtitle: 'Construye un ayudante con Mía', patternType: 'MIXTO', emoji: '⚙️', colors: ['#B06C35', '#EBCB82'], coverImagePath: '/inventions-world-cover.jpg', coverImageAlt: 'Lumi y Mía paseando con un ayudante de madera', challenges: makeStoryChallenges('inventos', inventionsStory) },
];

export const TOTAL_CHALLENGES = WORLDS.reduce((total, world) => total + world.challenges.length, 0);
