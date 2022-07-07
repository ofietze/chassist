import {
  BISHOP,
  PAWN,
  PAWN_OFFSETS,
  PIECE_OFFSETS,
  QUEEN,
  ROOK,
  SQUARES,
  SQUARE_MAP,
  WHITE,
} from "./chess.js";

const ASSIST_VALUES = new Array(64); // mapping to chess board via SQUARES
const ASSIST_CLASS = "assist";
const LIGHT = "#fff";
const DARK = "#000";
const SLIGHTLY_LIGHT = "#aaa";
const SLIGHTLY_DARK = "#444";
const config = {
  draggable: true,
  position: "start",
  onDrop: onDrop,
};
var board = new Chessboard("board", config);
calcAssistValues();

$("#fenInput").on("change", updateBoard);
$("#xBtn").on("click", () => {
  $("#fenInput").val("");
  updateBoard();
});

// utility functions ------------
function onDrop(source, target, piece, newPos, oldPos, orientation) {
  board.move(source + "-" + target);
  calcAssistValues();
}

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
  const fenInput = $("#fenInput").val();
  const updateConfig = Object.assign({}, config);
  updateConfig.position = fenInput;
  if (fenInput.length > 0) {
    board = new Chessboard("board", updateConfig);
  } else {
    board = new Chessboard("board", config);
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
function getPawnOffsetIndices(squareIndex, color) {
  var indicesToMark = [];
  // use the square map to easier calculate if a possible move is still on the board
  const squareMapVal = SQUARE_MAP[SQUARES[squareIndex]];
  for (
    let index = 2; // start at 2 to ignore the normal pawn moves
    index < PAWN_OFFSETS[color].length;
    index++
  ) {
    const currentOffset = squareMapVal + PAWN_OFFSETS[color][index];
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
function getPieceOffsetIndices(squareIndex, type) {
  var indicesToMark = [];
  const squareMapVal = SQUARE_MAP[SQUARES[squareIndex]];
  // use the square map to easier calculate if a possible move is still on the board
  for (let index = 0; index < PIECE_OFFSETS[type].length; index++) {
    if ([QUEEN, ROOK, BISHOP].includes(type)) {
      // check all directions until the edge of the board or until another piece blocks
      for (let j = 1; j < 8; j++) {
        const currentOffset = squareMapVal + PIECE_OFFSETS[type][index] * j;
        if (!(currentOffset & 0x88)) {
          // Useful way to check if offset is in SQUARE_MAP
          const field = getKeyByValue(SQUARE_MAP, currentOffset);
          const indexOfField = getKeyByValue(SQUARES, field);
          indicesToMark.push(indexOfField);
          if (board.position()[field] != null) {
            break; // found a piece that blocks this path from now on
          }
        } else {
          break; // We are out of bounds and dont need to search this direction further
        }
      }
    } else {
      // For these pieces we just need to iterate through their possible moves
      const currentOffset = squareMapVal + PIECE_OFFSETS[type][index];
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
  var squareContent = board.position()[SQUARES[squareIndex]];
  if (squareContent) {
    squareContent = squareContent.toLowerCase().split("");
    var indicesToMark = [];
    if (squareContent[1] === PAWN) {
      indicesToMark.push(
        ...getPawnOffsetIndices(squareIndex, squareContent[0])
      );
    } else {
      indicesToMark.push(
        ...getPieceOffsetIndices(squareIndex, squareContent[1])
      );
    }
    marklndeces(indicesToMark, squareContent[0]);
  }
}

function updateAssistValues() {
  for (const square of SQUARES) {
    var $square = $("#board .square-" + square);
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
    return; // skip when called before board is rendered
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
