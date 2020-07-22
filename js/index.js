let localResultTable = JSON.parse(localStorage.getItem('localResultTable')) || {
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
};

function renderGameLevels(levelsObject, board) {
    board.innerHTML = '';
    let levelClassName = '';
    for (let key in levelsObject) {
        if (levelsObject[key].isAccessible) {
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
    document.querySelectorAll('.level__enabled').forEach(el => {
        el.addEventListener('click', () => startGame({
            level: +el.getAttribute('data-level'),
            localResultTable,
        }));
    });
}

renderGameLevels(localResultTable, document.querySelector('.board'));

function startGame(props) {
    const {
        level,
        localResultTable
    } = props;
    const game = new Game(level, localResultTable);
    game.render();
}


function showHideInstructions() {
    document.querySelector('.instructions-info').classList.toggle('hidden');
    document.querySelector('.container').classList.toggle('innactive');
}

document.querySelector('#instructions').onclick = showHideInstructions;
document.querySelector('.instructions-info__close').onclick = showHideInstructions;
document.body.addEventListener('click', function (event) {
    if (event.target === document.querySelector('.container.innactive')) {
        showHideInstructions();
    }
})




// function showRecordResult() {
//     if (arguments.length === 0) {
//         fetch('https://5f103a9700d4ab00161349f0.mockapi.io/scores')
//             .then(response => response.json())
//             .then(response => {
//                 bestResult = response[0].score;
//                 document.querySelector('.top-result span').textContent = bestResult;
//             })
//     } else {
//         document.querySelector('.top-result span').textContent = arguments[0];
//     }
// }

// function sumbitRecordResult(number) {
//     var myHeaders = new Headers();
//     myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

//     var urlencoded = new URLSearchParams();
//     urlencoded.append("score", `${number}`);

//     var requestOptions = {
//         method: 'PUT',
//         headers: myHeaders,
//         body: urlencoded,
//         redirect: 'follow'
//     };

//     fetch("https://5f103a9700d4ab00161349f0.mockapi.io/scores/1/", requestOptions);
//     showRecordResult(number);
// }
// let bestResult;
// showRecordResult();