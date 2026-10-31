# AeroGuía — versión 100 % frontend

Esta versión está preparada para **GitHub Pages**.

## Características

- No utiliza backend.
- No utiliza Node.js para ejecutarse.
- No utiliza APIs externas para recomendaciones o chat.
- Las recomendaciones se generan con lógica JavaScript local.
- Permite cambiar la ciudad recomendada.
- Las reseñas se guardan en `localStorage` del navegador.
- El chat usa respuestas locales preconfiguradas.
- Permite exportar el itinerario a `.txt`.

## Publicar en GitHub Pages

1. Sube `index.html`, `.nojekyll` y este `README.md` a la raíz de la rama `main`.
2. En GitHub abre **Settings > Pages**.
3. En **Build and deployment**, selecciona **Deploy from a branch**.
4. Selecciona la rama **main** y la carpeta **/(root)**.
5. Guarda los cambios.

GitHub Pages podrá abrir `index.html` directamente sin ejecutar ningún servidor.

> Nota: la interfaz usa Tailwind CSS y Font Awesome desde CDN, por lo que el navegador necesita Internet para cargar esos estilos e iconos. La lógica de negocio, recomendaciones, chat y reseñas sí funciona completamente en el navegador sin backend.
