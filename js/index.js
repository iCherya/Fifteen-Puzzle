function getLocalGameData() {
    return JSON.parse(localStorage.getItem('localGameData')) || {
        '2': {
            isAccessible: true,
        },
        '3': {
            isAccessible: false,
        },
        '4': {
            isAccessible: false,
        },
        '5': {
            isAccessible: false,
        },
        '6': {
            isAccessible: false,
        },
        '7': {
            isAccessible: false,
        },
        '8': {
            isAccessible: false,
        },
        '9': {
            isAccessible: false,
        },
    }
}

const localGameData = getLocalGameData();

function renderGameLevels(localGameDataObject, board) {
    board.innerHTML = '';
    let levelClassName = '';
    for (let key in localGameDataObject) {
        if (localGameDataObject[key].isAccessible) {
            levelClassName = 'level__enabled';
        } else {
            levelClassName = 'level__disabled';
        }

        let levelEl = createElement('div', {
            className: levelClassName + ' level',
        }, `${key}x${key}`);
        levelEl.setAttribute('data-level', key);

        board.append(levelEl);
    }
    document.querySelectorAll('.level__enabled').forEach(levelEl => {
        levelEl.addEventListener('click', () => startGame({
            level: +levelEl.getAttribute('data-level'),
            localGameDataObject,
        }));
    });
}

renderGameLevels(localGameData, document.querySelector('.board'));

function startGame(props) {
    const {
        level,
        localGameDataObject
    } = props;
    const game = new Game(level, localGameDataObject);
    game.render();
    getGlobalScoreData(level);
}



function getGlobalScoreData(level) {
    fetch('https://5f103a9700d4ab00161349f0.mockapi.io/scores')
        .then(response => response.json())
        .then(data => {
            const globalLevelData = data
                .find(el => {
                    return el.id == level - 1;
                });
            document.querySelector('.game-stats__global--value').textContent = globalLevelData.score;
            document.querySelector('.game-stats__global--value').classList.remove('loading');
            document.querySelector('.game-stats__global--name').textContent = globalLevelData.name;
            document.querySelector('.game-stats__global--name').classList.remove('loading');
        })
}


function showHideInstructions() {
    document.querySelector('.instructions-info').classList.toggle('hidden');
    document.querySelector('.container').classList.toggle('innactive');
}

document.querySelector('#instructions').onclick = showHideInstructions;
document.querySelector('.instructions-info .close').onclick = showHideInstructions;

document.body.addEventListener('click', function (event) {
    if (event.target === document.querySelector('.container.innactive')) {
        showHideInstructions();
    }
})