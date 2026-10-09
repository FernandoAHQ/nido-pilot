import type { Challenge, Choice, PatternItem, World } from '../types';

const item = (
  id: string,
  label: string,
  symbol: string,
  color: string,
  kind: PatternItem['kind'],
  shape?: PatternItem['shape'],
): PatternItem => ({ id, label, symbol, color, kind, shape });

export const ITEMS = {
  red: item('red', 'rojo', '', '#F15B5D', 'color', 'circle'),
  blue: item('blue', 'azul', '', '#3D78D8', 'color', 'circle'),
  yellow: item('yellow', 'amarillo', '', '#F6C945', 'color', 'circle'),
  green: item('green', 'verde', '', '#52A978', 'color', 'circle'),
  purple: item('purple', 'morado', '', '#8B68C8', 'color', 'circle'),
  orange: item('orange', 'naranja', '', '#EF8A43', 'color', 'circle'),
  circle: item('circle', 'círculo', '', '#E95D7B', 'shape', 'circle'),
  square: item('square', 'cuadrado', '', '#4D90D9', 'shape', 'square'),
  triangle: item('triangle', 'triángulo', '', '#F0A53A', 'shape', 'triangle'),
  star: item('star', 'estrella', '★', '#F2C438', 'shape', 'star'),
  diamond: item('diamond', 'rombo', '', '#916AD4', 'shape', 'diamond'),
  apple: item('apple', 'manzana', '🍎', '#F15B5D', 'object'),
  leaf: item('leaf', 'hoja', '🍃', '#55A86C', 'object'),
  fish: item('fish', 'pez', '🐟', '#4D90D9', 'object'),
  flower: item('flower', 'flor', '🌼', '#E8B82E', 'object'),
  moon: item('moon', 'luna', '🌙', '#766BC0', 'object'),
  sun: item('sun', 'sol', '☀️', '#EBAF26', 'object'),
  rocket: item('rocket', 'cohete', '🚀', '#5477C8', 'object'),
  planet: item('planet', 'planeta', '🪐', '#B86EAF', 'object'),
  heart: item('heart', 'corazón', '♥', '#E85570', 'object'),
  firefly: item('firefly', 'luciérnaga', '✨', '#F4C84E', 'object'),
  acorn: item('acorn', 'bellota', '🌰', '#A96E42', 'object'),
  berry: item('berry', 'mora', '🫐', '#6672C9', 'object'),
  bird: item('bird', 'pájaro', '🐦', '#55AFC6', 'object'),
  lantern: item('lantern', 'farol', '🏮', '#EC6957', 'object'),
  balloon: item('balloon', 'globo', '🎈', '#E75B75', 'object'),
  gift: item('gift', 'regalo', '🎁', '#8B68C8', 'object'),
  drum: item('drum', 'tambor', '🥁', '#D77845', 'object'),
  cupcake: item('cupcake', 'pastelito', '🧁', '#DB78A5', 'object'),
  flag: item('flag', 'banderín', '🚩', '#EE675A', 'object'),
};

type ItemKey = keyof typeof ITEMS;

interface ChallengeSpec {
  unit: ItemKey[];
  distractors: ItemKey[];
  missing: number;
}

const specs: Record<Challenge['patternType'], ChallengeSpec[]> = {
  AB: [
    { unit: ['red', 'blue'], distractors: ['yellow', 'green'], missing: 4 },
    { unit: ['circle', 'square'], distractors: ['triangle', 'star'], missing: 3 },
    { unit: ['apple', 'leaf'], distractors: ['flower', 'fish'], missing: 2 },
    { unit: ['yellow', 'purple'], distractors: ['orange', 'blue'], missing: 5 },
    { unit: ['fish', 'flower'], distractors: ['moon', 'apple'], missing: 1 },
    { unit: ['triangle', 'circle'], distractors: ['diamond', 'square'], missing: 4 },
  ],
  AAB: [
    { unit: ['red', 'red', 'blue'], distractors: ['yellow', 'green'], missing: 4 },
    { unit: ['star', 'star', 'circle'], distractors: ['square', 'triangle'], missing: 2 },
    { unit: ['apple', 'apple', 'leaf'], distractors: ['flower', 'fish'], missing: 5 },
    { unit: ['green', 'green', 'purple'], distractors: ['orange', 'blue'], missing: 3 },
    { unit: ['sun', 'sun', 'moon'], distractors: ['planet', 'rocket'], missing: 1 },
    { unit: ['square', 'square', 'triangle'], distractors: ['circle', 'diamond'], missing: 4 },
  ],
  ABB: [
    { unit: ['red', 'blue', 'blue'], distractors: ['yellow', 'green'], missing: 5 },
    { unit: ['circle', 'star', 'star'], distractors: ['square', 'triangle'], missing: 3 },
    { unit: ['leaf', 'apple', 'apple'], distractors: ['flower', 'fish'], missing: 1 },
    { unit: ['orange', 'purple', 'purple'], distractors: ['green', 'blue'], missing: 4 },
    { unit: ['moon', 'sun', 'sun'], distractors: ['planet', 'rocket'], missing: 2 },
    { unit: ['triangle', 'square', 'square'], distractors: ['circle', 'diamond'], missing: 5 },
  ],
  ABC: [
    { unit: ['red', 'yellow', 'blue'], distractors: ['green', 'purple'], missing: 5 },
    { unit: ['circle', 'triangle', 'square'], distractors: ['star', 'diamond'], missing: 3 },
    { unit: ['apple', 'leaf', 'flower'], distractors: ['fish', 'sun'], missing: 1 },
    { unit: ['green', 'orange', 'purple'], distractors: ['red', 'blue'], missing: 4 },
    { unit: ['rocket', 'planet', 'star'], distractors: ['moon', 'sun'], missing: 2 },
    { unit: ['diamond', 'circle', 'triangle'], distractors: ['square', 'star'], missing: 5 },
  ],
};

const makeChallenges = (worldId: string, patternType: Challenge['patternType']): Challenge[] =>
  specs[patternType].map((spec, index) => {
    const fullSequence = Array.from({ length: 6 }, (_, position) => ITEMS[spec.unit[position % spec.unit.length]]);
    const answer = fullSequence[spec.missing];
    const choices: Choice[] = [
      { ...ITEMS[spec.distractors[0]], isCorrect: false },
      { ...answer, isCorrect: true },
      { ...ITEMS[spec.distractors[1]], isCorrect: false },
    ];
    const sequence: Array<PatternItem | null> = [...fullSequence];
    sequence[spec.missing] = null;

    return {
      id: `${worldId}-${index + 1}`,
      worldId,
      patternType,
      instruction: 'Mira con atención. ¿Qué sigue en el patrón?',
      sequence,
      choices,
      repeatUnitLength: spec.unit.length,
    };
  });

interface StoryChallengeSpec extends ChallengeSpec {
  patternType: Challenge['patternType'];
  title: string;
  narrative: string;
  imagePath: string;
  imageAlt: string;
  placeholderEmoji: string;
}

const makeStoryChallenges = (worldId: string, storySpecs: StoryChallengeSpec[]): Challenge[] =>
  storySpecs.map((spec, index) => {
    const fullSequence = Array.from({ length: 6 }, (_, position) => ITEMS[spec.unit[position % spec.unit.length]]);
    const answer = fullSequence[spec.missing];
    const sequence: Array<PatternItem | null> = [...fullSequence];
    sequence[spec.missing] = null;

    return {
      id: `${worldId}-${index + 1}`,
      worldId,
      patternType: spec.patternType,
      instruction: `${spec.narrative} ¿Qué pieza sigue?`,
      sequence,
      choices: [
        { ...ITEMS[spec.distractors[0]], isCorrect: false },
        { ...answer, isCorrect: true },
        { ...ITEMS[spec.distractors[1]], isCorrect: false },
      ],
      repeatUnitLength: spec.unit.length,
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

export const WORLDS: World[] = [
  {
    id: 'jardin',
    number: 1,
    name: 'Jardín Saltarín',
    subtitle: 'Uno y otro',
    patternType: 'AB',
    emoji: '🌱',
    colors: ['#54B883', '#BFE7A9'],
    challenges: makeChallenges('jardin', 'AB'),
  },
  {
    id: 'mar',
    number: 2,
    name: 'Bahía Burbuja',
    subtitle: 'Dos iguales y uno nuevo',
    patternType: 'AAB',
    emoji: '🐠',
    colors: ['#3D91D9', '#9EDFE5'],
    challenges: makeChallenges('mar', 'AAB'),
  },
  {
    id: 'nubes',
    number: 3,
    name: 'Nubes de Algodón',
    subtitle: 'Uno nuevo y dos iguales',
    patternType: 'ABB',
    emoji: '☁️',
    colors: ['#8170D1', '#D6C8F2'],
    challenges: makeChallenges('nubes', 'ABB'),
  },
  {
    id: 'espacio',
    number: 4,
    name: 'Galaxia Brillante',
    subtitle: 'Tres amigos diferentes',
    patternType: 'ABC',
    emoji: '🪐',
    colors: ['#5554A8', '#BF77C2'],
    challenges: makeChallenges('espacio', 'ABC'),
  },
  {
    id: 'luciérnagas',
    number: 5,
    name: 'Bosque de Luz',
    subtitle: 'Ayuda a Lila a volver a casa',
    patternType: 'MIXTO',
    emoji: '✨',
    colors: ['#2F8273', '#B7E4BF'],
    coverImagePath: '/firefly-world-cover.webp',
    coverImageAlt: 'Lumi y Lila entrando a un bosque iluminado por luciérnagas',
    challenges: makeStoryChallenges('luciérnagas', fireflyStory),
  },
  {
    id: 'festival',
    number: 6,
    name: 'Festival de Nido',
    subtitle: 'Prepara una fiesta con Lumi',
    patternType: 'MIXTO',
    emoji: '🎪',
    colors: ['#D06173', '#F5C6A8'],
    coverImagePath: '/festival-world-cover.webp',
    coverImageAlt: 'Lumi y sus amigos preparando el colorido Festival de Nido',
    challenges: makeStoryChallenges('festival', festivalStory),
  },
];

export const TOTAL_CHALLENGES = WORLDS.reduce((total, world) => total + world.challenges.length, 0);
