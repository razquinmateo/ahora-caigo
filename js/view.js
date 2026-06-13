export default class View {
  constructor() {
    // Elementos del DOM
    this.pantallaInicial = document.getElementById("pantalla-inicial");
    this.pantallaJuego = document.getElementById("pantalla-juego");
    this.inputNombre = document.getElementById("nombre-jugador");
    this.mejorPuntajeContainer = document.getElementById(
      "mejor-puntaje-container"
    );
    this.mejorPuntajeTexto = document.getElementById("mejor-puntaje");
    this.btnIniciarJuego = document.getElementById("btn-iniciar-juego");
    this.nombreMostrado = document.getElementById("nombre-mostrado");
    this.contenedorPista = document.getElementById("pista-texto");
    this.casillasRespuesta = document.getElementById("casillas-respuesta");
    this.temporizador = document.getElementById("temporizador");
    this.btnIniciarRonda = document.getElementById("btn-iniciar-ronda");
    this.inputRespuesta = document.getElementById("input-respuesta");
    this.descripcionCuriosidad = document.getElementById(
      "descripcion-curiosidad"
    );
    this.mensajeCorrecto = document.getElementById("mensaje-correcto");
    this.vidasContainer = document.getElementById("vidas");
    this.rondaActualTexto = document.getElementById("ronda-actual");
    this.puntajeActualTexto = document.getElementById("puntaje-actual");
    this.btnCambiarJugador = document.getElementById("btn-cambiar-jugador");
    this.btnReintentarRonda = document.getElementById("btn-reintentar-ronda");
    this.contenedorPistaBorde = document.getElementById("contenedor-pista");
    this.btnRanking = document.getElementById("btn-ranking");
    this.btnSonido = document.getElementById("btn-sonido");
    this.iconoSonido = document.getElementById("icono-sonido");
// Inicializar Audios
this.audioFondo = new Audio("assets/audio/musica-fondo.mp3");
this.audioFondo.loop = true;
this.audioAlerta = new Audio("assets/audio/alerta-tiempo.mp3");
this.audioAlerta.loop = true;
this.audioAcierto = new Audio("assets/audio/acierto.mp3");
this.audioError = new Audio("assets/audio/error.mp3");

    // Estilos iniciales
    this.btnReintentarRonda.classList.add("btn-mismo-tamano");
    this.btnIniciarRonda.classList.add("btn-mismo-tamano");
  }

  // Métodos para renderizar el estado del juego
  mostrarPantallaInicial() {
    this.pantallaJuego.classList.add("d-none");
    this.pantallaJuego.classList.remove("fade-in");
    this.pantallaInicial.classList.remove("d-none");
    this.pantallaInicial.classList.add("fade-in");
  }

  mostrarPantallaJuego() {
    this.pantallaInicial.classList.add("d-none");
    this.pantallaInicial.classList.remove("fade-out");
    this.pantallaJuego.classList.remove("d-none");
    this.pantallaJuego.classList.add("fade-in");
  }

  actualizarNombreJugador(nombre) {
    this.nombreMostrado.textContent = nombre;
  }

  mostrarMejorPuntaje(puntaje) {
    if (puntaje > 0) {
      this.mejorPuntajeTexto.textContent = puntaje;
      this.mejorPuntajeContainer.classList.remove("d-none");
    } else {
      this.mejorPuntajeContainer.classList.add("d-none");
    }
  }

  actualizarVidas(vidas) {
    const corazones = "❤️".repeat(vidas) + "🤍".repeat(3 - vidas);
    this.vidasContainer.textContent = corazones;
  }

  actualizarRonda(ronda, maxRondas) {
    this.rondaActualTexto.textContent = `Ronda: ${ronda + 1} / ${maxRondas}`;
  }

  actualizarPuntaje(puntos) {
    this.puntajeActualTexto.textContent = `Puntos: ${puntos}`;
  }

  mostrarIncrementoPuntaje(puntos) {
    const rect = this.puntajeActualTexto.getBoundingClientRect();
    const incremento = document.createElement("div");
    incremento.classList.add("puntaje-incremento");
    incremento.textContent = `+${puntos}`;
    incremento.style.left = `${rect.left + rect.width / 2}px`;
    incremento.style.top = `${rect.top - 20}px`;

    document.body.appendChild(incremento);

    setTimeout(() => incremento.remove(), 1500);
  }

  actualizarTemporizador(tiempo) {
    this.temporizador.textContent = tiempo;

    if (tiempo <= 10) {
      this.temporizador.classList.add("timer-critico");
    } else {
      this.temporizador.classList.remove("timer-critico");
    }

    if (tiempo > 0 && !this.inputRespuesta.disabled && tiempo <= 5) {
      this.contenedorPistaBorde.classList.add("borde-parpadeante");
    } else {
      this.contenedorPistaBorde.classList.remove("borde-parpadeante");
    }
  }

  mostrarPista(pista) {
    this.contenedorPista.textContent = pista;
  }

  // Genera las casillas de la respuesta
  generarCasillas(respuesta, posicionesPista) {
    this.casillasRespuesta.innerHTML = "";
    const palabras = respuesta.toUpperCase().split(" ");

    palabras.forEach((palabra, indexPalabra) => {
      if (indexPalabra > 0) {
        const espacio = document.createElement("div");
        espacio.classList.add("casilla-espacio");
        this.casillasRespuesta.appendChild(espacio);
      }

      for (let i = 0; i < palabra.length; i++) {
        const letra = palabra[i];
        const casilla = document.createElement("div");
        casilla.classList.add("casilla");
        casilla.textContent = posicionesPista[indexPalabra]?.includes(i)
          ? letra
          : "";
        if (posicionesPista[indexPalabra]?.includes(i)) {
          casilla.classList.add("letra-pista");
        }
        this.casillasRespuesta.appendChild(casilla);
      }
    });
  }

  mostrarRespuestaCorrecta(esCorrecta, respuesta) {
    const casillas = this.casillasRespuesta.querySelectorAll(".casilla");
    const respuestaSinEspacios = respuesta.toUpperCase().replace(/ /g, "");

    casillas.forEach((casilla, index) => {
      const letra = respuestaSinEspacios[index] || "";
      casilla.textContent = letra;
      if (esCorrecta) {
        casilla.classList.add("correcta");
      }
    });

    this.mensajeCorrecto.textContent = esCorrecta
      ? "✅ ¡Correcto!"
      : "⏱️ Tiempo agotado";
    this.mensajeCorrecto.style.display = "block";
  }

  mostrarMensajeIncorrecto() {
    this.efectoShake();
    this.inputRespuesta.value = "";
  }

  efectoShake() {
    this.inputRespuesta.classList.add("shake");
    setTimeout(() => {
      this.inputRespuesta.classList.remove("shake");
    }, 500);
  }

  mostrarMensajeVictoria(nombreJugador, puntajeFinal) {
    // Remueve cualquier mensaje previo
    const mensajeExistente = document.getElementById("mensaje-final");
    if (mensajeExistente) mensajeExistente.remove();

    const mensajeFinal = document.createElement("div");
    mensajeFinal.id = "mensaje-final";
    mensajeFinal.classList.add("alert", "alert-success", "text-center");
    mensajeFinal.innerHTML = `
      🎉 <strong>¡Felicidades, ${nombreJugador}!</strong> <br>
      Has completado las 10 rondas con éxito.<br>
      Tu puntaje final es: <strong>${puntajeFinal}</strong> 🎓
      <br><br>
      <button id="btn-reiniciar" class="btn btn-success mt-2">Reiniciar partida</button>
  `;

    this.contenedorPistaBorde.parentNode.insertBefore(
      mensajeFinal,
      this.contenedorPistaBorde
    );
  }

  mostrarMensajeDerrota() {
    Swal.fire({
      icon: "error",
      title: "¡Juego terminado!",
      text: `Perdiste tus 3 vidas. 😢`,
      confirmButtonText: "Reiniciar",
    }).then(() => {
      this.reiniciarJuegoVisual();
    });
  }

  // Métodos para cambiar estados visuales
  deshabilitarInputs(disabled) {
    this.inputRespuesta.disabled = disabled;
  }

  deshabilitarBotonRonda(disabled) {
    this.btnIniciarRonda.disabled = disabled;
  }

  reiniciarJuegoVisual() {
    const mensajeFinal = document.getElementById("mensaje-final");
    if (mensajeFinal) mensajeFinal.remove();
    this.descripcionCuriosidad.style.display = "none";
    this.mensajeCorrecto.style.display = "none";
    this.inputRespuesta.value = "";
    this.inputRespuesta.disabled = true;
    this.btnIniciarRonda.textContent = "Iniciar ronda";
    this.btnIniciarRonda.disabled = false;
    this.btnIniciarRonda.classList.remove("animated");
    this.contenedorPista.textContent = "";
    this.contenedorPistaBorde.classList.remove("borde-parpadeante");
    this.casillasRespuesta.innerHTML = "";
    this.temporizador.textContent = "30";
    this.temporizador.classList.remove("timer-critico");
    this.btnReintentarRonda.classList.add("d-none");
  }

  toggleReintentar(mostrar) {
    this.btnReintentarRonda.classList.toggle("d-none", !mostrar);
  }

  mostrarCuriosidad(texto) {
    this.descripcionCuriosidad.textContent = texto;
    this.descripcionCuriosidad.style.display = "block";
  }

  cambiarBotonRonda(texto, animated = false) {
    this.btnIniciarRonda.textContent = texto;
    this.btnIniciarRonda.classList.toggle("animated", animated);
  }

  mostrarTablaRanking(ranking) {
    const tabla = document.getElementById("tabla-ranking");
    if (!tabla) return;
    tabla.innerHTML = ranking
      .map(
        (jugador) =>
          `<tr><td>${jugador.nombre}</td><td>${jugador.puntaje}</td></tr>`
      )
      .join("");

    const modal = new bootstrap.Modal(document.getElementById("rankingModal"));
    modal.show();
  }

  // Gestión de Audio
  actualizarIconoSonido(activado) {
    this.iconoSonido.className = activado ? "fas fa-volume-up" : "fas fa-volume-mute";
    if (!activado) {
      this.detenerTodoElAudio();
    }
  }

  reproducirMusicaFondo(activado) {
    if (!activado) return;
    this.audioFondo.volume = 0.5;
    this.audioFondo.play().catch(e => console.log("Autoplay bloqueado hasta interacción"));
  }

  setEstadoCriticoAudio(esCritico, activado) {
    if (!activado) return;
    if (esCritico) {
      // Efecto de desvanecimiento de música de fondo
      let vol = 0.5;
      const interval = setInterval(() => {
        vol -= 0.05;
        if (vol <= 0.1) {
          vol = 0.1;
          clearInterval(interval);
        }
        this.audioFondo.volume = vol;
      }, 100);
      
      this.audioAlerta.currentTime = 0;
      this.audioAlerta.play().catch(() => {});
    } else {
      this.audioFondo.volume = 0.5;
      this.audioAlerta.pause();
      this.audioAlerta.currentTime = 0;
    }
  }

  reproducirFeedback(tipo, activado) {
    if (!activado) return;
    
    // Detener y resetear ambos sonidos para evitar solapamientos
    this.audioAcierto.pause();
    this.audioAcierto.currentTime = 0;
    this.audioError.pause();
    this.audioError.currentTime = 0;

    if (tipo === "acierto") {
      this.audioAcierto.play().catch((e) => console.error("Error reproduciendo acierto:", e));
    } else {
      this.audioError.play().catch((e) => console.error("Error reproduciendo error:", e));
    }
  }

  detenerTodoElAudio() {
    [this.audioFondo, this.audioAlerta].forEach(a => {
      a.pause();
      a.currentTime = 0;
    });
  }

  bindToggleSonido(handler) {
    this.btnSonido.addEventListener("click", handler);
  }

  bindIniciarJuego(handler) {
    this.btnIniciarJuego.addEventListener("click", () =>
      handler(this.inputNombre.value)
    );
  }

  bindCambiarJugador(handler) {
    this.btnCambiarJugador.addEventListener("click", handler);
  }

  bindIniciarRonda(handler) {
    this.btnIniciarRonda.addEventListener("click", handler);
  }

  bindReintentarRonda(handler) {
    this.btnReintentarRonda.addEventListener("click", handler);
  }

  bindReiniciarPartida(handler) {
    const btnReiniciar = document.getElementById("btn-reiniciar-partida");
    if (btnReiniciar) btnReiniciar.addEventListener("click", handler);
    // Evento para el botón de reiniciar del modal de victoria
    const body = document.querySelector("body");
    body.addEventListener("click", (e) => {
      if (e.target.id === "btn-reiniciar") {
        handler();
      }
    });
  }

  bindEnviarRespuesta(handler) {
    this.inputRespuesta.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handler(this.inputRespuesta.value);
      }
    });
  }

  bindMostrarRanking(handler) {
    this.btnRanking.addEventListener("click", handler);
  }
}
