import Model from "./model.js";
import View from "./view.js";

export default class Controller {
  constructor() {
    this.model = new Model();
    this.view = new View();

    this.init();
  }

  async init() {
    await this.model.cargarPreguntas();
    this.view.actualizarVidas(this.model.estado.vidas);
    this.view.actualizarRonda(
      this.model.estado.rondaActual,
      this.model.estado.maxRondas
    );
    this.view.actualizarPuntaje(this.model.estado.puntajeTotal);
    this.view.mostrarMejorPuntaje(this.model.obtenerMejorPuntaje());
    this.view.actualizarIconoSonido(this.model.sonidoActivado);

    const nombreGuardado = this.model.obtenerNombreJugador();
    if (nombreGuardado) {
      this.model.establecerNombreJugador(nombreGuardado);
      this.view.actualizarNombreJugador(nombreGuardado);
      this.view.mostrarPantallaJuego();
    }

    this.bindEvents();
    this.posicionesPistaActuales = {};
    this.esperandoRespuesta = false;
  }

  bindEvents() {
    this.view.bindIniciarJuego(this.handleIniciarJuego.bind(this));
    this.view.bindCambiarJugador(this.handleCambiarJugador.bind(this));
    this.view.bindIniciarRonda(this.handleIniciarRonda.bind(this));
    this.view.bindReintentarRonda(this.handleReintentarRonda.bind(this));
    this.view.bindReiniciarPartida(this.handleReiniciarPartida.bind(this));
    this.view.bindEnviarRespuesta(this.handleEnviarRespuesta.bind(this));
    this.view.bindMostrarRanking(this.handleMostrarRanking.bind(this));
    this.view.bindToggleSonido(this.handleToggleSonido.bind(this));
  }

  handleIniciarJuego(nombre) {
    const nombreLimpio = nombre.trim();
    if (nombreLimpio === "") {
      Swal.fire({
        icon: "warning",
        title: "Nombre requerido",
        text: "Por favor, ingresa un nombre para comenzar el juego.",
        confirmButtonText: "Entendido",
      });
      return;
    }
    if (nombreLimpio.length > 15) {
      Swal.fire({
        icon: "warning",
        title: "Nombre demasiado largo",
        text: "Por favor, usa un nombre de máximo 15 caracteres.",
        confirmButtonText: "Entendido",
      });
      return;
    }
    this.model.establecerNombreJugador(nombreLimpio);
    this.view.actualizarNombreJugador(nombreLimpio);
    this.view.mostrarPantallaJuego();
    this.view.reproducirMusicaFondo(this.model.sonidoActivado);
  }

  handleCambiarJugador() {
    this.model.limpiarNombreJugador();
    this.model.reiniciarJuego();
    this.view.reiniciarJuegoVisual();
    this.view.mostrarPantallaInicial();
    this.view.detenerTodoElAudio();
  }

  handleIniciarRonda() {
    this.view.reiniciarJuegoVisual();
    this.view.setEstadoCriticoAudio(false, this.model.sonidoActivado);
    this.view.deshabilitarInputs(false);
    this.view.inputRespuesta.focus();
    this.esperandoRespuesta = true;

    this.view.deshabilitarBotonRonda(true);

    const pregunta = this.model.iniciarRonda();
    if (!pregunta) return;

    this.view.mostrarPista(pregunta.pista);
    this.view.actualizarRonda(
      this.model.estado.rondaActual,
      this.model.estado.maxRondas
    );

    const respuesta = pregunta.respuesta.toUpperCase();
    const palabras = respuesta.split(" ");
    this.posicionesPistaActuales = this.generarPosicionesPista(palabras);
    this.view.generarCasillas(respuesta, this.posicionesPistaActuales);

    this.model.iniciarTemporizador(
      (tiempo) => {
        this.view.actualizarTemporizador(tiempo);
        if (tiempo === 20 || tiempo === 10) {
          this.revelarLetraExtra(palabras);
          this.view.generarCasillas(respuesta, this.posicionesPistaActuales);
        }
        if (tiempo === 10) {
          this.view.setEstadoCriticoAudio(true, this.model.sonidoActivado);
        }
      },
      () => this.handleTiempoAgotado()
    );
    
    // Asegurar que la música de fondo esté sonando si el usuario ya interactuó
    this.view.reproducirMusicaFondo(this.model.sonidoActivado);
  }
revelarLetraExtra(palabras) {
  palabras.forEach((palabra, indexPalabra) => {
    const len = palabra.length;
    if (len <= 4) return; // No dar pistas extra automáticas a palabras cortas

    if (!this.posicionesPistaActuales[indexPalabra]) {
      this.posicionesPistaActuales[indexPalabra] = [];
    }

    const posicionesOcultas = [];
    for (let i = 0; i < len; i++) {
      if (!this.posicionesPistaActuales[indexPalabra].includes(i)) {
        posicionesOcultas.push(i);
      }
    }

    // Solo revela una letra si quedan más de 2 letras ocultas
    // Así evitamos regalar la palabra completa por tiempo
    if (posicionesOcultas.length > 2) {
      const randomIndex = Math.floor(Math.random() * posicionesOcultas.length);
      this.posicionesPistaActuales[indexPalabra].push(
        posicionesOcultas[randomIndex]
      );
    }
  });
}

  handleReintentarRonda() {
    this.model.obtenerPreguntaDistinta();
    this.view.toggleReintentar(false);
    this.handleIniciarRonda();
  }

  handleTiempoAgotado() {
    if (!this.esperandoRespuesta) return;
    this.esperandoRespuesta = false;
    
    this.view.deshabilitarInputs(true);
    this.view.setEstadoCriticoAudio(false, this.model.sonidoActivado);
    this.view.reproducirFeedback("error", this.model.sonidoActivado);
    this.view.mostrarRespuestaCorrecta(
      false,
      this.model.estado.preguntaActual.respuesta
    );
    this.view.mostrarCuriosidad("No lograste responder a tiempo.");

    this.view.cambiarBotonRonda("Iniciar ronda", false);
    this.view.btnIniciarRonda.disabled = true;
    this.view.toggleReintentar(true);

    this.model.perderVida();
    this.view.actualizarVidas(this.model.estado.vidas);

    if (this.model.estado.vidas <= 0) {
      this.view.mostrarMensajeDerrota();
      this.view.toggleReintentar(false);
    }
  }

  handleEnviarRespuesta(intento) {
    const intentoLimpio = intento.trim();
    if (intentoLimpio === "" || !this.esperandoRespuesta) return;

    if (this.model.verificarRespuesta(intentoLimpio)) {
      this.esperandoRespuesta = false;
      this.model.detenerTemporizador();
      this.view.setEstadoCriticoAudio(false, this.model.sonidoActivado);
      this.view.reproducirFeedback("acierto", this.model.sonidoActivado);

      // Calcular puntos de la ronda: 100 base + tiempo restante * 5
      const puntosRonda = 100 + this.model.estado.tiempoRestante * 5;
      this.model.sumarPuntos(puntosRonda);
      this.view.actualizarPuntaje(this.model.estado.puntajeTotal);
      this.view.mostrarIncrementoPuntaje(puntosRonda);

      this.view.deshabilitarInputs(true);
      this.view.mostrarRespuestaCorrecta(
        true,
        this.model.estado.preguntaActual.respuesta
      );
      this.view.mostrarCuriosidad(this.model.estado.preguntaActual.descripcion);

      if (this.model.esUltimaRonda()) {
        const puntajeFinal = this.model.calcularPuntajeFinal();
        this.model.guardarEnRanking(
          this.model.estado.nombreJugador,
          puntajeFinal
        );
        this.view.mostrarMensajeVictoria(
          this.model.estado.nombreJugador,
          puntajeFinal
        );

        this.mostrarConfeti();
      } else {
        this.model.siguienteRonda();
        this.view.cambiarBotonRonda("Siguiente ronda", true);
        this.view.deshabilitarBotonRonda(false);
      }
    } else {
      this.view.mostrarMensajeIncorrecto();
      this.view.reproducirFeedback("error", this.model.sonidoActivado);
    }
  }

  handleReiniciarPartida() {
    this.model.reiniciarJuego();
    this.view.reiniciarJuegoVisual();
    this.view.actualizarVidas(this.model.estado.vidas);
    this.view.actualizarRonda(
      this.model.estado.rondaActual,
      this.model.estado.maxRondas
    );
    this.view.actualizarPuntaje(this.model.estado.puntajeTotal);
    this.view.detenerTodoElAudio();
    this.view.reproducirMusicaFondo(this.model.sonidoActivado);
  }

  handleMostrarRanking() {
    const ranking = this.model.obtenerRanking();
    this.view.mostrarTablaRanking(ranking);
  }

  handleToggleSonido() {
    const activado = this.model.toggleSonido();
    this.view.actualizarIconoSonido(activado);
    if (activado && this.model.nombreJugador) {
      this.view.reproducirMusicaFondo(true);
    } else {
      this.view.detenerTodoElAudio();
    }
  }

  generarPosicionesPista(palabras) {
    const posicionesPista = {};

    palabras.forEach((palabra, indexPalabra) => {
      let pistasPorPalabra = 0;
      const len = palabra.length;

      // Nueva lógica más conservadora
      if (len <= 3) pistasPorPalabra = 0; // Sin pistas para palabras muy cortas
      else if (len >= 4 && len <= 5) pistasPorPalabra = 1;
      else if (len >= 6 && len <= 8) pistasPorPalabra = 2;
      else if (len >= 9 && len <= 11) pistasPorPalabra = 3;
      else if (len > 11) pistasPorPalabra = 4;

      if (pistasPorPalabra > 0) {
        posicionesPista[indexPalabra] = [];
        const posicionesEnPalabra = new Set();
        while (posicionesEnPalabra.size < pistasPorPalabra) {
          const posEnPalabra = Math.floor(Math.random() * palabra.length);
          if (!posicionesEnPalabra.has(posEnPalabra)) {
            posicionesEnPalabra.add(posEnPalabra);
            posicionesPista[indexPalabra].push(posEnPalabra);
          }
        }
      }
    });

    return posicionesPista;
  }

  mostrarConfeti() {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }
}
