const USUARIOS = [
  { id: 1, usuario: "admin", clave: "admin123", rol: "Administrador", activo: true,
    nombre: "Carlos Mendoza", cedula: "1712345678", telefono: "0998765432", correo: "admin@automotriz.com" },
  { id: 2, usuario: "juan", clave: "juan123", rol: "Cliente", activo: true,
    nombre: "Juan Pérez", cedula: "1723456789", telefono: "0991234567", correo: "juan@correo.com" },
  { id: 3, usuario: "maria", clave: "maria123", rol: "Cliente", activo: true,
    nombre: "María López", cedula: "1734567890", telefono: "0987654321", correo: "maria@correo.com" },
  { id: 4, usuario: "pedro", clave: "pedro123", rol: "Cliente", activo: false, // cuenta deshabilitada
    nombre: "Pedro Gómez", cedula: "1745678901", telefono: "0976543210", correo: "pedro@correo.com" }
];


const SERVICIOS = [
  { id: 1, nombre: "Cambio de aceite y filtro", precio: 35, descripcion: "Aceite, filtro y revisión de niveles." },
  { id: 2, nombre: "Alineación y balanceo", precio: 30, descripcion: "Mejora la estabilidad y alarga la vida de tus llantas." },
  { id: 3, nombre: "Revisión y cambio de frenos", precio: 60, descripcion: "Pastillas, discos y líquido de frenos." },
  { id: 4, nombre: "Cambio de batería", precio: 90, descripcion: "Prueba de carga y cambio de batería." },
  { id: 5, nombre: "Revisión general (scanner)", precio: 25, descripcion: "Diagnóstico computarizado del vehículo." },
  { id: 6, nombre: "Cambio de llantas", precio: 50, descripcion: "Mano de obra de montaje y balanceo." }
];


const MARCAS = {
  "Chevrolet": ["Aveo", "Spark", "Sail", "Captiva"],
  "Kia": ["Rio", "Picanto", "Sportage", "Cerato"],
  "Toyota": ["Yaris", "Corolla", "Hilux", "RAV4"],
  "Hyundai": ["Accent", "Tucson", "Creta", "Elantra"],
  "Mazda": ["Mazda 2", "Mazda 3", "CX-5"],
  "Nissan": ["Versa", "Sentra", "Frontier"]
};


const ESTADOS = ["Pendiente", "En revisión", "En proceso", "Finalizado", "Cancelado"];
const COLORES_ESTADO = {
  "Pendiente": "warning text-dark",
  "En revisión": "info text-dark",
  "En proceso": "primary",
  "Finalizado": "success",
  "Cancelado": "danger"
};


const HORARIO = {
  1: { inicio: 480, fin: 1020, texto: "08:00 a 17:00" },
  2: { inicio: 480, fin: 1020, texto: "08:00 a 17:00" },
  3: { inicio: 480, fin: 1020, texto: "08:00 a 17:00" },
  4: { inicio: 480, fin: 1020, texto: "08:00 a 17:00" },
  5: { inicio: 480, fin: 1020, texto: "08:00 a 17:00" },
  6: { inicio: 480, fin: 780, texto: "08:00 a 13:00" }
};


const ANIO_MIN = 1900;
const ANIO_MAX = 2035;
const KM_MIN = 0;
const KM_MAX = 999999;


function obtenerSolicitudes() {
  try {
    return JSON.parse(localStorage.getItem("solicitudes")) || [];
  } catch (error) {
    return [];
  }
}

function guardarSolicitudes(lista) {
  localStorage.setItem("solicitudes", JSON.stringify(lista));
}

function nuevoId(lista) {
  return lista.length ? Math.max(...lista.map(s => s.id)) + 1 : 1;
}

// ---------- Utilidades ----------
// Evita que texto escrito por el usuario se interprete como HTML
function escaparHTML(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}


function hoyISO() {
  const h = new Date();
  const mes = String(h.getMonth() + 1).padStart(2, "0");
  const dia = String(h.getDate()).padStart(2, "0");
  return `${h.getFullYear()}-${mes}-${dia}`;
}

function llenarSelectMarcas(select) {
  select.innerHTML = '<option value="">Seleccione una marca</option>';
  for (const marca in MARCAS) {
    select.innerHTML += `<option value="${marca}">${marca}</option>`;
  }
}

function llenarSelectModelos(selectMarca, selectModelo, modeloSeleccionado = "") {
  selectModelo.innerHTML = '<option value="">Seleccione un modelo</option>';
  const modelos = MARCAS[selectMarca.value] || [];
  modelos.forEach(modelo => {
    const sel = modelo === modeloSeleccionado ? "selected" : "";
    selectModelo.innerHTML += `<option value="${modelo}" ${sel}>${modelo}</option>`;
  });
}

function llenarSelectServicios(select) {
  select.innerHTML = '<option value="">Seleccione un servicio</option>' +
    SERVICIOS.map(s => `<option value="${s.nombre}">${s.nombre} - $${s.precio}</option>`).join("");
}


if (!localStorage.getItem("solicitudes")) {
  guardarSolicitudes([
    {
      id: 1, idUsuario: 2, nombre: "Juan Pérez", telefono: "0991234567", correo: "juan@correo.com",
      placa: "PBA-1234", marca: "Chevrolet", modelo: "Aveo", anio: 2018, kilometraje: 65000,
      servicio: "Cambio de aceite y filtro", fecha: "2026-11-20", hora: "09:00",
      combustible: "Gasolina", extras: ["Lavado"], observaciones: "Ruido leve al frenar.",
      estado: "Pendiente"
    },
    {
      id: 2, idUsuario: 3, nombre: "María López", telefono: "0987654321", correo: "maria@correo.com",
      placa: "PCD-567", marca: "Kia", modelo: "Rio", anio: 2020, kilometraje: 40000,
      servicio: "Alineación y balanceo", fecha: "2026-11-21", hora: "10:30",
      combustible: "Gasolina", extras: [], observaciones: "",
      estado: "En revisión"
    }
  ]);
}