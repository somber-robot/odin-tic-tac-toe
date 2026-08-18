document.addEventListener("keydown", (e) => {
    if (e.key == "Escape") e.preventDefault();
});

const Modes = Object.freeze({
    PVP: 'person versus person',
    PVC: 'person versus computer'
});

const Symbols = Object.freeze({
    ONE: "X",
    TWO: "O",
    NONE: ""
});

const Pages = Object.freeze({
    MENU: "menu",
    NAME: "name",
    GAME: "game"
});

const UIChange = Object.freeze({
    P1: "player 1 wins",
    P2: "player 2 wins",
    TIE: "tie",
    RESET: "reset",
    SWITCH: "switch turn"
});

let menuPage = (() => {
    let modal = document.querySelector("#initial");

    let pvpBtn = document.querySelector("#pvp");
    let pvcBtn = document.querySelector("#pvc");

    pvcBtn.addEventListener("click", () => {
        gamePage.mode.mode = Modes.PVC;
        setPage(menuPage, namePage);
    });

    pvpBtn.addEventListener("click", () => {
        gamePage.mode.mode = Modes.PVP;
        setPage(menuPage, namePage);
    }); 

    let open = () => {modal.showModal();};
    let close = () => {modal.close();};

    return {modal, open, close};
})();

let namePage = (() => {
    let modal = document.querySelector("#name");

    let one = document.querySelector("#name-one");
    let two = document.querySelector("#name-two");

    let back = document.querySelector("#name-back");
    back.addEventListener("click", () => {
        setPage(namePage, menuPage);
    });

    let confirm = document.querySelector("#name-confirm");
    confirm.addEventListener("click", () => {
        oneVal = (one.value === "") ? "P1" : one.value;
        twoVal = (two.value === "") ? "P2" : two.value;
        gamePage.p1.name = oneVal;
        gamePage.p2.name = twoVal;
        setPage(namePage, gamePage);
    });

    let open = () => {
        modal.showModal();
        
        one.value = "";
        two.value = "";

        if (gamePage.mode.mode === Modes.PVC){
            two.disabled = true;
            two.value = "CPU";
        }else{
            two.disabled = false;
        }
    };
    let close = () => {modal.close();};

    return {modal, open, close};
})();

let gamePage = (() => {
    let modal = document.querySelector("#game");

    function Player(name, symbol){
        let getSymbol = () => symbol;
        return {name, getSymbol};
    }

    function Mode(mode){return {mode};}

    let mode = Mode(null);
    let p1 = Player("", 1);
    let p2 = Player("", 2);
    let turn = null;
    let active = false;

    let turnLabel = document.querySelector("#turn-label");

    let round = document.querySelector("#restart");
    let game = document.querySelector("#new-game");

    round.addEventListener("click", () => {
        clearBoard();
        active = true;
        setTurn(p1);
        adjustUi(UIChange.RESET);
    });

    game.addEventListener("click", () => {
        setPage(gamePage, menuPage);
        clearBoard();
        adjustUi(UIChange.RESET);
    });

    let tiles = Array.from(document.querySelectorAll('.tile'));

    for (const [idx, tile] of tiles.entries()){
        tile.addEventListener("click", () => {
            if (!active || tile.innerHTML !== Symbols.NONE) return;
            setSpace(idx, turn.getSymbol());
            spaces = getAvailableSpaces();
            result = checkWin(turn.getSymbol())
            if (result){
                active = false;
                adjustUi((turn === p1) ? UIChange.P1 : UIChange.P2, result);
                return;
            }

            if (spaces.length === 0){
                active = false;
                adjustUi(UIChange.TIE);
                return;
            }

            if (mode.mode === Modes.PVP)
                setTurn((turn === p1) ? p2 : p1);
            else{
                active = false;
                setTurn(p2);
                setTimeout(() => {
                    active = true;
                    choice = spaces[Math.floor(Math.random() * spaces.length)];
                    setSpace(choice, p2.getSymbol());
                    setTurn(p1);
                    result = checkWin(p2.getSymbol())
                    if (result) {
                        active = false;
                        adjustUi(UIChange.P2, result);
                    }
                }, 500);
            }
        });

        tile.addEventListener("mouseenter", () => {
            if (!active || tile.innerHTML !== Symbols.NONE) return;
            tile.classList.add("tile-hover");
        });

        tile.addEventListener("mouseleave", () => {
            tile.classList.remove("tile-hover");
        });
    }

    let board = [0,0,0,0,0,0,0,0,0];

    let getAvailableSpaces = () => {
            return board.map((elem, idx) => (elem === 0) ? idx : -1)
                        .filter(idx => idx !== -1);
    };

    let setSpace = (index, symbol) => {
        board[index] = symbol;
        updateGrid();
    };

    let clearBoard = () => {
        board = [0,0,0,0,0,0,0,0,0];
        updateGrid();
    };

    let updateGrid = () => {
        for (const [idx, tile] of tiles.entries()) {
            if (board[idx] === 1){
                tile.innerHTML = Symbols.ONE;
            }else if (board[idx] === 2){
                tile.innerHTML = Symbols.TWO;
            }else{
                tile.innerHTML = Symbols.NONE;
            }
            tile.classList.remove("tile-hover");
        }
    };

    let checkWin = (symbol) => {
        const rows = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
        for (const row of rows) {
            let match = true;
            for (const index of row) {
                if (board[index] != symbol) match = false;
            }
            if (match) return row;
        }
        return false;
    };

    let setTurn = (newturn) => {
        turn = newturn;
        turnLabel.innerHTML = `${newturn.name}'s turn`
    };

    let adjustUi = (type, other) => {
        switch (type) {
            case UIChange.P1:
                turnLabel.innerHTML = `${p1.name} WINS!`;
                for (const [idx, tile] of tiles.entries()){
                    if (other.includes(idx)) tile.classList.add("win-tile");
                }
                break;
            case UIChange.P2:
                turnLabel.innerHTML = `${p2.name} WINS!`;
                for (const [idx, tile] of tiles.entries()){
                    if (other.includes(idx)) tile.classList.add("win-tile");
                }
                break;
            case UIChange.TIE:
                turnLabel.innerHTML = `It's a TIE!`;
                break;
            case UIChange.RESET:
                for (const tile of tiles){
                    tile.classList.remove("win-tile");
                }
                break;
        }
    }

    let open = () => {
        modal.showModal();
        active = true;
        setTurn(p1);
    };
    let close = () => {modal.close();};

    return {modal, open, close, p1, p2, mode};
})();

function setPage(current, next){
    if (current) current.close();
    next.open();
}

setPage(null, menuPage);