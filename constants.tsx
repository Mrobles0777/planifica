
import { Level, Nucleo } from './types';

export const CURRICULUM_DATA: Nucleo[] = [
  // AMBITO: Desarrollo Personal y Social
  {
    name: 'Identidad y Autonomía',
    ambito: 'Desarrollo Personal y Social',
    objectives: {
      [Level.SALA_CUNA]: [
        { id: 1, text: 'Expresar vocal, gestual o corporalmente distintas necesidades o emociones (alegría, miedo, pena, entre otras).' },
        { id: 2, text: 'Manifestar satisfacción cuando percibe que adultos significativos le expresan afecto.' },
        { id: 3, text: 'Reconocer progresivamente su cuerpo a través de la exploración sensorial.' },
        { id: 4, text: 'Manifestar sus preferencias por recursos, objetos y juegos, mediante gestos o acciones.' },
        { id: 5, text: 'Manifestar interés por nuevas situaciones y objetos, ampliando su campo y repertorio de acción.' },
        { id: 6, text: 'Reconocer algunos rasgos distintivos de su identidad, como su nombre y su imagen física.' },
        { id: 7, text: 'Incorporar rutinas básicas vinculadas a la alimentación, vigilia, sueño e higiene, integrando paulatinamente objetos y acciones.' }
      ],
      [Level.MEDIO]: [
        { id: 1, text: 'Representar verbal y corporalmente diferentes emociones y sentimientos en sus juegos.' },
        { id: 2, text: 'Manifestar disposición y confianza para separarse de los adultos significativos.' },
        { id: 3, text: 'Reconocer en sí mismo y en los demás, características corporales, de género y de pertenencia.' },
        { id: 4, text: 'Manifestar disposición para regular sus respuestas frente a deseos y frustraciones.' },
        { id: 5, text: 'Manifestar sus preferencias por actividades, materiales, lugares y grupos de juego.' },
        { id: 6, text: 'Actuar con progresiva independencia, ampliando su repertorio de acciones, juegos y tareas.' },
        { id: 7, text: 'Comunicar algunos rasgos de su identidad, como su nombre, sus intereses y sus fortalezas.' },
        { id: 8, text: 'Cuidar su bienestar personal, llevando a cabo prácticas de higiene, alimentación y vestuario.' },
        { id: 9, text: 'Manifestar iniciativa en la ejecución de juegos y actividades cotidianas.' },
        { id: 10, text: 'Manifestar satisfacción y confianza por sus logros, mediante expresiones lingüísticas y corporales.' },
        { id: 11, text: 'Identificar alimentos saludables, reconociendo la importancia de estos para su crecimiento.' },
        { id: 12, text: 'Anticipar acciones y rutinas próximas a realizar, a partir de pistas del entorno.' }
      ],
      [Level.TRANSICION]: [
        { id: 1, text: 'Comunicar a los demás emociones y sentimientos (amor, miedo, alegría) provocados por diversas narraciones.' },
        { id: 2, text: 'Manifestar disposición y confianza para proponer ideas y tomar decisiones en el juego.' },
        { id: 3, text: 'Reconocer emociones y sentimientos en otras personas a partir de expresiones gestuales y corporales.' },
        { id: 4, text: 'Expresar sus rasgos distintivos, habilidades, fortalezas, intereses y desafíos personales.' },
        { id: 5, text: 'Comunicar sus preferencias en juegos, actividades, temas de interés y proyectos.' },
        { id: 6, text: 'Planificar proyectos y juegos, estableciendo metas y estrategias para alcanzarlas.' },
        { id: 7, text: 'Comunicar rasgos de su identidad de género, cultura (local y nacional) y comunidad.' },
        { id: 8, text: 'Comunicar sus características identitarias, fortalezas, habilidades y desafíos personales.' },
        { id: 9, text: 'Cuidar su bienestar personal, llevando a cabo prácticas de higiene, alimentación y seguridad.' },
        { id: 10, text: 'Comunicar a otras personas desafíos alcanzados, identificando acciones que favorecieron el logro.' },
        { id: 11, text: 'Distinguir parámetros de una alimentación saludable y su aporte para el organismo.' },
        { id: 12, text: 'Anticipar posibles consecuencias de sus acciones para sí mismo y para otros.' },
        { id: 13, text: 'Representar sus pensamientos y sentimientos a través de diversas expresiones.' }
      ]
    }
  },
  {
    name: 'Convivencia y Ciudadanía',
    ambito: 'Desarrollo Personal y Social',
    objectives: {
      [Level.SALA_CUNA]: [
        { id: 1, text: 'Interactuar con pares y adultos significativos a través de gestos, vocalizaciones y juegos.' },
        { id: 2, text: 'Disfrutar de la cercanía de otros niños y adultos en juegos y situaciones cotidianas.' },
        { id: 3, text: 'Manifestar interés por participar en celebraciones y ritos de su entorno familiar.' },
        { id: 4, text: 'Manifestar disposición para compartir juegos y materiales con otros.' },
        { id: 5, text: 'Iniciarse en la práctica de normas de convivencia sencillas.' }
      ],
      [Level.MEDIO]: [
        { id: 1, text: 'Participar en actividades y juegos grupales con sus pares, colaborando en propósitos comunes.' },
        { id: 2, text: 'Disfrutar de instancias de interacción social con adultos de la comunidad educativa.' },
        { id: 3, text: 'Colaborar en situaciones cotidianas y de juego, aportando ideas o materiales.' },
        { id: 4, text: 'Manifestar disposición para respetar turnos de habla y de acción.' },
        { id: 5, text: 'Iniciarse en la resolución pacífica de conflictos, mediante el diálogo.' },
        { id: 6, text: 'Manifestar disposición para aplicar algunas normas de convivencia.' },
        { id: 7, text: 'Identificar objetos y lugares de su entorno que forman parte de su cultura.' },
        { id: 8, text: 'Apreciar ritos y celebraciones de su entorno familiar y comunitario.' },
        { id: 9, text: 'Reconocer que el comportamiento propio puede afectar a los demás.' },
        { id: 10, text: 'Reconocer algunos derechos de los niños y niñas.' }
      ],
      [Level.TRANSICION]: [
        { id: 1, text: 'Participar en actividades y juegos colaborativos, respetando acuerdos y turnos.' },
        { id: 2, text: 'Participar en actividades solidarias que benefician a la comunidad.' },
        { id: 3, text: 'Manifestar empatía y solidaridad frente a situaciones que vivencian sus pares.' },
        { id: 4, text: 'Apreciar la importancia de las normas y acuerdos de convivencia en el grupo.' },
        { id: 5, text: 'Aplicar estrategias pacíficas de resolución de conflictos cotidianos.' },
        { id: 6, text: 'Respetar normas establecidas por el grupo para el cuidado de materiales.' },
        { id: 7, text: 'Identificar objetos, espacios y ritos que forman parte de la cultura de su grupo.' },
        { id: 8, text: 'Comprender que algunas normas de seguridad previenen riesgos en el entorno.' },
        { id: 9, text: 'Reconocer que la democracia es una forma de organización social y política.' },
        { id: 10, text: 'Reconocer que niños y niñas somos personas con los mismos derechos.' },
        { id: 11, text: 'Apreciar la diversidad de las personas y sus formas de vida.' }
      ]
    }
  },
  {
    name: 'Corporalidad y Movimiento',
    ambito: 'Desarrollo Personal y Social',
    objectives: {
      [Level.SALA_CUNA]: [
        { id: 1, text: 'Manifestar sus sensaciones y necesidades corporales mediante gestos o llantos.' },
        { id: 2, text: 'Reconocer partes de su cuerpo en sí mismo y en otros.' },
        { id: 3, text: 'Experimentar diversas posibilidades de movimiento, como girar, reptar, gatear.' },
        { id: 4, text: 'Ampliar sus posibilidades de exploración sensorio-motriz al interactuar con el entorno.' },
        { id: 5, text: 'Adquirir control de la prensión voluntaria y de la postura sedente.' },
        { id: 6, text: 'Coordinar con precisión y eficiencia habilidades motrices finas.' },
        { id: 7, text: 'Adquirir control y equilibrio en situaciones de movimiento y desplazamiento.' }
      ],
      [Level.MEDIO]: [
        { id: 1, text: 'Perfeccionar su coordinación visomotriz fina a través del uso de diversos instrumentos.' },
        { id: 2, text: 'Reconocer las principales partes y funciones externas de su cuerpo.' },
        { id: 3, text: 'Experimentar diversas formas de desplazamiento, saltos, trepado.' },
        { id: 4, text: 'Manifestar conciencia de las posibilidades y limitaciones motrices de su cuerpo.' },
        { id: 5, text: 'Coordinar con control y equilibrio movimientos de su cuerpo en diferentes juegos.' },
        { id: 6, text: 'Adquirir control y equilibrio en situaciones de movimiento y desplazamiento.' },
        { id: 7, text: 'Resolver desafíos prácticos manteniendo el control y equilibrio.' },
        { id: 8, text: 'Utilizar categorías de ubicación espacial y temporal en sus juegos.' }
      ],
      [Level.TRANSICION]: [
        { id: 1, text: 'Manifestar iniciativa para practicar actividad física de su interés y con regularidad.' },
        { id: 2, text: 'Apreciar sus características corporales, manifestando interés y cuidado.' },
        { id: 3, text: 'Tomar conciencia de su cuerpo, de algunas de sus funciones y cambios.' },
        { id: 4, text: 'Coordinar sus habilidades psicomotoras finas con precisión y eficacia.' },
        { id: 5, text: 'Comunicar el bienestar que le produce el movimiento y la actividad física.' },
        { id: 6, text: 'Coordinar con control y equilibrio sus movimientos, posturas y desplazamientos.' },
        { id: 7, text: 'Resolver desafíos prácticos manteniendo el control, equilibrio y coordinación.' },
        { id: 8, text: 'Utilizar categorías de ubicación espacial y temporal, respecto de sí mismo.' },
        { id: 9, text: 'Identificar acciones que favorecen el cuidado de su cuerpo.' }
      ]
    }
  },
  // AMBITO: Comunicación Integral
  {
    name: 'Lenguaje Verbal',
    ambito: 'Comunicación Integral',
    objectives: {
      [Level.SALA_CUNA]: [
        { id: 1, text: 'Expresar oralmente sus emociones y necesidades a través de balbuceos, gestos y palabras.' },
        { id: 2, text: 'Reconocer sonidos de su entorno cercano, voces de personas significativas.' },
        { id: 3, text: 'Identificar algunos objetos por su nombre en situaciones cotidianas.' },
        { id: 4, text: 'Comprender mensajes simples en juegos y situaciones comunicativas.' },
        { id: 5, text: 'Iniciarse en el disfrute de textos literarios (poesías, rimas, cuentos cortos).' },
        { id: 6, text: 'Incorporar nuevas palabras a su repertorio lingüístico para comunicarse con otros.' },
        { id: 7, text: 'Disfrutar de la audición de cuentos, rimas y canciones.' },
        { id: 8, text: 'Reaccionar frente a diversos estímulos sonoros de su entorno.' }
      ],
      [Level.MEDIO]: [
        { id: 1, text: 'Expresarse oralmente empleando estructuras oracionales simples y patrones básicos.' },
        { id: 2, text: 'Comprender mensajes simples y preguntas en diversas situaciones comunicativas.' },
        { id: 3, text: 'Identificar algunos atributos de los sonidos, como intensidad y duración.' },
        { id: 4, text: 'Relatar experiencias personales con claridad progresiva en situaciones lúdicas.' },
        { id: 5, text: 'Manifestar interés por descubrir el contenido de diversos textos literarios.' },
        { id: 6, text: 'Comprender a partir de la escucha atenta, contenidos explícitos de textos literarios.' },
        { id: 7, text: 'Reconocer que los textos escritos transmiten mensajes en entornos cotidianos.' },
        { id: 8, text: 'Producir sus propios signos gráficos en situaciones lúdicas.' },
        { id: 9, text: 'Utilizar un vocabulario variado en diversas situaciones comunicativas.' },
        { id: 10, text: 'Comunicar mensajes simples a través de diversos soportes.' }
      ],
      [Level.TRANSICION]: [
        { id: 1, text: 'Expresarse oralmente en forma clara y comprensible empleando estructuras complejas.' },
        { id: 2, text: 'Comprender textos orales como preguntas, explicaciones, relatos y otros.' },
        { id: 3, text: 'Descubrir en contextos lúdicos atributos fonológicos de las palabras (sílabas, rimas).' },
        { id: 4, text: 'Comunicar oralmente temas de su interés, empleando un vocabulario variado.' },
        { id: 5, text: 'Manifestar interés por descubrir el contenido y propósitos de diversos textos.' },
        { id: 6, text: 'Comprender contenidos explícitos e implícitos de textos literarios y no literarios.' },
        { id: 7, text: 'Reconocer palabras que se encuentran en diversos soportes asociados a fonemas.' },
        { id: 8, text: 'Representar gráficamente algunos trazos, letras, signos y palabras significativas.' },
        { id: 9, text: 'Comunicar mensajes simples en la lengua indígena de su comunidad (opcional).' },
        { id: 10, text: 'Producir diversos tipos de textos breves de manera creativa.' }
      ]
    }
  },
  {
    name: 'Lenguajes Artísticos',
    ambito: 'Comunicación Integral',
    objectives: {
      [Level.SALA_CUNA]: [
        { id: 1, text: 'Manifestar interés por sonidos, colores, formas y texturas de su entorno.' },
        { id: 2, text: 'Explorar las posibilidades de expresión sonora a través de diversos objetos.' },
        { id: 3, text: 'Experimentar con recursos plásticos (pintura, masa) descubriendo sus atributos.' },
        { id: 4, text: 'Expresar corporalmente sensaciones que le provocan la música y otros sonidos.' },
        { id: 5, text: 'Manifestar satisfacción al participar en actividades de expresión plástica.' },
        { id: 6, text: 'Explorar diversos materiales para la creación plástica.' }
      ],
      [Level.MEDIO]: [
        { id: 1, text: 'Manifestar interés por diversas producciones artísticas (música, teatro, danza).' },
        { id: 2, text: 'Expresar sus vivencias a través del dibujo, la pintura y el modelado.' },
        { id: 3, text: 'Experimentar con instrumentos musicales, percutiendo ritmos sencillos.' },
        { id: 4, text: 'Expresar corporalmente diversas sensaciones y emociones mediante el baile.' },
        { id: 5, text: 'Expresar emociones e ideas a través de la experimentación con materiales.' },
        { id: 6, text: 'Improvisar movimientos a partir de audiciones musicales.' },
        { id: 7, text: 'Identificar colores y formas en obras de arte de su entorno.' }
      ],
      [Level.TRANSICION]: [
        { id: 1, text: 'Apreciar producciones artísticas de diversos contextos locales y globales.' },
        { id: 2, text: 'Comunicar sus impresiones sobre obras de arte de diversos tiempos y lugares.' },
        { id: 3, text: 'Expresar emociones, ideas y experiencias a través del dibujo y el modelado.' },
        { id: 4, text: 'Expresar ideas y sentimientos a través de la danza y la dramatización.' },
        { id: 5, text: 'Representar plásticamente sus impresiones a partir de diversos estímulos.' },
        { id: 6, text: 'Interpretar canciones sencillas, con variaciones de intensidad y velocidad.' },
        { id: 7, text: 'Recrear situaciones de su interés a través de juegos dramáticos.' },
        { id: 8, text: 'Representar historias breves mediante el uso de títeres o dramatizaciones.' },
        { id: 9, text: 'Integrar diversas técnicas plásticas en sus producciones artísticas.' }
      ]
    }
  },
  // AMBITO: Interacción y Comprensión del Entorno
  {
    name: 'Exploración del Entorno Natural',
    ambito: 'Interacción y Comprensión del Entorno',
    objectives: {
      [Level.SALA_CUNA]: [
        { id: 1, text: 'Manifestar curiosidad por algunos elementos de su entorno natural inmediato.' },
        { id: 2, text: 'Explorar con sus sentidos diversos elementos de la naturaleza (arena, agua, hojas).' },
        { id: 3, text: 'Descubrir algunas características de animales y plantas de su entorno.' },
        { id: 4, text: 'Reaccionar frente a cambios climáticos evidentes en su entorno.' }
      ],
      [Level.MEDIO]: [
        { id: 1, text: 'Manifestar interés y asombro por diversos elementos y fenómenos de la naturaleza.' },
        { id: 2, text: 'Identificar algunos seres vivos de su comunidad y sus necesidades básicas.' },
        { id: 3, text: 'Reconocer algunas propiedades de los elementos de la naturaleza (color, forma, textura).' },
        { id: 4, text: 'Iniciarse en el cuidado de plantas y animales de su entorno.' },
        { id: 5, text: 'Distinguir paisajes naturales de su comunidad local.' },
        { id: 6, text: 'Explorar diversos objetos y materiales, reconociendo algunos cambios.' }
      ],
      [Level.TRANSICION]: [
        { id: 1, text: 'Manifestar interés por conocer la relevancia de la energía solar y el agua.' },
        { id: 2, text: 'Formular conjeturas sobre causas y efectos de fenómenos naturales (viento, lluvia).' },
        { id: 3, text: 'Reconocer la importancia del cuidado del medio ambiente y la sustentabilidad.' },
        { id: 4, text: 'Comunicar propiedades observables de los seres vivos y su hábitat.' },
        { id: 5, text: 'Distinguir entre recursos naturales renovables y no renovables (introducción).' },
        { id: 6, text: 'Emplear instrumentos de observación para explorar el entorno natural.' },
        { id: 7, text: 'Identificar diversas formas de vida en ambientes naturales extremos.' }
      ]
    }
  },
  {
    name: 'Comprensión del Entorno Sociocultural',
    ambito: 'Interacción y Comprensión del Entorno',
    objectives: {
      [Level.SALA_CUNA]: [
        { id: 1, text: 'Interactuar con personas de su entorno familiar y comunitario.' },
        { id: 2, text: 'Iniciarse en el reconocimiento de personas significativas y sus roles sociales.' },
        { id: 3, text: 'Descubrir algunos objetos tecnológicos sencillos de su entorno.' },
        { id: 4, text: 'Identificar algunos lugares de su entorno cercano.' }
      ],
      [Level.MEDIO]: [
        { id: 1, text: 'Describir actividades habituales de su comunidad y sus funciones básicas.' },
        { id: 2, text: 'Identificar algunas instituciones y servicios de su entorno (hospital, bomberos).' },
        { id: 3, text: 'Apreciar ritos y celebraciones que forman parte de la identidad de su grupo.' },
        { id: 4, text: 'Reconocer el uso de diversos objetos tecnológicos en la vida cotidiana.' },
        { id: 5, text: 'Identificar diversas profesiones y oficios de su comunidad.' },
        { id: 6, text: 'Comprender que las personas tienen diversas formas de vida.' }
      ],
      [Level.TRANSICION]: [
        { id: 1, text: 'Comprender que los grupos humanos y lugares cambian con el paso del tiempo.' },
        { id: 2, text: 'Apreciar la diversidad cultural de su comunidad local y nacional.' },
        { id: 3, text: 'Identificar funciones de personas en organizaciones e instituciones de su entorno.' },
        { id: 4, text: 'Reconocer símbolos patrios y fechas significativas de la historia de Chile.' },
        { id: 5, text: 'Comprender el uso y funcionamiento de diversos medios de transporte y comunicación.' },
        { id: 6, text: 'Relacionar avances tecnológicos con cambios en la vida de las personas.' },
        { id: 7, text: 'Representar hechos significativos de su historia personal y familiar.' }
      ]
    }
  },
  {
    name: 'Pensamiento Matemático',
    ambito: 'Interacción y Comprensión del Entorno',
    objectives: {
      [Level.SALA_CUNA]: [
        { id: 1, text: 'Adquirir la noción de permanencia de objetos y personas significativas.' },
        { id: 2, text: 'Explorar objetos descubriendo sus atributos sensoriales (tamaño, color).' },
        { id: 3, text: 'Experimentar con objetos estableciendo relaciones de causa y efecto.' },
        { id: 4, text: 'Utilizar desplazamientos para alcanzar objetos de su interés.' },
        { id: 5, text: 'Orientarse temporalmente en función de rutinas cotidianas.' },
        { id: 6, text: 'Emplear cuantificadores (más/menos, mucho/poco) en situaciones concretas.' },
        { id: 7, text: 'Representar cantidades pequeñas mediante el uso de objetos.' }
      ],
      [Level.MEDIO]: [
        { id: 1, text: 'Reproducir patrones sonoros, visuales o gestuales de dos elementos.' },
        { id: 2, text: 'Orientarse temporalmente en situaciones cotidianas (día/noche, ayer/hoy).' },
        { id: 3, text: 'Describir la posición de objetos respecto de sí mismo (dentro/fuera).' },
        { id: 4, text: 'Orientarse en el espacio utilizando conceptos de dirección y distancia.' },
        { id: 5, text: 'Establecer relaciones de comparación por tamaño, longitud y capacidad.' },
        { id: 6, text: 'Emplear progresivamente los números para contar, identificar y comparar hasta el 10.' },
        { id: 7, text: 'Representar números y cantidades en forma concreta y pictórica hasta el 10.' },
        { id: 8, text: 'Resolver problemas simples sumando o quitando elementos de manera concreta.' },
        { id: 9, text: 'Descubrir atributos de figuras 3D mediante exploración y juegos.' },
        { id: 10, text: 'Identificar algunas figuras geométricas planas en objetos del entorno.' }
      ],
      [Level.TRANSICION]: [
        { id: 1, text: 'Crear patrones de repetición de hasta tres elementos en contextos lúdicos.' },
        { id: 2, text: 'Experimentar con objetos estableciendo relaciones al clasificar y seriar.' },
        { id: 3, text: 'Comunicar la posición de objetos respecto de un punto de referencia.' },
        { id: 4, text: 'Emplear conceptos de orientación temporal (antes/después, mañana/tarde).' },
        { id: 5, text: 'Orientarse temporalmente empleando conceptos de semana, meses y estaciones.' },
        { id: 6, text: 'Emplear los números para contar, identificar, cuantificar y comparar hasta el 20.' },
        { id: 7, text: 'Representar números y cantidades hasta el 10 en forma concreta, pictórica y simbólica.' },
        { id: 8, text: 'Resolver problemas simples agregando o quitando hasta 10 elementos.' },
        { id: 9, text: 'Comunicar la posición de objetos utilizando coordenadas y planos simples.' },
        { id: 10, text: 'Identificar atributos de figuras 2D y 3D (lados, vértices, caras).' },
        { id: 11, text: 'Utilizar diversos instrumentos de medición para comparar longitudes y pesos.' },
        { id: 12, text: 'Representar gráficamente información cuantitativa simple.' }
      ]
    }
  }
];

export const COLORS = {
  primary: '#6366f1',
  secondary: '#ec4899',
  accent: '#10b981',
  background: '#f8fafc',
  card: '#ffffff'
};
