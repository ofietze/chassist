import {
  Chess,
  SQUARES,
  PAWN,
  ROOK,
  KING,
  KNIGHT,
  QUEEN,
  BISHOP,
  PAWN_OFFSETS,
  PIECE_OFFSETS,
  SQUARE_MAP,
} from "./chess.js";

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
    calcAssistValueForPieceOnSquare(i);
  }

  updateAssistValues();
}

function validSquare(index) {
  return index > 0 && index < 64;
}

function marklndeces(indeces) {
  for (const index of indeces) {
    if (validSquare(index)) ASSIST_VALUES[index]++;
  }
}

// Go through all squares and check for pieces. For each piece mark all the squares it defends
function calcAssistValueForPieceOnSquare(squareIndex) {
  const squareContent = game.get(SQUARES[squareIndex]);
  if (squareContent) {
    switch (squareContent?.type) {
      case PAWN:
        if (squareContent.color === "w") {
          // top left square is -9, top right is -7
          var possibleIndeces = [squareIndex - 9, squareIndex - 7];
          marklndeces(possibleIndeces);
        } else {
        }
        break;
      case KNIGHT:
        break;
      case BISHOP:
        break;
      case ROOK:
        break;
      case QUEEN:
        break;
      case KING:
        break;
      default:
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
