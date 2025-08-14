# Ahora Caigo - Minijuego Web

¡Bienvenido a **Ahora Caigo**!  
Este es un minijuego web de preguntas y respuestas inspirado en el famoso programa de TV. Pon a prueba tus conocimientos, supera rondas, suma puntos y compite en el ranking.

## Características

- Juego de preguntas y respuestas con pistas.
- Temporizador de 30 segundos por ronda.
- 3 vidas por partida.
- 10 rondas por juego.
- Puntaje final: 100 puntos + 25 por cada vida restante.
- Ranking de puntajes persistente (localStorage).
- Modal de ranking con los mejores jugadores.
- Responsive y visualmente atractivo (Bootstrap 5).

## Instalación y uso

1. **Clona o descarga** este repositorio.
2. **Abre `index.html` en tu navegador**.  
    No requiere servidor, funciona localmente.
   ▶ Tambien puedes acceder desde: razquinmateo.github.io/ahora-caigo-web

## Estructura del proyecto

```
ahora-caigo/
│
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── main.js
│   ├── model.js
│   ├── view.js
│   └── controller.js
├── data/
│   └── preguntas.json
├── assets/
│   └── favicon.png
```

## Cómo jugar

1. Ingresa tu nombre y haz clic en **Iniciar juego**.
2. Haz clic en **Iniciar ronda** para comenzar.
3. Lee la pista, escribe la respuesta y presiona Enter.
4. Si aciertas, avanzas de ronda. Si fallas o se acaba el tiempo, pierdes una vida.
5. Completa las 10 rondas para sumar puntos y aparecer en el ranking.
6. Haz clic en el botón 👑 del footer para ver el ranking de puntajes.

## Tecnologías utilizadas

- HTML5, CSS3 (con Bootstrap 5)
- JavaScript (ES6 Modules)
- SweetAlert2 para mensajes y alertas
- LocalStorage para persistencia de ranking

## Personalización

- Puedes agregar o editar preguntas en `data/preguntas.json`.
- El ranking se almacena en el navegador (localStorage).

## Implementaciónes a futuro / Próximas funcionalidades

- **Niveles de dificultad:** preguntas fáciles, medias y difíciles.
- **Comodines:** pistas extra, eliminar opciones, saltar pregunta, etc.
- **Preguntas multimedia:** incluir imágenes o audios como pistas.
- **Más estadísticas:** historial de partidas, logros y progresos.
- **Adaptado a moviles:** diseño responsive mejor adaptado a pantallas moviles.

## Créditos

Desarrollado por Mateo Razquin.  
Inspirado en el programa "Ahora Caigo".

---

¡Diviértete!
