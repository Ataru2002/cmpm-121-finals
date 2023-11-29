import * as foo from "./test.ts";



const game = new foo.Game(3, 3 );


const currentPosition = game.player.getPos();
document.addEventListener('keydown', (event) => {
  const keyName = event.key;
  if(keyName === 'ArrowUp') {
    if(game.player.getPos().y === 0){
      return;
    } else {
      game.player.move(0, -1);
      game.playTurn();
      
    }
  } 
  else if (keyName === 'ArrowDown'){
    if (currentPosition.y === 2){
      return;
    } else {
      game.player.move(0, 1);
      game.playTurn();
    }
  }
  else if (keyName === 'ArrowLeft'){
    if (currentPosition.x === 0){
      return;
    } else {
      game.player.move(-1, 0);
      game.playTurn();
    }
  }
  else if (keyName === 'ArrowRight'){
    if (currentPosition.x === 2){
      return;
    } else {
      game.player.move(1, 0);
    }
  }
  else if(keyName === ' '){
    game.player.action(game); 
  } else {
    return
  }
  game.playTurn();
  
});



