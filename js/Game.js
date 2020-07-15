class Game {
    static START_BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 'empty'];
    constructor(props) {
        const {
            board = Game.createRandomBoard(),
                container
        } = props;

        this.board = {};
        this.isWin = false;
        this.container = container;
        this.container.classList.add('board');
        this.move = this.move.bind(this);

        this.init(board);

        document.addEventListener('keyup', this.keyUp.bind(this));
    }
    static canBoardWin(board) {
        let N = Math.ceil(board.findIndex(cell => cell === 'empty') / 4);
        for (let i = 0; i < 15; i++) {
            if (board[i] !== 'empty') {
                N += board.filter((number, index) => number !== 'empty' && index < i && number < board[i]).length;
            }
        }
        return N % 2 != 0;
    }
    static rotateBoard(board) {
        const size = Math.sqrt(board.length);
        let board2d = create2dArray(board, size);
        let rotatedBoard = [];

        for (let i = 0; i < size; ++i) {
            for (let j = 0; j < size; ++j) {
                if (!rotatedBoard[j]) rotatedBoard[j] = [];
                rotatedBoard[j][i] = board2d[size - 1 - i][j];
            }
        }

        return rotatedBoard.flat();
    }
    static convertArrayToBoard(boardArray) {
        return boardArray.reduce((board, cell, idx) => {
            board[idx] = cell;
            return board;
        }, {});
    }
    static createRandomBoard() {
        let randomBoard = Game.START_BOARD
            .concat()
            .sort(() => Math.random() - 0.5);
        if (Game.canBoardWin(randomBoard)) {
            return Game.convertArrayToBoard(randomBoard);
        } else {
            randomBoard = Game.rotateBoard(randomBoard);
            return Game.convertArrayToBoard(randomBoard);
        }

    }
    checkWin() {
        return Game.START_BOARD
            .every((number, index) => this.board[index] !== 'empty' ? this.board[index].props.number === number : this.board[index] === number);
    }
    getIndex(number) {
        for (let index = 0; index < 16; index++) {
            if (this.board[index] === 'empty') {
                if (number === 'empty') {
                    return index;
                }
            } else if (this.board[index].props.number === number) {
                return index;
            }
        }
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
    init(board) {
        const cells = [];

        for (let i = 0; i <= 15; i++) {
            const number = board[i];

            if (number !== 'empty') {
                const cell = new Cell({
                    number,
                    onMove: this.move,
                });

                this.board[i] = cell;
                cells.push(cell.element);
            } else {
                this.board[i] = number;
            }
        }
        this.render();
        render(cells, this.container);
    }
    keyUp(event) {
        let direction, from;
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                direction = 'TOP';
                from = 'BOTTOM';
                break;
            case 'ArrowDown':
            case 'KeyS':
                direction = 'BOTTOM';
                from = 'TOP';
                break;
            case 'ArrowLeft':
            case 'KeyA':
                direction = 'LEFT';
                from = 'RIGHT';
                break;
            case 'ArrowRight':
            case 'KeyD':
                direction = 'RIGHT';
                from = 'LEFT';
                break;
            default:
                break;
        }
        const emptyIndex = this.getIndex('empty'),
            siblings = this.getSiblingsIndex(emptyIndex);
        if (siblings[from] >= 0 && siblings[from] != null) {
            this.move(this.board[siblings[from]]);
        }
    }
    move(cell) {
        if (this.isWin) {
            return;
        }
        const moveData = this.getMoveData(cell.props.number);

        if (moveData) {
            this.board[moveData.to] = cell;
            this.board[moveData.from] = 'empty';
        }
        this.render();

        if (this.checkWin()) {
            this.win();
        }
    }
    render() {
        for (let i = 0; i <= 15; i++) {
            const cell = this.board[i];

            if (cell !== 'empty') {
                cell.changeProps({
                    canMove: !!this.getMoveData(cell.props.number),
                    position: this.getPosition(i)
                })
            }
        }
    }
    win() {
        console.log('You win');
        this.isWin = true;
        this.board[4 * 4 - 2].element.classList.remove('cell--can-move');
        this.board[4 * 3 - 1].element.classList.remove('cell--can-move');
    }
}