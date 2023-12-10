import * as foo from "./test.ts";

//local storage
let currentLevel = localStorage.getItem("currentlevel");
if (currentLevel == null) {
  localStorage.setItem("currentlevel", "0");
}

currentLevel = localStorage.getItem("currentlevel");
const game = foo.InitGame(Number(currentLevel));

document.addEventListener("keydown", (event) => {
  const currentPosition = game.playerPosition;
  const keyName = event.key;
  if (keyName === "ArrowUp") {
    console.log("up");
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
  game.playTurn();
});
// Variables to store touch coordinates
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Add touch event listeners
document.querySelector("#gameContainer")!.addEventListener(
  "touchstart",
  function (event) {
    console.log("touchstart");
    const touch = (event as TouchEvent).touches[0];
    touchStartX = touch.screenX;
    touchStartY = touch.screenY;
  },
  false
);

document.querySelector("#gameContainer")!.addEventListener(
  "touchend",
  function (event) {
    console.log("touchend");
    const touch = (event as TouchEvent).changedTouches[0];
    touchEndX = touch.screenX;
    touchEndY = touch.screenY;
    handleSwipe();
  },
  false
);
// Function to determine and handle swipe direction
function handleSwipe() {
  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    console.log("swiped right");
    if (deltaX > 0) {
      // Swiped right
      if (game.playerPosition.x !== game.rows - 1) {
        game.movePlayer(1, 0);
      } else {
        return;
      }
    } else {
      // Swiped left
      if (game.playerPosition.x !== 0) {
        game.movePlayer(-1, 0);
      } else {
        return;
      }
    }

    localStorage.setItem("autosave", game.toMomento());
    localStorage.setItem("language", JSON.stringify(game.language));
    game.playTurn();
  } else {
    // Vertical swipe
    if (deltaY > 0) {
      console.log("swiped down");
      // Swiped down
      if (game.playerPosition.y !== game.cols - 1) {
        game.movePlayer(0, 1);
      } else {
        return;
      }
    } else {
      console.log("swiped up");
      // Swiped up
      if (game.playerPosition.y !== 0) {
        game.movePlayer(0, -1);
      } else {
        return;
      }
    }

    localStorage.setItem("autosave", game.toMomento());
    localStorage.setItem("language", JSON.stringify(game.language));
    game.playTurn();
  }
}

document.querySelector("#playerAction")!.addEventListener("click", () => {
  game.playerAction();
  localStorage.setItem("autosave", game.toMomento());
  localStorage.setItem("language", JSON.stringify(game.language));
  game.playTurn();
});

document.querySelector("#undobtn")!.addEventListener("click", () => {
  console.log("undo");
  game.revertGameState();
  localStorage.setItem("autosave", game.toMomento());
  localStorage.setItem("language", JSON.stringify(game.language));
  game.playTurn();
});

document.querySelector("#redobtn")!.addEventListener("click", () => {
  game.restoreGameState();
  localStorage.setItem("autosave", game.toMomento());
  localStorage.setItem("language", JSON.stringify(game.language));
  game.playTurn();
});

document.querySelector("#loadbtn1")!.addEventListener("click", () => {
  const getSave = localStorage.getItem("save1");
  if (getSave) game.fromMomento(getSave, game.language.slot1);
  localStorage.setItem("autosave", game.toMomento());
  localStorage.setItem("language", JSON.stringify(game.language));
  game.playTurn();
});

document.querySelector("#loadbtn2")!.addEventListener("click", () => {
  const getSave = localStorage.getItem("save2");
  if (getSave) game.fromMomento(getSave, game.language.slot2);
  localStorage.setItem("autosave", game.toMomento());
  localStorage.setItem("language", JSON.stringify(game.language));
  game.playTurn();
});

document.querySelector("#loadbtn3")!.addEventListener("click", () => {
  const getSave = localStorage.getItem("save3");
  if (getSave) game.fromMomento(getSave, game.language.slot3);
  localStorage.setItem("autosave", game.toMomento());
  localStorage.setItem("language", JSON.stringify(game.language));
  game.playTurn();
});

document
  .getElementById("dropdownButton")!
  .addEventListener("click", function () {
    document.getElementById("dropdownMenu")!.classList.toggle("show");
  });

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  if (!(event.target as Element)?.matches("#dropdownButton")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};
