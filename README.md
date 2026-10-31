# AeroGuía - modo 100% local

Esta versión no usa Gemini, Google AI ni ninguna API externa. Tampoco necesita paquetes npm externos.

## Ejecutar

Solo necesitas Node.js 20 o superior:

```bash
npm start
```

También puedes ejecutar directamente:

```bash
node server.js
```

Abrir en el navegador:

http://localhost:3000

## Validar backend

http://localhost:3000/api/health

Debe responder con `mode: "local"` y `externalApi: false`.

## Pruebas incluidas

- Recomendaciones de alojamiento, gastronomía y actividades.
- Combinaciones variables según tipo de viajero, tiempo, presupuesto e intereses.
- Variación aleatoria entre pruebas para no devolver siempre las mismas tarjetas.
- Chat local con respuestas para equipaje, comida, transporte, alojamiento, tiempo de escala, vuelos y compras.
- Respuestas generales de respaldo.
- Español e inglés en el contenido local principal.
- No requiere `.env`, API key ni Internet.
## Ciudad recomendada

La versión local ahora genera una **ciudad principal recomendada** y dos alternativas según tipo de viajero, presupuesto e intereses. La ciudad también se incluye al exportar el itinerario.

