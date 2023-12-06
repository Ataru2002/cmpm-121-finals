# Devlog Entry - 11/19/23

## Intoducing the Team

- Tools Lead - Aaron Lee
- Engine Lead - Jonathan Alvarez
- Design Lead - Gyle Viloria
- Assistant - Wichapas Pichetpongsa
- Backup - Nhan Nguyen

## Tools and Materials

- For our engine, we decided to use Phaser 3 because it is an engine that every member is familiar with and it uses js/ts. With the game being grid-based, it would seem easy to use Phaser 3 to keep things simple skipping the need of using an engine that supports 3d graphics. CMPM 120 was everyone's first run-in with Phaser and after having used it back then + our newfound knowledge of js/ts it only seemed natural that we would use Phaser. Since the team has a decent level of familiarity with Phaser we thought this was the best plan to be able to adapt to any assignment requirements added throughout the project.

- We decided to use either Typescript or Javascript because we can use what was taught in class and everyone in the group would have similar familiarity with the language. Also, Typescript having "interface" is something we feel like might come in handy.

- We most likely will be using VSCode for our IDE. This is due to our familiarity with the IDE and everybody is on the same page.

## Outlook

- The hardest/riskiest part of the project is how we chose Phaser but if we don't feel like it fits the requirements we might have to change the framework in the future.

# Devlog Entry - 11/29/23

## How we satisfied the software requirements

For our game, we have a controllable player on a 3x3 grid where any action-- moving, reaping, sowing-- will advance time by 1 day. Each cell has its own amount of sun energy and water level each day. At the beginning of the game, all grid cells are populated randomly by one of two plant types: **Flowers** and **Tomato Trees**. Both of these plant types have three levels of growth and require at least 1 sun energy, but **Flowers** need at least 1 level of water while **Tomato Trees** need at least 2 levels of water. Once plants reach growth level 3, players can reap them by pressing Space while on the same cell. For a cell without a plant, players can sow a random plant by pressing Space. For the win condition of the game we decided on a simple condition of collecting ten plants to show a win message. This may get changed in the future but we have this as a placeholder for now.

## Reflection

For our initial implementation, we decided to not use Phaser 3. It has a lot of functionality, but with our current implementation, it was much more lightweight to work without it. We are going forward with using just JavaScript (TypeScript) for now. Interfaces and type aliases have been helpful for us, and our familiarity with TypeScript made it much easier for the team to understand and read each other's code.

# Devlog Entry - 12/5/23

## How we satisfied the software requirements

- F0.a - F0.g: Same as last week

- F1.a: We used an Array of Structures (write more, embed image diagram of AoS)
- F1.b: We have arrays `logs` and `redos` that both hold `gameStates`, which contain the important information of each day of the game. The player is able to undo (R) and redo (T) every action multiple times, even from a saved game.
- F1.c: Players can save their data on three different slots by pressing **1**, **2**, and **3**. They can then load their save file by pressing **Shift + 1/2/3**.
- F1.d: After each move that the player makes, the game is auto-saved into an auto-save entry. In the case of an unexpected quit, the player is prompted if they want to "load from autosave".

## Reflection

After switching to just TypeScript (with no Phaser library), not much has changed for our team plan. For now, we are continuing to build upon our code from last week and adding the new software requirements from F1. We will need to pick up the pace for these next assignments, which will reduce our scope in terms of gameplay mechanics.
