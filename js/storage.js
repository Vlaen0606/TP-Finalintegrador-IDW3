// Veterinaria La Mary — utilidades compartidas de almacenamiento (LocalStorage)
//
// Módulo ES: lo importan js/mascotas.js, js/veterinarios.js y js/catalogo.js.
//
// Cada entidad se guarda bajo su propia clave, como un array JSON:
//   - "vlm-mascotas"     → [{ idMascota, nombreMascota, nombreDuenio, color, edad, peso, imagen? }]
//   - "vlm-veterinarios" → [{ idVeterinario, matricula, nombre, especializacion, valorConsulta, imagen? }]

import { FOTOS_INICIALES } from './fotos-iniciales.js';

const KEYS = {
  mascotas: 'vlm-mascotas',
  veterinarios: 'vlm-veterinarios',
};

// Especializaciones predefinidas (opcional del TFI). Cada una trae una descripción
// corta (tarjeta de la portada) y una larga (modal "Ver perfil").
const ESPECIALIZACIONES = [
  {
    nombre: 'Clínica general',
    corta: 'Controles de rutina, vacunación y primeras consultas.',
    larga: 'Se especializa en controles de rutina, planes de vacunación y primeras consultas para cachorros y gatitos. Es quien suele derivar internamente al especialista adecuado según lo que necesite tu mascota.',
  },
  {
    nombre: 'Cirugía y traumatología',
    corta: 'Intervenciones programadas, lesiones y rehabilitación.',
    larga: 'Realiza intervenciones programadas, atiende lesiones traumatológicas y acompaña el proceso de rehabilitación post-quirúrgica de la mascota.',
  },
  {
    nombre: 'Dermatología',
    corta: 'Alergias, afecciones de piel y pelaje.',
    larga: 'Atiende alergias, afecciones de piel y pelaje, y realiza el seguimiento de tratamientos dermatológicos prolongados.',
  },
  {
    nombre: 'Cardiología',
    corta: 'Estudios y seguimiento de pacientes cardíacos.',
    larga: 'Realiza estudios cardíacos y hace el seguimiento de pacientes con afecciones crónicas del corazón.',
  },
  {
    nombre: 'Nutrición y geriatría',
    corta: 'Planes alimentarios y cuidado de mascotas mayores.',
    larga: 'Diseña planes alimentarios a medida y se ocupa del cuidado integral de mascotas mayores.',
  },
  {
    nombre: 'Oftalmología',
    corta: 'Diagnóstico y tratamiento de afecciones oculares.',
    larga: 'Diagnostica y trata afecciones oculares, y realiza el seguimiento de pacientes con problemas de visión.',
  },
  {
    nombre: 'Odontología',
    corta: 'Salud bucal, limpiezas y extracciones.',
    larga: 'Se ocupa de la salud bucal de la mascota: limpiezas, tratamiento de sarro y extracciones cuando son necesarias.',
  },
  {
    nombre: 'Neurología',
    corta: 'Trastornos del sistema nervioso.',
    larga: 'Evalúa y trata trastornos del sistema nervioso, como convulsiones o problemas de movilidad de origen neurológico.',
  },
  {
    nombre: 'Oncología',
    corta: 'Diagnóstico y tratamiento de tumores.',
    larga: 'Diagnostica y acompaña el tratamiento de tumores y otras enfermedades oncológicas.',
  },
  {
    nombre: 'Animales exóticos',
    corta: 'Aves, roedores, reptiles y otras especies no convencionales.',
    larga: 'Atiende aves, roedores, reptiles y otras especies no convencionales, con el manejo particular que cada una requiere.',
  },
];

// Veterinarios que ya figuraban en la portada estática. Se cargan una sola vez, la
// primera vez que se abre el sitio (cuando la clave todavía no existe), para que el
// catálogo dinámico de la portada no arranque vacío. Las matrículas son de ejemplo.
const VETERINARIOS_INICIALES = [
  { matricula: 4101, nombre: 'Dra. Marisol Funes', especializacion: 'Clínica general', valorConsulta: 18500 },
  { matricula: 4102, nombre: 'Dr. Ezequiel Prado', especializacion: 'Cirugía y traumatología', valorConsulta: 26000 },
  { matricula: 4103, nombre: 'Dra. Belén Aquino', especializacion: 'Dermatología', valorConsulta: 21000 },
  { matricula: 4104, nombre: 'Dr. Nicolás Ibarra', especializacion: 'Cardiología', valorConsulta: 24500 },
  { matricula: 4105, nombre: 'Dra. Rocío Medina', especializacion: 'Nutrición y geriatría', valorConsulta: 19000 },
];

const AVATAR_COLORS = ['#3B5D42', '#6E4B3A', '#6B7F4A', '#4C6B75', '#8A5A3B', '#5A4E6B', '#7A6A2F'];

// Identificador único (uid). randomUUID solo existe en contextos seguros (https/localhost),
// así que dejamos un respaldo para que funcione igual al abrir el sitio de otra forma.
function generarUid() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function leer(clave) {
  try {
    const crudo = localStorage.getItem(clave);
    if (crudo === null) return null;
    const datos = JSON.parse(crudo);
    return Array.isArray(datos) ? datos : [];
  } catch (e) {
    return [];
  }
}

// Devuelve true si se pudo guardar; false si el navegador lo impidió (por ejemplo,
// cuota superada al guardar imágenes grandes).
function guardar(clave, lista) {
  try {
    localStorage.setItem(clave, JSON.stringify(lista));
    return true;
  } catch (e) {
    return false;
  }
}

function getMascotas() {
  return leer(KEYS.mascotas) || [];
}

function setMascotas(lista) {
  return guardar(KEYS.mascotas, lista);
}

function getVeterinarios() {
  let lista = leer(KEYS.veterinarios);
  if (lista === null) {
    lista = VETERINARIOS_INICIALES.map(function (v) {
      const nuevo = Object.assign({ idVeterinario: generarUid() }, v);
      if (FOTOS_INICIALES[v.matricula]) nuevo.imagen = FOTOS_INICIALES[v.matricula];
      return nuevo;
    });
    guardar(KEYS.veterinarios, lista);
  }
  return lista;
}

function setVeterinarios(lista) {
  return guardar(KEYS.veterinarios, lista);
}

function escapeHtml(valor) {
  return String(valor).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

const monedaEntera = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const monedaDecimal = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 });

// "$ 18.500" si es entero, "$ 17.250,50" si tiene centavos.
function formatearMoneda(numero) {
  return Number.isInteger(numero) ? monedaEntera.format(numero) : monedaDecimal.format(numero);
}

function formatearNumero(numero) {
  return Number(numero).toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

// Iniciales para el avatar: ignora el tratamiento ("Dr.", "Dra.") y toma las dos primeras palabras.
function iniciales(nombre) {
  const palabras = String(nombre)
    .replace(/^(dra?\.?|lic\.?|mv\.?)\s+/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return palabras.slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join('') || '?';
}

// Color de avatar estable: depende del id, así una misma persona siempre tiene el mismo color.
function colorAvatar(id) {
  let suma = 0;
  for (let i = 0; i < id.length; i++) suma = (suma + id.charCodeAt(i)) % 997;
  return AVATAR_COLORS[suma % AVATAR_COLORS.length];
}

// Reduce una foto a un máximo de 240 px de lado y la devuelve como data URL JPEG: así una
// foto de celular no agota el límite de ~5 MB de LocalStorage. Devuelve una Promise.
function reducirImagen(archivo) {
  return new Promise(function (resolve, reject) {
    const lector = new FileReader();
    lector.onerror = reject;
    lector.onload = function () {
      const img = new Image();
      img.onerror = reject;
      img.onload = function () {
        const MAX = 240;
        const escala = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

function buscarEspecializacion(nombre) {
  return ESPECIALIZACIONES.find(function (e) { return e.nombre === nombre; }) || null;
}

export const VLM = {
  KEYS: KEYS,
  ESPECIALIZACIONES: ESPECIALIZACIONES,
  generarUid: generarUid,
  getMascotas: getMascotas,
  setMascotas: setMascotas,
  getVeterinarios: getVeterinarios,
  setVeterinarios: setVeterinarios,
  escapeHtml: escapeHtml,
  formatearMoneda: formatearMoneda,
  formatearNumero: formatearNumero,
  iniciales: iniciales,
  colorAvatar: colorAvatar,
  buscarEspecializacion: buscarEspecializacion,
  reducirImagen: reducirImagen,
};
