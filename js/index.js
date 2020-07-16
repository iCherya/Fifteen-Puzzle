document.querySelector('.best-result span').textContent = localStorage.getItem('bestResult') || 0;
document.querySelector('.game').addEventListener('mouseup', startGame);

function startGame() {
    const game = new Game({
        container: document.querySelector('.board')
    });
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

function showRecordResult() {
    if (arguments.length === 0) {
        fetch('https://5f103a9700d4ab00161349f0.mockapi.io/scores')
            .then(response => response.json())
            .then(response => {
                bestResult = response[0].score;
                document.querySelector('.top-result span').textContent = bestResult;
            })
    } else {
        document.querySelector('.top-result span').textContent = arguments[0];
    }
}

function sumbitRecordResult(number) {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("score", `${number}`);

    var requestOptions = {
        method: 'PUT',
        headers: myHeaders,
        body: urlencoded,
        redirect: 'follow'
    };

    fetch("https://5f103a9700d4ab00161349f0.mockapi.io/scores/1/", requestOptions);
    showRecordResult(number);
}
let bestResult;
showRecordResult();