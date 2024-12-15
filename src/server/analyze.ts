"use server"

import { readFileSync } from "fs";
import path from "path";
import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

export type position = ({
    square: Square,
    type: PieceSymbol,
    color: Color,
} | null)[][]

export type square = {
    row: number,
    col: number,
}

export type moveRating = "brilliant"|"great"|"best"|"excellent"|"good"|"book"|"inaccuracy"|"mistake"|"miss"|"blunder"

export interface move {
    position: position,
    movement?: square[],
    staticEval: string[],
    bestMove: square[],
    moveRating?: moveRating,
}

function formatTime(seconds: number, noTime: string): string {
    const toTwoDigits = (num: number) => {
        return String(num).padStart(2, '0')
    }

    const getMinutes = (seconds: number) => {
        return [Math.floor(seconds / 60), seconds % 60]
    }

    const getHours = (minutes: number) => {
        return Math.ceil(minutes / 60)
    }

    const getDays = (hours: number) => {
        return Math.ceil(hours / 24)
    }

    const [minutes, restSeconds] = getMinutes(seconds)

    if (minutes) {
        const hours = getHours(minutes)
        if (hours > 2) {
            const days = getDays(hours)
            if (days > 2) {
                return `${days} days`
            }
            return `${hours} ${hours > 1 ? 'hours' : 'hour'}`
        }
        return `${toTwoDigits(minutes)}:${toTwoDigits(restSeconds)}`
    }
    if (restSeconds) return `${toTwoDigits(minutes)}:${toTwoDigits(restSeconds)}`
    return noTime
}

function getNames(headers: Record<string, string>) {
    const NO_NAME = 'Unknown'
    const NO_ELO = '?'

    const whiteName = headers.White ?? NO_NAME
    const blackName = headers.Black ?? NO_NAME

    const whiteElo = headers.WhiteElo ?? NO_ELO
    const blackElo = headers.BlackElo ?? NO_ELO

    const fullWhiteName = `${whiteName} (${whiteElo})`
    const fullBlackName = `${blackName} (${blackElo})`

    return [fullWhiteName, fullBlackName]
}

function getTime(headers: Record<string, string>) {
    const NO_TIME = '--:--'

    const seconds = headers.TimeControl ?? '0'

    const formattedTime = formatTime(Number(seconds), NO_TIME)

    return formattedTime
}

function formatSquare(square: string): square {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

    const col = letters.indexOf(square[0])
    const row = Number(square[1]) - 1

    return {col, row}
}

function cleanProgramListeners(program: ChildProcessWithoutNullStreams) {
    program.stdout.removeAllListeners('data')
}

async function getEvaluation(program: ChildProcessWithoutNullStreams): Promise<number> {
    function formatEvaluation(evaluation: string) {
        const line = evaluation.split('\n').filter(line => line.startsWith('Final evaluation'))[0]
        const number = line ? Number(line.split(/\s+/)[2]) : undefined
        return number
    }

    program.stdin.write(`eval\n`)

    return new Promise((resolve, reject) => {
        program.stdout.on('data', data => {
            const response = formatEvaluation(data.toString())
            
            if (typeof response !== 'undefined') {
                resolve(response)
                cleanProgramListeners(program)
            }
        })

    })
}

function formatMove(evaluation: string) {
    const line = evaluation.split('\n').filter(line => line.startsWith('bestmove'))[0]
    const move = line?.split(/\s+/)[1]
    if (move === '(none)') return []

    const movement = move ? [move.slice(0, 2), move.slice(2, 4)].map(square => {
        const {col, row} = formatSquare(square)

        return {col, row}
    }) : undefined
    return movement
}

function formatStaticEval(evaluation: string) {
    const line = evaluation.split('\n').filter(line => line.startsWith('info')).pop()
    const fields = line?.split(/\s+/)

    const staticEval = fields?.slice(fields?.indexOf('score')+1, fields.indexOf('nodes'))

    return staticEval
}

async function getBestMove(program: ChildProcessWithoutNullStreams): Promise<{ bestMove: square[], staticEval: string[] }> {

    program.stdin.write(`go depth 10\n`)

    let staticEval: string[]
    return new Promise((resolve, reject) => {
        program.stdout.on('data', data => {
            const line = data.toString()

            const bestMove = formatMove(line)
            staticEval = formatStaticEval(line) ?? staticEval

            if (typeof bestMove !== 'undefined') {
                resolve({ bestMove, staticEval })
                cleanProgramListeners(program)
            }
        })

    })
}

function getMoveRating(staticEval: string[], previousStaticEval: string[], bestMove: square[], movement: square[], color: Color): moveRating {
    function getStandardRating(guide: [moveRating, boolean][]) {
        const valid = guide.filter(rating => rating[1])[0]
        return valid ? valid[0] : "blunder"
    }

    function isStandardRating(guide: [moveRating, boolean][], moveRating: moveRating) {
        return guide.filter(rating => rating[0] === moveRating)[0][1]
    }

    function losingGeatAdvantage(evaluation: number, previousEvaluation: number, color: Color) {
        const GREAT_ADVANTAGE = 2

        if (color === "w") {
            return previousEvaluation >= GREAT_ADVANTAGE && evaluation < GREAT_ADVANTAGE
        } else {
            return previousEvaluation <= -GREAT_ADVANTAGE && evaluation > -GREAT_ADVANTAGE
        }
    }

    if (staticEval[0] === 'mate') return 'brilliant'

    const staticEvalAmount = Number(staticEval[1]) / 100 * (color === 'w' ? -1 : 1)
    const staticPreviousEvalAmount = Number(previousStaticEval[1]) / 100 * (color === 'b' ? -1 : 1)

    // best
    const isBest = movement.every((move, i) => {
        return JSON.stringify(move) === JSON.stringify(bestMove[i])
    })
    if (isBest) return 'best'

    // standard
    const evaluationDiff = color === "w" ? staticPreviousEvalAmount - staticEvalAmount : staticEvalAmount - staticPreviousEvalAmount
    const guide: [moveRating, boolean][] = [
        ["excellent", evaluationDiff < 0.4],
        ["good", evaluationDiff < 0.8],
        ["inaccuracy", evaluationDiff < 4],
    ]

    // mistake
    if (isStandardRating(guide, "inaccuracy") && losingGeatAdvantage(staticEvalAmount, staticPreviousEvalAmount, color)) {
        return 'mistake'
    }

    return getStandardRating(guide)
}

async function analyze(program: ChildProcessWithoutNullStreams, fen: string) {
    program.stdin.write(`position fen ${fen}\n`)

    // const evaluation = await getEvaluation(program)
    const { bestMove, staticEval } = await getBestMove(program)

    return { bestMove, staticEval }
}

export async function parsePGN() {
    const pgnFile = readFileSync(path.join(process.cwd(), 'test/pgn/game1.pgn'), 'utf-8')

    const chess = new Chess()
    chess.loadPgn(pgnFile)

    const headers = chess.header()

    const names = getNames(headers)
    const time = getTime(headers)

    const metadata = {names, time}

    const moves: move[] = []

    const stockfishFile = path.join(process.cwd(), 'stockfish/stockfish-ubuntu-x86-64-avx2')
    const stockfish = spawn(stockfishFile)

    let moveNumber = 0, previousStaticEval = ['cp', '0'], previousBestMove
    for (const move of chess.history({verbose: true})) {
        if (moveNumber === 0) {
            chess.load(move.before)
            const position = chess.board()
            const { bestMove } = await analyze(stockfish, move.before)
            moves.push({
                position,
                staticEval: ['cp', '0'],
                bestMove,
            })
            previousBestMove = bestMove
        }
        chess.load(move.after)

        const position = chess.board()

        const movement: square[] = [move.from, move.to].map(square => {
            const {col, row} = formatSquare(square)

            return {col, row}
        })

        if (chess.isCheckmate()) {
            var staticEval = ["mate"]
            var bestMove: square[] = []
        } else {
            var { staticEval, bestMove } = await analyze(stockfish, move.after)
        }

        const moveRating = getMoveRating(staticEval, previousStaticEval, previousBestMove ?? [], movement, move.color)

        moves.push({
            position,
            movement,
            staticEval,
            bestMove,
            moveRating,
        })

        previousBestMove = bestMove
        previousStaticEval = staticEval
        moveNumber++
    }

    return {metadata, moves}
}