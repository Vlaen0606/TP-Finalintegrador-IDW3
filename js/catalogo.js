// Veterinaria La Mary — catálogo de profesionales de la portada.
// Se arma a partir de los veterinarios guardados en LocalStorage (los mismos que se
// administran en veterinarios.html). Depende de js/storage.js (objeto VLM).

import { VLM } from './storage.js';

(function () {
  const contenedor = document.getElementById('catalogoProfesionales');
  if (!contenedor) return;

  const vacio = document.getElementById('catalogoVacio');
  const statProfesionales = document.getElementById('statProfesionales');
  const statEspecialidades = document.getElementById('statEspecialidades');
  const modalEl = document.getElementById('vetModal');
  const modal = new bootstrap.Modal(modalEl);

  const veterinarios = VLM.getVeterinarios();

  function descripcionCorta(esp) {
    const e = VLM.buscarEspecializacion(esp);
    return e ? e.corta : 'Profesional de la clínica.';
  }

  function descripcionLarga(esp) {
    const e = VLM.buscarEspecializacion(esp);
    return e ? e.larga : 'Profesional de la clínica. Consultá por turnos y disponibilidad.';
  }

  function tarjetaHtml(v) {
    return '<div class="col">' +
      '<article class="card vet-card h-100">' +
        (v.imagen
          ? '<img class="vet-foto" src="' + v.imagen + '" alt="Foto de ' + VLM.escapeHtml(v.nombre) + '">'
          : '<div class="vet-avatar" style="--avatar-color:' + VLM.colorAvatar(v.idVeterinario) + ';">' + VLM.escapeHtml(VLM.iniciales(v.nombre)) + '</div>') +
        '<div class="card-body">' +
          '<h3 class="card-title">' + VLM.escapeHtml(v.nombre) + '</h3>' +
          '<span class="badge rounded-pill badge-brand mb-2">' + VLM.escapeHtml(v.especializacion) + '</span>' +
          '<p class="card-text">' + VLM.escapeHtml(descripcionCorta(v.especializacion)) + '</p>' +
          '<button type="button" class="btn btn-outline-primary btn-sm" data-id="' + VLM.escapeHtml(v.idVeterinario) + '">Ver perfil</button>' +
          '<div class="valor">' +
            '<span class="label">Valor de consulta</span>' +
            '<span class="monto">' + VLM.formatearMoneda(v.valorConsulta) + '</span>' +
          '</div>' +
        '</div>' +
      '</article>' +
    '</div>';
  }

  contenedor.innerHTML = veterinarios.map(tarjetaHtml).join('');
  vacio.classList.toggle('d-none', veterinarios.length > 0);

  // Contadores de la "ficha de la clínica" (hero)
  if (statProfesionales) statProfesionales.textContent = veterinarios.length;
  if (statEspecialidades) {
    const distintas = new Set(veterinarios.map(function (v) { return v.especializacion; })).size;
    statEspecialidades.textContent = distintas + (distintas === 1 ? ' área' : ' áreas');
  }

  contenedor.addEventListener('click', function (event) {
    const boton = event.target.closest('button[data-id]');
    if (!boton) return;
    const v = veterinarios.find(function (x) { return x.idVeterinario === boton.dataset.id; });
    if (!v) return;
    document.getElementById('vetModalLabel').textContent = v.nombre;
    document.getElementById('vetModalEsp').textContent = v.especializacion;
    document.getElementById('vetModalDesc').textContent = descripcionLarga(v.especializacion);
    document.getElementById('vetModalValor').textContent = VLM.formatearMoneda(v.valorConsulta);
    modal.show();
  });
})();
