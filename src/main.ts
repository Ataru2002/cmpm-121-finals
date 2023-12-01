import * as foo from "./test.ts";



const game = foo.InitGame();

const currentPosition = game.playerPosition;
document.addEventListener("keydown", (event) => {
  const keyName = event.key;
  if (keyName === "ArrowUp") {
    if (currentPosition.y === 0) {
      return;
    } else {
      game.movePlayer(0, -1);
    }
  } else if (keyName === "ArrowDown") {
    if (currentPosition.y === 2) {
      return;
    } else {
      game.movePlayer(0, 1);
    }
  } else if (keyName === "ArrowLeft") {
    if (currentPosition.x === 0) {
      return;
    } else {
      game.movePlayer(-1, 0);
    }
  } else if (keyName === "ArrowRight") {
    if (currentPosition.x === 2) {
      return;
    } else {
      game.movePlayer(1, 0);
    }
  }
  else if(keyName === ' '){
    game.playerAction(); 
  } else {
    return
  }
  game.playTurn();
  
});



