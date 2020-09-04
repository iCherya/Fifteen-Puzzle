function getLocalGameData() {
    return (
        JSON.parse(localStorage.getItem("localGameData")) || {
            2: {
                isAccessible: true,
            },
            3: {
                isAccessible: false,
            },
            4: {
                isAccessible: false,
            },
            5: {
                isAccessible: false,
            },
            6: {
                isAccessible: false,
            },
            7: {
                isAccessible: false,
            },
            8: {
                isAccessible: false,
            },
            9: {
                isAccessible: false,
            },
        }
    );
}

function renderGameLevels(localGameDataObject) {
    document.querySelector(".controls__main").classList.remove("none");
    document.querySelector(".controls__game").classList.add("none");
    const board = document.querySelector(".board");
    board.innerHTML = "";
    for (let key in localGameDataObject) {
        let levelEl = createElement("div", {
            className: "level__" + localGameDataObject[key].isAccessible + " level",
            tabIndex: 0,
            children: [
                createElement(
                    "div",
                    {
                        className: "level__name",
                    },
                    `${key}x${key}`
                ),
                createElement(
                    "div",
                    {
                        className: "level__score",
                    },
                    (function () {
                        if (localGameDataObject[key].bestScore)
                            return `Score: ${localGameDataObject[key].bestScore}`;
                        return "";
                    })()
                ),
            ],
        });
        levelEl.setAttribute("data-level", key);
        board.append(levelEl);
    }
    if (board.lastChild.querySelector(".level__score").textContent) {
        board.classList.add("game-over");
    }

    document.querySelectorAll(".level__true").forEach((levelEl) => {
        levelEl.addEventListener("click", () =>
            startGame({
                level: +levelEl.getAttribute("data-level"),
                localGameDataObject,
            })
        );
    });
}

renderGameLevels(getLocalGameData());

function startGame(props) {
    const { level, localGameDataObject, moves, board } = props;

    const game = new Game(level, localGameDataObject, moves, board);
    game.render();
    getGlobalScoreData(level);
    document.querySelector(".controls__main").classList.add("none");
    document.querySelector(".controls__game").classList.remove("none");
    document.querySelector(".board").classList.remove("game-over");
    document.querySelector(".game-stats").classList.remove("hidden");
    if (localStorage.getItem("gameProcess")) document.querySelector("#load").disabled = false;
}

function getGlobalScoreData(level) {
    fetch("https://5f103a9700d4ab00161349f0.mockapi.io/scores")
        .then((response) => response.json())
        .then((data) => {
            const globalLevelData = data.find((el) => {
                return el.id == level - 1;
            });
            document.querySelector(".game-stats__global--value").textContent =
                globalLevelData.score;
            document.querySelector(".game-stats__global--value").classList.remove("loading");
            document.querySelector(".game-stats__global--name").textContent = globalLevelData.name;
            document.querySelector(".game-stats__global--name").classList.remove("loading");
        });
}

document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("close")) {
        event.target.parentElement.classList.toggle("hidden");
        event.target.parentElement.classList.toggle("visible");
        document.querySelector(".container").classList.toggle("innactive");
    }

    if (event.target.classList.contains("innactive")) {
        if (document.querySelector(".popup.visible")) {
            let el = document.querySelector(".popup.visible");
            el.classList.toggle("hidden");
            el.classList.toggle("visible");
            event.target.classList.toggle("innactive");
        }
    }
});

function drawLeaderboard() {
    let tableWrapper = document.querySelector(".leaderboard-table-wrapper");

    fetch("https://5f103a9700d4ab00161349f0.mockapi.io/scores")
        .then((response) => response.json())
        .then((data) => {
            const table = createElement("table", {
                className: "leaderboard-table",
                children: [
                    createElement("tr", {
                        children: [
                            createElement("th", {}, "Level"),
                            createElement("th", {}, "Score"),
                            createElement("th", {}, "Player"),
                        ],
                    }),
                ],
            });
            tableWrapper.textContent = "";
            tableWrapper.classList.remove("loading");
            tableWrapper.append(table);
            data.forEach((el) => {
                let rowEl = createElement("tr", {
                    children: [
                        createElement("td", {}, `${el.level}x${el.level}`),
                        createElement("td", {}, el.score),
                        createElement("td", {}, el.name),
                    ],
                });
                table.append(rowEl);
            });
        });
}

function showHidePopup() {
    document.querySelector(`.${this.id}`).classList.toggle("hidden");
    document.querySelector(`.${this.id}`).classList.toggle("visible");
    document.querySelector(".container").classList.toggle("innactive");
}

document.querySelector("#instructions").onclick = showHidePopup;
document.querySelector("#leaderboard").addEventListener("click", function () {
    showHidePopup.apply(this);
    if (!document.querySelector(".leaderboard-table")) {
        drawLeaderboard();
    }
});
