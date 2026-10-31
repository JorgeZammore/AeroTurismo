const http = require('http');
const fs = require('fs');
const path = require('path');

const port = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, 'public');

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeInterests(interests) {
  if (!Array.isArray(interests)) return [];
  return interests.filter(isNonEmptyString).map(v => v.trim()).slice(0, 10);
}

function pickMany(items, count = 3) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
}

const catalog = {
  es: {
    accommodations: [
      { name: 'Hotel Express Aeropuerto', description: 'Opción práctica cerca del aeropuerto, ideal para escalas largas o una noche de descanso.', tag: 'Práctico' },
      { name: 'Hostal Urbano', description: 'Alternativa económica con servicios básicos y fácil conexión hacia zonas comerciales.', tag: 'Económico' },
      { name: 'Hotel Ejecutivo Central', description: 'Habitaciones cómodas, Wi‑Fi y espacios tranquilos para viajeros de negocios.', tag: 'Negocios' },
      { name: 'Suite Familiar', description: 'Habitación amplia para familias, con zonas de descanso y opciones de alimentación cercanas.', tag: 'Familia' },
      { name: 'Hotel Boutique Ciudad', description: 'Alternativa de mayor confort para parejas o viajeros que buscan una experiencia más tranquila.', tag: 'Confort' },
      { name: 'Airport Premium Lounge Hotel', description: 'Opción premium pensada para descansar, trabajar o ducharse entre vuelos.', tag: 'Premium' }
    ],
    gastronomy: [
      { name: 'Sabores Colombianos', description: 'Menú de comida local con platos tradicionales y opciones rápidas para viajeros.', tag: 'Local' },
      { name: 'Café de Origen', description: 'Café colombiano, repostería y desayunos ligeros para una parada corta.', tag: 'Café' },
      { name: 'Mercado Urbano', description: 'Varias alternativas de comida en un mismo lugar, útil para grupos con gustos diferentes.', tag: 'Variado' },
      { name: 'Bistró Ejecutivo', description: 'Servicio ágil, ambiente tranquilo y platos ligeros para una comida de negocios.', tag: 'Ejecutivo' },
      { name: 'Terraza Gourmet', description: 'Propuesta de mayor nivel con platos de autor y ambiente relajado.', tag: 'Gourmet' },
      { name: 'Comida Rápida Local', description: 'Alternativa económica y rápida si tienes poco tiempo antes de tu siguiente vuelo.', tag: 'Rápido' }
    ],
    activities: [
      { name: 'Recorrido cultural breve', description: 'Visita una zona cultural cercana y conoce parte de la historia local sin alejarte demasiado.', tag: 'Cultura' },
      { name: 'Ruta gastronómica', description: 'Prueba dos o tres sabores típicos y termina con café colombiano.', tag: 'Gastronomía' },
      { name: 'Zona de descanso y lounge', description: 'Aprovecha la escala para descansar, cargar dispositivos y organizar tu siguiente trayecto.', tag: 'Relax' },
      { name: 'Compras y recuerdos', description: 'Explora tiendas, artesanías y productos locales antes de continuar el viaje.', tag: 'Compras' },
      { name: 'Paseo urbano guiado', description: 'Recorrido corto por puntos representativos, recomendado solo si tu tiempo de conexión es suficiente.', tag: 'Ciudad' },
      { name: 'Plan familiar', description: 'Actividad tranquila con espacios amplios, comida cercana y tiempos flexibles para niños.', tag: 'Familia' }
    ]
  },
  en: {
    accommodations: [
      { name: 'Airport Express Hotel', description: 'A practical option near the airport for long layovers or an overnight rest.', tag: 'Practical' },
      { name: 'Urban Hostel', description: 'Budget-friendly accommodation with basic services and easy transport access.', tag: 'Budget' },
      { name: 'Central Business Hotel', description: 'Comfortable rooms, Wi‑Fi and quiet work areas for business travelers.', tag: 'Business' },
      { name: 'Family Suite', description: 'Spacious accommodation with rest areas and nearby family-friendly food options.', tag: 'Family' },
      { name: 'City Boutique Hotel', description: 'A comfortable choice for couples or travelers looking for a calmer stay.', tag: 'Comfort' },
      { name: 'Airport Premium Lounge Hotel', description: 'Premium option for resting, working or taking a shower between flights.', tag: 'Premium' }
    ],
    gastronomy: [
      { name: 'Colombian Flavors', description: 'Traditional local dishes plus quick options suitable for travelers.', tag: 'Local' },
      { name: 'Origin Coffee', description: 'Colombian coffee, pastries and light breakfasts for a short stop.', tag: 'Coffee' },
      { name: 'Urban Food Market', description: 'Several food choices in one place, useful for groups with different tastes.', tag: 'Variety' },
      { name: 'Business Bistro', description: 'Fast service, quiet atmosphere and light meals for business travelers.', tag: 'Business' },
      { name: 'Gourmet Terrace', description: 'Higher-end dining with a relaxed atmosphere.', tag: 'Gourmet' },
      { name: 'Local Fast Bites', description: 'Quick and affordable food when you have limited time before your next flight.', tag: 'Quick' }
    ],
    activities: [
      { name: 'Short cultural route', description: 'Visit a nearby cultural area and learn some local history without going too far.', tag: 'Culture' },
      { name: 'Food tasting route', description: 'Try a few local flavors and finish with Colombian coffee.', tag: 'Food' },
      { name: 'Rest and lounge', description: 'Use your layover to rest, charge devices and organize the next part of your trip.', tag: 'Relax' },
      { name: 'Shopping and souvenirs', description: 'Browse shops, crafts and local products before continuing your trip.', tag: 'Shopping' },
      { name: 'Guided city walk', description: 'A short city route, recommended only when your connection time is sufficient.', tag: 'City' },
      { name: 'Family plan', description: 'A relaxed activity with flexible timing and convenient food options for children.', tag: 'Family' }
    ]
  }
};

function getLang(language) {
  return language === 'en' ? 'en' : 'es';
}

function scoreAndSort(items, profile, section) {
  const interests = profile.interests.map(i => i.toLowerCase());
  const traveler = profile.travelerType.toLowerCase();
  const budget = profile.budget.toLowerCase();
  const time = profile.timeAvailable.toLowerCase();

  return items
    .map(item => {
      const text = `${item.name} ${item.description} ${item.tag}`.toLowerCase();
      let score = Math.random() * 2;

      if (traveler.includes('famil') && text.includes('famil')) score += 5;
      if (traveler.includes('negoc') && (text.includes('negoc') || text.includes('business') || text.includes('ejecut'))) score += 5;
      if (traveler.includes('pareja') && (text.includes('boutique') || text.includes('gourmet') || text.includes('confort'))) score += 3;
      if (budget.includes('econ') && (text.includes('econ') || text.includes('budget') || text.includes('rápid') || text.includes('quick'))) score += 4;
      if ((budget.includes('premium') || budget.includes('lujo')) && (text.includes('premium') || text.includes('gourmet') || text.includes('confort'))) score += 4;
      if (time.includes('corta') && (text.includes('rápid') || text.includes('quick') || text.includes('lounge') || text.includes('café'))) score += 4;
      if (time.includes('estancia') && (text.includes('ciudad') || text.includes('city') || text.includes('hotel'))) score += 3;

      interests.forEach(interest => {
        const tokens = interest.split(/\s+|\//).filter(t => t.length > 3);
        if (tokens.some(t => text.includes(t))) score += 5;
      });

      if (section === 'activities' && interests.some(i => i.includes('cultura')) && text.includes('cultur')) score += 6;
      if (section === 'activities' && interests.some(i => i.includes('compras')) && (text.includes('compra') || text.includes('shopping'))) score += 6;
      if (section === 'activities' && interests.some(i => i.includes('relax')) && text.includes('relax')) score += 6;
      if (section === 'gastronomy' && interests.some(i => i.includes('gastronom')) && (text.includes('local') || text.includes('food') || text.includes('gastro'))) score += 6;

      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);
}



const cityCatalog = {
  es: [
    {
      name: 'Bogotá', country: 'Colombia', icon: 'fa-mountain-city',
      description: 'Capital cultural y gastronómica, con museos, cafés de especialidad, compras y una amplia oferta hotelera.',
      tags: ['Cultura', 'Gastronomía', 'Compras'],
      bestFor: ['solo', 'negocios', 'pareja'], budgets: ['económico', 'moderado', 'premium'], interests: ['gastronomía', 'cultura', 'compras']
    },
    {
      name: 'Medellín', country: 'Colombia', icon: 'fa-cable-car',
      description: 'Ciudad moderna y agradable para recorrer, con buena gastronomía, vida urbana y atractivos culturales.',
      tags: ['Ciudad', 'Cultura', 'Gastronomía'],
      bestFor: ['solo', 'pareja', 'negocios'], budgets: ['moderado', 'premium'], interests: ['gastronomía', 'cultura', 'compras']
    },
    {
      name: 'Cartagena', country: 'Colombia', icon: 'fa-umbrella-beach',
      description: 'Ideal para una experiencia de descanso, historia y gastronomía frente al Caribe, especialmente en pareja o familia.',
      tags: ['Playa', 'Historia', 'Relax'],
      bestFor: ['pareja', 'familia'], budgets: ['moderado', 'premium'], interests: ['cultura', 'relax', 'gastronomía']
    },
    {
      name: 'Santa Marta', country: 'Colombia', icon: 'fa-water',
      description: 'Combina playa, naturaleza y descanso con opciones de presupuesto flexible y planes tranquilos.',
      tags: ['Naturaleza', 'Playa', 'Relax'],
      bestFor: ['solo', 'pareja', 'familia'], budgets: ['económico', 'moderado'], interests: ['relax', 'gastronomía']
    },
    {
      name: 'Cali', country: 'Colombia', icon: 'fa-music',
      description: 'Destino dinámico con gastronomía, cultura, música y alternativas urbanas para viajeros activos.',
      tags: ['Cultura', 'Gastronomía', 'Ciudad'],
      bestFor: ['solo', 'pareja'], budgets: ['económico', 'moderado'], interests: ['gastronomía', 'cultura']
    },
    {
      name: 'Barranquilla', country: 'Colombia', icon: 'fa-masks-theater',
      description: 'Opción urbana del Caribe con identidad cultural, restaurantes, compras y buena oferta para viajes cortos.',
      tags: ['Cultura', 'Compras', 'Caribe'],
      bestFor: ['solo', 'negocios', 'familia'], budgets: ['económico', 'moderado'], interests: ['cultura', 'compras', 'gastronomía']
    },
    {
      name: 'Bucaramanga', country: 'Colombia', icon: 'fa-tree-city',
      description: 'Una alternativa equilibrada para comer bien, descansar y realizar actividades urbanas con costos moderados.',
      tags: ['Económico', 'Gastronomía', 'Relax'],
      bestFor: ['solo', 'familia', 'negocios'], budgets: ['económico', 'moderado'], interests: ['gastronomía', 'relax']
    },
    {
      name: 'Pereira', country: 'Colombia', icon: 'fa-mug-hot',
      description: 'Puerta de entrada a experiencias cafeteras, descanso y gastronomía regional, adecuada para parejas y familias.',
      tags: ['Café', 'Naturaleza', 'Relax'],
      bestFor: ['pareja', 'familia', 'solo'], budgets: ['económico', 'moderado'], interests: ['gastronomía', 'relax', 'cultura']
    }
  ],
  en: [
    {
      name: 'Bogotá', country: 'Colombia', icon: 'fa-mountain-city',
      description: 'A strong cultural and food destination with museums, specialty coffee, shopping and extensive hotel options.',
      tags: ['Culture', 'Food', 'Shopping'],
      bestFor: ['solo', 'business', 'couple'], budgets: ['budget', 'moderate', 'premium'], interests: ['food', 'culture', 'shopping']
    },
    {
      name: 'Medellín', country: 'Colombia', icon: 'fa-cable-car',
      description: 'A modern, walkable city with strong food, urban life and cultural attractions.',
      tags: ['City', 'Culture', 'Food'],
      bestFor: ['solo', 'couple', 'business'], budgets: ['moderate', 'premium'], interests: ['food', 'culture', 'shopping']
    },
    {
      name: 'Cartagena', country: 'Colombia', icon: 'fa-umbrella-beach',
      description: 'Great for relaxation, history and Caribbean food, especially for couples and families.',
      tags: ['Beach', 'History', 'Relax'],
      bestFor: ['couple', 'family'], budgets: ['moderate', 'premium'], interests: ['culture', 'relax', 'food']
    },
    {
      name: 'Santa Marta', country: 'Colombia', icon: 'fa-water',
      description: 'Combines beach, nature and relaxation with flexible budget options.',
      tags: ['Nature', 'Beach', 'Relax'],
      bestFor: ['solo', 'couple', 'family'], budgets: ['budget', 'moderate'], interests: ['relax', 'food']
    },
    {
      name: 'Cali', country: 'Colombia', icon: 'fa-music',
      description: 'A lively city with food, culture, music and urban activities for active travelers.',
      tags: ['Culture', 'Food', 'City'],
      bestFor: ['solo', 'couple'], budgets: ['budget', 'moderate'], interests: ['food', 'culture']
    },
    {
      name: 'Barranquilla', country: 'Colombia', icon: 'fa-masks-theater',
      description: 'A Caribbean city with a strong cultural identity, restaurants, shopping and convenient short-trip options.',
      tags: ['Culture', 'Shopping', 'Caribbean'],
      bestFor: ['solo', 'business', 'family'], budgets: ['budget', 'moderate'], interests: ['culture', 'shopping', 'food']
    },
    {
      name: 'Bucaramanga', country: 'Colombia', icon: 'fa-tree-city',
      description: 'A balanced option for food, rest and urban activities at moderate prices.',
      tags: ['Budget', 'Food', 'Relax'],
      bestFor: ['solo', 'family', 'business'], budgets: ['budget', 'moderate'], interests: ['food', 'relax']
    },
    {
      name: 'Pereira', country: 'Colombia', icon: 'fa-mug-hot',
      description: 'A gateway to coffee-region experiences, relaxation and local cuisine for couples and families.',
      tags: ['Coffee', 'Nature', 'Relax'],
      bestFor: ['couple', 'family', 'solo'], budgets: ['budget', 'moderate'], interests: ['food', 'relax', 'culture']
    }
  ]
};

function normalizeProfileToken(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function rankCities(profile, language) {
  const traveler = normalizeProfileToken(profile.travelerType);
  const budget = normalizeProfileToken(profile.budget);
  const interests = profile.interests.map(normalizeProfileToken);
  const pool = cityCatalog[language] || cityCatalog.es;

  return pool.map(city => {
    let score = Math.random() * 1.5;
    const bestFor = city.bestFor.map(normalizeProfileToken);
    const budgets = city.budgets.map(normalizeProfileToken);
    const cityInterests = city.interests.map(normalizeProfileToken);

    if (bestFor.some(v => traveler.includes(v) || v.includes(traveler))) score += 6;
    if (budgets.some(v => budget.includes(v) || v.includes(budget))) score += 4;
    interests.forEach(interest => {
      if (cityInterests.some(v => interest.includes(v) || v.includes(interest))) score += 5;
    });

    return { ...city, score };
  }).sort((a, b) => b.score - a.score);
}

function buildRecommendations(body) {
  const language = getLang(body.language);
  const base = catalog[language];
  const profile = {
    travelerType: String(body.travelerType || 'General'),
    timeAvailable: String(body.timeAvailable || 'Escala'),
    budget: String(body.budget || 'Moderado'),
    interests: normalizeInterests(body.interests)
  };

  const accommodations = scoreAndSort(base.accommodations, profile, 'accommodations');
  const gastronomy = scoreAndSort(base.gastronomy, profile, 'gastronomy');
  const activities = scoreAndSort(base.activities, profile, 'activities');
  const rankedCities = rankCities(profile, language);
  const [recommendedCity, ...cityAlternatives] = rankedCities;

  // Mezcla entre las opciones más relevantes para producir combinaciones distintas en cada prueba.
  return {
    recommendedCity,
    alternativeCities: cityAlternatives.slice(0, 2),
    accommodations: pickMany(accommodations.slice(0, 5), 3),
    gastronomy: pickMany(gastronomy.slice(0, 5), 3),
    activities: pickMany(activities.slice(0, 5), 3)
  };
}

const chatResponses = {
  es: {
    luggage: [
      'Puedes consultar el servicio de guarda equipaje o lockers del aeropuerto. Para esta demo local, te recomiendo verificar el punto de información del terminal.',
      'Si necesitas guardar maletas durante una escala, busca la zona de equipajes o atención al viajero. Esta respuesta es simulada y funciona sin conexión a Internet.'
    ],
    food: [
      'Si tienes poco tiempo, te recomiendo una opción rápida cerca de tu puerta. Si dispones de varias horas, puedes probar comida local y un café colombiano.',
      'Para comer, puedes elegir entre café y snacks, comida rápida o un restaurante local según tu tiempo y presupuesto.'
    ],
    transport: [
      'Para una prueba del prototipo, considera taxi autorizado, transporte por aplicación o bus. Antes de salir del aeropuerto, revisa siempre tu hora de embarque.',
      'La opción de transporte depende del tiempo disponible. Para una escala corta es mejor permanecer en el aeropuerto; con varias horas puedes considerar un traslado urbano.'
    ],
    hotel: [
      'Para una escala nocturna puedes elegir un hotel cercano al aeropuerto. El prototipo puede sugerir opciones económicas, ejecutivas o premium según tu perfil.',
      'Si necesitas descansar, una alternativa cercana al aeropuerto suele ser la opción más segura para no comprometer el siguiente vuelo.'
    ],
    time: [
      'Con menos de 4 horas recomiendo permanecer en el aeropuerto. Entre 4 y 12 horas podrías hacer una actividad cercana, dejando margen suficiente para regresar.',
      'Calcula siempre tiempo de salida, desplazamiento, regreso, seguridad y embarque. En una escala corta conviene evitar recorridos largos.'
    ],
    shopping: [
      'Puedes explorar tiendas, recuerdos y duty free. Para esta demo local puedo variar las recomendaciones según presupuesto y tiempo disponible.',
      'Si buscas compras, prioriza zonas dentro del terminal cuando la escala sea corta; con más tiempo puedes combinar compras con una comida.'
    ],
    default: [
      'Puedo ayudarte con alojamiento, comida, actividades, compras, equipaje, transporte y recomendaciones según el tiempo de tu escala.',
      'Soy la versión local de AeroGuía. No uso ninguna API externa y puedo simular distintas recomendaciones para probar el kiosco.',
      'Cuéntame qué necesitas durante tu escala: descansar, comer, comprar, conocer algo de la ciudad o resolver una duda del aeropuerto.',
      'Para esta demostración puedo orientarte con respuestas preconfiguradas que cambian según el tipo de consulta.'
    ]
  },
  en: {
    luggage: ['For this local demo, check the airport luggage storage or locker area and confirm availability at the information desk.'],
    food: ['For a short layover, choose a quick option near your gate. With more time, try local food and Colombian coffee.'],
    transport: ['For the prototype, consider authorized taxi, ride-hailing or public transport, always allowing enough time to return for boarding.'],
    hotel: ['For an overnight layover, a hotel close to the airport is usually the safest option for protecting your connection time.'],
    time: ['With less than four hours, staying at the airport is recommended. With a longer layover, a nearby activity may be possible.'],
    shopping: ['You can explore airport shops, souvenirs and duty free areas depending on your available time.'],
    default: [
      'I can help with accommodation, food, activities, shopping, luggage and transport during your layover.',
      'This is the local AeroGuía demo. It uses no external API and returns simulated responses for testing.',
      'Tell me what you need during your layover and I will provide a local test response.'
    ]
  }
};

function localChatReply(message, language) {
  const lang = getLang(language);
  const text = message.toLowerCase();
  let category = 'default';

  if (/maleta|equipaje|locker|luggage|bag/.test(text)) category = 'luggage';
  else if (/comer|comida|restaurante|café|cafe|food|eat|restaurant/.test(text)) category = 'food';
  else if (/taxi|transporte|bus|uber|transport/.test(text)) category = 'transport';
  else if (/hotel|dormir|descans|alojamiento|sleep|stay/.test(text)) category = 'hotel';
  else if (/tiempo|escala|horas|vuelo|time|layover|flight/.test(text)) category = 'time';
  else if (/compr|tienda|duty|shopping|shop/.test(text)) category = 'shopping';

  const options = chatResponses[lang][category] || chatResponses[lang].default;
  return options[Math.floor(Math.random() * options.length)];
}


function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
      if (raw.length > 32768) {
        reject(new Error('Payload demasiado grande.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('JSON inválido.'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  let pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  if (pathname === '/') pathname = '/index.html';

  const safePath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(publicDir, safePath);
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Archivo no encontrado.');
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml'
    }[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, {
      success: true,
      service: 'AeroGuía Local',
      status: 'ok',
      mode: 'local',
      externalApi: false
    });
  }

  if (req.method === 'POST' && url.pathname === '/api/recommendations') {
    try {
      const body = await readJsonBody(req);
      const data = buildRecommendations(body);
      return sendJson(res, 200, { success: true, mode: 'local', data });
    } catch (error) {
      console.error('Error generando recomendaciones locales:', error);
      return sendJson(res, 400, { success: false, error: error.message || 'No se pudieron generar las recomendaciones locales.' });
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    try {
      const body = await readJsonBody(req);
      const { message, language = 'es' } = body;

      if (!isNonEmptyString(message)) {
        return sendJson(res, 400, { success: false, error: 'El campo message es obligatorio.' });
      }
      if (message.trim().length > 2000) {
        return sendJson(res, 400, { success: false, error: 'El mensaje es demasiado largo. Máximo 2000 caracteres.' });
      }

      return sendJson(res, 200, {
        success: true,
        mode: 'local',
        reply: localChatReply(message.trim(), language)
      });
    } catch (error) {
      return sendJson(res, 400, { success: false, error: error.message || 'No se pudo procesar el mensaje.' });
    }
  }

  if (url.pathname.startsWith('/api/')) {
    return sendJson(res, 404, { success: false, error: 'Endpoint no encontrado.' });
  }

  return serveStatic(req, res);
});

server.listen(port, () => {
  console.log(`🚀 AeroGuía en modo 100% local: http://localhost:${port}`);
  console.log('✅ Sin Gemini, sin API key, sin Express y sin conexiones externas.');
});
