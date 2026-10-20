import { resolve } from 'path';
import { defineConfig } from 'vite';

// Sitio multi-página: por defecto "vite build" solo empaqueta index.html,
// así que declaramos explícitamente las 5 páginas como puntos de entrada.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        institucional: resolve(__dirname, 'institucional.html'),
        contacto: resolve(__dirname, 'contacto.html'),
        mascotas: resolve(__dirname, 'mascotas.html'),
        veterinarios: resolve(__dirname, 'veterinarios.html'),
      },
    },
  },
});
