let emocionActual = 'triste';
let nombreEmocionActual = 'Tristeza';
let nivelActual = 1;
let temporizadorAvance = null;
let clicsAcumuladosPC = 0;
let temporizadorPC = null;

// Imágenes en assets/images/ para cada emoción/actividad
const IMAGENES_JUEGO_GREGORIO = {
  ducha:    'assets/images/Gregorio en la ducha.jpg',
  burbujas: 'assets/images/Gregorio haciendo burbujas.jpg',
  caricia:  'assets/images/Gregorio en el spa.jpg',
  casita:   'assets/images/Gregorio construyendo.jpg',
  ritmo:    'assets/images/Gregorio tocando música.jpg'
};

// Una actividad principal por emoción con texto natural
const ACTIVIDAD_POR_EMOCION = {
  desagrado: {
    juego: 'ducha',
    texto: 'Cuando sientes asco puedes tomar una ducha.'
  },
  bravo: {
    juego: 'casita',
    texto: 'Cuando estás bravo puedes construir con los bloques.'
  },
  alegre: {
    juego: 'burbujas',
    texto: 'Cuando estás feliz puedes explotar burbujas.'
  },
  triste: {
    juego: 'caricia',
    texto: 'Cuando estás triste puedes ponerte cremita suave en el spa.'
  },
  asustado: {
    juego: 'ritmo',
    texto: 'Cuando sientes miedo puedes tocar música para calmarte.'
  }
};

// 5 emociones para imitar en cámara (tu dibujito de Gregorio)
const FOTOS_GREGORIO_GALERIA = [
  { id: 'alegre',    nombre: 'Alegría',  guia: 'Imita su carita feliz',    src: 'assets/images/Gregorio feliz.png' },
  { id: 'triste',    nombre: 'Tristeza', guia: 'Imita su carita triste',   src: 'assets/images/Gregorio triste.png' },
  { id: 'bravo',     nombre: 'Rabia',    guia: 'Imita su carita de rabia', src: 'assets/images/Gregorio furioso.png' },
  { id: 'asustado',  nombre: 'Miedo',    guia: 'Imita su carita asustada', src: 'assets/images/Gregorio asustado.png' },
  { id: 'desagrado', nombre: 'Asco',     guia: 'Imita su carita de asco',  src: 'assets/images/Gregorio desagrado.png' }
];

const cacheImagenesJuego = {};
function obtenerImagenJuego(clave) {
  const ruta = IMAGENES_JUEGO_GREGORIO[clave] || FOTOS_GREGORIO_GALERIA[0].src;
  if (!cacheImagenesJuego[ruta]) {
    const img = new Image();
    img.src = encodeURI(ruta);
    cacheImagenesJuego[ruta] = img;
  }
  return cacheImagenesJuego[ruta];
}

// Estado de actividades
let juegoActual = 'caricia';
let animacionJuegoId = null;
let punteroActivo = false;
let animoGregorio = 45;
let tiempoJuego = 0;

// Ducha
let chorroTrompaFrames = 0;
let pulsoTrompa = 0;
let gotasAgua = [];
let salpicadurasAgua = [];
let pompasJabon = [];
let chispasLimpieza = [];

// Burbujas
let burbujasFlotantes = [];
let anillosExplosion = [];

// Spa / Crema aplicada con el dedo
let capasCrema = [];

// Construcciones
const CONSTRUCCIONES_DISPONIBLES = [
  { nombre: 'Casita', color: '#ffbe0b' },
  { nombre: 'Torre',  color: '#48cae4' },
  { nombre: 'Puente', color: '#ff9f1c' }
];
let indiceConstruccionActual = 0;
let progresoCasita = 0;

// Música / Escala Do a Do
let audioCtx = null;
let notasFlotantes = [];
let notaActivaBaqueta = 0;
const ESCALA_DO_OCTAVA = [
  { nota: 'Do',  freq: 261.63 },
  { nota: 'Re',  freq: 293.66 },
  { nota: 'Mi',  freq: 329.63 },
  { nota: 'Fa',  freq: 349.23 },
  { nota: 'Sol', freq: 392.00 },
  { nota: 'La',  freq: 440.00 },
  { nota: 'Si',  freq: 493.88 },
  { nota: 'Do',  freq: 523.25 }
];
let pulsoNota = new Array(ESCALA_DO_OCTAVA.length).fill(0);

// Estado de cámara y foto
let streamCamara = null;
let animacionCamaraId = null;
const imagenesGaleriaCargadas = {};
let fotoGregorioSeleccionadaId = FOTOS_GREGORIO_GALERIA[0].id;
let imagenGregorioCamara = null;
let posGregorioCamaraX = 235;
let posGregorioCamaraY = 200;
let tamanoGregorioCamara = 105;
let arrastrandoGregorio = false;
let ultimaFotoDataUrl = '';
let tiempoCamara = 0;

const RITUALES_POR_EMOCION = {
  triste: {
    1: {
      titulo: "Ritual 1. La caricia de Gregorio",
      nivelLabel: "NIVEL 1",
      etiqueta: "RITUAL 1 · LA CARICIA DE GREGORIO",
      progreso: "33.3%",
      resumen: "Pon tu manito con la palma hacia arriba y acaricia tu pulgar suavemente desde la base hasta la punta.",
      proposito: "Ofrecer una experiencia breve de contacto suave y atención corporal.",
      materiales: "Ninguno.",
      pasos: [
        "Coloca una mano frente a ti con la palma hacia arriba.",
        "Con el dedo índice de la otra mano, acaricia suavemente el pulgar.",
        "Recorre el pulgar desde la base hasta la punta.",
        "Repite en el otro pulgar si quieres."
      ],
      guion: "A veces la tristeza llega despacito. Pon tu manito aquí y, con tu dedito índice, acaricia tu pulgar suavemente.",
      acompanamiento: "Validar sin presionar y ofrecer compañía tranquila.",
      imagen: "assets/images/Ritual 1 tristeza.jpg",
      audio: "audios/tristeza_nivel1.mp3"
    },
    2: {
      titulo: "Ritual 2. El abrazo de deditos",
      nivelLabel: "NIVEL 2",
      etiqueta: "RITUAL 2 · EL ABRAZO DE DEDITOS",
      progreso: "66.6%",
      resumen: "Acerca tus dos manos frente a tu pecho y entrelaza tus deditos suavemente, sin apretar.",
      proposito: "Ofrecer una experiencia de contacto y contención.",
      materiales: "Ninguno.",
      pasos: [
        "Acerca las dos manos frente a tu pecho.",
        "Entrelaza los dedos suavemente.",
        "Mantén las manos juntas unos segundos si te resulta cómodo.",
        "Separa los dedos despacio."
      ],
      guion: "Vamos a juntar los deditos suavemente, sin apretar, como un pequeño abrazo.",
      acompanamiento: "Preguntar antes de abrazar y respetar lo que el niño elija.",
      imagen: "assets/images/Ritual 2 tristeza.jpg",
      audio: "audios/tristeza_nivel2.mp3"
    },
    3: {
      titulo: "Ritual 3. El nido de Gregorio",
      nivelLabel: "NIVEL 3",
      etiqueta: "RITUAL 3 · EL NIDO DE GREGORIO",
      progreso: "100%",
      resumen: "Con un peluche o cojín cerca, envuélvelo con tus manos y saluda cada dedo con tu índice.",
      proposito: "Facilitar la búsqueda de seguridad y consuelo cuando la tristeza es intensa.",
      materiales: "Peluche o cojín y adulto de confianza.",
      pasos: [
        "Busca un peluche o cojín suave.",
        "Envuélvelo con tus manos.",
        "Saluda cada dedo con tu índice.",
        "Quédate acompañado el tiempo que necesites."
      ],
      guion: "Si hoy necesitas consuelo, busca tu peluche o cojín. Yo me quedo aquí contigo.",
      acompanamiento: "Ofrecer presencia calmada sin exigir hablar ni dejar de llorar.",
      imagen: "assets/images/Ritual 3 tristeza.jpg",
      audio: "audios/tristeza_nivel3.mp3"
    }
  },
  bravo: {
    1: {
      titulo: "Ritual 4. El detective de las manos",
      nivelLabel: "NIVEL 1",
      etiqueta: "RITUAL 4 · EL DETECTIVE DE LAS MANOS",
      progreso: "33.3%",
      resumen: "Abre tu palma y dibuja una espiral despacio con el índice de la otra mano; luego recorre su contorno.",
      proposito: "Notar señales tempranas de rabia en el cuerpo.",
      materiales: "Ninguno.",
      pasos: [
        "Abre una mano y mira tu palma.",
        "Dibuja una espiral despacio con el otro índice.",
        "Recorre el borde de la palma."
      ],
      guion: "Cuando llega la rabia, nuestras manos nos avisan. Dibujemos una espiral suave en la palma.",
      acompanamiento: "Ayudar a nombrar lo que pasó sin pedir explicaciones largas.",
      imagen: "assets/images/Ritual 1 rabia.jpg",
      audio: "audios/rabia_nivel1.mp3"
    },
    2: {
      titulo: "Ritual 5. La fábrica de plastilina",
      nivelLabel: "NIVEL 2",
      etiqueta: "RITUAL 5 · LA FÁBRICA DE PLASTILINA",
      progreso: "66.6%",
      resumen: "Aplasta suavemente la plastilina con tus dedos, haz huequitos con los pulgares y crea algo nuevo.",
      proposito: "Canalizar energía con las manos de forma segura.",
      materiales: "Plastilina blanda.",
      pasos: [
        "Toma un trozo de plastilina.",
        "Aplástala con los dedos.",
        "Haz huequitos con los pulgares y dale forma."
      ],
      guion: "Usa tus manos con la plastilina para transformar esa energía en algo que tú elijas.",
      acompanamiento: "Ofrecer alternativas blandas si la textura no agrada.",
      imagen: "assets/images/Ritual 2 rabia.jpg",
      audio: "audios/rabia_nivel2.mp3"
    },
    3: {
      titulo: "Ritual 6. El volcán encuentra una salida",
      nivelLabel: "NIVEL 3",
      etiqueta: "RITUAL 6 · EL VOLCÁN ENCUENTRA UNA SALIDA",
      progreso: "100%",
      resumen: "Apoya palmas y dedos en un cojín firme, empuja suavemente unos segundos y suelta.",
      proposito: "Cuidar la seguridad cuando hay mucha activación.",
      materiales: "Cojín firme y adulto acompañante.",
      pasos: [
        "Apoya las manos en un cojín firme.",
        "Empuja suavemente unos segundos.",
        "Suelta y haz una pausa."
      ],
      guion: "Si tienes mucha fuerza acumulada, empujemos este cojín con cuidado y luego soltamos.",
      acompanamiento: "Priorizar siempre la seguridad y hablar con calma y pocas palabras.",
      imagen: "assets/images/Ritual 3 rabia.jpg",
      audio: "audios/rabia_nivel3.mp3"
    }
  },
  alegre: {
    1: {
      titulo: "Ritual 7. El saludo de los cinco amigos",
      nivelLabel: "NIVEL 1",
      etiqueta: "RITUAL 7 · SALUDO DE LOS CINCO AMIGOS",
      progreso: "33.3%",
      resumen: "Abre los cinco dedos, haz que saluden y toca suavemente cada uno con tu pulgar.",
      proposito: "Expresar la alegría con movimiento.",
      materiales: "Ninguno.",
      pasos: [
        "Abre los cinco dedos.",
        "Haz que saluden.",
        "Toca cada uno con el pulgar."
      ],
      guion: "Tus cinco deditos están contentos hoy. Haz que saluden y cuenten qué te alegró.",
      acompanamiento: "Acompañar y compartir la alegría del niño.",
      imagen: "assets/images/Ritual alegría 1.jpg",
      audio: "audios/alegria_nivel1.mp3"
    },
    2: {
      titulo: "Ritual 8. La orquesta de los dedos",
      nivelLabel: "NIVEL 2",
      etiqueta: "RITUAL 8 · LA ORQUESTA DE LOS DEDOS",
      progreso: "66.6%",
      resumen: "Pon tus manos sobre una mesa, toca con los dedos uno a uno e inventa un ritmo corto.",
      proposito: "Organizar la energía mediante ritmo.",
      materiales: "Una mesa.",
      pasos: [
        "Apoya las manos sobre la mesa.",
        "Toca con cada dedo uno a uno.",
        "Inventa un ritmo corto."
      ],
      guion: "Hagamos un ritmo suave con los deditos sobre la mesa.",
      acompanamiento: "Seguir el ritmo y facilitar transiciones tranquilas.",
      imagen: "assets/images/Ritual 2 alegría.jpg",
      audio: "audios/alegria_nivel2.mp3"
    },
    3: {
      titulo: "Ritual 9. La misión de los exploradores",
      nivelLabel: "NIVEL 3",
      etiqueta: "RITUAL 9 · MISIÓN DE EXPLORADORES",
      progreso: "100%",
      resumen: "Camina por un camino corto y seguro y, al llegar, junta el pulgar con el índice y los demás dedos.",
      proposito: "Canalizar energía alta con un recorrido breve.",
      materiales: "Espacio despejado.",
      pasos: [
        "Camina por el espacio indicado.",
        "Al llegar, junta pulgar con índice.",
        "Toca los demás dedos uno por uno."
      ],
      guion: "Caminemos hasta el punto marcado y juntamos los deditos al llegar.",
      acompanamiento: "Mantener el recorrido seguro y breve.",
      imagen: "assets/images/Ritual 3 alegría.jpg",
      audio: "audios/alegria_nivel3.mp3"
    }
  },
  asustado: {
    1: {
      titulo: "Ritual 10. Los dedos amigos",
      nivelLabel: "NIVEL 1",
      etiqueta: "RITUAL 10 · LOS DEDOS AMIGOS",
      progreso: "33.3%",
      resumen: "Junta la punta del pulgar con la del índice, sepáralos despacio y vuelve a juntarlos.",
      proposito: "Dar un punto de atención sencillo ante el miedo.",
      materiales: "Ninguno.",
      pasos: [
        "Junta pulgar e índice.",
        "Sepáralos despacio.",
        "Vuélvelos a juntar."
      ],
      guion: "Juntamos el pulgar y el índice despacio, y miramos a nuestro alrededor con calma.",
      acompanamiento: "Escuchar qué asustó y retirar si hay peligro real.",
      imagen: "assets/images/Ritual 1 miedo.jpg",
      audio: "audios/miedo_nivel1.mp3"
    },
    2: {
      titulo: "Ritual 11. La casita protectora",
      nivelLabel: "NIVEL 2",
      etiqueta: "RITUAL 11 · LA CASITA PROTECTORA",
      progreso: "66.6%",
      resumen: "Acerca tus dos manos con las palmas enfrentadas y une las puntas de los dedos como un techito.",
      proposito: "Representar un lugar o persona de confianza.",
      materiales: "Ninguno.",
      pasos: [
        "Enfrenta las dos palmas.",
        "Une las puntas de los dedos como un techo.",
        "Piensa dónde o con quién te sientes seguro."
      ],
      guion: "Formemos un techito con las manos y pensemos con quién nos sentimos seguros.",
      acompanamiento: "Brindar protección real y explicaciones claras si algo asusta.",
      imagen: "assets/images/Ritual 2 miedo.jpg",
      audio: "audios/miedo_nivel2.mp3"
    },
    3: {
      titulo: "Ritual 12. El camino hacia alguien de confianza",
      nivelLabel: "NIVEL 3",
      etiqueta: "RITUAL 12 · CAMINO A ALGUIEN DE CONFIANZA",
      progreso: "100%",
      resumen: "Toca tu palma con tu dedito índice como señal de ayuda y ve con tu adulto de confianza.",
      proposito: "Pedir apoyo cuando el miedo es grande.",
      materiales: "Adulto de confianza.",
      pasos: [
        "Toca tu palma con el índice.",
        "Acércate a un adulto de confianza.",
        "Pide ayuda a tu manera."
      ],
      guion: "Cuando el miedo es grande, puedes buscar a alguien que te cuide y pedir ayuda.",
      acompanamiento: "Acercarse con calma, ponerse a su altura y proteger.",
      imagen: "assets/images/Ritual 3 miedo.jpg",
      audio: "audios/miedo_nivel3.mp3"
    }
  },
  desagrado: {
    1: {
      titulo: "Ritual 13. Mi dedo dice «no, gracias»",
      nivelLabel: "NIVEL 1",
      etiqueta: "RITUAL 13 · MI DEDO DICE «NO, GRACIAS»",
      progreso: "33.3%",
      resumen: "Levanta tu dedo índice, muévelo suavemente de un lado a otro y di «No, gracias» o «No me gusta».",
      proposito: "Expresar rechazo con claridad y respeto.",
      materiales: "Ninguno.",
      pasos: [
        "Levanta el dedo índice.",
        "Muévelo suave de un lado a otro.",
        "Di «No, gracias» o «No me gusta»."
      ],
      guion: "Si algo no te gusta, puedes levantar tu dedito y decir «No, gracias».",
      acompanamiento: "Respetar el rechazo sin obligar a probar o tocar.",
      imagen: "assets/images/Ritual 1 desagrado.jpg",
      audio: "audios/asco_nivel1.mp3"
    },
    2: {
      titulo: "Ritual 14. Los deditos exploradores se alejan",
      nivelLabel: "NIVEL 2",
      etiqueta: "RITUAL 14 · LOS DEDITOS SE ALEJAN",
      progreso: "66.6%",
      resumen: "Pon índice y medio como dos piernas sobre tu palma y hazlos caminar hacia el borde para alejarse.",
      proposito: "Practicar tomar distancia de lo que incomoda.",
      materiales: "Ninguno.",
      pasos: [
        "Abre una palma.",
        "Pon índice y medio como dos piernas.",
        "Camina hacia el borde para alejarte."
      ],
      guion: "Si algo te incomoda, tus deditos pueden caminar hacia el borde y tomar distancia.",
      acompanamiento: "Retirar el estímulo desagradable cuando sea posible.",
      imagen: "assets/images/Ritual 2 desagrado.jpg",
      audio: "audios/asco_nivel2.mp3"
    },
    3: {
      titulo: "Ritual 15. La misión de las manos limpias",
      nivelLabel: "NIVEL 3",
      etiqueta: "RITUAL 15 · MISIÓN DE LAS MANOS LIMPIAS",
      progreso: "100%",
      resumen: "Si tus manos están sucias, usa agua y jabón: frota palmas, dorso, entre los dedos y yemas; luego seca.",
      proposito: "Atender el asco cuando hay suciedad real.",
      materiales: "Agua, jabón y toalla.",
      pasos: [
        "Moja las manos y aplica jabón.",
        "Frota palmas, dorso, entre dedos y yemas.",
        "Enjuaga y seca bien."
      ],
      guion: "Si tocaste algo que te dio asco o ensució tus manos, lavémoslas con calma y sécalas.",
      acompanamiento: "Usar solo cuando haya suciedad real, sin volverlo repetitivo.",
      imagen: "assets/images/Ritual 3 desagrado.jpg",
      audio: "audios/asco_nivel3.mp3"
    }
  }
};

function irA(idPantalla) {
  clearTimeout(temporizadorAvance);
  cancelAnimationFrame(animacionJuegoId);
  if (idPantalla !== 'pantalla-camara') {
    detenerCamaraElefante();
  }

  const reproductor = document.getElementById('mi-audio-gregorio');
  if (reproductor) {
    reproductor.pause();
    reproductor.currentTime = 0;
  }
  const btnPlay = document.getElementById('btn-play');
  if (btnPlay) btnPlay.textContent = '▶';

  cerrarModalFicha();
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  const destino = document.getElementById(idPantalla);
  if (destino) destino.classList.add('activa');
}

function tocarGregorioInicio() {
  const imagen = document.getElementById('img-gregorio-inicio');
  const burbuja = document.getElementById('burbuja-saludo');

  const saludos = [
    "Hola, soy Gregorio, un elefante científico de Tanzania. Estoy aquí para ayudarte con lo que sientes.",
    "Me gusta investigar cómo se sienten las personas cuando están tristes, bravas o contentas.",
    "Toca el botón de abajo cuando quieras comenzar."
  ];

  if (burbuja) {
    burbuja.textContent = saludos[Math.floor(Math.random() * saludos.length)];
  }

  if (imagen) {
    imagen.classList.remove('salto-gregorio');
    void imagen.offsetWidth;
    imagen.classList.add('salto-gregorio');
  }
}

function seleccionarEmocion(clave, nombreBonito) {
  emocionActual = clave;
  nombreEmocionActual = nombreBonito;

  document.getElementById('badge-emocion').textContent = nombreBonito.toUpperCase();
  document.getElementById('numero-dedos').textContent = '?';
  limpiarHuellasCamino();

  irA('pantalla-dedos');
}

function crearHuellaElefanteSVG(indice) {
  const huella = document.createElement('div');
  huella.className = 'huella-caminito';

  const posicionesCamino = [
    { x: 75,  y: 145 },
    { x: 180, y: 95  },
    { x: 280, y: 145 }
  ];

  const pos = posicionesCamino[indice] || { x: 180, y: 120 };
  huella.style.left = pos.x + 'px';
  huella.style.top = pos.y + 'px';

  huella.innerHTML = `
    <svg viewBox="0 0 100 100" width="56" height="56">
      <ellipse cx="50" cy="62" rx="26" ry="22" fill="#ffd166" stroke="#fb8500" stroke-width="4"/>
      <circle cx="26" cy="35" r="10" fill="#ffd166" stroke="#fb8500" stroke-width="3.5"/>
      <circle cx="50" cy="26" r="11" fill="#ffd166" stroke="#fb8500" stroke-width="3.5"/>
      <circle cx="74" cy="35" r="10" fill="#ffd166" stroke="#fb8500" stroke-width="3.5"/>
    </svg>
  `;
  return huella;
}

function limpiarHuellasCamino() {
  const contenedor = document.getElementById('huellas-camino');
  if (contenedor) contenedor.innerHTML = '';
  const textoGuia = document.getElementById('texto-guia-camino');
  if (textoGuia) textoGuia.style.display = 'block';
}

function obtenerRitualActivo() {
  const grupo = RITUALES_POR_EMOCION[emocionActual] || RITUALES_POR_EMOCION['triste'];
  return grupo[nivelActual] || grupo[1];
}

function reproducirSonidoHuellita(indiceHuella = 0, nivel = 1) {
  try {
    const ctx = asegurarAudioCtx();
    if (!ctx) return;

    const notasNivel = [392.00, 440.00, 523.25];
    const freqBase = notasNivel[Math.min(indiceHuella, 2)] || 392.00;
    const inicio = ctx.currentTime + indiceHuella * 0.11;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqBase * (0.95 + nivel * 0.03), inicio);
    osc.frequency.exponentialRampToValueAtTime(freqBase * 1.25, inicio + 0.11);

    gain.gain.setValueAtTime(0.001, inicio);
    gain.gain.exponentialRampToValueAtTime(0.14, inicio + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(inicio);
    osc.stop(inicio + 0.17);
  } catch (e) {}
}

function registrarCaminoDedos(cantidad) {
  if (navigator.vibrate) {
    navigator.vibrate(45);
  }

  nivelActual = Math.min(Math.max(cantidad, 1), 3);
  document.getElementById('numero-dedos').textContent = nivelActual;

  const contenedor = document.getElementById('huellas-camino');
  contenedor.innerHTML = '';
  document.getElementById('texto-guia-camino').style.display = 'none';

  for (let i = 0; i < nivelActual; i++) {
    contenedor.appendChild(crearHuellaElefanteSVG(i));
    reproducirSonidoHuellita(i, nivelActual);
  }

  const infoRitual = obtenerRitualActivo();

  document.getElementById('etiqueta-nombre-ritual').textContent = infoRitual.etiqueta;
  document.getElementById('descripcion-ritual-fisico').textContent = infoRitual.resumen;
  document.getElementById('barra-progreso-nivel').style.width = infoRitual.progreso;

  const imgRitual = document.getElementById('img-ritual-gregorio');
  if (imgRitual && infoRitual.imagen) {
    imgRitual.src = encodeURI(infoRitual.imagen);
  }

  clearTimeout(temporizadorAvance);
  temporizadorAvance = setTimeout(() => {
    irA('pantalla-ritual');
  }, 1300);
}

const zonaTactil = document.getElementById('zona-tactil');

if (zonaTactil) {
  zonaTactil.addEventListener('touchstart', function (e) {
    e.preventDefault();
    const toques = Math.min(e.touches.length, 3);
    registrarCaminoDedos(toques);
  }, { passive: false });

  zonaTactil.addEventListener('mousedown', function () {
    if (clicsAcumuladosPC === 0 || clicsAcumuladosPC >= 3) {
      clicsAcumuladosPC = 0;
    }

    clicsAcumuladosPC++;
    registrarCaminoDedos(clicsAcumuladosPC);

    clearTimeout(temporizadorPC);
    temporizadorPC = setTimeout(() => {
      clicsAcumuladosPC = 0;
    }, 1300);
  });
}

function simularCaminoPC(cantidad) {
  registrarCaminoDedos(cantidad);
}

function tocarGregorioRitual() {
  const nube = document.querySelector('.contenedor-nube-ritual-externa');
  if (nube) {
    nube.classList.remove('salto-gregorio');
    void nube.offsetWidth;
    nube.classList.add('salto-gregorio');
  }

  toggleAudioPropio();
}

function toggleAudioPropio() {
  const reproductor = document.getElementById('mi-audio-gregorio');
  const boton = document.getElementById('btn-play');
  const infoRitual = obtenerRitualActivo();

  if (reproductor.getAttribute('data-track') !== infoRitual.audio) {
    reproductor.src = infoRitual.audio;
    reproductor.setAttribute('data-track', infoRitual.audio);
  }

  if (reproductor.paused) {
    reproductor.play().then(() => {
      boton.textContent = '⏸';
    }).catch(() => {
      abrirModalFicha();
    });
  } else {
    reproductor.pause();
    boton.textContent = '▶';
  }
}

function abrirModalFicha() {
  const info = obtenerRitualActivo();
  document.getElementById('ficha-titulo').textContent = `${info.titulo} (${info.nivelLabel})`;
  document.getElementById('ficha-proposito').textContent = info.proposito;
  document.getElementById('ficha-materiales').textContent = info.materiales;
  document.getElementById('ficha-guion').textContent = info.guion;
  document.getElementById('ficha-acompanamiento').textContent = info.acompanamiento;

  const listaPasos = document.getElementById('ficha-pasos');
  listaPasos.innerHTML = '';
  info.pasos.forEach(paso => {
    const li = document.createElement('li');
    li.textContent = paso;
    listaPasos.appendChild(li);
  });

  document.getElementById('modal-ficha-ritual').classList.remove('oculto');
}

function cerrarModalFicha(event) {
  if (!event || event.target.id === 'modal-ficha-ritual') {
    document.getElementById('modal-ficha-ritual').classList.add('oculto');
  }
}

// Sonidos con Web Audio API
function asegurarAudioCtx() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) audioCtx = new AudioContextClass();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function reproducirNotaEscala(indice) {
  try {
    const ctx = asegurarAudioCtx();
    if (!ctx) return;
    const item = ESCALA_DO_OCTAVA[indice] || ESCALA_DO_OCTAVA[0];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(item.freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.46);
  } catch (e) {}
}

function reproducirSonidoBurbuja(dorada = false) {
  try {
    const ctx = asegurarAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const base = dorada ? 520 : 340 + Math.random() * 140;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(base * 2.1, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {}
}

function reproducirSonidoAgua(esPompa = false) {
  try {
    const ctx = asegurarAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    if (esPompa) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);
    } else {
      osc.type = 'triangle';
      const inicio = 260 + Math.random() * 120;
      osc.frequency.setValueAtTime(inicio, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(inicio * 0.65, ctx.currentTime + 0.12);
    }

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.11, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  } catch (e) {}
}

function reproducirSonidoMasaje() {
  try {
    const ctx = asegurarAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(392, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.19);
  } catch (e) {}
}

function reproducirSonidoConstruir(progreso = 50) {
  try {
    const ctx = asegurarAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 240 + (progreso / 100) * 280;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.18, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.11);
  } catch (e) {}
}

function reproducirSonidoCamara() {
  try {
    const ctx = asegurarAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch (e) {}
}

// ========================================================
// ACTIVIDADES POR EMOCIÓN
// ========================================================
function actualizarAnimoPou(delta) {
  animoGregorio = Math.max(15, Math.min(100, animoGregorio + delta));
  const barra = document.getElementById('barra-animo-gregorio');
  if (barra) barra.style.width = `${animoGregorio}%`;
}

function setMensajePou(texto) {
  const el = document.getElementById('mensaje-pou-gregorio');
  if (el) el.textContent = texto;
}

function abrirPantallaVideojuegos() {
  const config = ACTIVIDAD_POR_EMOCION[emocionActual] || ACTIVIDAD_POR_EMOCION.triste;

  document.getElementById('badge-juego-contexto').textContent =
    `${nombreEmocionActual.toUpperCase()} · NV.${nivelActual}`;

  irA('pantalla-videojuegos');
  const btn = document.querySelector(`.dock-arcade .arcade-btn[data-juego="${config.juego}"]`);
  seleccionarMinijuego(config.juego, btn, config.texto);
}

function generarBurbujasPou(cantidad = 7) {
  burbujasFlotantes = [];
  for (let i = 0; i < cantidad; i++) {
    burbujasFlotantes.push({
      x: 45 + Math.random() * 235,
      y: 65 + Math.random() * 190,
      r: 18 + Math.random() * 10,
      vy: -0.45 - Math.random() * 0.45,
      fase: Math.random() * Math.PI * 2,
      dorada: i === 0
    });
  }
}

function seleccionarMinijuego(tipo, elementoBoton = null, textoEmocion = '') {
  juegoActual = tipo;
  document.querySelectorAll('.dock-arcade .arcade-btn').forEach(b => b.classList.remove('activo'));
  if (elementoBoton) elementoBoton.classList.add('activo');

  obtenerImagenJuego(tipo);

  const guia = document.getElementById('guia-juego-dedos');
  gotasAgua = [];
  salpicadurasAgua = [];
  pompasJabon = [];
  chispasLimpieza = [];
  anillosExplosion = [];
  capasCrema = [];
  notasFlotantes = [];
  notaActivaBaqueta = 0;
  pulsoNota.fill(0);
  progresoCasita = 0;
  chorroTrompaFrames = 0;
  pulsoTrompa = 0;

  const entradaEmocion = Object.values(ACTIVIDAD_POR_EMOCION).find(item => item.juego === tipo);
  const fraseBase = textoEmocion || (entradaEmocion ? entradaEmocion.texto : '');

  if (tipo === 'ducha') {
    pompasJabon = [
      { x: 145, y: 190, r: 12 },
      { x: 178, y: 210, r: 14 },
      { x: 160, y: 170, r: 10 }
    ];
  } else if (tipo === 'burbujas') {
    generarBurbujasPou(7);
  }

  setMensajePou(fraseBase);
  if (guia) guia.textContent = fraseBase;

  iniciarLoopJuego();
}

function obtenerZonaTrompa(canvas) {
  return {
    x: canvas.width * 0.75,
    y: canvas.height * 0.25,
    radio: 22
  };
}

function activarChorroTrompa(canvas, intensidad = 1) {
  chorroTrompaFrames = 26;
  pulsoTrompa = 10;
  const trompa = obtenerZonaTrompa(canvas);

  for (let i = 0; i < 8 * intensidad; i++) {
    gotasAgua.push({
      x: trompa.x + (Math.random() * 8 - 4),
      y: trompa.y + 3,
      vx: 0.2 + Math.random() * 1.0,
      vy: 1.5 + Math.random() * 1.9,
      vida: 46
    });
  }
}

function trazarRectanguloRedondeado(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function dibujarGregorioImagen(ctx, canvas, claveJuego, opciones = {}) {
  const { respira = 0 } = opciones;
  const img = obtenerImagenJuego(claveJuego);
  const escala = 1 + Math.sin(respira) * 0.015 - pulsoTrompa * 0.003;

  ctx.save();
  trazarRectanguloRedondeado(ctx, 0, 0, canvas.width, canvas.height, 18);
  ctx.clip();

  if (img && img.complete && img.naturalWidth > 0) {
    const ratio = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const drawW = img.naturalWidth * ratio * escala;
    const drawH = img.naturalHeight * ratio * escala;
    ctx.drawImage(
      img,
      (canvas.width - drawW) / 2,
      (canvas.height - drawH) / 2,
      drawW,
      drawH
    );
  } else {
    ctx.fillStyle = '#caf0f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1d3557';
    ctx.font = 'bold 16px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gregorio', canvas.width / 2, canvas.height / 2);
  }

  ctx.restore();

  if (claveJuego === 'ducha') {
    const trompa = obtenerZonaTrompa(canvas);
    ctx.save();
    ctx.strokeStyle = chorroTrompaFrames > 0 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(trompa.x, trompa.y, trompa.radio * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function obtenerPuntosEscala() {
  return [
    { x: 34,  y: 84, idx: 0 },
    { x: 64,  y: 62, idx: 1 },
    { x: 96,  y: 44, idx: 2 },
    { x: 136, y: 36, idx: 3 },
    { x: 182, y: 36, idx: 4 },
    { x: 222, y: 44, idx: 5 },
    { x: 254, y: 62, idx: 6 },
    { x: 286, y: 84, idx: 7 }
  ];
}

function manejarToqueJuego(clientX, clientY, esArrastre = false) {
  const canvas = document.getElementById('canvas-juego-dedos');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * canvas.width;
  const y = ((clientY - rect.top) / rect.height) * canvas.height;

  if (juegoActual === 'ducha') {
    const trompa = obtenerZonaTrompa(canvas);
    const tocoTrompa = Math.hypot(x - trompa.x, y - trompa.y) <= trompa.radio + 14;

    if (tocoTrompa || !esArrastre) {
      activarChorroTrompa(canvas, tocoTrompa ? 1.4 : 1);
      reproducirSonidoAgua(false);
      actualizarAnimoPou(3);
      if (navigator.vibrate) navigator.vibrate(20);
    } else if (chorroTrompaFrames > 0) {
      activarChorroTrompa(canvas, 0.7);
    }

    pompasJabon = pompasJabon.filter(p => {
      const lejos = Math.hypot(x - p.x, y - p.y) > p.r + 18;
      if (!lejos) {
        reproducirSonidoAgua(true);
        for (let k = 0; k < 6; k++) {
          chispasLimpieza.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            vida: 22
          });
        }
      }
      return lejos;
    });
  } else if (juegoActual === 'burbujas') {
    burbujasFlotantes.forEach(b => {
      if (Math.hypot(x - b.x, y - b.y) <= b.r + 14) {
        anillosExplosion.push({
          x: b.x,
          y: b.y,
          r: b.r * 0.6,
          color: b.dorada ? '#ff9f1c' : '#0096c7',
          vida: 20
        });
        reproducirSonidoBurbuja(b.dorada);
        b.y = canvas.height + 25;
        b.x = 45 + Math.random() * 235;
        actualizarAnimoPou(3);
        if (navigator.vibrate) navigator.vibrate(20);
      }
    });
  } else if (juegoActual === 'caricia') {
    capasCrema.push({
      x,
      y,
      r: 18,
      alpha: 0.72
    });
    if (capasCrema.length > 55) capasCrema.shift();
    if (!esArrastre || Math.random() < 0.25) {
      reproducirSonidoMasaje();
    }
    actualizarAnimoPou(esArrastre ? 1.5 : 2.5);
  } else if (juegoActual === 'casita') {
    const actual = CONSTRUCCIONES_DISPONIBLES[indiceConstruccionActual];
    if (!esArrastre) {
      progresoCasita = Math.min(100, progresoCasita + 20);
      reproducirSonidoConstruir(progresoCasita);
      actualizarAnimoPou(3);

      if (progresoCasita >= 100) {
        indiceConstruccionActual = (indiceConstruccionActual + 1) % CONSTRUCCIONES_DISPONIBLES.length;
        const siguiente = CONSTRUCCIONES_DISPONIBLES[indiceConstruccionActual];
        progresoCasita = 0;
        setMensajePou(`Cuando estás bravo puedes construir con los bloques (${siguiente.nombre}).`);
      } else {
        setMensajePou(`Cuando estás bravo puedes construir con los bloques (${actual.nombre} ${progresoCasita}%).`);
      }
      if (navigator.vibrate) navigator.vibrate(18);
    }
  } else if (juegoActual === 'ritmo' && !esArrastre) {
    const puntos = obtenerPuntosEscala();
    puntos.forEach((pt, idx) => {
      if (Math.hypot(x - pt.x, y - pt.y) <= 22) {
        notaActivaBaqueta = idx;
        pulsoNota[idx] = 18;
        reproducirNotaEscala(idx);
        actualizarAnimoPou(3);
        const infoNota = ESCALA_DO_OCTAVA[idx];
        notasFlotantes.push({
          x: pt.x,
          y: Math.max(18, pt.y - 16),
          vy: -0.9,
          texto: `♪ ${infoNota.nota}`,
          vida: 34
        });
        if (navigator.vibrate) navigator.vibrate(18);
      }
    });
  }
}

function configurarEventosCanvasJuego() {
  const canvas = document.getElementById('canvas-juego-dedos');
  if (!canvas || canvas.dataset.listo) return;
  canvas.dataset.listo = '1';

  canvas.addEventListener('pointerdown', e => {
    punteroActivo = true;
    manejarToqueJuego(e.clientX, e.clientY, false);
  });

  canvas.addEventListener('pointermove', e => {
    if (!punteroActivo && e.pointerType === 'mouse') return;
    manejarToqueJuego(e.clientX, e.clientY, true);
  });

  window.addEventListener('pointerup', () => {
    punteroActivo = false;
  });
}

function iniciarLoopJuego() {
  configurarEventosCanvasJuego();
  cancelAnimationFrame(animacionJuegoId);

  const canvas = document.getElementById('canvas-juego-dedos');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function frame() {
    tiempoJuego += 0.04;
    if (chorroTrompaFrames > 0) chorroTrompaFrames--;
    if (pulsoTrompa > 0) pulsoTrompa--;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dibujarGregorioImagen(ctx, canvas, juegoActual, {
      respira: tiempoJuego
    });

    if (juegoActual === 'ducha') {
      if (chorroTrompaFrames > 0 && chorroTrompaFrames % 2 === 0) {
        const trompa = obtenerZonaTrompa(canvas);
        gotasAgua.push({
          x: trompa.x + (Math.random() * 8 - 4),
          y: trompa.y + 3,
          vx: 0.2 + Math.random() * 1.0,
          vy: 1.5 + Math.random() * 1.6,
          vida: 44
        });
      }

      const pisoAgua = canvas.height - 20;
      gotasAgua.forEach(g => {
        g.x += g.vx;
        g.y += g.vy;
        g.vy += 0.14;
        g.vida--;

        if (g.y >= pisoAgua) {
          salpicadurasAgua.push({ x: g.x, y: pisoAgua, r: 2, vida: 14 });
          g.vida = 0;
        }

        ctx.fillStyle = `rgba(0, 150, 199, ${Math.max(0, g.vida / 44)})`;
        ctx.beginPath();
        ctx.arc(g.x, g.y, 4.3, 0, Math.PI * 2);
        ctx.fill();
      });
      gotasAgua = gotasAgua.filter(g => g.vida > 0);

      salpicadurasAgua.forEach(s => {
        s.r += 1.1;
        s.vida--;
        ctx.strokeStyle = `rgba(72, 202, 228, ${Math.max(0, s.vida / 14)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.r * 1.5, s.r * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      salpicadurasAgua = salpicadurasAgua.filter(s => s.vida > 0);

      pompasJabon.forEach((p, idx) => {
        const wob = Math.sin(tiempoJuego * 2 + idx) * 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.strokeStyle = '#00b4d8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x + wob, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      chispasLimpieza.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.vida--;
        ctx.fillStyle = `rgba(255, 159, 28, ${Math.max(0, c.vida / 22)})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      chispasLimpieza = chispasLimpieza.filter(c => c.vida > 0);
    } else if (juegoActual === 'burbujas') {
      burbujasFlotantes.forEach(b => {
        b.y += b.vy;
        b.x += Math.sin(tiempoJuego * 1.4 + b.fase) * 0.7;
        if (b.y < -25) {
          b.y = canvas.height + 20;
          b.x = 45 + Math.random() * 235;
        }

        ctx.fillStyle = b.dorada ? 'rgba(255, 190, 11, 0.62)' : 'rgba(144, 224, 239, 0.62)';
        ctx.strokeStyle = b.dorada ? '#fb8500' : '#0077b6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.32, b.y - b.r * 0.32, b.r * 0.22, 0, Math.PI * 2);
        ctx.fill();
      });

      anillosExplosion.forEach(a => {
        a.r += 1.6;
        a.vida--;
        ctx.strokeStyle = a.color;
        ctx.globalAlpha = Math.max(0, a.vida / 20);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      anillosExplosion = anillosExplosion.filter(a => a.vida > 0);
    } else if (juegoActual === 'caricia') {
      capasCrema.forEach(c => {
        c.alpha -= 0.008;
        c.r += 0.12;
        if (c.alpha > 0) {
          ctx.fillStyle = `rgba(255, 251, 240, ${c.alpha})`;
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(244, 226, 198, ${c.alpha * 0.8})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
      capasCrema = capasCrema.filter(c => c.alpha > 0);
    } else if (juegoActual === 'casita') {
      const p = progresoCasita / 100;
      const actual = CONSTRUCCIONES_DISPONIBLES[indiceConstruccionActual];
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = `${actual.color}80`;
      ctx.lineWidth = 3.5;

      if (indiceConstruccionActual === 0) {
        if (p > 0.05) {
          const hPared = 90 * Math.min(1, p / 0.5);
          ctx.beginPath();
          ctx.rect(75, 240 - hPared, 175, hPared);
          ctx.fill();
          ctx.stroke();
        }
        if (p > 0.5) {
          const t = (p - 0.5) / 0.5;
          ctx.beginPath();
          ctx.moveTo(62, 150);
          ctx.lineTo(162, 150 - 70 * t);
          ctx.lineTo(262, 150);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      } else if (indiceConstruccionActual === 1) {
        const pisos = Math.floor(p * 4);
        for (let i = 0; i < pisos; i++) {
          ctx.beginPath();
          ctx.rect(102, 205 - i * 35, 120, 29);
          ctx.fill();
          ctx.stroke();
        }
      } else {
        if (p > 0.05) {
          ctx.beginPath();
          ctx.arc(162, 235, 90 * Math.min(1, p), Math.PI, 0);
          ctx.lineWidth = 14;
          ctx.stroke();
        }
      }
    } else if (juegoActual === 'ritmo') {
      const puntos = obtenerPuntosEscala();
      puntos.forEach((pt, idx) => {
        if (pulsoNota[idx] > 0) pulsoNota[idx]--;
        const radio = pulsoNota[idx] > 0 ? 19 : 15;
        const infoNota = ESCALA_DO_OCTAVA[idx];

        ctx.fillStyle = pulsoNota[idx] > 0 ? '#ffbe0b' : '#ffffff';
        ctx.strokeStyle = '#1d3557';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radio, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1d3557';
        ctx.font = 'bold 10px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(infoNota.nota, pt.x, pt.y);
      });

      notasFlotantes.forEach(n => {
        n.y += n.vy;
        n.vida--;
        ctx.globalAlpha = Math.max(0, n.vida / 34);
        ctx.fillStyle = '#1d3557';
        ctx.font = 'bold 13px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(n.texto, n.x, n.y);
        ctx.globalAlpha = 1;
      });
      notasFlotantes = notasFlotantes.filter(n => n.vida > 0);

      // Una sola baqueta de xilófono apoyada en la nota tocada
      const puntoBaqueta = obtenerPuntosEscala()[notaActivaBaqueta] || obtenerPuntosEscala()[0];
      const golpe = pulsoNota[notaActivaBaqueta] > 0 ? -4 : 0;

      ctx.save();
      ctx.translate(puntoBaqueta.x + 8, puntoBaqueta.y - 6 + golpe);
      ctx.rotate(-0.55);
      ctx.strokeStyle = '#8c6239';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-22, 24);
      ctx.lineTo(0, 0);
      ctx.stroke();

      ctx.fillStyle = '#ff595e';
      ctx.strokeStyle = '#1d3557';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    animacionJuegoId = requestAnimationFrame(frame);
  }

  frame();
}

// ========================================================
// FOTO CON TU DIBUJITO DE GREGORIO + CAPTURA Y DESCARGA
// ========================================================
function obtenerEmocionCamaraActiva() {
  return (
    FOTOS_GREGORIO_GALERIA.find(f => f.id === fotoGregorioSeleccionadaId) ||
    FOTOS_GREGORIO_GALERIA[0]
  );
}

function precargarGaleriaGregorio() {
  FOTOS_GREGORIO_GALERIA.forEach(item => {
    if (!imagenesGaleriaCargadas[item.id]) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = encodeURI(item.src);
      imagenesGaleriaCargadas[item.id] = img;
    }
  });
  if (!imagenGregorioCamara) {
    imagenGregorioCamara = imagenesGaleriaCargadas[fotoGregorioSeleccionadaId];
  }
}

function actualizarCirculoGuiaGregorio() {
  const activa = obtenerEmocionCamaraActiva();
  const imgCirculo = document.getElementById('img-guia-gregorio-circulo');
  const labelCirculo = document.getElementById('etiqueta-guia-gregorio');
  const circulo = document.getElementById('circulo-guia-gregorio');

  if (imgCirculo) {
    imgCirculo.src = encodeURI(activa.src);
    imgCirculo.alt = `Gregorio ${activa.nombre}`;
  }
  if (labelCirculo) {
    labelCirculo.textContent = activa.nombre;
  }
  if (circulo) {
    circulo.classList.add('salto-gregorio');
    setTimeout(() => circulo.classList.remove('salto-gregorio'), 420);
  }
}

function alternarTamanoGuiaGregorio() {
  const circulo = document.getElementById('circulo-guia-gregorio');
  if (!circulo) return;
  circulo.classList.toggle('grande');
  reproducirSonidoBurbuja(false);
}

function actualizarGuiaImitacionCamara() {
  const estado = document.getElementById('estado-camara-texto');
  const panel = document.getElementById('panel-foto-capturada');
  if (!estado) return;
  if (panel && !panel.classList.contains('oculto')) {
    estado.textContent = '¡Foto lista! Toca Descargar';
    return;
  }
  const activa = obtenerEmocionCamaraActiva();
  estado.textContent = activa.guia;
  actualizarCirculoGuiaGregorio();
}

function renderizarGaleriaGregorio() {
  precargarGaleriaGregorio();
  const galeria = document.getElementById('galeria-gregorio-subidas');
  if (!galeria) return;
  galeria.innerHTML = '';

  FOTOS_GREGORIO_GALERIA.forEach(item => {
    const tarjeta = document.createElement('button');
    tarjeta.type = 'button';
    tarjeta.className = 'tarjeta-foto-gregorio' + (item.id === fotoGregorioSeleccionadaId ? ' activa' : '');
    tarjeta.onclick = () => {
      seleccionarFotoGregorioGaleria(item.id);
    };

    const img = document.createElement('img');
    img.src = encodeURI(item.src);
    img.alt = item.nombre;

    const label = document.createElement('small');
    label.textContent = item.nombre;

    tarjeta.appendChild(img);
    tarjeta.appendChild(label);
    galeria.appendChild(tarjeta);
  });

  actualizarGuiaImitacionCamara();
}

function seleccionarFotoGregorioGaleria(id) {
  const encontrada = FOTOS_GREGORIO_GALERIA.find(f => f.id === id);
  if (!encontrada) return;
  fotoGregorioSeleccionadaId = encontrada.id;
  imagenGregorioCamara = imagenesGaleriaCargadas[encontrada.id];
  reproducirSonidoBurbuja(false);
  renderizarGaleriaGregorio();
}

function abrirPantallaCamara() {
  irA('pantalla-camara');
  volverCamaraEnVivo();
  renderizarGaleriaGregorio();
  iniciarCamaraElefante();
}

function detenerCamaraElefante() {
  cancelAnimationFrame(animacionCamaraId);
  if (streamCamara) {
    streamCamara.getTracks().forEach(track => track.stop());
    streamCamara = null;
  }
}

async function iniciarCamaraElefante() {
  const video = document.getElementById('video-camara-elefante');
  detenerCamaraElefante();

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      streamCamara = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      if (video) {
        video.srcObject = streamCamara;
        await video.play();
      }
    }
  } catch (err) {
    streamCamara = null;
  }

  actualizarGuiaImitacionCamara();
  configurarEventosCanvasCamara();
  iniciarLoopCamara();
}

function configurarEventosCanvasCamara() {
  const canvas = document.getElementById('canvas-camara-elefante');
  if (!canvas || canvas.dataset.listo) return;
  canvas.dataset.listo = '1';

  canvas.addEventListener('pointerdown', e => {
    const rect = canvas.getBoundingClientRect();
    posGregorioCamaraX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    posGregorioCamaraY = ((e.clientY - rect.top) / rect.height) * canvas.height;
    arrastrandoGregorio = true;
  });

  canvas.addEventListener('pointermove', e => {
    if (!arrastrandoGregorio) return;
    const rect = canvas.getBoundingClientRect();
    posGregorioCamaraX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    posGregorioCamaraY = ((e.clientY - rect.top) / rect.height) * canvas.height;
  });

  window.addEventListener('pointerup', () => {
    arrastrandoGregorio = false;
  });
}

function dibujarGregorioEnCanvas(ctx, x, y, t, conMovimiento = true) {
  precargarGaleriaGregorio();
  const imgActual = imagenGregorioCamara || imagenesGaleriaCargadas[fotoGregorioSeleccionadaId];
  if (!imgActual || !imgActual.complete || imgActual.naturalWidth <= 0) return;

  const reboteY = conMovimiento ? Math.sin(t * 2.5) * 3 : 0;
  const ratio = imgActual.naturalHeight / imgActual.naturalWidth;
  const w = tamanoGregorioCamara;
  const h = w * ratio;

  ctx.save();
  ctx.translate(x, y + reboteY);
  try {
    ctx.drawImage(imgActual, -w / 2, -h / 2, w, h);
  } catch (e) {}
  ctx.restore();
}

function dibujarFondoCamaraOEscenario(ctx, width, height, video, permitirVideo = true) {
  let videoDibujado = false;
  if (permitirVideo && video && video.readyState >= 2 && video.videoWidth > 0 && streamCamara) {
    try {
      ctx.save();
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      const ratio = Math.max(width / video.videoWidth, height / video.videoHeight);
      const drawW = video.videoWidth * ratio;
      const drawH = video.videoHeight * ratio;
      ctx.drawImage(video, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
      ctx.restore();
      videoDibujado = true;
    } catch (e) {
      videoDibujado = false;
    }
  }

  if (!videoDibujado) {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#caf0f8');
    grad.addColorStop(0.68, '#fff3b0');
    grad.addColorStop(0.68, '#b7e4c7');
    grad.addColorStop(1, '#74c69d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 190, 11, 0.85)';
    ctx.beginPath();
    ctx.arc(54, 52, 24, 0, Math.PI * 2);
    ctx.fill();

    const activa = obtenerEmocionCamaraActiva();
    ctx.fillStyle = '#1d3557';
    ctx.font = 'bold 14px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(activa.guia, width / 2, 26);
  }
}

function iniciarLoopCamara() {
  cancelAnimationFrame(animacionCamaraId);
  const canvas = document.getElementById('canvas-camara-elefante');
  const video = document.getElementById('video-camara-elefante');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function frame() {
    tiempoCamara += 0.04;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    dibujarFondoCamaraOEscenario(ctx, canvas.width, canvas.height, video, true);
    dibujarGregorioEnCanvas(ctx, posGregorioCamaraX, posGregorioCamaraY, tiempoCamara, true);
    animacionCamaraId = requestAnimationFrame(frame);
  }

  frame();
}

function tomarFotoElefante() {
  const video = document.getElementById('video-camara-elefante');
  const panel = document.getElementById('panel-foto-capturada');
  const img = document.getElementById('img-foto-tomada');
  const enlace = document.getElementById('enlace-descarga-foto');
  const estado = document.getElementById('estado-camara-texto');

  reproducirSonidoCamara();

  const fotoCanvas = document.createElement('canvas');
  fotoCanvas.width = 325;
  fotoCanvas.height = 275;
  const fctx = fotoCanvas.getContext('2d');

  dibujarFondoCamaraOEscenario(fctx, fotoCanvas.width, fotoCanvas.height, video, true);
  dibujarGregorioEnCanvas(fctx, posGregorioCamaraX, posGregorioCamaraY, tiempoCamara, false);

  let dataUrl = '';
  try {
    dataUrl = fotoCanvas.toDataURL('image/png');
  } catch (e) {
    const soloFondo = document.createElement('canvas');
    soloFondo.width = 325;
    soloFondo.height = 275;
    const sctx = soloFondo.getContext('2d');
    dibujarFondoCamaraOEscenario(sctx, 325, 275, video, true);
    try {
      dataUrl = soloFondo.toDataURL('image/png');
    } catch (e2) {
      dataUrl = '';
    }
  }

  if (!dataUrl) return;

  ultimaFotoDataUrl = dataUrl;

  if (img) {
    img.src = dataUrl;
  }
  if (enlace) {
    enlace.href = dataUrl;
    enlace.download = 'gregorio-foto.png';
  }
  if (panel) {
    panel.classList.remove('oculto');
  }
  if (estado) {
    estado.textContent = '¡Foto lista! Toca Descargar';
  }
}

function volverCamaraEnVivo() {
  const panel = document.getElementById('panel-foto-capturada');
  if (panel) panel.classList.add('oculto');
  actualizarGuiaImitacionCamara();
}

function descargarFotoElefante() {
  if (!ultimaFotoDataUrl) {
    tomarFotoElefante();
  }

  const enlace = document.getElementById('enlace-descarga-foto');
  const estado = document.getElementById('estado-camara-texto');

  if (enlace && ultimaFotoDataUrl) {
    enlace.href = ultimaFotoDataUrl;
    enlace.download = 'gregorio-foto.png';
    enlace.click();
  }

  if (estado) {
    estado.textContent = '¡Foto guardada!';
  }
}