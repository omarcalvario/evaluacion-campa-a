# Encuesta UVP · Experiencias que dejan huella

Encuesta estática en HTML, CSS y JavaScript para evaluar la campaña de la Universidad del Valle de Puebla. Funciona en GitHub Pages y no requiere instalación.

## Uso

Abre `index.html` o publica el repositorio en GitHub Pages. Las respuestas se guardan automáticamente en `localStorage` del navegador del participante. Desde **Panel de respuestas** se pueden descargar en CSV o JSON.

## Selección de piezas gráficas

Al comenzar, el participante elige una de las seis imágenes de `propuestas correctas/` y responde el cuestionario. Después elige una de las dos imágenes de `comparativas/` y responde nuevamente el cuestionario. Ambas selecciones y sus respuestas se guardan en el registro y aparecen en el CSV exportado.

Para cambiar nombres o agregar piezas, edita el arreglo `PROPOSALS` en `app.js` y coloca las imágenes en la carpeta correspondiente.

## Importante: respuestas de varios participantes

GitHub Pages es alojamiento estático: `localStorage` guarda datos únicamente en el dispositivo y navegador donde se responde. Para reunir respuestas de distintas personas, configura un endpoint de Google Apps Script y define antes de `app.js`:

```html
<script>window.UVP_ENDPOINT = 'URL_DE_TU_WEB_APP';</script>
<script src="app.js"></script>
```

El endpoint recibirá cada respuesta como JSON mediante `POST`. Conserva también la descarga local como respaldo.

El archivo `google-apps-script.gs` contiene el endpoint completo para Google Sheets. Solo debes sustituir el ID de la hoja, desplegarlo como aplicación web y pegar la URL en `index.html`.

## Preguntas incluidas

Perfil, primera impresión, atractivo visual, mensaje percibido, emociones, identificación, autenticidad, interés por conocer UVP, mejora sugerida y diferenciación frente a otras campañas universitarias.
