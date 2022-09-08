const canvas = document.querySelector("#game");
const game = canvas.getContext("2d");

const texto = document.querySelector("#texto");
const time = document.querySelector("#time");
const recordParrafo = document.querySelector("#record-p");
const btnReset  =document.querySelector('#reset')

window.addEventListener("keyup", moveByKeys);

window.addEventListener("load", setCamvasSize);
window.addEventListener("resize", setCamvasSize);

btnReset.addEventListener('click',reset)

let canvasSize;
let elementSize;
const playerPosition = [];
const giftPosition = [];
const enemiesPositions = [];
const winPosition = [];
let flag;
let level = 0;
let live = 3;

let timeStart;
let timeplayer = "";
let timeInterval;

const records = [];
let ordenado;

function showTime() {
  timeplayer = ((Date.now() - timeStart) / 1000).toFixed(0);
  time.innerHTML = timeplayer;
}

/**GAME START */

function startGame() {
  texto.innerHTML = `Tienes <strong>${emojis["HEARTS"].repeat(
    live
  )}</strong> vidas`;

  game.clearRect(0, 0, canvasSize, canvasSize);

  let map = maps[level];

  /**Evaluar si ya no hay mas arrays*/
  if (!map) {
    gameWin();
    return;
  }

  if (!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(showTime, 100);
    recordParrafo.innerHTML = `Tu record es: ${consultaDatos()}`;
    //
  }

  game.font = elementSize + "px Verdana";
  game.texAlign = "end";
  //generamos las filas  primero eliminando los espacios en blanco y luego encontrando los saltos de linea
  const mapRows = map.trim().split("\n");
  const mapRowCol = mapRows.map((row) => row.trim().split(""));

  mapRowCol.forEach((row, rowI) => {
    row.forEach((col, colI) => {
      const emoji = emojis[col];
      const posX = elementSize * colI;
      const posY = elementSize * (rowI + 1);
      game.fillText(emoji, posX, posY);

      if (col == "O") {
        if (!playerPosition.x && !playerPosition.y) {
          playerPosition.x = posX;
          playerPosition.y = posY;
        }
      } else if (col == "I") {
        giftPosition.x = posX;
        giftPosition.y = posY;
      } else if (col == "X" && flag) {
        enemiesPositions.push({
          x: posX,
          y: posY,
        });
      }
    });
  });
  flag = false;
  movePlayer();

  // for(let row = 1; row<=10; row++){
  //     // game.fillText(emojis['X'],elementSize *i,elementSize)

  //     for(let col = 0; col <=10; col++){
  //         game.fillText(emojis[mapRowCol[row-1][col]],
  //         elementSize * col, elementSize * row)
  //     }
  // }
}

function movePlayer() {
  const giftCollisionX =
    playerPosition.x.toFixed(0) == giftPosition.x.toFixed(0);
  const giftCollisionY =
    playerPosition.y.toFixed(0) == giftPosition.y.toFixed(0);
  const giftCollision = giftCollisionX && giftCollisionY;

  if (giftCollision) {
    levelUp();
  }
    /**
   * collision con el enémigo
   */

  const enemiCollision = enemiesPositions.find((el) => {
    const eneX = el.x == playerPosition.x;
    const eneY = el.y == playerPosition.y;
    // Si ambos son verdadaderos devuleve verdad
    return eneX && eneY;
  });

  if (enemiCollision) {

    const firePositions  = enemiesPositions

    game.clearRect(0, 0, canvasSize, canvasSize);

    firePositions.forEach((row,index)=>{

      game.fillText(emojis['BOMB_COLLISION'],row.x,row.y)
    })

    setTimeout(drawFire,300)
  }

  game.fillText(emojis["PLAYER"], playerPosition.x, playerPosition.y);
}

function drawFire(){
    console.log('fire');
    death();
}

function setCamvasSize() {
  flag = true;
  canvasSize =
    window.innerWidth > window.innerHeight
      ? window.innerHeight * 0.8
      : window.innerWidth * 0.8;

  canvas.setAttribute("width", canvasSize);
  canvas.setAttribute("height", canvasSize);

  elementSize = canvasSize / 10;

  startGame();
}

function moveByKeys(el) {
  /**Movimiento con teclado */
  switch (el.key) {
    case "ArrowUp":
      block("y", "-");
      break;
    case "ArrowDown":
      block("y", "+");
      break;
    case "ArrowLeft":
      block("x", "-");
      break;
    case "ArrowRight":
      block("x", "+");
      break;
  }
}

function block(pos, dir) {
  switch (dir) {
    case "+":
      playerPosition[pos] += elementSize;
      //   if (playerPosition.y > canvasSize+elementSize || playerPosition.x > canvasSize) {
      //     undefined;
      //   } else {
      //   }
      break;
    case "-":
      if (playerPosition.y < elementSize || playerPosition.x < 0) {
        undefined;
      } else {
        playerPosition[pos] -= elementSize;
      }
      break;
  }

  startGame();
}

function levelUp() {
  level += 1;
  flag = true;
  enemiesPositions.splice(0, enemiesPositions.length);
  startGame();
}
function death() {
  live--;
  if (live <= 0) {
    live = 3;
    level = 0;
    timeStart = undefined;
  }
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  enemiesPositions.splice(0, enemiesPositions.length);
  flag = true;

  startGame();
}

function gameWin() {
  clearInterval(timeInterval);
  enemiesPositions.splice(0, enemiesPositions.length);
  endGame();
}

function endGame() {
  flag = true;
  game.fillStyle = 'green'
  game.fillRect(0,0,canvasSize,canvasSize)
  game.fillStyle = 'white'
  game.font = '50px serif';
  game.fillText('Fin del juego', canvasSize/4,canvasSize/4);

  setLocalStorage()
}

function consultaDatos() {
  //Primero generamos un Array dendro de localStorage

  if (!JSON.parse(localStorage.getItem("records"))) {
    localStorage.setItem("records", JSON.stringify([]));
  }

  //Conultamos la información y la guardamos en una variable
  const record = JSON.parse(localStorage.getItem("records"));
  /**
   * Encontrar el elemento mas pequeño dentro del array
   */
  ordenado = record
    .map((el) => parseInt(el))
    .sort()
    .slice(0, 1);

  return ordenado;
}

function setLocalStorage(){

  //Conultamos la información y la guardamos en una variable
  const record = JSON.parse(localStorage.getItem("records"));

  //Podemos agregar elementos al array extraido
  record.push(timeplayer);

  console.log('record',record);

  //Agregamos el array ya modificado a localStorage
  localStorage.setItem("records", JSON.stringify(record));

  /**
   * Encontrar el elemento mas pequeño dentro del array
   */

  ordenado = record
    .map((el) => parseInt(el))
    .sort()
    .slice(0, 1);

}


function reset(){
  clearInterval(timeInterval)
    live = 3;
    level = 0;
    timeStart = undefined;
  playerPosition.x = undefined;
  playerPosition.y = undefined;
  enemiesPositions.splice(0, enemiesPositions.length);
  flag = true;  
  startGame();
}