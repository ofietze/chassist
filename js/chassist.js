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
  WHITE,
} from "./chess.js";

var board = null;
var game = new Chess();
const ASSIST_VALUES = new Array(64); // mapping to chess board via SQUARES
const ASSIST_CLASS = "assist";
const LIGHT = "#fff";
const DARK = "#000";
const SLIGHTLY_LIGHT = "#aaa";
const SLIGHTLY_DARK = "#444";

$("#positions").on("change", updateBoard);
$("#loadBtn").on("click", updateBoard);
$("#resetBtn").on("click", () => {
  board = new Chessboard("board", config);
  game.reset();
  calcAssistValues();
});

// utility functions ------------
function validSquare(index) {
  return index > 0 && index < 64;
}

function marklndeces(indeces, color) {
  if (indeces) {
    for (const index of indeces) {
      if (validSquare(index)) {
        color === WHITE ? ASSIST_VALUES[index]++ : ASSIST_VALUES[index]--;
      }
    }
  }
}

function getKeyByValue(object, value) {
  return Object.keys(object).find((key) => object[key] === value);
}

function updateBoard() {
  const selectedPosition = $("#positions").val();
  const fenInput = $("#fenInput").val();
  if (fenInput.length > 0) {
    if (game.load(fenInput)) {
      board = new Chessboard("board", fenInput);
    }
  } else if (selectedPosition) {
    game.load(selectedPosition);
    board = new Chessboard("board", selectedPosition);
  }
  calcAssistValues();
}
// -----------------------------

function calcAssistValues() {
  // zero init array / reset
  for (var i = 0; i < ASSIST_VALUES.length; i++) {
    ASSIST_VALUES[i] = 0;
  }

  for (var i = 0; i < ASSIST_VALUES.length; i++) {
    calcAssistValueForPieceOnSquare(i);
  }

  updateAssistValues();
}

// Checks the possible attacks of a given pawn and returns the indices of the squares it defends/attacks
// The indices refer to SQUARES
function getPawnOffsetIndices(squareIndex, squareContent) {
  var indicesToMark = [];
  // use the square map to easier calculate if a possible move is still on the board
  const squareMapVal = SQUARE_MAP[SQUARES[squareIndex]];
  for (
    let index = 2; // start at 2 to ignore the normal pawn moves
    index < PAWN_OFFSETS[squareContent.color].length;
    index++
  ) {
    const currentOffset =
      squareMapVal + PAWN_OFFSETS[squareContent.color][index];
    const hasValue = Object.values(SQUARE_MAP).includes(currentOffset);
    if (hasValue) {
      const field = getKeyByValue(SQUARE_MAP, currentOffset);
      const indexOfField = getKeyByValue(SQUARES, field);
      indicesToMark.push(indexOfField);
    }
  }
  return indicesToMark;
}
// Checks the possible moves of a given piece and returns the indices of the squares it defends/attacks
// The indices refer to SQUARES
function getPieceOffsetIndices(squareIndex, squareContent) {
  var indicesToMark = [];
  const squareMapVal = SQUARE_MAP[SQUARES[squareIndex]];
  // use the square map to easier calculate if a possible move is still on the board
  for (
    let index = 0;
    index < PIECE_OFFSETS[squareContent.type].length;
    index++
  ) {
    if ([QUEEN, ROOK, BISHOP].includes(squareContent.type)) {
      // check all directions until the edge of the board or until another piece blocks
      for (let j = 1; j < 8; j++) {
        const currentOffset =
          squareMapVal + PIECE_OFFSETS[squareContent.type][index] * j;
        if (!(currentOffset & 0x88)) {
          // Useful way to check if offset is in SQUARE_MAP
          const field = getKeyByValue(SQUARE_MAP, currentOffset);
          const indexOfField = getKeyByValue(SQUARES, field);
          indicesToMark.push(indexOfField);
          if (game.get(field) != null) {
            break; // found a piec that blocks this path from now on
          }
        } else {
          break; // We are out of bounds and dont need to search this direction further
        }
      }
    } else {
      const currentOffset =
        squareMapVal + PIECE_OFFSETS[squareContent.type][index];
      if (!(currentOffset & 0x88)) {
        // Useful way to check if offset is in SQUARE_MAP
        const field = getKeyByValue(SQUARE_MAP, currentOffset);
        const indexOfField = getKeyByValue(SQUARES, field);
        indicesToMark.push(indexOfField);
      }
    }
  }
  return indicesToMark;
}

// Go through all squares and check for pieces. For each piece mark all the squares it defends
function calcAssistValueForPieceOnSquare(squareIndex) {
  const squareContent = game.get(SQUARES[squareIndex]);
  if (squareContent) {
    var indicesToMark = [];
    switch (squareContent?.type) {
      case PAWN:
        indicesToMark.push(...getPawnOffsetIndices(squareIndex, squareContent));
        break;
      case KNIGHT:
      case BISHOP:
      case ROOK:
      case QUEEN:
      case KING:
        indicesToMark.push(
          ...getPieceOffsetIndices(squareIndex, squareContent)
        );
        break;
      default:
        break;
    }
    marklndeces(indicesToMark, squareContent.color);
  }
}

function updateAssistValues() {
  for (const square of SQUARES) {
    var $square = $("#board .square-" + square);
    const piece = game.get(square);
    checkChildrenForAssist($square, SQUARES.indexOf(square));
  }
}

function setAssistColor(square, assistValue) {
  if (assistValue < 0) {
    // black has advantage on square
    $(square).css("background", DARK);
    $(square).css("border-color", LIGHT);
    $(square).css("color", LIGHT);
  } else if (assistValue === 0) {
    // neutral
    $(square).css("background", SLIGHTLY_LIGHT);
    $(square).css("border-color", SLIGHTLY_DARK);
    $(square).css("color", SLIGHTLY_DARK);
  } else {
    // white has advantage
    $(square).css("background", LIGHT);
    $(square).css("border-color", DARK);
    $(square).css("color", DARK);
  }
}

function checkChildrenForAssist(squareDOM, squareIndex) {
  if (squareDOM.length < 1) {
    return; // skip when calles before board is rendered
  }
  var foundAssist = false;
  const children = squareDOM[0].children;
  for (const child of children) {
    if (child.className.includes(ASSIST_CLASS)) {
      foundAssist = true;
      child.innerHTML = ASSIST_VALUES[squareIndex];
      setAssistColor(child, ASSIST_VALUES[squareIndex]);
    }
  }

  if (!foundAssist) {
    const node = document.createElement("div");
    node.innerHTML = ASSIST_VALUES[squareIndex];
    setAssistColor(node, ASSIST_VALUES[squareIndex]);
    node.className = ASSIST_CLASS;
    squareDOM.append(node);
  }
}

function onDrop(source, target, piece, newPos, oldPos, orientation) {
  game.move({ from: source, to: target });
}

var config = {
  draggable: true,
  position: "start",
  onChange: calcAssistValues,
  onDrop: onDrop,
};
board = new Chessboard("board", config);
calcAssistValues();
