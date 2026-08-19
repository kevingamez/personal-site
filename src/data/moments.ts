// The moments behind "The parts a CV leaves out": one card per photograph.
// Placeholder copy for now - the descriptions are the part only Kevin can write.

export interface Moment {
  src: string
  place: string
  en: { title: string; desc: string }
  es: { title: string; desc: string }
}

export const MOMENTS: Moment[] = [
  {
    src: '/posts/masters-graduation-diploma.webp',
    place: 'Uniandes · May 2026',
    en: {
      title: 'The day I graduated',
      desc: 'M.Sc. in information engineering, deep-learning track. I started my first full-time job the same week.',
    },
    es: {
      title: 'El día que me gradué',
      desc: 'Maestría en ingeniería de información, con énfasis en aprendizaje profundo. Empecé a trabajar la misma semana.',
    },
  },
  {
    src: '/posts/bogota-half-marathon-medal.webp',
    place: 'Bogotá · 2026',
    en: {
      title: 'The Bogotá half marathon',
      desc: '21 kilometres at 2,600 metres above sea level. Six months of training and I still walked the last three.',
    },
    es: {
      title: 'La media maratón de Bogotá',
      desc: '21 kilómetros a 2.600 metros de altura. Entrené seis meses y aun así los últimos tres los hice caminando.',
    },
  },
  {
    src: '/posts/masters-graduation-classmates.webp',
    place: 'Uniandes · May 2026',
    en: {
      title: 'The one with my family',
      desc: 'The people who put up with the strange years. This is the photo my mother has printed.',
    },
    es: {
      title: 'La foto con mi familia',
      desc: 'Los que aguantaron los años raros. Esta es la que mi mamá tiene impresa.',
    },
  },
  {
    src: '/posts/mac-mini-office-server.webp',
    place: 'Bogotá · 2026',
    en: {
      title: 'The server in the living room',
      desc: 'A Mac mini doing server duty at home. It runs the browser agents I would rather not pay a cloud for.',
    },
    es: {
      title: 'El servidor de la sala',
      desc: 'Un Mac mini haciendo de servidor en casa. Corre los agentes de navegador que prefiero no pagar en la nube.',
    },
  },
  {
    src: '/posts/masters-graduation-family.webp',
    place: 'Uniandes · 2026',
    en: {
      title: 'The thesis, finally',
      desc: 'Models trained on satellite imagery to find deforestation before it spreads.',
    },
    es: {
      title: 'La tesis, por fin',
      desc: 'Modelos entrenados sobre imágenes satelitales para encontrar deforestación antes de que se extienda.',
    },
  },
  {
    src: '/posts/cursor-ide-late-night-coding.webp',
    place: 'LinkedIn · 2026',
    en: {
      title: 'Learning to speak plainly',
      desc: 'You can be a great engineer and still be poor. Not because you cannot code, because you cannot explain.',
    },
    es: {
      title: 'Aprender a hablar simple',
      desc: 'Puedes ser un gran ingeniero y seguir siendo pobre. No por no saber codear, sino por no saber explicarte.',
    },
  },
  {
    src: '/posts/home-desk-command-center.webp',
    place: 'Bogotá · 2026',
    en: {
      title: 'What the turbo taught me',
      desc: 'A project that fell over in production and taught me more than any course did.',
    },
    es: {
      title: 'Lo que enseña el turbo',
      desc: 'Un proyecto que se cayó en producción y me enseñó más que cualquier curso.',
    },
  },
  {
    src: '/posts/burp-suite-supabase-capture.webp',
    place: 'Enttor · 2026',
    en: {
      title: 'The app that got hacked',
      desc: 'If you vibe coded it, it has probably been hacked already and you do not know it yet.',
    },
    es: {
      title: 'La app que hackearon',
      desc: 'Si la vibe codeaste, probablemente ya te la hackearon y todavía no lo sabes.',
    },
  },
  {
    src: '/posts/masters-graduation-friends.webp',
    place: 'Uniandes · May 2026',
    en: {
      title: 'The ones who were there',
      desc: 'The people I sat in the study room with until 3am for five years.',
    },
    es: {
      title: 'Los que estuvieron ahí',
      desc: 'La gente con la que trasnoché en la sala de estudio durante cinco años.',
    },
  },
]
