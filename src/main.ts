import * as foo from "./test.ts";

const game = foo.InitGame();
//const getAuto = localStorage.getItem("autosave");
//if (getAuto) game.fromMomento(getAuto, "autosave");

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
  } else if (keyName === " ") {
    game.playerAction();
  } else if (keyName === "r") {
    game.revertGameState();
  } else if (keyName === "t") {
    game.restoreGameState();
  } else if (keyName === "1") {
    localStorage.setItem("save1", game.toMomento("save slot 1"));
  } else if (keyName === "!" && event.shiftKey) {
    const getSave = localStorage.getItem("save1");
    if (getSave) game.fromMomento(getSave, "save slot 1");
  } else if (keyName === "2") {
    localStorage.setItem("save2", game.toMomento("save slot 2"));
  } else if (keyName === "@" && event.shiftKey) {
    const getSave = localStorage.getItem("save2");
    if (getSave) game.fromMomento(getSave, "save slot 2");
  } else if (keyName === "3") {
    localStorage.setItem("save3", game.toMomento("save slot 3"));
  } else if (keyName === "#" && event.shiftKey) {
    const getSave = localStorage.getItem("save3");
    if (getSave) game.fromMomento(getSave, "save slot 3");
  } else {
    return;
  }

  //autosave after the moved was made
  localStorage.setItem("autosave", game.toMomento());
  if (!specialCommand) game.playTurn();
});
