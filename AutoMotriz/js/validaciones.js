const REGEX_TELEFONO = /^09\d{8}$/;                    
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_PLACA = /^[A-Z]{3}-?\d{3,4}$/;             
const REGEX_ENTERO = /^\d+$/;                          


function normalizarPlaca(placa) {
  placa = placa.trim().toUpperCase();
  return /^[A-Z]{3}\d{3,4}$/.test(placa) ? placa.slice(0, 3) + "-" + placa.slice(3) : placa;
}


function aMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}


function leerDatosFormulario(prefijo) {
  const valor = id => document.getElementById(prefijo + id).value;
  const radio = document.querySelector(`input[name="${prefijo}combustible"]:checked`);
  const extras = [...document.querySelectorAll(`input[name="${prefijo}extras"]:checked`)]
    .map(c => c.value);

  return {
    nombre: valor("nombre"),
    telefono: valor("telefono"),
    correo: valor("correo"),
    placa: valor("placa"),
    marca: valor("marca"),
    modelo: valor("modelo"),
    anio: valor("anio"),
    kilometraje: valor("kilometraje"),
    servicio: valor("servicio"),
    fecha: valor("fecha"),
    hora: valor("hora"),
    combustible: radio ? radio.value : "",
    extras: extras,
    observaciones: valor("observaciones")
  };
}


function validarSolicitud(d, esEdicion = false) {
  const errores = [];

  if (d.nombre.trim() === "") {
    errores.push("El nombre del cliente es obligatorio.");
  }

  if (d.telefono.trim() === "") {
    errores.push("El teléfono es obligatorio.");
  } else if (!REGEX_TELEFONO.test(d.telefono.trim())) {
    errores.push("El teléfono debe tener 10 dígitos y empezar con 09 (ej. 0991234567).");
  }

  if (d.correo.trim() === "") {
    errores.push("El correo es obligatorio.");
  } else if (!REGEX_CORREO.test(d.correo.trim())) {
    errores.push("El correo no tiene un formato válido.");
  }

  // --- Vehículo ---
  const placa = normalizarPlaca(d.placa);
  if (placa === "") {
    errores.push("La placa es obligatoria.");
  } else if (!REGEX_PLACA.test(placa)) {
    errores.push("La placa no es válida. Use el formato ABC-1234 o ABC-123.");
  }

  if (d.marca === "") {
    errores.push("Debe seleccionar una marca.");
  }

  if (d.modelo === "") {
    errores.push("Debe seleccionar un modelo.");
  } else if (!MARCAS[d.marca] || !MARCAS[d.marca].includes(d.modelo)) {
    errores.push("El modelo no corresponde a la marca seleccionada.");
  }

  const anio = d.anio.trim();
  if (anio === "") {
    errores.push("El año es obligatorio.");
  } else if (!REGEX_ENTERO.test(anio) || Number(anio) < ANIO_MIN || Number(anio) > ANIO_MAX) {
    errores.push(`El año debe ser un número entero entre ${ANIO_MIN} y ${ANIO_MAX}.`);
  }

  const km = d.kilometraje.trim();
  if (km === "") {
    errores.push("El kilometraje es obligatorio.");
  } else if (!REGEX_ENTERO.test(km) || Number(km) < KM_MIN || Number(km) > KM_MAX) {
    errores.push(`El kilometraje debe ser un número entero entre ${KM_MIN} y ${KM_MAX} (sin negativos ni decimales).`);
  }

 
  if (d.servicio === "") {
    errores.push("Debe seleccionar un servicio.");
  } else if (!SERVICIOS.some(s => s.nombre === d.servicio)) {
    errores.push("El servicio seleccionado no existe.");
  }

  if (d.combustible === "") {
    errores.push("Debe seleccionar el tipo de combustible.");
  }

  // --- Fecha y hora ---
  let fecha = null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (d.fecha === "") {
    errores.push("La fecha es obligatoria.");
  } else {
    fecha = new Date(d.fecha + "T00:00:00");
    if (isNaN(fecha.getTime())) {
      errores.push("La fecha no es válida.");
      fecha = null;
    } else {
      if (!esEdicion && fecha < hoy) {
        errores.push("La fecha no puede ser anterior a hoy.");
      }
      if (fecha.getDay() === 0) {
        errores.push("No se atiende los domingos.");
      }
    }
  }

  if (d.hora === "") {
    errores.push("La hora es obligatoria.");
  } else if (fecha) {
    const horario = HORARIO[fecha.getDay()];
    if (horario) { 
      const minutos = aMinutos(d.hora);
      if (minutos < horario.inicio || minutos >= horario.fin) {
        errores.push(`La hora está fuera del horario de atención de ese día (${horario.texto}).`);
      } else if (!esEdicion && fecha.getTime() === hoy.getTime()) {
        const ahora = new Date();
        if (minutos <= ahora.getHours() * 60 + ahora.getMinutes()) {
          errores.push("La hora seleccionada ya pasó.");
        }
      }
    }
  }

  return errores;
}


function mostrarErrores(errores) {
  Swal.fire({
    icon: "error",
    title: "No se pudo guardar",
    html: "<ul class='text-start mb-0'>" + errores.map(e => `<li>${e}</li>`).join("") + "</ul>",
    confirmButtonColor: "#c8102e"
  });
}