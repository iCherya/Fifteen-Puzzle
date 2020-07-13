class Board {
    START_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 'empty'];
    constructor() {
        this.board = this.convertArrayToBoard(this.START_BOARD
            .sort(() => Math.random() - 0.5)
        );
    }
    convertArrayToBoard = function (boardArray) {
        return boardArray.reduce((board, cell, idx) => {
            board[idx] = cell;
            return board;
        }, {});
    }
    render = function () {
        console.log('----- board start------');
        for (let row = 0; row < 4; row++) {
            let rowStr = '';
            for (let col = 0; col < 4; col++) {
                const el = this.board[col + row * 4];
                if (el === 'empty') {
                    rowStr += 'ee ';
                } else {
                    rowStr += el.toString().padStart(2, '0') + ' ';
                }
            }
            console.log(rowStr);
        }

        return '----- board end------';
    }
    canMove = function (number) {
        if (number === 'empty') return null;
        const currentIndex = this.getIndex(number),
            sublingsItems = this.getSiblingsIndex(currentIndex),
            possibleMove = ['LEFT', 'RIGHT', 'TOP', 'BOTTOM']
            .find(direction => sublingsItems[direction] != null && this.board[sublingsItems[direction]] === 'empty');
        return possibleMove;
    }
    getIndex = function (number) {
        for (let index = 0; index < 16; index++) {
            if (this.board[index] === number) return index;
        }
    }
    getSiblingsIndex = function (currentIndex) {
        const leftItemIndex = currentIndex % 4 === 0 ? null : currentIndex - 1,
            rightItemIndex = currentIndex % 4 === 3 ? null : currentIndex + 1,
            topItemIndex = currentIndex < 4 ? null : currentIndex - 4,
            bottomItemIndex = currentIndex > 11 ? null : currentIndex + 4;
        return {
            LEFT: leftItemIndex,
            RIGHT: rightItemIndex,
            TOP: topItemIndex,
            BOTTOM: bottomItemIndex
        }
    }
}

const game = new Board();

console.log(game);
console.log(game.render());


for (let value in game.board) {
    if (game.canMove(game.board[value]) != undefined) {
        console.log(game.board[value], game.canMove(game.board[value]));
    }
}