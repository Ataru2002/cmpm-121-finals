export enum PlantType {
  Type1,
  Type2,
  Type3,
}
export enum PlantLevel {
  Type1,
  Type2,
  Type3,
}

export interface Plant {
  type: PlantType;
  growthLevel: number;
}

export class GridCell {
  sunLevel: number;
  waterLevel: number;
  plant: Plant | undefined;

  constructor(sunLevel: number, waterLevel: number, PlantType?: PlantType) {
    this.sunLevel = sunLevel;
    this.waterLevel = waterLevel;
    if (PlantType) {
      this.plant = { type: PlantType, growthLevel: 1 };
    } else {
      this.plant = { type: 1, growthLevel: 1 };
    }
  }

  setPlant(plant: Plant) {
    this.plant = plant;
  }
  setSunLevel(sunLevel: number) {
    this.sunLevel = sunLevel;
  }
  setWaterLevel(waterLevel: number) {
    this.waterLevel = waterLevel;
  }
  updateCell() {
    //you either get sun or no sun
    this.sunLevel = Math.round(Math.random());

    //but you can accumulate water
    if (Math.random() < 0.25 && this.waterLevel < 3) {
      this.waterLevel += 1;
    }
  }


  updatePlant(): void {
    if (this.plant) {
      if (this.sunLevel === 1 && this.waterLevel > 0 && this.plant.growthLevel < 3) {
        this.plant.growthLevel += 1;
        this.waterLevel -= 1;
        this.sunLevel -= 1;
      }

    }
  }

  toString() {
    return `Sun = ${this.sunLevel}\nWater = ${this.waterLevel}\nPlant: ${this.plant ? `Type: ${this.plant.type}, Level: ${this.plant.growthLevel}` : "None"}`;
  }
}


export class Grid {
  cells: GridCell[][]
  constructor(rows: number, cols: number) {
    this.cells = [];
    for (let y = 0; y < rows; y++) {
      const row: GridCell[] = [];
      for (let x = 0; x < cols; x++) {
        const cell = new GridCell(0, 0);
        row.push(cell);
        const gameDiv = document.querySelector('#gameContainer');
        const div = document.createElement('div');
        div.classList.add('cell');
        div.id = `cell-${x}-${y}`;
        div.style.width = '100px';
        div.style.height = '100px';
        div.style.backgroundColor = 'grey';

        div.style.border = '1px solid black';

        gameDiv!.appendChild(div);
      }

      this.cells.push(row);
    }
  }

  getPlantLvl(x: number, y: number) {
    return this.cells[y][x].plant?.growthLevel;
  }

  getCell(x: number, y: number): GridCell {
    return this.cells[y][x];
  }

  renderCell(x: number, y: number): void {
    const cellElement = document.querySelector(`#cell-${x}-${y}`);
    cellElement!.innerHTML = '';
    const cellData = this.getCell(x, y);
    for (let i = 0; i < cellData.sunLevel; i++) {
      const sun = document.createElement('img')
      sun.src = './assets/sun.png';
      sun.style.width = '25px';
      sun.style.height = '25px';
      cellElement!.appendChild(sun);
    }
    for (let i = 0; i < cellData.waterLevel; i++) {
      const water = document.createElement('img')
      water.src = './assets/water.png';
      water.style.width = '25px';
      water.style.height = '25px';
      cellElement!.appendChild(water);
    }
    if (cellData.plant) {
      const plant = document.createElement('img');
      plant.src = `./assets/level${cellData.plant.growthLevel}.png`;
      plant.style.width = '25px';
      plant.style.height = '25px';
      plant.id = `plant-${x}-${y}`;
      cellElement!.appendChild(plant);
    }
  }

}


interface Position {
  x: number;
  y: number;
}
export class Character {
  position: Position;
  inventory: Plant[];

  constructor(startingPosition: Position, inventory: Plant[]) {
    this.position = startingPosition;
    this.inventory = inventory;

    this.renderPlayer();
  }

  move(x: number, y: number): void {
    this.position.x += x;
    this.position.y += y;
    this.renderPlayer();

  }
  renderPlayer(): void {
    const player = document.createElement('img');
    player.src = './assets/player.png';
    player.id = 'player';
    player.style.width = '25px';
    player.style.height = '25px';
    const div = document.querySelector(`#cell-${this.position.x}-${this.position.y}`);
    div!.appendChild(player!);

    if(this.inventory.length > 0){
      const inventory = document.querySelector('#inventory');
      inventory!.innerHTML = '';
      for (let i = 0; i < this.inventory.length; i++) {
        const plant = document.createElement('img');
        plant.src = `./assets/level${this.inventory[i].growthLevel}.png`;
        plant.style.width = '25px';
        plant.style.height = '25px';
        inventory!.appendChild(plant);
      }
    }
  }

  action(game: Game): void {
    const currentCell = game.grid.getCell(this.position.x, this.position.y);
    if (currentCell.plant && currentCell.plant.growthLevel == 3) {
      this.inventory.push(currentCell.plant);
      currentCell.plant = undefined;
    } else if (!currentCell.plant) {
      const newPlant: Plant = { type: 1, growthLevel: 1 };
      currentCell.plant = newPlant;

    }
  }


  getPos() {
    return this.position;
  }

  checkScenarioCompletion(targetPlantCount: number): boolean {
    // Additional logic for checking if the scenario is completed
    // const plantsWithTargetGrowth = grid.flat().flatMap((cell) => cell.plant).filter((plant) => plant!.growthLevel >= targetGrowthLevel);
    return this.inventory.length >= targetPlantCount;
  }
}

export class Game {
  grid: Grid;
  player: Character;
  rows: number;
  cols: number;
  goal: number;
  time: Date;


  constructor(gridRows: number, gridCols: number, goal: number) {
    this.goal = goal;
    this.rows = gridRows;
    this.cols = gridCols;
    this.time = new Date(2023, 0, 1, 0, 0, 0);
    const initalPos: Position = { x: Math.floor(Math.random() * this.rows), y: Math.floor(Math.random() * this.cols) };
    this.grid = new Grid(this.rows, this.cols);
    this.player = new Character(initalPos, []);
    this.playTurn();

  }

  playTurn(): void {
    // update the game state here
    //for every cell update the game state
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {

        //this will update the game state for every cell
        const currentCell = this.grid.getCell(x, y);
        currentCell.updateCell();
        currentCell.updatePlant();
        this.grid.renderCell(x, y);

      }
    }
    this.player.renderPlayer();
    this.renderUI();
  }
  renderUI(): void { 
    const goal = document.querySelector('#goal');
    goal!.innerHTML = `${this.player.inventory.length}/${this.goal} plants collected`;
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
    this.time.setDate(this.time.getDate() + 1);
  }


}

