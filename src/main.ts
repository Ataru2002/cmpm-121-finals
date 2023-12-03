import * as foo from "./test.ts";



const game = foo.InitGame();


document.addEventListener("keydown", (event) => {
  const currentPosition = game.playerPosition;
  let specialCommand = false;
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
  } else if(keyName === ' '){
    game.playerAction(); 
  } else if (keyName === "r") {
    game.revertGameState();
  } else if(keyName === "t") {
    game.restoreGameState();
  } else {
    return;
  }
  if(!specialCommand) game.playTurn();
});



