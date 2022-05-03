import { Chess, SQUARES } from "./chess.js";

var board = null;
var game = new Chess();
const ASSIST_VALUES = new Array(64); // mapping to chess board via SQUARES
const ASSIST_CLASS = "assist";
$("#assistBtn").on("click", calcAssistValues);

function calcAssistValues() {
  // zero init array
  for (var i = 0; i < ASSIST_VALUES.length; i++) {
    ASSIST_VALUES[i] = 0;
  }

  for (var i = 0; i < ASSIST_VALUES.length; i++) {
    calcAssistValueForPieceOnSquare(SQUARES[i]);
  }

  updateAssistValues();
}

function calcAssistValueForPieceOnSquare(square) {
  const squareContent = game.get(square);
  if (squareContent) {
    switch (squareContent.piece) {
      case game.PAWN:
        break;
      case game.KNIGHT:
        break;
      case game.BISHOP:
        break;
      case game.ROOK:
        break;
      case game.QUEEN:
        break;
      case game.KING:
        break;
    }
  }
}

function updateAssistValues() {
  for (const square of SQUARES) {
    var $square = $("#myBoard .square-" + square);
    const piece = game.get(square);
    checkChildrenForAssist($square, SQUARES.indexOf(square));
  }
}

function checkChildrenForAssist(squareDOM, squareIndex) {
  var foundAssist = false;
  const children = squareDOM[0].children;
  for (const child of children) {
    if (child.className.includes(ASSIST_CLASS)) {
      foundAssist = true;
      child.innerHTML = ASSIST_VALUES[squareIndex];
    }
  }

  if (!foundAssist) {
    const node = document.createElement("div");
    node.innerHTML = ASSIST_VALUES[squareIndex];
    node.className = ASSIST_CLASS;
    squareDOM.append(node);
  }
}
var config = {
  draggable: true,
  position: "start",
};
board = Chessboard("myBoard", config);
// --- End Example JS ----------------------------------------------------------
