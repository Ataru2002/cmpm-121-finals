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






export function InitGame(): Game {
  const rows = 3;
  const cols = 3;
  const goal = 10;
  const buffer = new ArrayBuffer(rows * cols * 4);

  const garden = new Garden(buffer, rows, cols);

  const game = new Game(rows, cols, goal, garden);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
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
  }
  game.playTurn();

  return game;
}

export class Game {
  garden: Garden;
  playerPos: Position;
  inventory: { plant: number, level: number }[];
  rows: number;
  cols: number;
  goal: number;
  time: Date;


  constructor(gridRows: number, gridCols: number, goal: number, garden: Garden) {
    this.goal = goal;
    this.rows = gridRows;
    this.cols = gridCols;
    this.time = new Date(2023, 0, 1, 0, 0, 0);
    const initalPos: Position = { x: Math.floor(Math.random() * this.rows), y: Math.floor(Math.random() * this.cols) };
    this.inventory = [];
    this.garden = garden;
    this.playerPos = initalPos;
  }
  get playerPosition(): Position {
    return this.playerPos;
  }
  movePlayer(x: number, y: number): void {
    this.playerPos.x += x;
    this.playerPos.y += y;
  }
  playTurn(): void {
    // update the game state here
    //for every cell update the game state
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {

        this.renderCell({ x, y });
        this.updateGameState({ x, y });

      }
    }
    this.renderPlayer();
    this.renderUI();
    if (this.inventory.length >= this.goal) {
      alert('You win!');
    }
  }

  updateGameState(cell: Position): void {
    const cellData = this.garden.getCell(cell);



    switch (cellData.plant) {
      case PlantType.None:
        break;
      case PlantType.Type1:
        if (cellData.sun === 1 && cellData.water > 0 && cellData.level != PlantLevel.Type3) {
          cellData.level += 1;
          cellData.water -= 1;
          cellData.sun -= 1;
        }
        break;
      case PlantType.Type2:
        if (cellData.sun === 1 && cellData.water > 1 && cellData.level != PlantLevel.Type3) {
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
    const currentCell = this.garden.getCell(this.playerPos);

    //REAP 
    if (currentCell.plant && currentCell.level == 2) {
      this.inventory.push({ plant: currentCell.plant, level: currentCell.level });
      currentCell.plant = 0;
      currentCell.level = 0;

      //SOW 
    } else if (!currentCell.plant) {
      //TODO: this needs to be changed so it is the length of the Plant enum
      currentCell.plant = 1 + Math.round(Math.random()) * 1;
      currentCell.level = 0;


    }
  }
  //  RENDERING FUNCTIONS
  renderCell(cell: Position): void {
    const cellElement = document.querySelector(`#cell-${cell.x}-${cell.y}`);
    cellElement!.innerHTML = '';
    const cellData = this.garden.getCell(cell);
    console.log(cellData)
    for (let i = 0; i < cellData.sun; i++) {
      const sun = document.createElement('img')
      sun.src = 'assets/sun.png';
      sun.style.width = '25px';
      sun.style.height = '25px';
      cellElement!.appendChild(sun);
    }
    for (let i = 0; i < cellData.water; i++) {
      const water = document.createElement('img')
      water.src = 'assets/water.png';
      water.style.width = '25px';
      water.style.height = '25px';
      cellElement!.appendChild(water);
    }
    if (cellData.plant) {
      console.log(cellData.level)
      console.log(cellData.plant)
      const plant = document.createElement('img');
      plant.src = `assets/type${cellData.plant}_level${cellData.level + 1}.png`;
      plant.style.width = '25px';
      plant.style.height = '25px';
      cellElement!.appendChild(plant);
    }
  }
  renderPlayer(): void {
    const player = document.createElement('img');
    player.src = 'assets/player.png';
    player.id = 'player';
    player.style.width = '25px';
    player.style.height = '25px';
    const div = document.querySelector(`#cell-${this.playerPos.x}-${this.playerPos.y}`);
    div!.appendChild(player!);

    if (this.inventory.length > 0) {
      const inventory = document.querySelector('#inventory');
      inventory!.innerHTML = '';
      for (let i = 0; i < this.inventory.length; i++) {
        const plant = document.createElement('img');
        //TODO: this needs to be changed so it can have values besides 0,1
        plant.src = `assets/type${this.inventory[i].plant}_level${this.inventory[i].level + 1}.png`;
        plant.style.width = '25px';
        plant.style.height = '25px';
        inventory!.appendChild(plant);
      }
    }
  }
  renderUI(): void {
    const goal = document.querySelector('#goal');
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
    this.time.setDate(this.time.getDate() + 1);
  }
}

