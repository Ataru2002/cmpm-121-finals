import * as foo from "./test.ts";


//local storage
let currentLevel = localStorage.getItem("currentlevel");
if (currentLevel == null){
  localStorage.setItem("currentlevel", "0");
} 

currentLevel = localStorage.getItem("currentlevel");
const game = foo.InitGame(Number(currentLevel));

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
    if (currentPosition.y === game.cols - 1) {
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
    if (currentPosition.x === game.rows - 1) {
      return;
    } else {
      game.movePlayer(1, 0);
    }
  } else if (keyName === " ") {
    game.playerAction();
  } else if (keyName === "r") {
    game.revertGameState();
  } else if (keyName === "t") {
    game.restoreGameState();
  } else if (keyName === "1") {
    localStorage.setItem("save1", game.toMomento(game.language.slot1));
  } else if (keyName === "!" && event.shiftKey) {
    const getSave = localStorage.getItem("save1");
    if (getSave) game.fromMomento(getSave, game.language.slot1);
  } else if (keyName === "2") {
    localStorage.setItem("save2", game.toMomento(game.language.slot2));
  } else if (keyName === "@" && event.shiftKey) {
    const getSave = localStorage.getItem("save2");
    if (getSave) game.fromMomento(getSave, game.language.slot2);
  } else if (keyName === "3") {
    localStorage.setItem("save3", game.toMomento(game.language.slot3));
  } else if (keyName === "#" && event.shiftKey) {
    const getSave = localStorage.getItem("save3");
    if (getSave) game.fromMomento(getSave, game.language.slot3);
  } else {
    return;
  }

  //autosave after the moved was made
  localStorage.setItem("autosave", game.toMomento());
  localStorage.setItem("language", JSON.stringify(game.language));
  if (!specialCommand) game.playTurn();
});
