class Game {
    static START_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 'empty'];
    constructor(props) {
        const {
            startBoard = Game.createRandomBoard(),
                container
        } = props;
        this.board = startBoard;
        this.container = container;
        this.container.classList.add('board');

        this.init();
    }
    static createRandomBoard = function () {
        return Game.convertArrayToBoard(Game.START_BOARD
            .concat()
            .sort(() => Math.random() - 0.5)
        );
    }
    static canBoardWin = function (board) {
        let N = Math.ceil(board.findIndex(cell => cell === 'empty') / 4);
        for (let i = 0; i < 15; i++) {
            if (board[i] !== 'empty') {
                N += board.filter((number, index) => number !== 'empty' && index < i && number < board[i]).length;
            }
        }
        return N % 2 !== 0;
    }
    static convertArrayToBoard = function (boardArray) {
        return boardArray.reduce((board, cell, idx) => {
            board[idx] = cell;
            return board;
        }, {});
    }
    render() {
        console.log('----- board------');
        for (let row = 0; row < 4; row++) {
            let rowStr = '';
            for (let col = 0; col < 4; col++) {
                const el = this.board[col + row * 4];
                if (el === 'empty') {
                    rowStr += 'ee ';
                } else {
                    rowStr += el.props.number.toString().padStart(2, '0') + ' ';
                }
            }
            console.log(rowStr);
        }
        console.log('----- board------');
    }
    getMoveData(number) {
        if (number === 'empty') return undefined;
        const currentIndex = this.getIndex(number),
            sublingsItems = this.getSiblingsIndex(currentIndex),
            possibleMove = ['LEFT', 'RIGHT', 'TOP', 'BOTTOM']
            .find(direction => sublingsItems[direction] != null && this.board[sublingsItems[direction]] === 'empty');
        if (!possibleMove) {
            return;
        }
        return {
            direction: possibleMove,
            from: currentIndex,
            to: sublingsItems[possibleMove],
        };
    }
    getIndex(number) {
        for (let index = 0; index < 16; index++) {
            if (this.board[index] === number) return index;
        }
    }
    getPosition(index) {
        return {
            row: Math.floor(index / 4),
            cell: index % 4,
        }
    }
    getSiblingsIndex(currentIndex) {
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
    move(number) {
        const moveData = this.getMoveData(number);

        if (moveData) {
            this.board[moveData.to] = number;
            this.board[moveData.from] = 'empty';
        }
        if (this.checkWin()) {
            this.win();
        } else {
            this.render();
        }
    }
    checkWin() {
        return Game.START_BOARD
            .every((number, index) => this.board[index] === number);
    }
    win() {
        console.log('You win')
    }
    init() {
        const cells = [];

        for (let i = 0; i <= 15; i++) {
            const number = this.board[i];

            if (number !== 'empty') {
                const cell = new Cell({
                    number,
                    canMove: !!this.getMoveData(number),
                    position: this.getPosition(i)
                });

                this.board[i] = cell;
                cells.push(cell.element);
            }
        }

        render(cells, this.container);
    }
}