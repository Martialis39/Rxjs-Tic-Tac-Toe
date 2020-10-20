import Rx from "rx";

console.log(Rx);

const boardElement = document.querySelector("#board");
const sideButtonsElement = document.querySelector("#buttons");

const winStates = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [2, 4, 6],
  [0, 4, 8],
];

const board = Array(9).fill("");

const getTarget = (event) => event.target;

const getAttribute = (attribute) => (element) => element.dataset[attribute];

const checkBoardForCombination = ({ winStates, side, board }) =>
  winStates
    .map((combination) => {
      return combination.map((index) => board[index] === side).every(Boolean);
    })
    .some(Boolean);

const checkWin = (data) => {
  const playerHasWon = checkBoardForCombination(data);
  const computerSide = data.side === "X" ? "O" : "X";
  const computerHasWon = checkBoardForCombination({
    ...data,
    side: computerSide,
  });
  if (computerHasWon) return "Computer has won!";
  if (playerHasWon) return "Player has won!";
  return false;
};

const updateBoard = ({ board }) => {
  const squares = [...document.querySelectorAll(".square")];
  squares.forEach((square, index) => {
    if (Boolean(board[index])) {
      square.textContent = board[index];
    }
  });
};

const makeMove = (prevState, newState, i) => {
  const { index, side } = newState;
  const board = i === 0 ? newState.board.slice() : prevState.board.slice();
  board[index] = side;
  // Make computer move as well
  const freeSpots = board
    .map((element, index) => {
      if (!Boolean(element)) {
        return index;
      } else {
        return false;
      }
    })
    .filter((index) => index === 0 || Boolean(index));
  const computerSide = side === "X" ? "O" : "X";
  board[freeSpots[0]] = computerSide;

  return { board, side };
};

const getIndex = getAttribute("index");
const getSide = getAttribute("side");

const makeMoveStream = Rx.Observable.fromEvent(boardElement, "click")
  .map(getTarget)
  .map(getIndex);

const sideButtonsStream = Rx.Observable.fromEvent(sideButtonsElement, "click")
  .take(1)
  .map(getTarget)
  .map(getSide);

const boardStream = Rx.Observable.of(board);
const winStatesStream = Rx.Observable.of(winStates);

const gameStream = makeMoveStream
  .combineLatest([sideButtonsStream, boardStream], (index, side, board) => ({
    index,
    side,
    board,
  }))
  .scan(makeMove, {})
  .do(updateBoard)
  .combineLatest(winStatesStream, (boardAndSide, winStates) => ({
    winStates,
    board: boardAndSide.board,
    side: boardAndSide.side,
  }))
  .map(checkWin); //return true or false

gameStream.subscribe((message) => {
  if (message) {
    alert(message);
  }
});
