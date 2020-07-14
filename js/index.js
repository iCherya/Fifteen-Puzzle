const startBoard = Game.createRandomBoard();
const game = new Game({
    board: startBoard,
    container: document.querySelector('.board')
});
console.log("game", game);
game.render();