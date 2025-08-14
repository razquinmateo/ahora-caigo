export default class Model {
  constructor() {
    this.nombreJugador = "";
    this.rondaActual = 0;
    this.tiempoRestante = 30;
    this.timerInterval = null;
    this.preguntas = [];
    this.preguntasSeleccionadas = [];
    this.vidas = 3;
    this.maxRondas = 10;
    this.puntajeFinal = 0;
  }

  // getters
  get estado() {
    return {
      nombreJugador: this.nombreJugador,
      rondaActual: this.rondaActual,
      vidas: this.vidas,
      maxRondas: this.maxRondas,
      preguntaActual: this.preguntasSeleccionadas[this.rondaActual],
      tiempoRestante: this.tiempoRestante,
    };
  }

  // Lógica para cargar las preguntas del archivo JSON
  async cargarPreguntas() {
    try {
      const respuesta = await fetch("data/preguntas.json");
      const preguntasCargadas = await respuesta.json();
      const preguntasUnicas = preguntasCargadas.filter(
        (p, index, self) =>
          index ===
          self.findIndex(
            (q) => q.pista === p.pista && q.respuesta === p.respuesta
          )
      );
      const preguntasMezcladas = preguntasUnicas.sort(
        () => Math.random() - 0.5
      );
      this.preguntas = preguntasMezcladas;
      this.preguntasSeleccionadas = preguntasMezcladas.slice(0, this.maxRondas);
    } catch (error) {
      console.error("Error al cargar preguntas:", error);
      alert("No se pudieron cargar las preguntas.");
    }
  }

  iniciarTemporizador(callbackTick, callbackTimeout) {
    this.tiempoRestante = 30;
    callbackTick(this.tiempoRestante);
    this.timerInterval = setInterval(() => {
      this.tiempoRestante--;
      callbackTick(this.tiempoRestante);

      if (this.tiempoRestante <= 0) {
        this.detenerTemporizador();
        callbackTimeout();
      }
    }, 1000);
  }

  detenerTemporizador() {
    clearInterval(this.timerInterval);
  }

  reiniciarJuego() {
    this.cargarPreguntas();
    this.rondaActual = 0;
    this.vidas = 3;
    this.puntajeFinal = 0;
  }

  iniciarRonda() {
    if (this.rondaActual >= this.maxRondas) return;
    const pregunta = this.preguntasSeleccionadas[this.rondaActual];
    return pregunta;
  }

  verificarRespuesta(intento) {
    const respuestaCorrecta =
      this.preguntasSeleccionadas[this.rondaActual].respuesta;
    const intentoNormalizado = this.quitarTildes(intento).toUpperCase();
    const respuestaNormalizada =
      this.quitarTildes(respuestaCorrecta).toUpperCase();

    return intentoNormalizado === respuestaNormalizada;
  }

  quitarTildes(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // Método para obtener una pregunta distinta al fallar una ronda
  obtenerPreguntaDistinta() {
    const preguntaActual = this.preguntasSeleccionadas[this.rondaActual];
    const usadas = this.preguntasSeleccionadas.map(
      (p) => p.pista + p.respuesta
    );
    const candidatas = this.preguntas.filter(
      (p) =>
        p.pista !== preguntaActual.pista &&
        p.respuesta !== preguntaActual.respuesta &&
        !usadas.includes(p.pista + p.respuesta)
    );

    if (candidatas.length === 0) return preguntaActual;

    const nuevaPregunta =
      candidatas[Math.floor(Math.random() * candidatas.length)];
    this.preguntasSeleccionadas[this.rondaActual] = nuevaPregunta;

    return nuevaPregunta;
  }

  perderVida() {
    this.vidas--;
  }

  esUltimaRonda() {
    return this.rondaActual + 1 >= this.maxRondas;
  }

  siguienteRonda() {
    this.rondaActual++;
  }

  calcularPuntajeFinal() {
    this.puntajeFinal = 100 + this.vidas * 25;
    return this.puntajeFinal;
  }

  guardarEnRanking(nombre, puntaje) {
    let ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    const jugadorExistente = ranking.find((j) => j.nombre === nombre);

    if (jugadorExistente) {
      jugadorExistente.puntaje += puntaje;
    } else {
      ranking.push({ nombre: nombre, puntaje: puntaje });
    }

    ranking.sort((a, b) => b.puntaje - a.puntaje);
    localStorage.setItem("ranking", JSON.stringify(ranking));
  }

  obtenerRanking() {
    return JSON.parse(localStorage.getItem("ranking")) || [];
  }

  // Gestión del jugador
  establecerNombreJugador(nombre) {
    this.nombreJugador = nombre;
    localStorage.setItem("nombreJugador", nombre);
  }

  obtenerNombreJugador() {
    return localStorage.getItem("nombreJugador");
  }

  limpiarNombreJugador() {
    this.nombreJugador = "";
    localStorage.removeItem("nombreJugador");
  }
}
