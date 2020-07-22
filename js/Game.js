class Game {
    constructor(gameLevel, localResultTable) {
        this.container = document.querySelector('.board');
        this.gameLevel = gameLevel;
        this.START_BOARD_ARR = Game.generateStartBoard(gameLevel);
        this.isWin = false;
        this.localResultTable = localResultTable;
        this.board = this.createRandomBoard();
        this.move = this.move.bind(this);
        this.moveCount = 0;
        this.init(this.board);

        this.renderResultsTable(this.localResultTable);

        document.querySelector('.game-stats').classList.remove('hidden');
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
    renderResultsTable(resultsArray) {
        document.querySelector('.best-result__level').textContent = `${this.gameLevel}x${this.gameLevel}`;
        document.querySelector('.best-result__value').textContent = resultsArray[this.gameLevel].bestScore || 'Not solved yet'
    }
    win() {
        this.isWin = true;
        // this.board[this.gameLevel * this.gameLevel - 2].element.classList.remove('cell--can-move');
        // this.board[this.gameLevel * (this.gameLevel - 1) - 1].element.classList.remove('cell--can-move');

        localResultTable = this.localResultTable;

        localResultTable[`${this.gameLevel + 1}`].isAccessible = true;

        if (!localResultTable[this.gameLevel].bestScore || this.moveCount < localResultTable[this.gameLevel].bestScore) {
            localResultTable[this.gameLevel].bestScore = this.moveCount;
            this.renderResultsTable(localResultTable);
        }

        localStorage.setItem('localResultTable', JSON.stringify(localResultTable));

        // Restart game

        this.container.innerHTML = '';
        const newGame = createElement('div', {
            className: 'game',
            children: [
                createElement('div', {}, `Solved!\nYour result: ${this.moveCount}`),
                createElement('div', {
                    className: 'game-controls',
                    children: [
                        createElement('div', {
                            className: 'game-controls__all'
                        }, 'Choose level'),
                        createElement('div', {
                            className: 'game-controls__retry'
                        }, 'Retry again'),
                    ]
                })
            ]
        })

        newGame.lastChild.children[0].addEventListener('click', () => {
            renderGameLevels(localResultTable, document.querySelector('.board'));
            document.querySelector('.game-stats').classList.add('hidden');
        });
        newGame.lastChild.children[1].addEventListener('click', () => {
            startGame({
                level: this.gameLevel,
                localResultTable
            })
        });
        if (!(this.gameLevel === 9)) {
            let nextLevelEl = createElement('div', {
                className: 'game-controls__next'
            }, 'Next level')
            nextLevelEl.addEventListener('click', () => {
                startGame({
                    level: this.gameLevel + 1,
                    localResultTable
                })
            })
            newGame.lastChild.append(nextLevelEl);

        }
        render(newGame, this.container);
        console.dir(newGame);
        // renderGameLevels(localResultTable, this.container);
    }
}