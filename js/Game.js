class Game {
    constructor(gameLevel, localGameDataObject, moves, board) {

        this.container = document.querySelector('.board');
        this.gameLevel = gameLevel;
        this.START_BOARD_ARR = Game.generateStartBoard(this.gameLevel);
        this.isWin = false;
        this.localGameData = localGameDataObject;

        this.board = board || this.createRandomBoard();
        this.move = this.move.bind(this);
        this.moveCount = moves || 0;

        this.init(this.board);

        this.renderResultsTable(this.localGameData);

        document.querySelector('.game-stats').classList.remove('hidden');

        document.querySelector('#level').addEventListener('click', () => {
            this.isWin = true;
            renderGameLevels(this.localGameData, document.querySelector('.board'));
        });

        document.querySelector('#save').addEventListener('click', () => {
            let boardExport = {};
            for (let key in this.board) {
                if (!this.board[key].props) {
                    boardExport[key] = 'empty'
                } else {
                    boardExport[key] = this.board[key].props.number;
                }
            }
            const gameProcess = {
                level: this.gameLevel,
                moves: this.moveCount,
                board: boardExport,
            }
            localStorage.setItem('gameProcess', JSON.stringify(gameProcess));
            document.querySelector('#load').disabled = false;
            event.target.classList.add('saved');
            setTimeout(() => document.querySelector('#save').classList.remove('saved'), 1000);
        });
        const swipes = new Hammer(this.container);
        swipes.get('swipe').set({
            direction: Hammer.DIRECTION_ALL
        });
        swipes.on("swipeleft swiperight swipeup swipedown", this.moveControls.bind(this));
        document.addEventListener('keyup', this.moveControls.bind(this));
        document.querySelector('#solve').disabled = false;

        document.querySelector('#solve').addEventListener('click', () => {
            document.querySelector('.popupSolve').textContent = '';
            const elem = createElement('div', {
                className: 'popup',
                children: [
                    createElement('div', {}, `Are you sure?`),
                    createElement('input', {
                        type: 'button',
                        value: 'Yes, I\'m a loser',
                    }, ),
                    createElement('input', {
                        type: 'button',
                        value: 'No, I will try harder',
                    }, ),
                ],
            }, '')

            elem.children[1].addEventListener('click', () => {
                elem.style.display = 'none';
                this.solve();
            });
            elem.children[2].onclick = () => {

                elem.style.display = 'none';
                document.body.classList.remove('innactive');
            }
            document.querySelector('.popupSolve').append(elem);
            document.body.classList.add('innactive');
        })


        document.querySelector('#load').addEventListener('click', () => {
            const loadedBoard = JSON.parse(localStorage.getItem('gameProcess'));
            this.isWin = true;
            startGame({
                level: loadedBoard.level,
                localGameDataObject: JSON.parse(localStorage.getItem('localGameData')),
                moves: loadedBoard.moves,
                board: loadedBoard.board,
            })
        });

    }
    static convertArrayToBoard(boardArray) {
        return boardArray.reduce((board, cell, idx) => {
            board[idx] = cell;
            return board;
        }, {});
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
    checkWin() {
        return this.START_BOARD_ARR
            .every((number, index) => this.board[index] !== 'empty' ? this.board[index].props.number === number : this.board[index] === number);
    }
    createRandomBoard() {
        let randomBoard = this.START_BOARD_ARR
            .concat()
            .sort(() => Math.random() - 0.5);


        if (this.canBoardWin(randomBoard)) {
            return Game.convertArrayToBoard(randomBoard);
        }

        return this.createRandomBoard();
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
        document.querySelector('.game-stats__moves--value').textContent = this.moveCount;
    }
    renderResultsTable(resultsObject) {
        document.querySelector('.game-stats__local--level').textContent = `${this.gameLevel}x${this.gameLevel}`;
        document.querySelector('.game-stats__local--value').textContent = resultsObject[this.gameLevel].bestScore || '-';
    }
    sumbitGlobalScoreData(playerName) {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("id", this.gameLevel - 1);
        urlencoded.append("level", this.gameLevel);
        urlencoded.append("score", this.moveCount);
        urlencoded.append("name", playerName);

        var requestOptions = {
            method: 'PUT',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'follow'
        };

        fetch(`https://5f103a9700d4ab00161349f0.mockapi.io/scores/${this.gameLevel - 1}/`, requestOptions)
            .then(response => response.json())
            .then(response => {
                document.querySelector('.game-stats__global--value').textContent = response.score;
                document.querySelector('.game-stats__global--name').textContent = response.name;
            })
            .catch(error => console.log('error', error));

    }
    renderConsoleBoard() {
        let boardArray = [];
        for (let key in this.board) {
            if (!this.board[key].props) {
                boardArray.push('');
            } else {
                boardArray.push(this.board[key].props.number);
            }
        }

        let boardDim = Math.sqrt(boardArray.length);
        console.log('--- board ---');

        for (let row = 0; row < boardDim; row++) {
            let rowStr = '';
            for (let col = 0; col < boardDim; col++) {

                let el = boardArray[col + row * boardDim];

                if (el === "") {
                    rowStr += 'ee ';
                } else {
                    rowStr += el.toString().padStart(2, '0') + ' ';
                }
            }

            console.log(rowStr);
        }

    }

    solve() {

        let boardArray = [];
        for (let key in this.board) {
            if (!this.board[key].props) {
                boardArray.push('');
            } else {
                boardArray.push(this.board[key].props.number);
            }
        }
        let board2d = create2dArray(boardArray, Math.sqrt(boardArray.length));

        let solver = new NPuzzleSolver(board2d);
        let solution = solver.solve();

        let i = 0,
            solutionMoves = solution.length;

        function moveCellSolution() {
            // this.renderConsoleBoard();
            let boardArray = [];
            for (let key in this.board) {
                if (!this.board[key].props) {
                    boardArray.push('');
                } else {
                    boardArray.push(this.board[key].props.number);
                }
            }

            let element = boardArray.findIndex(el => el === solution[i].number);
            this.move(this.board[element]);
            i++;
            if (i < solutionMoves) {
                setTimeout(moveCellSolution.bind(this), 100);
            }

        }
        moveCellSolution.call(this);
    }
    win() {
        document.body.classList.remove('innactive');
        document.querySelector('.controls__main').classList.toggle('none');
        document.querySelector('.controls__game').classList.toggle('none');
        document.querySelector('#solve').disabled = true;
        this.isWin = true;


        if (this.gameLevel !== 9) {
            this.localGameData[`${this.gameLevel + 1}`].isAccessible = true;
        }
        if (!this.localGameData[this.gameLevel].bestScore || this.moveCount < this.localGameData[this.gameLevel].bestScore) {
            this.localGameData[this.gameLevel].bestScore = this.moveCount;
            this.renderResultsTable(this.localGameData);
        }


        localStorage.setItem('localGameData', JSON.stringify(this.localGameData));


        this.container.innerHTML = '';
        const newGame = createElement('div', {
            className: 'win',
            children: [
                createElement('div', {}, `Solved!\nYour result: ${this.moveCount}`),
                createElement('div', {
                    className: 'win-controls',
                    children: [
                        createElement('div', {
                            className: 'win-controls__all'
                        }, 'Choose level'),
                        createElement('div', {
                            className: 'win-controls__retry'
                        }, 'Retry again'),
                    ]
                })
            ]
        })
        newGame.lastChild.children[0].addEventListener('click', () => {
            this.isWin = true;
            renderGameLevels(this.localGameData, document.querySelector('.board'));
            document.querySelector('.game-stats').classList.add('hidden');
        });
        newGame.lastChild.children[1].addEventListener('click', () => {
            this.isWin = true;
            startGame({
                level: this.gameLevel,
                localGameDataObject: this.localGameData,
            })
        });
        if (!(this.gameLevel === 9)) {
            let nextLevelEl = createElement('div', {
                className: 'win-controls__next'
            }, 'Next level')
            nextLevelEl.addEventListener('click', () => {
                this.isWin = true;
                startGame({
                    level: this.gameLevel + 1,
                    localGameDataObject: this.localGameData,
                })
            })
            newGame.lastChild.append(nextLevelEl);
        }
        render(newGame, this.container);
        let globalScoreElValue = document.querySelector('.game-stats__global--value').textContent;
        if (this.moveCount < +globalScoreElValue || globalScoreElValue === "-") {
            let playerName = 'Unknown Hero';
            const submitResultEl = createElement('div', {
                className: 'submit-result popup',
                children: [
                    createElement('div', {}, 'New Record!'),
                    createElement('input', {
                        type: 'text',
                        placeholder: "What's your name, champ?"
                    }),
                    createElement('input', {
                        type: 'button',
                        value: "Submit"
                    }),
                ]
            }, )
            submitResultEl.children[2].onclick = () => {
                if (submitResultEl.children[1].value.length > 0) {
                    playerName = submitResultEl.children[1].value;
                }
                document.querySelector('.container').classList.remove('innactive');
                submitResultEl.children[1].blur();
                submitResultEl.style.display = 'none';
                this.sumbitGlobalScoreData(playerName);
            }
            submitResultEl.children[1].addEventListener('keyup', function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    submitResultEl.children[2].click();
                }
            });
            document.body.append(submitResultEl);
            document.querySelector('.container').classList.add('innactive');
        }
    }
}