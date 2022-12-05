'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'

const gElCollectedSpan = document.querySelector('.collected span')
const gElNeighborsSpan = document.querySelector('h1 span')

// Model:
var gBoard
var gGamerPos
var gEmptyCells
var gRandBallInterval
var gRandGlueInterval
var gCollectedBallsCount
var gNeighborsCount
var gCurrGlueLocation
var isGlued = false

function onInitGame() {
    gNeighborsCount = 0
    gElNeighborsSpan.innerText = gNeighborsCount
    gGamerPos = {
        i: 2,
        j: 9
    }
    gBoard = buildBoard()
    renderBoard(gBoard)
    gEmptyCells = getEmptyCells(gBoard)
    gRandBallInterval = setInterval(renderRandomBall, 1000)
    gRandGlueInterval = setInterval(renderGlue, 2000)


    // countNeighbors(gGamerPos)

    gCollectedBallsCount = 0
    gElCollectedSpan.innerText = gCollectedBallsCount
}

function renderGlue() {
    var randomCell = getRandEmptyCell(gEmptyCells)
    gCurrGlueLocation = {
        i: randomCell[0].i,
        j: randomCell[0].j
    }
    if (gBoard[randomCell[0].i][randomCell[0].j].gameElement === GAMER || gBoard[randomCell[0].i][randomCell[0].j].gameElement === BALL) {
        gEmptyCells.push(randomCell[0])
        return
    }
    // update Model
    gBoard[randomCell[0].i][randomCell[0].j].gameElement = GLUE
    // update DOM
    renderCell(randomCell[0], GLUE_IMG)
    setTimeout(() => {
        gEmptyCells.push(randomCell[0])
        if (gBoard[gCurrGlueLocation.i][gCurrGlueLocation.j].gameElement === GAMER) return
        // update Model
        gBoard[gCurrGlueLocation.i][gCurrGlueLocation.j].gameElement = null
        // update DOM
        renderCell(gCurrGlueLocation, '')
    }, 1250)

}

function renderRandomBall() {
    var randomCell = getRandEmptyCell(gEmptyCells)
    if (gEmptyCells.length === 0) {
        clearInterval(gRandBallInterval)
        clearInterval(gRandGlueInterval)
    }
    // update Model
    gBoard[randomCell[0].i][randomCell[0].j].gameElement = BALL
    // update DOM
    renderCell(randomCell[0], BALL_IMG)
}

function getRandEmptyCell(emptyCells) {

    const randomIdx = getRandomIntInclusive(0, gEmptyCells.length)
    var emptyCell = emptyCells[randomIdx]
    if (gBoard[emptyCell.i][emptyCell.j].gameElement === GAMER || gBoard[emptyCell.i][emptyCell.j].gameElement === GLUE) {
        return
    }
    return emptyCells.splice(randomIdx, 1)
}

function getEmptyCells(board) {
    const emptyCells = []

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            if (currCell.type === WALL || currCell.gameElement === GAMER || currCell.gameElement === BALL) continue
            if (currCell.type === FLOOR) {
                var cellClass = {
                    i,
                    j
                }
                emptyCells.push(cellClass)
            }
        }
    }
    return emptyCells
}

function buildBoard() {
    const board = []
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < 10; i++) {
        board[i] = []
        for (var j = 0; j < 12; j++) {
            board[i][j] = {
                type: FLOOR,
                gameElement: null
            }
            if (i === 0 || i === 9 || j === 0 || j === 11) {
                board[i][j].type = WALL
            }
        }
    }
    // DONE: Place the gamer and two balls
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[0][5].type = FLOOR
    board[9][5].type = FLOOR
    board[5][0].type = FLOOR
    board[5][11].type = FLOOR

    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]

            var cellClass = getClassName({
                i: i,
                j: j
            })

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }

    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    console.log('isGlued:', isGlued)
    if (isGlued) return
    console.log(i, j)
    const targetCell = gBoard[i][j]
    const isBall = targetCell.gameElement === BALL
    const isGlue = targetCell.gameElement === GLUE
    if (targetCell.type === WALL) return

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)


    //TUNNELS: If the clicked Cell is one of the two allowed
    if (jAbsDiff === gBoard[0].length - 1 || iAbsDiff === gBoard.length - 1 || (iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {
        if (isGlue) {
            console.log('Youre glued');
            isGlued = true
            setTimeout(() => {
                isGlued = false
            }, 3000)
        }
        if (isBall) {
            eatBallAndCheckWin()
        }
        // DONE: Move the gamer
        // REMOVING FROM
        // update Model
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // update DOM
        renderCell(gGamerPos, '')

        // ADD TO
        // update Model
        targetCell.gameElement = GAMER
        gGamerPos = {
            i,
            j
        }
        // update DOM
        renderCell(gGamerPos, GAMER_IMG)
    }

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
    countNeighbors(gGamerPos)
    gElNeighborsSpan.innerText = gNeighborsCount
}

// Move the player by keyboard arrows
function onHandleKey(event) {
    const i = gGamerPos.i
    const j = gGamerPos.j

    switch (event.key) {
        case 'ArrowLeft':
            if (j === 0) moveTo(i, 11)
            else moveTo(i, j - 1)
            break
        case 'ArrowRight':
            if (j === 11) moveTo(i, 0)
            else moveTo(i, j + 1)
            break
        case 'ArrowUp':
            if (i === 0) moveTo(9, j)
            else moveTo(i - 1, j)
            break
        case 'ArrowDown':
            if (i === 9) moveTo(0, j)
            else moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function restartGame() {
    onInitGame()
    hideElement('.restart-btn')
}

function hideElement(selector) {
    const el = document.querySelector(selector)
    el.classList.add('hidden')
}

function showElement(selector) {
    const el = document.querySelector(selector)
    el.classList.remove('hidden')
}


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function eatBallAndCheckWin() {
    gCollectedBallsCount++
    gElCollectedSpan.innerText = gCollectedBallsCount
    if (gCollectedBallsCount === 83) {
        showElement('.restart-btn')
        clearInterval(gRandBallInterval)
    }
}

function countNeighbors(currGamerPos) {
    gNeighborsCount = 0
    for (let i = currGamerPos.i - 1; i <= currGamerPos.i + 1; i++) {
        if (i < 0 || i > gBoard.length - 1) continue
        for (let j = currGamerPos.j - 1; j <= currGamerPos.j + 1; j++) {
            if (j < 0 || j > gBoard[0].length - 1) continue
            const neighbor = gBoard[i][j]
            if (neighbor.gameElement === BALL) {
                gNeighborsCount++
            }
        }
    }
}