// Veterinaria La Mary — administración de Veterinarios (ABM sobre LocalStorage)
// Depende de js/storage.js (objeto VLM).

import { VLM } from './storage.js';

(function () {
  const form = document.getElementById('veterinarioForm');
  if (!form) return;

  const campos = {
    id: document.getElementById('idVeterinario'),
    matricula: document.getElementById('matricula'),
    nombre: document.getElementById('nombre'),
    especializacion: document.getElementById('especializacion'),
    valorConsulta: document.getElementById('valorConsulta'),
    imagen: document.getElementById('imagen'),
  };
  const previewWrap = document.getElementById('imagenPreview');
  const previewImg = document.getElementById('imagenPreviewImg');
  const quitarImagen = document.getElementById('quitarImagen');
  const quitarImagenWrap = document.getElementById('quitarImagenWrap');
  const matriculaFeedback = document.getElementById('matriculaFeedback');
  const MENSAJE_MATRICULA = matriculaFeedback.textContent;
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const tbody = document.getElementById('tablaVeterinarios');
  const totalEl = document.getElementById('totalVeterinarios');
  const sinVeterinarios = document.getElementById('sinVeterinarios');

  const mensajeForm = document.getElementById('mensajeForm');
  const mensajeFormTexto = document.getElementById('mensajeFormTexto');
  const buscador = document.getElementById('buscador');
  const sinResultados = document.getElementById('sinResultados');

  const confirmModalEl = document.getElementById('confirmDeleteModal');
  const confirmModal = new bootstrap.Modal(confirmModalEl);
  const confirmText = document.getElementById('confirmDeleteText');
  const confirmBtn = document.getElementById('confirmDeleteBtn');

  let veterinarios = VLM.getVeterinarios();
  let idAEliminar = null;
  let filtro = '';
  let imagenActual = null;   // data URL de la foto que quedará guardada (o null)

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

  // ---------- Lista de especializaciones predefinidas ----------

  VLM.ESPECIALIZACIONES.forEach(function (e) {
    const opcion = document.createElement('option');
    opcion.value = e.nombre;
    opcion.textContent = e.nombre;
    campos.especializacion.appendChild(opcion);
  });

  // ---------- Listado ----------

  function filaHtml(v) {
    const foto = v.imagen
      ? '<img class="pet-thumb" src="' + v.imagen + '" alt="Foto de ' + VLM.escapeHtml(v.nombre) + '">'
      : '<span class="pet-thumb pet-thumb-vacio" aria-hidden="true">' + VLM.escapeHtml(VLM.iniciales(v.nombre)) + '</span>';

    return '<tr>' +
      '<td>' + foto + '</td>' +
      '<td>' + v.matricula + '</td>' +
      '<th scope="row" class="fw-semibold">' + VLM.escapeHtml(v.nombre) + '</th>' +
      '<td><span class="badge rounded-pill badge-brand">' + VLM.escapeHtml(v.especializacion) + '</span></td>' +
      '<td class="text-end">' + VLM.formatearMoneda(v.valorConsulta) + '</td>' +
      '<td class="text-end text-nowrap">' +
        '<button type="button" class="btn btn-outline-primary btn-sm me-1" data-action="editar" data-id="' + VLM.escapeHtml(v.idVeterinario) + '" aria-label="Editar a ' + VLM.escapeHtml(v.nombre) + '">Editar</button>' +
        '<button type="button" class="btn btn-outline-danger btn-sm" data-action="eliminar" data-id="' + VLM.escapeHtml(v.idVeterinario) + '" aria-label="Eliminar a ' + VLM.escapeHtml(v.nombre) + '">Eliminar</button>' +
      '</td>' +
    '</tr>';
  }

  function render() {
    const q = normalizar(filtro.trim());
    const visibles = q === '' ? veterinarios : veterinarios.filter(function (v) {
      return normalizar(v.nombre + ' ' + v.matricula + ' ' + v.especializacion).indexOf(q) !== -1;
    });
    tbody.innerHTML = visibles.map(filaHtml).join('');
    // El total siempre cuenta todos los registrados; si hay filtro se aclara cuántos se ven.
    const total = veterinarios.length + (veterinarios.length === 1 ? ' veterinario' : ' veterinarios');
    totalEl.textContent = q === '' ? total : visibles.length + ' de ' + total;
    sinVeterinarios.classList.toggle('d-none', veterinarios.length > 0);
    sinResultados.classList.toggle('d-none', veterinarios.length === 0 || visibles.length > 0);
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

  // ---------- Validación de matrícula repetida ----------

  // `required` y `minlength` del HTML cuentan los espacios: "   " pasaría como válido y
  // después, al hacer trim(), se guardaría un nombre vacío. Se valida el texto ya recortado.
  const MIN_NOMBRE = 3;

  function validarNombre() {
    const largo = campos.nombre.value.trim().length;
    campos.nombre.setCustomValidity(largo < MIN_NOMBRE ? 'texto-invalido' : '');
  }

  campos.nombre.addEventListener('input', validarNombre);

  function validarMatriculaUnica() {
    const valor = campos.matricula.value;
    // Number() y no parseInt(): un input type="number" admite "1e5" (= 100000), que parseInt leería como 1.
    const repetida = valor !== '' && veterinarios.some(function (v) {
      return v.matricula === Number(valor) && v.idVeterinario !== campos.id.value;
    });
    campos.matricula.setCustomValidity(repetida ? 'repetida' : '');
    matriculaFeedback.textContent = repetida ? 'Ya existe un veterinario con esa matrícula.' : MENSAJE_MATRICULA;
  }

  campos.matricula.addEventListener('input', validarMatriculaUnica);

  // ---------- Formulario ----------

  function limpiarFormulario() {
    form.reset();
    form.classList.remove('was-validated');
    ocultarError();
    campos.id.value = '';
    previewImg.classList.remove('opacity-25');
    mostrarPreview(null, false);
    campos.matricula.setCustomValidity('');
    matriculaFeedback.textContent = MENSAJE_MATRICULA;
    formTitle.textContent = 'Registrar veterinario';
    submitBtn.textContent = 'Registrar veterinario';
    cancelBtn.classList.add('d-none');
  }

  function cargarParaEditar(id) {
    const v = veterinarios.find(function (x) { return x.idVeterinario === id; });
    if (!v) return;

    // Si la especialización guardada no está en la lista (dato viejo), se agrega para no perderla.
    const existe = Array.from(campos.especializacion.options).some(function (o) { return o.value === v.especializacion; });
    if (!existe) {
      const opcion = document.createElement('option');
      opcion.value = v.especializacion;
      opcion.textContent = v.especializacion;
      campos.especializacion.appendChild(opcion);
    }

    campos.id.value = v.idVeterinario;
    campos.matricula.value = v.matricula;
    campos.nombre.value = v.nombre;
    campos.especializacion.value = v.especializacion;
    campos.valorConsulta.value = v.valorConsulta;
    campos.imagen.value = '';
    previewImg.classList.remove('opacity-25');
    mostrarPreview(v.imagen || null, Boolean(v.imagen));
    validarMatriculaUnica();
    form.classList.remove('was-validated');
    formTitle.textContent = 'Editar veterinario';
    submitBtn.textContent = 'Guardar cambios';
    cancelBtn.classList.remove('d-none');
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    campos.nombre.focus({ preventScroll: true });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    event.stopPropagation();
    ocultarError();

    validarNombre();
    validarMatriculaUnica();
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const datos = {
      matricula: Number(campos.matricula.value),
      nombre: campos.nombre.value.trim(),
      especializacion: campos.especializacion.value,
      valorConsulta: Number(campos.valorConsulta.value),
    };
    if (imagenActual) datos.imagen = imagenActual;

    const copia = veterinarios.slice();
    if (campos.id.value) {
      // Edición: se conserva el id original.
      const i = copia.findIndex(function (x) { return x.idVeterinario === campos.id.value; });
      if (i === -1) return;
      copia[i] = Object.assign({ idVeterinario: campos.id.value }, datos);
    } else {
      // Alta: el id se genera automáticamente.
      copia.push(Object.assign({ idVeterinario: VLM.generarUid() }, datos));
    }

    if (!VLM.setVeterinarios(copia)) {
      mostrarError('No se pudo guardar: el almacenamiento del navegador está lleno o no disponible. Probá sin foto o con una más chica.');
      return;
    }
    veterinarios = copia;
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
      const v = veterinarios.find(function (x) { return x.idVeterinario === id; });
      if (!v) return;
      idAEliminar = id;
      confirmText.textContent = '¿Seguro que querés eliminar a ' + v.nombre + ' (matrícula ' + v.matricula + ')? Esta acción no se puede deshacer.';
      confirmModal.show();
    }
  });

  confirmBtn.addEventListener('click', function () {
    if (!idAEliminar) return;
    const copia = veterinarios.filter(function (x) { return x.idVeterinario !== idAEliminar; });
    if (!VLM.setVeterinarios(copia)) {
      confirmModal.hide();
      mostrarError('No se pudo eliminar: el almacenamiento del navegador no está disponible.');
      return;
    }
    veterinarios = copia;
    if (campos.id.value === idAEliminar) limpiarFormulario();
    idAEliminar = null;
    confirmModal.hide();
    render();
  });

  render();
})();
