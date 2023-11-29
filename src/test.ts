export enum PlantType {
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
  
    constructor(sunLevel: number, waterLevel: number) {
      this.sunLevel = sunLevel;
      this.waterLevel = waterLevel;
      this.plant = undefined;
    }

    toString() {
      return `Sun = ${this.sunLevel}\nWater = ${this.waterLevel}\nPlant: ${this.plant ? `Type: ${this.plant.type}, Level: ${this.plant.growthLevel}` : "None"}`;
    }
}
  

export class Grid{
    cells: GridCell[][]
    constructor(rows: number, cols: number){  
      this.cells = this.initializeCells(rows, cols);
    }

    private initializeCells(rows: number, cols: number): GridCell[][]{
        const cells: GridCell[][] = [];

        for(let y = 0; y < rows; y++){
            const row: GridCell[] = [];
            for(let x = 0; x < cols; x++){
                const cell = new GridCell(0, 0);
                row.push(cell);
            }
            cells.push(row);
        }
        return cells;
    }

    getPlantLvl(x: number, y: number) {
      return this.cells[y][x].plant?.growthLevel;
    }
    
    getCell(x: number, y: number): GridCell {
        return this.cells[y][x];
    }

    getCells(){
      return this.cells;
    }

    updateCell(x: number, y: number, updates: Partial<GridCell>): void {
        Object.assign(this.cells[y][x], updates);
    }
    
    getRandomCell(): { x: number; y: number } {
        const randomX = Math.floor(Math.random() * this.cells[0].length);
        const randomY = Math.floor(Math.random() * this.cells.length);
        return { x: randomX, y: randomY };
    }
}

export class PlantGrowthRules {
    static canGrow(plant: Plant, sunLevel: number, waterLevel: number): boolean {
      // Implement your plant growth rules here

      return plant.growthLevel < 3 && sunLevel > 0 && waterLevel > 0;
    }
}

export class Character {
    private position: { x: number; y: number};
    inventory: Plant[];
  
    constructor(startingPosition: { x: number; y: number}, inventory: Plant[]) {
      this.position = startingPosition;
      this.inventory = inventory;
    }
  
    move(x: number, y: number): void {
      this.position.x += x;
      this.position.y += y;
    }
  
    reap(grid: GridCell[][]): void {
      const currentCell = grid[this.position.y][this.position.x];
      if(currentCell.plant && currentCell.plant.growthLevel == 3){
        this.inventory.push(currentCell.plant);
        currentCell.plant = undefined;
        console.log(`Collected resources: ${JSON.stringify(this.inventory)}`);
      }
      
    }
  
    sow(grid: GridCell[][], plantType: PlantType): void {
      const currentCell = grid[this.position.y][this.position.x];
      if (!currentCell.plant) {
        const newPlant: Plant = { type: plantType, growthLevel: 1 };
        currentCell.plant = newPlant;
      }
      // Additional logic for planting and updating game state
    }

    getPos() {
      return this.position;
    }
  
    // advanceTime(grid: Grid): void {
    // Additional logic for updating sun and water levels, plant growth

    // }
  
    checkScenarioCompletion(targetPlantCount: number): boolean {
      // Additional logic for checking if the scenario is completed
      // const plantsWithTargetGrowth = grid.flat().flatMap((cell) => cell.plant).filter((plant) => plant!.growthLevel >= targetGrowthLevel);
      return this.inventory.length >= targetPlantCount;
    }
  }

export class Game {
  grid: Grid;
  player: Character;


  constructor(gridRows: number, gridCols: number, playerStartingPosition: { x: number; y: number }) {
      this.grid = new Grid(gridRows, gridCols);
      this.player = new Character(playerStartingPosition, []);

  }

  initializeGame(): void {
    //placing initial plants on the grid
    // const initialPlantPosition = this.grid.getRandomCell();
    const initialPlant: Plant = { type: PlantType.Type1, growthLevel: 1 };
    this.grid.cells.forEach((row, y) => {
      row.forEach((_cell, x) => {
        const luck = Math.random();
        if(luck > 0.7){
          this.grid.updateCell(x, y, {sunLevel: 1, waterLevel: 1, plant: initialPlant});
        } 
      });
    });
    
  }
  playTurn(): void {
    // this.player.advanceTime(this.grid);
    
    this.grid.cells.forEach((row, y) => {
      row.forEach((_cell, x) => {
        const existingWater : number = _cell.waterLevel;
        this.grid.updateCell(x, y, { sunLevel: Math.floor(Math.random() * 3), waterLevel: existingWater + Math.floor(Math.random() * 3) });
        console.log(`(${x}, ${y}):\n ${_cell}`);

        if(_cell.plant){
          if (PlantGrowthRules.canGrow(_cell.plant, _cell.sunLevel, _cell.waterLevel)) {
            // Implement plant growth logic
            _cell.plant.growthLevel += 1;
          }
        }
      });
    });
    console.log("--------")
    
    
    const isScenarioCompleted = this.player.checkScenarioCompletion(10);
    if (isScenarioCompleted) {
      console.log("Scenario completed! Game over.");
    }
  }
  
}


// OpenAI. (2023). ChatGPT [Large language model]. https://chat.openai.com