function obtenerSesion() {
  try {
    return JSON.parse(sessionStorage.getItem("sesion"));
  } catch (error) {
    return null;
  }
}

function cerrarSesion() {
  sessionStorage.removeItem("sesion");
  location.href = "index.html";
}



function protegerPagina(rolRequerido) {
  const sesion = obtenerSesion();

  if (!sesion) {
    Swal.fire({
      icon: "warning",
      title: "Inicia sesión",
      text: "Debes iniciar sesión para ver esta página.",
      confirmButtonColor: "#c8102e"
    }).then(() => { location.href = "login.html"; });
    return false;
  }

  if (rolRequerido && sesion.rol !== rolRequerido) {
    Swal.fire({
      icon: "error",
      title: "Acceso denegado",
      text: "No tienes permisos para entrar a esta sección.",
      confirmButtonColor: "#c8102e"
    }).then(() => { location.href = "index.html"; });
    return false;
  }

  return true;
}


function pintarMenu() {
  const menu = document.getElementById("menu");
  if (!menu) return;

  const sesion = obtenerSesion();
  let html = `
    <li class="nav-item"><a class="nav-link" href="index.html#inicio">Inicio</a></li>
    <li class="nav-item"><a class="nav-link" href="index.html#acerca">Acerca de</a></li>
    <li class="nav-item"><a class="nav-link" href="index.html#servicios">Servicios</a></li>`;

  if (sesion) {
    html += `
      <li class="nav-item"><a class="nav-link" href="solicitud.html">Solicitar mantenimiento</a></li>
      <li class="nav-item"><a class="nav-link" href="mantenimientos.html">Mis mantenimientos</a></li>`;

    if (sesion.rol === "Administrador") {
      html += `<li class="nav-item"><a class="nav-link" href="admin.html">Administración</a></li>`;
    }

    html += `
      <li class="nav-item">
        <a class="nav-link" href="#" onclick="cerrarSesion(); return false;">
          Cerrar sesión (${escaparHTML(sesion.usuario)})
        </a>
      </li>`;
  } else {
    html += `<li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>`;
  }

  menu.innerHTML = html;
}


function manejarLogin(evento) {
  evento.preventDefault();

  const usuario = document.getElementById("usuario").value.trim().toLowerCase();
  const clave = document.getElementById("clave").value;

  if (usuario === "" || clave === "") {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Ingresa tu usuario y tu contraseña.",
      confirmButtonColor: "#c8102e"
    });
    return;
  }

  const encontrado = USUARIOS.find(u => u.usuario === usuario && u.clave === clave);

  if (!encontrado) {
    Swal.fire({
      icon: "error",
      title: "Acceso inválido",
      text: "Usuario o contraseña incorrectos.",
      confirmButtonColor: "#c8102e"
    });
    return;
  }

  if (!encontrado.activo) {
    Swal.fire({
      icon: "error",
      title: "Cuenta deshabilitada",
      text: "Tu cuenta está deshabilitada. Comunícate con el taller.",
      confirmButtonColor: "#c8102e"
    });
    return;
  }

  // Guardamos la sesión SIN la contraseña
  const { clave: _descartada, ...datosSesion } = encontrado;
  sessionStorage.setItem("sesion", JSON.stringify(datosSesion));

  Swal.fire({
    icon: "success",
    title: "¡Bienvenido, " + encontrado.nombre + "!",
    timer: 1200,
    showConfirmButton: false
  }).then(() => {
    location.href = encontrado.rol === "Administrador" ? "admin.html" : "mantenimientos.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  pintarMenu();

  const formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", manejarLogin);
  }
});