// Veterinaria La Mary — administración de Mascotas (ABM sobre LocalStorage)
// Depende de js/storage.js (objeto VLM).

import { VLM } from './storage.js';

(function () {
  const form = document.getElementById('mascotaForm');
  if (!form) return;

  const campos = {
    id: document.getElementById('idMascota'),
    nombreMascota: document.getElementById('nombreMascota'),
    nombreDuenio: document.getElementById('nombreDuenio'),
    color: document.getElementById('color'),
    edad: document.getElementById('edad'),
    peso: document.getElementById('peso'),
    imagen: document.getElementById('imagen'),
  };
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const tbody = document.getElementById('tablaMascotas');
  const totalEl = document.getElementById('totalMascotas');
  const sinMascotas = document.getElementById('sinMascotas');
  const previewWrap = document.getElementById('imagenPreview');
  const previewImg = document.getElementById('imagenPreviewImg');
  const quitarImagen = document.getElementById('quitarImagen');
  const quitarImagenWrap = document.getElementById('quitarImagenWrap');

  const mensajeForm = document.getElementById('mensajeForm');
  const mensajeFormTexto = document.getElementById('mensajeFormTexto');
  const buscador = document.getElementById('buscador');
  const sinResultados = document.getElementById('sinResultados');

  const confirmModalEl = document.getElementById('confirmDeleteModal');
  const confirmModal = new bootstrap.Modal(confirmModalEl);
  const confirmText = document.getElementById('confirmDeleteText');
  const confirmBtn = document.getElementById('confirmDeleteBtn');

  let mascotas = VLM.getMascotas();
  let imagenActual = null;   // data URL de la foto que quedará guardada (o null)
  let idAEliminar = null;
  let filtro = '';

  // Muestra un error dentro de la página (alerta de Bootstrap) en lugar de alert().
  function mostrarError(texto) {
    mensajeFormTexto.textContent = texto;
    mensajeForm.classList.remove('d-none');
  }

  function ocultarError() {
    mensajeForm.classList.add('d-none');
  }

  // Normaliza para buscar sin distinguir mayúsculas ni tildes.
  function normalizar(texto) {
    return String(texto).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // `required` y `minlength` del HTML cuentan los espacios: "   " pasaría como válido y
  // después, al hacer trim(), se guardaría un campo vacío. Por eso se valida el largo
  // del texto ya recortado (el mensaje de error es el .invalid-feedback del propio campo).
  const TEXTOS = [
    { campo: campos.nombreMascota, minimo: 2 },
    { campo: campos.nombreDuenio, minimo: 2 },
    { campo: campos.color, minimo: 1 },
  ];

  function validarTextos() {
    TEXTOS.forEach(function (t) {
      const largo = t.campo.value.trim().length;
      t.campo.setCustomValidity(largo < t.minimo ? 'texto-invalido' : '');
    });
  }

  TEXTOS.forEach(function (t) {
    t.campo.addEventListener('input', validarTextos);
  });

  // ---------- Listado ----------

  function filaHtml(m) {
    const foto = m.imagen
      ? '<img class="pet-thumb" src="' + m.imagen + '" alt="Foto de ' + VLM.escapeHtml(m.nombreMascota) + '">'
      : '<span class="pet-thumb pet-thumb-vacio" aria-hidden="true">' + VLM.escapeHtml(VLM.iniciales(m.nombreMascota)) + '</span>';

    return '<tr>' +
      '<td>' + foto + '</td>' +
      '<th scope="row" class="fw-semibold">' + VLM.escapeHtml(m.nombreMascota) + '</th>' +
      '<td>' + VLM.escapeHtml(m.nombreDuenio) + '</td>' +
      '<td>' + VLM.escapeHtml(m.color) + '</td>' +
      '<td class="text-end text-nowrap">' + m.edad + (m.edad === 1 ? ' año' : ' años') + '</td>' +
      '<td class="text-end text-nowrap">' + VLM.formatearNumero(m.peso) + ' kg</td>' +
      '<td class="text-end text-nowrap">' +
        '<button type="button" class="btn btn-outline-primary btn-sm me-1" data-action="editar" data-id="' + VLM.escapeHtml(m.idMascota) + '" aria-label="Editar a ' + VLM.escapeHtml(m.nombreMascota) + '">Editar</button>' +
        '<button type="button" class="btn btn-outline-danger btn-sm" data-action="eliminar" data-id="' + VLM.escapeHtml(m.idMascota) + '" aria-label="Eliminar a ' + VLM.escapeHtml(m.nombreMascota) + '">Eliminar</button>' +
      '</td>' +
    '</tr>';
  }

  function render() {
    const q = normalizar(filtro.trim());
    const visibles = q === '' ? mascotas : mascotas.filter(function (m) {
      return normalizar(m.nombreMascota + ' ' + m.nombreDuenio + ' ' + m.color).indexOf(q) !== -1;
    });
    tbody.innerHTML = visibles.map(filaHtml).join('');
    // El total siempre cuenta todas las registradas; si hay filtro se aclara cuántas se ven.
    const total = mascotas.length + (mascotas.length === 1 ? ' mascota' : ' mascotas');
    totalEl.textContent = q === '' ? total : visibles.length + ' de ' + total;
    sinMascotas.classList.toggle('d-none', mascotas.length > 0);
    sinResultados.classList.toggle('d-none', mascotas.length === 0 || visibles.length > 0);
  }

  buscador.addEventListener('input', function () {
    filtro = buscador.value;
    render();
  });

  // ---------- Imagen (opcional) ----------

  function mostrarPreview(dataUrl, permitirQuitar) {
    imagenActual = dataUrl;
    // Si antes se había tildado "Quitar la foto", la vista previa quedó atenuada: se restablece.
    previewImg.classList.remove('opacity-25');
    previewWrap.classList.toggle('d-none', !dataUrl);
    if (dataUrl) previewImg.src = dataUrl;
    quitarImagenWrap.classList.toggle('d-none', !permitirQuitar);
    quitarImagen.checked = false;
  }

  campos.imagen.addEventListener('change', function () {
    ocultarError();
    const archivo = campos.imagen.files[0];
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      campos.imagen.value = '';
      mostrarError('El archivo elegido no es una imagen.');
      return;
    }
    VLM.reducirImagen(archivo)
      .then(function (dataUrl) { mostrarPreview(dataUrl, false); })
      .catch(function () {
        campos.imagen.value = '';
        mostrarError('No se pudo leer la imagen. Probá con otro archivo.');
      });
  });

  quitarImagen.addEventListener('change', function () {
    if (quitarImagen.checked) {
      previewImg.classList.add('opacity-25');
      imagenActual = null;
    } else {
      previewImg.classList.remove('opacity-25');
      imagenActual = previewImg.src;
    }
  });

  // ---------- Formulario ----------

  function limpiarFormulario() {
    form.reset();
    form.classList.remove('was-validated');
    ocultarError();
    campos.id.value = '';
    previewImg.classList.remove('opacity-25');
    mostrarPreview(null, false);
    formTitle.textContent = 'Registrar mascota';
    submitBtn.textContent = 'Registrar mascota';
    cancelBtn.classList.add('d-none');
  }

  function cargarParaEditar(id) {
    const m = mascotas.find(function (x) { return x.idMascota === id; });
    if (!m) return;
    campos.id.value = m.idMascota;
    campos.nombreMascota.value = m.nombreMascota;
    campos.nombreDuenio.value = m.nombreDuenio;
    campos.color.value = m.color;
    campos.edad.value = m.edad;
    campos.peso.value = m.peso;
    campos.imagen.value = '';
    previewImg.classList.remove('opacity-25');
    mostrarPreview(m.imagen || null, Boolean(m.imagen));
    form.classList.remove('was-validated');
    formTitle.textContent = 'Editar mascota';
    submitBtn.textContent = 'Guardar cambios';
    cancelBtn.classList.remove('d-none');
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    campos.nombreMascota.focus({ preventScroll: true });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();
    ocultarError();

    validarTextos();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    // Number() y no parseInt(): un input type="number" admite "1e1" (= 10), que parseInt leería como 1.
    // El atributo step="1" ya garantiza que la edad sea un entero.
    const datos = {
      nombreMascota: campos.nombreMascota.value.trim(),
      nombreDuenio: campos.nombreDuenio.value.trim(),
      color: campos.color.value.trim(),
      edad: Number(campos.edad.value),
      peso: Number(campos.peso.value),
    };
    if (imagenActual) datos.imagen = imagenActual;

    const copia = mascotas.slice();
    if (campos.id.value) {
      // Edición: se conserva el id original.
      const i = copia.findIndex(function (x) { return x.idMascota === campos.id.value; });
      if (i === -1) return;
      copia[i] = Object.assign({ idMascota: campos.id.value }, datos);
    } else {
      // Alta: el id se genera automáticamente.
      copia.push(Object.assign({ idMascota: VLM.generarUid() }, datos));
    }

    if (!VLM.setMascotas(copia)) {
      mostrarError('No se pudo guardar: el almacenamiento del navegador está lleno o no disponible. Probá sin foto o con una más chica.');
      return;
    }
    mascotas = copia;
    render();
    limpiarFormulario();
  });

  cancelBtn.addEventListener('click', limpiarFormulario);

  // ---------- Acciones de la tabla ----------

  tbody.addEventListener('click', function (event) {
    const boton = event.target.closest('button[data-action]');
    if (!boton) return;
    const id = boton.dataset.id;

    if (boton.dataset.action === 'editar') {
      cargarParaEditar(id);
    } else if (boton.dataset.action === 'eliminar') {
      const m = mascotas.find(function (x) { return x.idMascota === id; });
      if (!m) return;
      idAEliminar = id;
      confirmText.textContent = '¿Seguro que querés eliminar a ' + m.nombreMascota + ' (dueño: ' + m.nombreDuenio + ')? Esta acción no se puede deshacer.';
      confirmModal.show();
    }
  });

  confirmBtn.addEventListener('click', function () {
    if (!idAEliminar) return;
    const copia = mascotas.filter(function (x) { return x.idMascota !== idAEliminar; });
    if (!VLM.setMascotas(copia)) {
      confirmModal.hide();
      mostrarError('No se pudo eliminar: el almacenamiento del navegador no está disponible.');
      return;
    }
    mascotas = copia;
    // Si justo se estaba editando la mascota eliminada, se limpia el formulario.
    if (campos.id.value === idAEliminar) limpiarFormulario();
    idAEliminar = null;
    confirmModal.hide();
    render();
  });

  render();
})();
