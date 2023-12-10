import levels from "./levels.json";
import english from "./en.json";
import chinese from "./cn.json";
import arabic from "./ar.json";
const levelData = JSON.parse(JSON.stringify(levels));
const englishData = JSON.parse(JSON.stringify(english)) as LanguageData;
const chineseData = JSON.parse(JSON.stringify(chinese)) as LanguageData;
const arabicData = JSON.parse(JSON.stringify(arabic)) as LanguageData;

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

interface LanguageData {
  load: string;
  win: string;
  save: string;
  slot1: string;
  slot2: string;
  slot3: string;
  inventory: string;
  dateCode: string;
  autoSave: string;
  controls: string;
  nextLevel: string;
  end: string;
}

interface Position {
  x: number;
  y: number;
}

interface PlantDefinitionLanguage {
  type(type: PlantType): void;
  assets(assets: string[]): void;
  sun(sun: number): void;
  water(water: number): void;
  level(level: PlantLevel): void;
}

class InternalPlantType {
  type: PlantType = PlantType.None;
  assets: string[] = [];
  sun: number = -1;
  water: number = -1;
  level: number = -1;
}

function InternalPlantTypeCompiler(
  program: ($: PlantDefinitionLanguage) => void
): InternalPlantType {
  const internalPlantType = new InternalPlantType();
  const dsl: PlantDefinitionLanguage = {
    type(type: PlantType): void {
      internalPlantType.type = type;
    },
    assets(assets: string[]): void {
      internalPlantType.assets = assets;
    },
    sun(sun: number): void {
      internalPlantType.sun = sun;
    },
    water(water: number): void {
      internalPlantType.water = water;
    },
    level(level: number): void {
      internalPlantType.level = level;
    },
  };
  program(dsl);
  return internalPlantType;
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

export function InitGame(level: number): Game {
  //set autosave level in addition to autosave
  const autosave = localStorage.getItem("autosave");
  const rows = levelData[level].rows;
  const cols = levelData[level].cols;
  const buffer = new ArrayBuffer(rows * cols * 4);
  const garden = new Garden(buffer, rows, cols);
  const game = new Game(
    rows,
    cols,
    levelData[level].goal,
    garden,
    levelData[level].start
  );
  const gameDiv = document.querySelector("#gameContainer") as HTMLDivElement;

  gameDiv.style.gridTemplateColumns = `repeat(${cols}, 100px)`;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
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
    const savedLang = localStorage.getItem("language")!;
    const autoLanguage = JSON.parse(savedLang) as LanguageData;

    // console.log(autoLanguage.save);
    if (savedLang) {
      const loadAuto = window.confirm(autoLanguage.autoSave);
      if (loadAuto) {
        console.log("loading from auto");
        game.fromMomento(autosave);
      }
    }
  }
  const enButton = document.getElementById("en");
  enButton?.addEventListener("click", () => {
    game.language = englishData;
    game.renderUI();
  });
  const cnButton = document.getElementById("cn");
  cnButton?.addEventListener("click", () => {
    game.language = chineseData;
    game.renderUI();
  });

  const arButton = document.getElementById("ar");
  arButton?.addEventListener("click", () => {
    game.language = arabicData;
    game.renderUI();
  });
  game.playTurn();

  return game;
}

export class Game {
  garden: Garden;
  playerPos: Position;
  inventory: { plant: number; level: number }[];
  rows: number;
  cols: number;
  goal: number[];
  time: Date;
  logs: gameState[];
  redos: gameState[];
  language: any;
  plants: InternalPlantType[];

  constructor(
    gridRows: number,
    gridCols: number,
    goal: number[],
    garden: Garden,
    start: [number, number, number]
  ) {
    this.goal = goal;
    this.rows = gridRows;
    this.cols = gridCols;
    this.time = new Date(...start);
    const initalPos: Position = {
      x: Math.floor(Math.random() * this.rows),
      y: Math.floor(Math.random() * this.cols),
    };
    this.inventory = [];
    this.garden = garden;
    this.playerPos = initalPos;
    this.logs = [];
    this.redos = [];
    const savedLang = localStorage.getItem("language")!;
    if (savedLang) {
      const autoLanguage = JSON.parse(savedLang) as LanguageData;
      this.language = autoLanguage;
    } else {
      this.language = englishData;
    }

    //define the types of plants
    const allPlantDefinitions = [
      function flower($: PlantDefinitionLanguage) {
        $.type(PlantType.Type1);
        $.assets([
          "assets/type1_level1.png",
          "assets/type1_level2.png",
          "assets/type1_level3.png",
        ]);
        $.sun(1);
        $.water(1);
        $.level(PlantLevel.Type3);
      },
      function tomato($: PlantDefinitionLanguage) {
        $.type(PlantType.Type2);
        $.assets([
          "assets/type2_level1.png",
          "assets/type2_level2.png",
          "assets/type2_level3.png",
        ]);
        $.sun(1);
        $.water(2);
        $.level(PlantLevel.Type3);
      },
    ];

    this.plants = allPlantDefinitions.map(InternalPlantTypeCompiler);
    console.log(this.plants);
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
    let goalReached = true;
    for (let i = 0; i < this.goal.length; i++) {
      const plantct = this.inventory.filter(
        (item) => item.plant === i + 1
      ).length;
      if (plantct < this.goal[i]) {
        goalReached = false;
      }
    }
    if (goalReached) {
      popUpMessage("You win!");
      const current = Number(localStorage.getItem("currentlevel"));
      const moveOn = window.confirm(this.language.nextLevel);
      if (!moveOn) {
        //player don't want to go to the next level
        localStorage.clear();
        localStorage.setItem("currentlevel", current.toString());
        localStorage.setItem("language", JSON.stringify(this.language));
        location.reload();
      } else if (moveOn && current < levelData.length - 1) {
        //player move on to the next level
        const newLevel = current + 1;
        localStorage.clear();
        localStorage.setItem("currentlevel", newLevel.toString());
        localStorage.setItem("language", JSON.stringify(this.language));
        location.reload();
      } else if (moveOn) {
        //player finished the last level
        alert(this.language.end);
        localStorage.clear();
        localStorage.setItem("currentlevel", "0");
        localStorage.setItem("language", JSON.stringify(this.language));
        location.reload();
      }
    }
  }

  updateGameState(cell: Position): void {
    const cellData = this.garden.getCell(cell);

    if (cellData.plant) {
      const rules = this.plants[cellData.plant - 1];
      if (
        cellData.water >= rules.water &&
        cellData.sun >= rules.sun &&
        cellData.level <= rules.level - 1
      ) {
        cellData.level += 1;
        cellData.water -= rules.water;
        cellData.sun -= rules.sun;
      }
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
    if (this.logs.length) {
      const last = this.logs.pop();
      const current = this.copyGameState({
        garden: this.garden,
        playerPos: this.playerPos,
        time: this.time,
        inventory: this.inventory,
      });
      console.log({current})
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
      console.log({current})
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
    const sunDiv = document.createElement("div");
    sunDiv.style.display = "flex";
    sunDiv.style.flexDirection = "row";
    sunDiv.style.justifyContent = "center";
    sunDiv.style.alignItems = "center";
    const sun = document.createElement("img");
    sun.src = "assets/sun.png";
    sun.style.width = "25px";
    sun.style.height = "25px";
    sunDiv!.appendChild(sun);
    const sunText = document.createElement("p");
    sunText.style.color = "black";
    sunText.style.margin = "0px";
    sunText.innerHTML = "x" + cellData.sun.toString();
    sunDiv!.appendChild(sunText);
    cellElement!.appendChild(sunDiv);
    const waterDiv = document.createElement("div");
    waterDiv.style.display = "flex";
    waterDiv.style.flexDirection = "row";
    waterDiv.style.justifyContent = "center";
    waterDiv.style.alignItems = "center";
    const water = document.createElement("img");
    water.src = "assets/water.png";
    water.style.width = "25px";
    water.style.height = "25px";
    waterDiv!.appendChild(water);
    const waterText = document.createElement("p");
    waterText.style.color = "black";
    waterText.style.margin = "0px";
    waterText.innerHTML = "x" + cellData.water.toString();
    waterDiv!.appendChild(waterText);
    cellElement!.appendChild(waterDiv);
    if (cellData.plant) {
      const plant = document.createElement("img");
      plant.src = `assets/type${cellData.plant}_level${cellData.level + 1}.png`;
      plant.style.width = "25px";
      plant.style.height = "25px";
      cellElement!.appendChild(plant);
    }
  }

  renderPlayer(): void {
    const div = document.querySelector(
      `#cell-${this.playerPos.x}-${this.playerPos.y}`
    );
    const playerDiv = document.createElement("div");
    playerDiv.style.display = "flex";
    playerDiv.style.flexDirection = "row";
    playerDiv.style.justifyContent = "right";
    playerDiv.style.alignItems = "flex-end";
    playerDiv.style.width = "100px";
    const numChildren = div?.childElementCount;
    playerDiv.style.height = 100 - numChildren! * 25 + "px";

    const player = document.createElement("img");
    player.src = "assets/player.png";
    player.id = "player";
    player.style.width = "25px";
    player.style.height = "25px";

    playerDiv!.appendChild(player);
    div!.appendChild(playerDiv!);

    if (this.inventory.length > 0) {
      const inventory = document.querySelector("#inventory");
      inventory!.innerHTML = "";
      this.inventory.sort((a, b) => a.plant - b.plant);
      for (let i = 0; i < this.inventory.length; i++) {
        const plant = document.createElement("img");
        plant.src = this.plants[this.inventory[i].plant - 1].assets[2];
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
    const goal = document.querySelector("#goal") as HTMLDivElement;
    const inventoryText = document.getElementById(
      "inventory"
    ) as HTMLDivElement;
    goal.innerHTML = "";
    inventoryText.innerText = this.language.inventory;
    const types = this.goal.length;
    for (let i = 0; i < types; i++) {
      const plantct = this.inventory.filter(
        (item) => item.plant === i + 1
      ).length;
      const plant = document.createElement("img");
      plant.src = this.plants[i].assets[2];
      plant.style.width = "25px";
      plant.style.height = "25px";
      goal.appendChild(plant);
      goal.innerHTML += `(${plantct}/${this.goal[i]})`;
    }
    const inGameTime = document.querySelector("#time");
    const inGameDate = this.time;
    inGameTime!.innerHTML = inGameDate.toLocaleString(this.language.dateCode, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const controls = document.getElementById("controls") as HTMLElement;
    controls.innerHTML = this.language.controls;
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
      popUpMessage(this.language.save + slot);
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
      popUpMessage(this.language.load + slot);
    }
  }
}
function popUpMessage(message: string) {
  const popUp = document.createElement("div");
  popUp.classList.add("popUp");
  popUp.innerHTML = message + "!";
  const gameDiv = document.querySelector("#app");
  gameDiv!.insertBefore(popUp, gameDiv!.firstChild);
  setTimeout(() => {
    popUp.remove();
  }, 2000);
}
