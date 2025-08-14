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

    const nombreGuardado = this.model.obtenerNombreJugador();
    if (nombreGuardado) {
      this.model.establecerNombreJugador(nombreGuardado);
      this.view.actualizarNombreJugador(nombreGuardado);
      this.view.mostrarPantallaJuego();
    }

    this.bindEvents();
  }

  bindEvents() {
    this.view.bindIniciarJuego(this.handleIniciarJuego.bind(this));
    this.view.bindCambiarJugador(this.handleCambiarJugador.bind(this));
    this.view.bindIniciarRonda(this.handleIniciarRonda.bind(this));
    this.view.bindReintentarRonda(this.handleReintentarRonda.bind(this));
    this.view.bindReiniciarPartida(this.handleReiniciarPartida.bind(this));
    this.view.bindEnviarRespuesta(this.handleEnviarRespuesta.bind(this));
    this.view.bindMostrarRanking(this.handleMostrarRanking.bind(this));
  }

  // Manejadores de eventos (event handlers)
  handleIniciarJuego(nombre) {
    if (nombre === "") {
      Swal.fire({
        icon: "warning",
        title: "Nombre requerido",
        text: "Por favor, ingresa un nombre para comenzar el juego.",
        confirmButtonText: "Entendido",
      });
      return;
    }
    this.model.establecerNombreJugador(nombre);
    this.view.actualizarNombreJugador(nombre);
    this.view.mostrarPantallaJuego();
  }

  handleCambiarJugador() {
    this.model.limpiarNombreJugador();
    this.model.reiniciarJuego();
    this.view.reiniciarJuegoVisual();
    this.view.mostrarPantallaInicial();
  }

  handleIniciarRonda() {
    this.view.reiniciarJuegoVisual();
    this.view.deshabilitarInputs(false);
    this.view.inputRespuesta.focus();

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
    const posicionesPista = this.generarPosicionesPista(palabras);
    this.view.generarCasillas(respuesta, posicionesPista);

    this.model.iniciarTemporizador(
      (tiempo) => this.view.actualizarTemporizador(tiempo),
      () => this.handleTiempoAgotado()
    );
  }

  handleReintentarRonda() {
    this.model.obtenerPreguntaDistinta();
    this.view.toggleReintentar(false);
    this.handleIniciarRonda();
  }

  handleTiempoAgotado() {
    this.view.deshabilitarInputs(true);
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
    if (intento.trim() === "") return;

    if (this.model.verificarRespuesta(intento)) {
      this.model.detenerTemporizador();
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
  }

  handleMostrarRanking() {
    const ranking = this.model.obtenerRanking();
    this.view.mostrarTablaRanking(ranking);
  }

  generarPosicionesPista(palabras) {
    const posicionesPista = {};

    palabras.forEach((palabra, indexPalabra) => {
      let pistasPorPalabra = 0;
      const len = palabra.length;

      if (len === 3) pistasPorPalabra = 1;
      else if (len >= 4 && len <= 6) pistasPorPalabra = 2;
      else if (len >= 7 && len <= 10) pistasPorPalabra = 3;
      else if (len > 10) pistasPorPalabra = 4;

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
    const confetiContainer = document.createElement("div");
    confetiContainer.id = "confeti-container";
    document.body.appendChild(confetiContainer);

    const colores = ["#ff0", "#f00", "#0f0", "#00f", "#f0f", "#0ff", "#fff"];
    const numPiezas = 100;

    for (let i = 0; i < numPiezas; i++) {
      const confeti = document.createElement("div");
      confeti.classList.add("confeti");
      confeti.style.backgroundColor =
        colores[Math.floor(Math.random() * colores.length)];
      confeti.style.left = Math.random() * 100 + "vw";
      confeti.style.width = 5 + Math.random() * 10 + "px";
      confeti.style.height = 5 + Math.random() * 10 + "px";
      confeti.style.opacity = 0.5 + Math.random() * 0.5; // mantén esta
      confeti.style.animationDuration = 3 + Math.random() * 3 + "s";
      confetiContainer.appendChild(confeti);
    }

    setTimeout(() => confetiContainer.remove(), 8000);
  }
}
