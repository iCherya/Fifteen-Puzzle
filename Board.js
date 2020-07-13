function Board() {
    this.board = convertArrayToBoard(
        Board.START_BOARD
        .sort(() => Math.random() - 0.5)
    );
}

Board.START_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 'empty'];

function convertArrayToBoard(boardArray) {
    return boardArray.reduce((board, cell, idx) => {
        board[idx] = cell;
        return board;
    }, {});
}

const board = new Board();
console.log(board);