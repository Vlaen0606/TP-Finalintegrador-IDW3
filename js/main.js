// Veterinaria La Mary — comportamiento compartido del sitio
// 1) Selector de modo claro/oscuro con persistencia en localStorage.
// 2) Formulario de contacto: validación de Bootstrap + modal de confirmación.
//    (No hay backend todavía: eso se conecta en una etapa posterior del TFI.)

(function () {
  const THEME_KEY = 'vlm-theme';
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-bs-theme', theme);
    if (toggle) {
      const isDark = theme === 'dark';
      toggle.setAttribute('aria-pressed', String(isDark));
      toggle.innerHTML = isDark
        ? '<span aria-hidden="true">☀️</span> Modo claro'
        : '<span aria-hidden="true">🌙</span> Modo oscuro';
    }
  }

  let stored = null;
  try {
    stored = localStorage.getItem(THEME_KEY);
  } catch (e) {
    // almacenamiento no disponible (modo privado, etc.): seguimos sin persistencia
  }

  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(stored || (prefersDark ? 'dark' : 'light'));

  if (toggle) {
    toggle.addEventListener('click', function () {
      const next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (e) {
        // si falla el guardado, el modo igual se aplica para esta visita
      }
    });
  }
})();

(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const confirmModalEl = document.getElementById('confirmModal');
  const confirmModal = confirmModalEl && window.bootstrap
    ? new bootstrap.Modal(confirmModalEl)
    : null;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();

    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    form.classList.add('was-validated');
    if (confirmModal) {
      confirmModal.show();
    }
    form.reset();
    form.classList.remove('was-validated');
  });
})();
