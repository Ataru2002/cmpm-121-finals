export enum PlantType {
  None,
  Type1,
  Type2,
}
export enum PlantLevel {
  Type1,
  Type2,
  Type3,
}

interface Cell {
  water: number;
  plant: PlantType;
  sun: number;
  level: PlantLevel;
}

interface Position {
  x: number;
  y: number;
}

class Garden {
  buffer: ArrayBuffer;
  u8: Uint8Array;
  rows: number;
  cols: number;

  constructor(buffer: ArrayBuffer, rows: number, cols: number) {
    this.buffer = buffer;
    this.u8 = new Uint8Array(buffer);
    this.rows = rows;
    this.cols = cols;
  }

  getCell(cell: Position): Cell {
    const garden = this;
    const offset = (cell.x + cell.y * this.cols) * 4;

    return {
      get water() {
        return garden.u8[offset];
      },
      set water(value) {
        garden.u8[offset] = value;
      },
      get plant() {
        return garden.u8[offset + 1];
      },
      set plant(value) {
        garden.u8[offset + 1] = value;
      },
      get sun() {
        return garden.u8[offset + 2];
      },
      set sun(value) {
        garden.u8[offset + 2] = value;
      },
      get level() {
        return garden.u8[offset + 3];
      },
      set level(value) {
        garden.u8[offset + 3] = value;
      },
    };
  }
}

//Stores the data for a gamestate
interface gameState {
  garden: Garden;
  playerPos: Position;
  time: Date;
  inventory: { plant: number; level: number }[];
}

export function InitGame(): Game {
  const autosave = localStorage.getItem("autosave");
  const rows = 3;
  const cols = 3;
  const goal = 10;
  const buffer = new ArrayBuffer(rows * cols * 4);
  const garden = new Garden(buffer, rows, cols);
  const game = new Game(rows, cols, goal, garden);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const gameDiv = document.querySelector("#gameContainer");
      const div = document.createElement("div");
      div.classList.add("cell");
      div.id = `cell-${x}-${y}`;
      div.style.width = "100px";
      div.style.height = "100px";
      div.style.backgroundColor = "grey";

      div.style.border = "1px solid black";
      gameDiv!.appendChild(div);
      game.updateGameState({ x, y });
    }
  }
  if (autosave) {
    const loadAuto = window.confirm("load from autosave?");
    if (loadAuto) {
      console.log("loading from auto");
      game.fromMomento(autosave);
    }
  }
  game.playTurn();

  return game;
}

export class Game {
  garden: Garden;
  playerPos: Position;
  inventory: { plant: number; level: number }[];
  rows: number;
  cols: number;
  goal: number;
  time: Date;
  logs: gameState[];
  redos: gameState[];

  constructor(
    gridRows: number,
    gridCols: number,
    goal: number,
    garden: Garden
  ) {
    this.goal = goal;
    this.rows = gridRows;
    this.cols = gridCols;
    this.time = new Date(2023, 0, 1, 0, 0, 0);
    const initalPos: Position = {
      x: Math.floor(Math.random() * this.rows),
      y: Math.floor(Math.random() * this.cols),
    };
    this.inventory = [];
    this.garden = garden;
    this.playerPos = initalPos;
    this.logs = [];
    this.redos = [];
  }

  get playerPosition(): Position {
    return this.playerPos;
  }

  //function to make a deep copy of the gameState
  copyGameState(gameState: gameState): gameState {
    const buffer = new ArrayBuffer(
      gameState.garden.rows * gameState.garden.cols * 4
    );
    const newGarden = new Garden(
      buffer,
      gameState.garden.rows,
      gameState.garden.cols
    );
    for (let y = 0; y < gameState.garden.rows; y++) {
      for (let x = 0; x < gameState.garden.cols; x++) {
        const cell = gameState.garden.getCell({ x, y });
        newGarden.getCell({ x, y }).water = cell.water;
        newGarden.getCell({ x, y }).plant = cell.plant;
        newGarden.getCell({ x, y }).sun = cell.sun;
        newGarden.getCell({ x, y }).level = cell.level;
      }
    }
    const newInventory: { plant: number; level: number }[] = [];
    gameState.inventory.forEach((instances) => {
      newInventory.push({ plant: instances.plant, level: instances.level });
    });
    const newPos = { x: this.playerPos.x, y: this.playerPos.y };
    const newTime = new Date(this.time.valueOf());

    const newGameState: gameState = {
      garden: newGarden,
      playerPos: newPos,
      time: newTime,
      inventory: newInventory,
    };
    return newGameState;
  }

  movePlayer(x: number, y: number): void {
    //logs the gamestate
    this.logs.push(
      this.copyGameState({
        garden: this.garden,
        playerPos: this.playerPos,
        time: this.time,
        inventory: this.inventory,
      })
    );
    this.playerPos.x += x;
    this.playerPos.y += y;

    //update the time and gameState
    this.time.setDate(this.time.getDate() + 1);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.updateGameState({ x, y });
      }
    }
  }

  playTurn(): void {
    // update the game state here
    //for every cell update the game state
    //logs the gamestate;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.renderCell({ x, y });
      }
    }
    this.renderPlayer();
    this.renderUI();
    if (this.inventory.length >= this.goal) {
      alert("You win!");
    }
  }

  updateGameState(cell: Position): void {
    const cellData = this.garden.getCell(cell);
    switch (cellData.plant) {
      case PlantType.None:
        break;
      case PlantType.Type1:
        if (
          cellData.sun === 1 &&
          cellData.water > 0 &&
          cellData.level != PlantLevel.Type3
        ) {
          cellData.level += 1;
          cellData.water -= 1;
          cellData.sun -= 1;
        }
        break;
      case PlantType.Type2:
        if (
          cellData.sun === 1 &&
          cellData.water > 1 &&
          cellData.level != PlantLevel.Type3
        ) {
          cellData.level += 1;
          cellData.water -= 2;
          cellData.sun -= 1;
        }
        break;
    }

    if (Math.random() < 0.25 && cellData.water < 3) {
      cellData.water += 1;
    }
    cellData.sun = Math.round(Math.random());
  }

  playerAction(): void {
    //logs the gamestate
    this.logs.push(
      this.copyGameState({
        garden: this.garden,
        playerPos: this.playerPos,
        time: this.time,
        inventory: this.inventory,
      })
    );
    const currentCell = this.garden.getCell(this.playerPos);
    //REAP
    if (currentCell.plant && currentCell.level == 2) {
      this.inventory.push({
        plant: currentCell.plant,
        level: currentCell.level,
      });
      currentCell.plant = 0;
      currentCell.level = 0;
      //SOW
    } else if (!currentCell.plant) {
      //TODO: this needs to be changed so it is the length of the Plant enum
      currentCell.plant = 1 + Math.round(Math.random()) * 1;
      currentCell.level = 0;
    }

    //update the time and gameState
    this.time.setDate(this.time.getDate() + 1);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.updateGameState({ x, y });
      }
    }
  }

  //reverse 1 step of the game
  revertGameState(): void {
    console.log(this.logs);
    if (this.logs.length) {
      const last = this.logs.pop();
      const current = this.copyGameState({
        garden: this.garden,
        playerPos: this.playerPos,
        time: this.time,
        inventory: this.inventory,
      });
      this.garden = last!.garden;
      this.playerPos = last!.playerPos;
      this.time = last!.time;
      this.inventory = last!.inventory;
      if (last) {
        this.redos.push(current);
      }
    }
  }

  //restore 1 step of the game that was undo
  restoreGameState(): void {
    if (this.redos.length) {
      const last = this.redos.pop();
      const current = this.copyGameState({
        garden: this.garden,
        playerPos: this.playerPos,
        time: this.time,
        inventory: this.inventory,
      });
      this.garden = last!.garden;
      this.playerPos = last!.playerPos;
      this.time = last!.time;
      this.inventory = last!.inventory;
      if (last) {
        this.logs.push(current);
      }
    }
  }
  //  RENDERING FUNCTIONS
  renderCell(cell: Position): void {
    const cellElement = document.querySelector(`#cell-${cell.x}-${cell.y}`);
    cellElement!.innerHTML = "";
    const cellData = this.garden.getCell(cell);
    //console.log(cellData)
    for (let i = 0; i < cellData.sun; i++) {
      const sun = document.createElement("img");
      sun.src = "assets/sun.png";
      sun.style.width = "25px";
      sun.style.height = "25px";
      cellElement!.appendChild(sun);
    }
    for (let i = 0; i < cellData.water; i++) {
      const water = document.createElement("img");
      water.src = "assets/water.png";
      water.style.width = "25px";
      water.style.height = "25px";
      cellElement!.appendChild(water);
    }
    if (cellData.plant) {
      //console.log(cellData.level)
      //console.log(cellData.plant)
      const plant = document.createElement("img");
      plant.src = `assets/type${cellData.plant}_level${cellData.level + 1}.png`;
      plant.style.width = "25px";
      plant.style.height = "25px";
      cellElement!.appendChild(plant);
    }
  }

  renderPlayer(): void {
    const player = document.createElement("img");
    player.src = "assets/player.png";
    player.id = "player";
    player.style.width = "25px";
    player.style.height = "25px";
    //console.log(`#cell-${this.playerPos.x}-${this.playerPos.y}`);
    const div = document.querySelector(
      `#cell-${this.playerPos.x}-${this.playerPos.y}`
    );
    div!.appendChild(player!);

    if (this.inventory.length > 0) {
      const inventory = document.querySelector("#inventory");
      inventory!.innerHTML = "";
      for (let i = 0; i < this.inventory.length; i++) {
        const plant = document.createElement("img");
        //TODO: this needs to be changed so it can have values besides 0,1
        plant.src = `assets/type${this.inventory[i].plant}_level${
          this.inventory[i].level + 1
        }.png`;
        plant.style.width = "25px";
        plant.style.height = "25px";
        inventory!.appendChild(plant);
      }
    } else {
      //clear the inventory when it's empty
      const inventory = document.querySelector("#inventory");
      inventory!.innerHTML = "";
    }
  }

  renderUI(): void {
    const goal = document.querySelector("#goal");
    goal!.innerHTML = `${this.inventory.length}/${this.goal} plants collected`;
    const inGameTime = document.querySelector("#time");
    const inGameDate = this.time;
    inGameTime!.innerHTML = inGameDate.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  //momento pattern
  toMomento(slot: string = ""): string {
    //save all these items to maintain a proper gamestates
    const gardenS = JSON.stringify(this.garden);
    const playerPosS = JSON.stringify(this.playerPos);
    const timeS = JSON.stringify(this.time);
    const logsS = JSON.stringify(this.logs);
    const redosS = JSON.stringify(this.redos);
    const inventoryS = JSON.stringify(this.inventory);
    if (slot !== "") {
      alert("saved to " + slot);
    }
    return `${gardenS}+${playerPosS}+${timeS}+${logsS}+${redosS}+${inventoryS}`;
  }

  fromMomento(momento: string, slot: string = "") {
    //split the string
    const cur = momento.split("+");
    //reload all the items
    const buffer = new ArrayBuffer(
      JSON.parse(cur[0]).rows * JSON.parse(cur[0]).cols * 4
    );
    const garden = new Garden(
      buffer,
      JSON.parse(cur[0]).rows,
      JSON.parse(cur[0]).cols
    );
    garden.u8 = JSON.parse(cur[0]).u8;
    const playerPos = JSON.parse(cur[1]);
    const time = new Date(JSON.parse(cur[2]));
    const logs: gameState[] = [];
    const redos: gameState[] = [];
    const inventory: { plant: number; level: number }[] = JSON.parse(cur[5]);

    JSON.parse(cur[3]).forEach((instance: any) => {
      const tempGarden = new Garden(
        instance.garden.buffer,
        instance.garden.rows,
        instance.garden.cols
      );
      tempGarden.u8 = instance.garden.u8;
      const temp: gameState = {
        garden: tempGarden,
        playerPos: instance.playerPos,
        time: new Date(instance.time),
        inventory: instance.inventory,
      };
      logs.push(temp);
    });

    JSON.parse(cur[4]).forEach((instance: any) => {
      const tempGarden = new Garden(
        instance.garden.buffer,
        instance.garden.rows,
        instance.garden.cols
      );
      tempGarden.u8 = instance.garden.u8;
      const temp: gameState = {
        garden: tempGarden,
        playerPos: instance.playerPos,
        time: new Date(instance.time),
        inventory: instance.inventory,
      };
      redos.push(temp);
    });

    this.garden = garden;
    this.playerPos = playerPos;
    this.time = time;
    this.logs = logs;
    this.redos = redos;
    this.inventory = inventory;
    if (slot !== "") {
      alert("loaded from " + slot);
    }
  }
}
