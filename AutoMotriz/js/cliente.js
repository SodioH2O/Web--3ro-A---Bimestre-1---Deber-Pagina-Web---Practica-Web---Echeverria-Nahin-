
if (protegerPagina()) {
  iniciarMantenimientos();
}

function iniciarMantenimientos() {
  const sesion = obtenerSesion();
  const usuario = USUARIOS.find(u => u.id === sesion.id);


  document.getElementById("perfil").innerHTML = `
    <p class="mb-1"><strong>Nombre:</strong> ${escaparHTML(usuario.nombre)}</p>
    <p class="mb-1"><strong>Cédula:</strong> ${escaparHTML(usuario.cedula)}</p>
    <p class="mb-1"><strong>Correo:</strong> ${escaparHTML(usuario.correo)}</p>
    <p class="mb-1"><strong>Teléfono:</strong> ${escaparHTML(usuario.telefono)}</p>
    <p class="mb-0"><strong>Rol:</strong> ${escaparHTML(usuario.rol)}</p>`;

  
  const propias = obtenerSolicitudes().filter(s => s.idUsuario === sesion.id);

  const tbody = document.getElementById("tablaMantenimientos");
  const sinRegistros = document.getElementById("sinRegistros");

  if (propias.length === 0) {
    tbody.innerHTML = "";
    sinRegistros.classList.remove("d-none");
    return;
  }

  sinRegistros.classList.add("d-none");
  tbody.innerHTML = propias.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${escaparHTML(s.placa)}</td>
      <td>${escaparHTML(s.marca)} ${escaparHTML(s.modelo)} (${s.anio})</td>
      <td>${escaparHTML(s.servicio)}</td>
      <td>${escaparHTML(s.fecha)} ${escaparHTML(s.hora)}</td>
      <td><span class="badge bg-${COLORES_ESTADO[s.estado]}">${escaparHTML(s.estado)}</span></td>
    </tr>`).join("");
}