import * as foo from "./test.ts";

const gameDiv = document.querySelector("#gameContainer");
const plants: any[][] = [[], [], []];
for (let j = 0; j < 3; j++) {
  for (let i = 0; i < 3; i++) {
    const div = document.createElement("div");
    div.id = `cell-${i}-${j}`;
    div.style.width = "100px";
    div.style.height = "100px";
    div.style.backgroundColor = "grey";
    div.style.display = "flex";
    div.style.border = "1px solid black";
    const sun = document.createElement("img");
    sun.src = "./assets/sun.png";
    sun.style.width = "25px";
    sun.style.height = "25px";
    const water = document.createElement("img");
    water.src = "./assets/water.png";
    water.style.width = "25px";
    water.style.height = "25px";
    plants[i][j] = { sun: 1, water: 1, level: 1 };
    const plant = document.createElement("img");
    plant.src = "./assets/level1.png";
    plant.style.width = "25px";
    plant.style.height = "25px";
    plant.id = `plant-${i}-${j}`;
    div.appendChild(plant);
    div.appendChild(sun);
    div.appendChild(water);
    gameDiv!.appendChild(div);
  }
}

const player = document.createElement("img");
player.setAttribute("src", "./assets/player.png");
player.style.width = "25px";
player.style.height = "30px";
document.querySelector("#cell-1-1")!.appendChild(player);

const game = new foo.Game(3, 3, { x: 1, y: 1 });

game.initializeGame();

const goalText = document.createElement("div");
goalText.innerText = `${game.player.getCollectedPlants()}/10 plants collected`;
gameDiv?.appendChild(goalText);

const inGameTime = document.createElement("div");
let inGameDate = new Date(2023, 0, 1, 0, 0, 0);
inGameTime.innerText = inGameDate.toLocaleString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
});
gameDiv?.appendChild(inGameTime);

const currentPosition = game.player.getPos();
document.addEventListener("keydown", (event) => {
  inGameDate.setMinutes(inGameDate.getMinutes() + 1);
  inGameTime.innerText = inGameDate.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  const keyName = event.key;
  if (keyName === "ArrowUp") {
    if (game.player.getPos().y === 0) {
      return;
    } else {
      // console.log(game.player.getPos().x + 1, game.player.getPos().y);
      game.player.move(0, -1);
      const currentCell = document.querySelector(
        `#cell-${currentPosition.x}-${currentPosition.y}`
      );
      currentCell!.appendChild(player);
      game.playTurn();
      const thisCell = game.grid.getCell(currentPosition.x, currentPosition.y);

      if (thisCell.plant) {
        const plant = document.querySelector(
          `#plant-${currentPosition.x}-${currentPosition.y}`
        );
        plant!.setAttribute(
          "src",
          `./assets/level${game.grid.getPlantLvl(
            currentPosition.x,
            currentPosition.y
          )}.png`
        );
      }
    }
  } else if (keyName === "ArrowDown") {
    if (currentPosition.y === 2) {
      return;
    } else {
      game.player.move(0, 1);
      const currentCell = document.querySelector(
        `#cell-${currentPosition.x}-${currentPosition.y}`
      );
      currentCell!.appendChild(player);
      game.playTurn();
      const thisCell = game.grid.getCell(currentPosition.x, currentPosition.y);
      if (thisCell.plant) {
        const plant = document.querySelector(
          `#plant-${currentPosition.x}-${currentPosition.y}`
        );
        plant!.setAttribute(
          "src",
          `./assets/level${game.grid.getPlantLvl(
            currentPosition.x,
            currentPosition.y
          )}.png`
        );
      }
    }
  } else if (keyName === "ArrowLeft") {
    if (currentPosition.x === 0) {
      return;
    } else {
      game.player.move(-1, 0);
      const currentCell = document.querySelector(
        `#cell-${currentPosition.x}-${currentPosition.y}`
      );
      currentCell!.appendChild(player);
      game.playTurn();
      const thisCell = game.grid.getCell(currentPosition.x, currentPosition.y);
      if (thisCell.plant) {
        const plant = document.querySelector(
          `#plant-${currentPosition.x}-${currentPosition.y}`
        );
        plant!.setAttribute(
          "src",
          `./assets/level${game.grid.getPlantLvl(
            currentPosition.x,
            currentPosition.y
          )}.png`
        );
      }
    }
  } else if (keyName === "ArrowRight") {
    if (currentPosition.x === 2) {
      return;
    } else {
      game.player.move(1, 0);
      const currentCell = document.querySelector(
        `#cell-${currentPosition.x}-${currentPosition.y}`
      );
      currentCell!.appendChild(player);
      game.playTurn();
      const thisCell = game.grid.getCell(currentPosition.x, currentPosition.y);

      if (thisCell.plant) {
        const plant = document.querySelector(
          `#plant-${currentPosition.x}-${currentPosition.y}`
        );
        plant!.setAttribute(
          "src",
          `./assets/level${game.grid.getPlantLvl(
            currentPosition.x,
            currentPosition.y
          )}.png`
        );
      }
    }
  } else if (keyName === " ") {
    if (plants[currentPosition.x][currentPosition.y].level < 3) {
      game.player.reap(game.grid.cells);
      const plant = document.querySelector(
        `#plant-${currentPosition.x}-${currentPosition.y}`
      );
      plant!.setAttribute("src", `./assets/level${1}.png`);
      // plants[currentPosition.x][currentPosition.y].level++;
      // const plant = document.querySelector(`#plant-${currentPosition.x}-${currentPosition.y}`);
      // plant!.setAttribute('src', `./assets/level${plants[currentPosition.x][currentPosition.y].level}.png`);
      goalText.innerText = `${game.player.getCollectedPlants()}/10 plants collected`;
    }
  }
});

// movement:
// const currentPosition = { x: 1, y: 1 };
// document.addEventListener('keydown', (event) => {
//   const keyName = event.key;
//   if (keyName === 'ArrowUp') {
//     if (currentPosition.y === 0) {
//       return;
//     } else {
//       currentPosition.y--;
//       const currentCell = document.querySelector(`#cell-${currentPosition.x}-${currentPosition.y}`);
//       currentCell!.appendChild(player);
//     }
//     move up
//   } else if (keyName === 'ArrowDown') {
//     if (currentPosition.y === 2) {
//       return;
//     } else {
//       currentPosition.y++;
//       const currentCell = document.querySelector(`#cell-${currentPosition.x}-${currentPosition.y}`);
//       currentCell!.appendChild(player);
//     }
//     // move down
//   } else if (keyName === 'ArrowLeft') {
//     if (currentPosition.x === 0) {
//       return;
//     } else {
//       currentPosition.x--;
//       const currentCell = document.querySelector(`#cell-${currentPosition.x}-${currentPosition.y}`);
//       currentCell!.appendChild(player);
//     }
//     // move left
//   } else if (keyName === 'ArrowRight') {
//     if (currentPosition.x === 2) {
//       return;
//     } else {
//       currentPosition.x++;
//       const currentCell = document.querySelector(`#cell-${currentPosition.x}-${currentPosition.y}`);
//       currentCell!.appendChild(player);
//     }

//   } else if(keyName === ' ') {
// if(plants[currentPosition.x][currentPosition.y].level < 3) {
//   plants[currentPosition.x][currentPosition.y].level++;
//   const plant = document.querySelector(`#plant-${currentPosition.x}-${currentPosition.y}`);
//   plant!.setAttribute('src', `./assets/level${plants[currentPosition.x][currentPosition.y].level}.png`);

// }

//   }
// });
