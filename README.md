# Nido

Una aventura web en español para que niñas y niños de 4 a 6 años practiquen patrones visuales AB, AAB, ABB y ABC. Incluye 36 retos en seis mundos, con dos aventuras narrativas protagonizadas por Lumi y sus amigos.

Bosque de Luz y Festival de Nido incluyen sus portadas y sus doce ilustraciones de capítulo finales. Los dos mundos narrativos y todos sus capítulos están siempre abiertos, con navegación libre entre cuentos. Consulta [la guía de imágenes](docs/IMAGE_REQUIREMENTS.md) para ver los nombres, formatos y descripciones de los recursos.

## Desarrollo

```bash
npm install
npm run dev
```

## Verificación

```bash
npm test
npm run build
npx playwright install
npm run test:e2e
```

El progreso se guarda únicamente en `localStorage`. No se recopilan datos ni se utiliza un backend.
