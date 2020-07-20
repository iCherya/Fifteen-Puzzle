class Game {
    constructor(gameLevel) {
        this.container = document.querySelector('.board');
        this.gameLevel = gameLevel;
        this.START_BOARD_ARR = Game.generateStartBoard(gameLevel);
        this.isWin = false;
        this.board = this.createRandomBoard();
        this.container.classList.add('board');
        this.move = this.move.bind(this);
        this.moveCount = 0;

        this.init(this.board);

        const swipes = new Hammer(this.container);
        swipes.get('swipe').set({
            direction: Hammer.DIRECTION_ALL
        });
        swipes.on("swipeleft swiperight swipeup swipedown", this.moveControls.bind(this));
        document.addEventListener('keyup', this.moveControls.bind(this));
    }
    static generateStartBoard(gameLevel) {
        let startBoardArr = [];

        for (let i = 1; i < gameLevel ** 2; i++) {
            startBoardArr.push(i);
        }
        startBoardArr.push('empty');

        return startBoardArr;
    }
    canBoardWin(array) {

        // Check if Start board is the same after ramdomize
        let startBoardPosition = array.every((el, idx) => {
            return el === this.START_BOARD_ARR[idx]
        });

        if (startBoardPosition) return false;

        // Check can board win
        let parity = 0;

        let gridWidth = Math.sqrt(array.length);

        let row = 0;
        let blankRow = 0;

        for (let i = 0; i < array.length; i++) {
            if (i % gridWidth == 0) {
                row++;
            }
            if (array[i] == 'empty') {
                blankRow = row;
                continue;
            }
            for (let j = i + 1; j < array.length; j++) {
                if (array[i] > array[j] && array[j] != 'empty') {
                    parity++;
                }
            }
        }

        if (gridWidth % 2 == 0) {
            if (blankRow % 2 == 0) {
                return parity % 2 == 0;
            } else {
                return parity % 2 != 0;
            }
        } else {
            return parity % 2 == 0;
        }
    }
    static convertArrayToBoard(boardArray) {
        return boardArray.reduce((board, cell, idx) => {
            board[idx] = cell;
            return board;
        }, {});
    }
    createRandomBoard() {
        let randomBoard = this.START_BOARD_ARR
            .concat()
            .sort(() => Math.random() - 0.5);


        if (this.canBoardWin(randomBoard)) {
            return Game.convertArrayToBoard(randomBoard);
        }

        return this.createRandomBoard();;
    }
    checkWin() {
        return this.START_BOARD_ARR
            .every((number, index) => this.board[index] !== 'empty' ? this.board[index].props.number === number : this.board[index] === number);
    }
    getIndex(number) {
        for (let index = 0; index < this.gameLevel ** 2; index++) {
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
            row: Math.floor(index / this.gameLevel),
            cell: index % this.gameLevel,
        }
    }
    getSiblingsIndex(currentIndex) {
        const leftItemIndex = currentIndex % this.gameLevel === 0 ? null : currentIndex - 1,
            rightItemIndex = currentIndex % this.gameLevel === this.gameLevel - 1 ? null : currentIndex + 1,
            topItemIndex = currentIndex < this.gameLevel ? null : currentIndex - this.gameLevel,
            bottomItemIndex = currentIndex > this.gameLevel * (this.gameLevel - 1) - 1 ? null : currentIndex + this.gameLevel;
        return {
            LEFT: leftItemIndex,
            RIGHT: rightItemIndex,
            TOP: topItemIndex,
            BOTTOM: bottomItemIndex
        }
    }
    init(board) {
        const cells = [];

        for (let i = 0; i <= this.gameLevel ** 2 - 1; i++) {
            const number = board[i];

            if (number !== 'empty') {
                const cell = new Cell({
                    number,
                    onMove: this.move,
                }, this.container, this.gameLevel);

                this.board[i] = cell;
                cells.push(cell.element);
            } else {
                this.board[i] = number;
            }
        }
        this.render();
        render(cells, this.container);
    }
    moveControls(event) {
        let from;
        if (event.code === 'ArrowUp' || event.type === 'swipeup') from = 'BOTTOM';
        if (event.code === 'ArrowDown' || event.type === 'swipedown') from = 'TOP';
        if (event.code === 'ArrowLeft' || event.type === 'swipeleft') from = 'RIGHT';
        if (event.code === 'ArrowRight' || event.type === 'swiperight') from = 'LEFT';

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
        this.moveCount++;
        this.render();

        if (this.checkWin()) {
            this.win();
        }
    }
    render() {
        for (let i = 0; i <= this.gameLevel ** 2 - 1; i++) {
            const Cell = this.board[i];

            if (Cell !== 'empty') {
                Cell.changeProps({
                    canMove: !!this.getMoveData(Cell.props.number),
                    position: this.getPosition(i),
                })
            }
        }
        document.querySelector('.moves span').textContent = this.moveCount;
    }
    win() {
        this.isWin = true;
        this.board[this.gameLevel * this.gameLevel - 2].element.classList.remove('cell--can-move');
        this.board[this.gameLevel * (this.gameLevel - 1) - 1].element.classList.remove('cell--can-move');

        // if (!localStorage.getItem('bestResult') || this.moveCount < +localStorage.getItem('bestResult')) {
        //     localStorage.setItem('bestResult', this.moveCount);
        // }


        /// Stopped here
        localStorage.setItem('localResultTable', JSON.stringify(
            this.gameLevel = this.gameLevel, {
                'levelBoard': `${this.gameLevel}x${this.gameLevel}`,
                'count': this.moveCount,
            }
        ));


        document.querySelector('.best-result span').textContent = localStorage.getItem('bestResult');

        // if (this.moveCount < bestResult) sumbitRecordResult(this.moveCount);

        // Restart game
        document.querySelector('.board').innerHTML = '';
        let a = createElement('div', {
            className: 'game'
        }, `You win! ${'\n'}Moves: ${this.moveCount}${'\n\n'} Play again?`);

        render(a, document.querySelector('.board'));
        document.querySelector('.game').onclick = startGame;
    }
}