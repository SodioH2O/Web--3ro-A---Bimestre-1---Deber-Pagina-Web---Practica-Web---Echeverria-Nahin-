
let modalEditar;

if (protegerPagina("Administrador")) {
  iniciarAdmin();
}


function esAdmin() {
  const sesion = obtenerSesion();
  return !!sesion && sesion.rol === "Administrador";
}

function sinPermiso() {
  Swal.fire({
    icon: "error",
    title: "Acceso denegado",
    text: "Solo el administrador puede realizar esta acción.",
    confirmButtonColor: "#c8102e"
  });
}

function aviso(mensaje) {
  Swal.fire({
    toast: true, position: "top-end", icon: "success",
    title: mensaje, showConfirmButton: false, timer: 1800
  });
}

function iniciarAdmin() {
  modalEditar = new bootstrap.Modal(document.getElementById("modalEditar"));


  const edMarca = document.getElementById("ed_marca");
  const edModelo = document.getElementById("ed_modelo");
  llenarSelectMarcas(edMarca);
  llenarSelectServicios(document.getElementById("ed_servicio"));
  edMarca.addEventListener("change", () => llenarSelectModelos(edMarca, edModelo));

  document.getElementById("ed_cliente").innerHTML = USUARIOS
    .map(u => `<option value="${u.id}">${escaparHTML(u.nombre)} (${u.rol})</option>`).join("");

  document.getElementById("ed_estado").innerHTML = ESTADOS
    .map(e => `<option value="${e}">${e}</option>`).join("");


    const filtro = document.getElementById("filtroEstado");
  filtro.innerHTML = '<option value="">Todos los estados</option>' +
    ESTADOS.map(e => `<option value="${e}">${e}</option>`).join("");
  filtro.addEventListener("change", renderTabla);
  document.getElementById("buscar").addEventListener("input", renderTabla);

  document.getElementById("formEditar").addEventListener("submit", guardarEdicion);

  renderTabla();
}


function renderTabla() {
  const estadoFiltro = document.getElementById("filtroEstado").value;
  const texto = document.getElementById("buscar").value.trim().toLowerCase();

  let lista = obtenerSolicitudes();
  if (estadoFiltro) {
    lista = lista.filter(s => s.estado === estadoFiltro);
  }
  if (texto) {
    lista = lista.filter(s =>
      s.placa.toLowerCase().includes(texto) || s.nombre.toLowerCase().includes(texto));
  }

  document.getElementById("totalRegistros").textContent = lista.length;
  const tbody = document.getElementById("tablaAdmin");

  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No hay solicitudes para mostrar.</td></tr>';
    return;
  }

  tbody.innerHTML = lista.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${escaparHTML(s.nombre)}</td>
      <td>${escaparHTML(s.placa)}</td>
      <td>${escaparHTML(s.marca)} ${escaparHTML(s.modelo)} (${s.anio})</td>
      <td>${escaparHTML(s.servicio)}</td>
      <td>${escaparHTML(s.fecha)} ${escaparHTML(s.hora)}</td>
      <td><span class="badge bg-${COLORES_ESTADO[s.estado]}">${escaparHTML(s.estado)}</span></td>
      <td>
        <select class="form-select form-select-sm" onchange="cambiarEstado(${s.id}, this.value)">
          ${ESTADOS.map(e => `<option value="${e}" ${e === s.estado ? "selected" : ""}>${e}</option>`).join("")}
        </select>
      </td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-dark" onclick="editar(${s.id})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="eliminar(${s.id})">Eliminar</button>
      </td>
    </tr>`).join("");
}


function cambiarEstado(id, nuevoEstado) {
  if (!esAdmin()) { sinPermiso(); return; }
  if (!ESTADOS.includes(nuevoEstado)) return;

  const lista = obtenerSolicitudes();
  const solicitud = lista.find(s => s.id === id);
  if (!solicitud) return;

  solicitud.estado = nuevoEstado;
  guardarSolicitudes(lista);
  renderTabla();
  aviso("Estado actualizado");
}


function editar(id) {
  if (!esAdmin()) { sinPermiso(); return; }

  const s = obtenerSolicitudes().find(x => x.id === id);
  if (!s) return;

  document.getElementById("ed_id").value = s.id;
  document.getElementById("ed_cliente").value = s.idUsuario;
  document.getElementById("ed_nombre").value = s.nombre;
  document.getElementById("ed_telefono").value = s.telefono;
  document.getElementById("ed_correo").value = s.correo;
  document.getElementById("ed_placa").value = s.placa;

  const edMarca = document.getElementById("ed_marca");
  edMarca.value = s.marca;
  llenarSelectModelos(edMarca, document.getElementById("ed_modelo"), s.modelo);

  document.getElementById("ed_anio").value = s.anio;
  document.getElementById("ed_kilometraje").value = s.kilometraje;
  document.getElementById("ed_servicio").value = s.servicio;
  document.getElementById("ed_fecha").value = s.fecha;
  document.getElementById("ed_hora").value = s.hora;
  document.getElementById("ed_observaciones").value = s.observaciones;
  document.getElementById("ed_estado").value = s.estado;

  // Radio de combustible
  document.querySelectorAll('input[name="ed_combustible"]').forEach(r => {
    r.checked = (r.value === s.combustible);
  });

  
  document.querySelectorAll('input[name="ed_extras"]').forEach(c => {
    c.checked = s.extras.includes(c.value);
  });

  modalEditar.show();
}


function guardarEdicion(evento) {
  evento.preventDefault();
  if (!esAdmin()) { sinPermiso(); return; }

  const datos = leerDatosFormulario("ed_");
  const errores = validarSolicitud(datos, true); 

  const estado = document.getElementById("ed_estado").value;
  if (!ESTADOS.includes(estado)) {
    errores.push("El estado no es válido.");
  }

  if (errores.length > 0) {
    mostrarErrores(errores);
    return;
  }

  const id = Number(document.getElementById("ed_id").value);
  const lista = obtenerSolicitudes();
  const indice = lista.findIndex(s => s.id === id);
  if (indice === -1) return;

  lista[indice] = {
    ...lista[indice],
    idUsuario: Number(document.getElementById("ed_cliente").value),
    nombre: datos.nombre.trim(),
    telefono: datos.telefono.trim(),
    correo: datos.correo.trim(),
    placa: normalizarPlaca(datos.placa),
    marca: datos.marca,
    modelo: datos.modelo,
    anio: Number(datos.anio),
    kilometraje: Number(datos.kilometraje),
    servicio: datos.servicio,
    fecha: datos.fecha,
    hora: datos.hora,
    combustible: datos.combustible,
    extras: datos.extras,
    observaciones: datos.observaciones.trim(),
    estado: estado
  };

  guardarSolicitudes(lista);
  modalEditar.hide();
  renderTabla();
  aviso("Solicitud actualizada");
}

function eliminar(id) {
  if (!esAdmin()) { sinPermiso(); return; }

  Swal.fire({
    title: "¿Eliminar solicitud #" + id + "?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#c8102e",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(resultado => {
    if (!resultado.isConfirmed) return;

    const lista = obtenerSolicitudes().filter(s => s.id !== id);
    guardarSolicitudes(lista);
    renderTabla();
    aviso("Solicitud eliminada");
  });
}