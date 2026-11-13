if (protegerPagina()) {
  iniciarSolicitud();
}

function iniciarSolicitud() {
  const sesion = obtenerSesion();
  const esAdmin = sesion.rol === "Administrador";

  const selMarca = document.getElementById("marca");
  const selModelo = document.getElementById("modelo");
  const selCliente = document.getElementById("clienteDestino");
  const form = document.getElementById("formSolicitud");

  llenarSelectMarcas(selMarca);
  llenarSelectServicios(document.getElementById("servicio"));
  selModelo.innerHTML = '<option value="">Seleccione un modelo</option>';
  document.getElementById("fecha").min = hoyISO();

  
  selMarca.addEventListener("change", () => llenarSelectModelos(selMarca, selModelo));

  
  if (esAdmin) {
    document.getElementById("bloqueCliente").classList.remove("d-none");
    USUARIOS.filter(u => u.activo).forEach(u => {
      selCliente.innerHTML += `<option value="${u.id}">${escaparHTML(u.nombre)} (${u.rol})</option>`;
    });
    selCliente.value = sesion.id;
    selCliente.addEventListener("change", () => rellenarDatosCliente(Number(selCliente.value)));
  }

  rellenarDatosCliente(sesion.id);

  form.addEventListener("submit", evento => {
    evento.preventDefault();

    const datos = leerDatosFormulario("");
    const errores = validarSolicitud(datos, false);

    if (errores.length > 0) {
      mostrarErrores(errores);
      return; 
    }

   
    const idDueno = esAdmin ? Number(selCliente.value) : sesion.id;

    const lista = obtenerSolicitudes();
    lista.push({
      id: nuevoId(lista),
      idUsuario: idDueno,
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
      estado: "Pendiente"
    });
    guardarSolicitudes(lista);

    Swal.fire({
      icon: "success",
      title: "Solicitud registrada",
      text: "Tu solicitud quedó en estado Pendiente.",
      confirmButtonColor: "#c8102e"
    }).then(() => {
      location.href = esAdmin ? "admin.html" : "mantenimientos.html";
    });
  });
}


function rellenarDatosCliente(idUsuario) {
  const u = USUARIOS.find(x => x.id === idUsuario);
  if (!u) return;
  document.getElementById("nombre").value = u.nombre;
  document.getElementById("telefono").value = u.telefono;
  document.getElementById("correo").value = u.correo;
}