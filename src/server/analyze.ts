"use server"

import { readFileSync } from "fs";
import path from "path";
import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
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

export type moveRating = "brilliant" | "great" | "best" | "excellent" | "good" | "book" | "inaccuracy" | "mistake" | "miss" | "blunder"

export interface move {
    position: position,
    movement?: square[],
    staticEval: string[],
    bestMove: square[],
    moveRating?: moveRating,
    color: Color,
}

function getPlayers(headers: Record<string, string>) {
    const NO_NAME = 'Unknown'
    const NO_ELO = '?'

    const whiteName = headers.White ?? NO_NAME
    const blackName = headers.Black ?? NO_NAME

    const whiteElo = headers.WhiteElo ?? NO_ELO
    const blackElo = headers.BlackElo ?? NO_ELO

    return [{ name: whiteName, elo: whiteElo }, { name: blackName, elo: blackElo }]
}

function getTime(headers: Record<string, string>) {
    const seconds = headers.TimeControl ?? "0"
    return Number(seconds)
}

function formatSquare(square: string): square {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

    const col = letters.indexOf(square[0])
    const row = Number(square[1]) - 1

    return { col, row }
}

function cleanProgramListeners(program: ChildProcessWithoutNullStreams) {
    program.stdout.removeAllListeners('data')
}

function formatMove(evaluation: string) {
    const line = evaluation.split('\n').filter(line => line.startsWith('bestmove'))[0]
    const move = line?.split(/\s+/)[1]
    if (move === '(none)') return []

    const movement = move ? [move.slice(0, 2), move.slice(2, 4)].map(square => {
        const { col, row } = formatSquare(square)

        return { col, row }
    }) : undefined
    return movement
}

function formatStaticEval(evaluation: string) {
    const line = evaluation.split('\n').filter(line => line.startsWith('info')).pop()
    const fields = line?.split(/\s+/)

    const staticEval = fields?.slice(fields?.indexOf('score') + 1, fields.indexOf('nodes'))

    return staticEval
}

async function getBestMove(program: ChildProcessWithoutNullStreams, depth: number): Promise<{ bestMove: square[], staticEval: string[] }> {

    program.stdin.write(`go depth ${depth}\n`)

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

function getMoveRating(staticEval: string[], previousStaticEval: string[], previousPreviousStaticEval: string[], bestMove: square[], movement: square[], fen: string, color: Color, sacrifice: boolean, previousSacrice: boolean): moveRating {
    const winning = Number(staticEval[1]) < 0
    const previousWinig = Number(previousStaticEval[1]) > 0

    const previousColor = color === 'w' ? 'b' : 'w'

    function getStandardRating(diff: number) {
        let rating: moveRating = 'excellent'
        if (diff >= 0.4) rating = 'good'
        if (diff >= 0.8) rating = 'inaccuracy'
        if (diff >= 4) rating = 'blunder'

        return rating
    }

    function losingGeatAdvantage(evaluation: number, previousEvaluation: number, color: Color) {
        const GREAT_ADVANTAGE = 2

        if (color === "w") {
            return previousEvaluation >= GREAT_ADVANTAGE && evaluation < GREAT_ADVANTAGE
        } else {
            return previousEvaluation <= -GREAT_ADVANTAGE && evaluation > -GREAT_ADVANTAGE
        }
    }

    function givingGeatAdvantage(evaluation: number, previousEvaluation: number, color: Color) {
        const GREAT_ADVANTAGE = -2

        if (color === "w") {
            return previousEvaluation >= GREAT_ADVANTAGE && evaluation < GREAT_ADVANTAGE
        } else {
            return previousEvaluation <= -GREAT_ADVANTAGE && evaluation > -GREAT_ADVANTAGE
        }
    }

    function keepMating(mateIn: number, previousMateIn: number, color: Color) {
        if (color === "w") {
            return mateIn < previousMateIn
        } else {
            return mateIn > previousMateIn
        }
    }

    function advanceMate(mateIn: number, previousMateIn: number, color: Color) {
        if (color === "w") {
            return mateIn > previousMateIn
        } else {
            return mateIn < previousMateIn
        }
    }

    const staticEvalAmount = Number(staticEval[1]) / 100 * (color === 'w' ? -1 : 1)
    const previousStaticEvalAmount = Number(previousStaticEval[1]) / 100 * (color === 'b' ? -1 : 1)
    const previousPreviousStaticEvalAmount = Number(previousPreviousStaticEval[1]) / 100 * (color === 'w' ? -1 : 1)

    const isNotMateRelated = staticEval[0] !== 'mate' && previousStaticEval[0] !== 'mate'
    const wasNotMateRelated = previousStaticEval[0] !== 'mate' && previousPreviousStaticEval[0] !== 'mate'

    
    // book
    const openingsFile = readFileSync(path.join(process.cwd(), 'openings/openings.json'), 'utf-8')
    const openings = JSON.parse(openingsFile)
    
    const openingName = openings[fen]
    if (openingName) return 'book'
    
    // standard
    const evaluationDiff = color === "w" ? previousStaticEvalAmount - staticEvalAmount : staticEvalAmount - previousStaticEvalAmount
    const standardRating = getStandardRating(evaluationDiff)
    
    const previousEvaluationDiff = color === "b" ? previousPreviousStaticEvalAmount - previousStaticEvalAmount : previousStaticEvalAmount - previousPreviousStaticEvalAmount
    const previousStandardRating = getStandardRating(previousEvaluationDiff)


    // brilliant - sacrifice
    const previousBrilliant = wasNotMateRelated && previousSacrice && previousStandardRating === 'excellent'
    if (!previousBrilliant && isNotMateRelated && standardRating === 'excellent' && sacrifice) return 'brilliant'

    // brilliant - start mate
    if (sacrifice && previousStaticEval[0] !== 'mate' && staticEval[0] === 'mate' && winning) return 'brilliant'

    // brilliant - right move to mate
    if (sacrifice && previousStaticEval[0] === 'mate' && staticEval[0] === 'mate' && keepMating(staticEvalAmount, previousStaticEvalAmount, color) && winning) return 'brilliant'

    // great - gaining advantage
    if (
        wasNotMateRelated
        &&
        isNotMateRelated
        &&
        standardRating === 'excellent'
        &&
        (
            (previousStandardRating === 'inaccuracy' || previousStandardRating === 'blunder')
            &&
            (losingGeatAdvantage(previousStaticEvalAmount, previousPreviousStaticEvalAmount, previousColor) || givingGeatAdvantage(previousStaticEvalAmount, previousPreviousStaticEvalAmount, previousColor))
        )
    ) return 'great'

    // best
    const isBest = movement.every((move, i) => {
        return JSON.stringify(move) === JSON.stringify(bestMove[i])
    })
    if (isBest) return 'best'

    // excellent - mate
    if (staticEval[0] === 'mate' && !staticEval[1]) return 'excellent'

    // excellent - start mate
    if (previousStaticEval[0] !== 'mate' && staticEval[0] === 'mate' && winning) return 'excellent'

    // excellent - right move to mate
    if (previousStaticEval[0] === 'mate' && staticEval[0] === 'mate' && keepMating(staticEvalAmount, previousStaticEvalAmount, color) && winning) return 'excellent'

    // good - delay mate
    if (previousStaticEval[0] === 'mate' && staticEval[0] === 'mate' && !keepMating(staticEvalAmount, previousStaticEvalAmount, color) && winning) return 'good'

    // good - advance mate
    if (previousStaticEval[0] === 'mate' && staticEval[0] === 'mate' && advanceMate(staticEvalAmount, previousStaticEvalAmount, color) && !winning) return 'good'

    // mistake - lose advantage
    if (isNotMateRelated && standardRating === "inaccuracy" && (losingGeatAdvantage(staticEvalAmount, previousStaticEvalAmount, color) || givingGeatAdvantage(staticEvalAmount, previousStaticEvalAmount, color))) return 'mistake'

    // mistake - mate
    if (previousStaticEval[0] !== 'mate' && staticEval[0] === 'mate' && !winning) return 'mistake'

    // miss - mate
    if (previousStaticEval[0] === 'mate' && staticEval[0] !== 'mate' && previousWinig) return 'miss'

    // miss - gain advantage
    if (
        isNotMateRelated
        &&
        (
            (previousStandardRating === "inaccuracy" && (losingGeatAdvantage(previousStaticEvalAmount, previousPreviousStaticEvalAmount, previousColor) || givingGeatAdvantage(previousStaticEvalAmount, previousPreviousStaticEvalAmount, previousColor)))
            ||
            previousStandardRating === "blunder"
        )
        &&
        (standardRating === "blunder" || standardRating === "inaccuracy")
    ) return 'miss'

    return standardRating
}

function checkDepth(depth: number) {
    return depth <= 21
}

async function analyze(program: ChildProcessWithoutNullStreams, fen: string, depth: number) {
    program.stdin.write(`position fen ${fen}\n`)

    const { bestMove, staticEval } = await getBestMove(program, depth)

    return { bestMove, staticEval }
}

function isSacrifice(move: Move) {
    const chess = new Chess(move.after)

    const piecesValue = {
        'p': 1,
        'n': 3,
        'b': 3,
        'r': 5,
        'q': 9,
        'k': 999,
        'none': 0,
    }

    let capturedValue = 0, sacrifiedValue = 0
    for (const row of chess.board()) {
        for (const square of row) {
            if (square === null) continue
            if (square.type === 'p') continue

            const piece = square.type
            const pieceValue = piecesValue[piece as keyof typeof piecesValue] ?? 0
            const pieceColor = square.color

            const previousSquare = new Chess(move.before).get(square.square)
            const previousPiece = previousSquare?.type
            let previousPieceValue = piecesValue[previousPiece as keyof typeof piecesValue] ?? 0
            const previousPieceColor = previousSquare?.color

            if (previousPieceColor === pieceColor) {
                previousPieceValue = 0
            }

            capturedValue += previousPieceValue

            const attackers = chess.attackers(square.square, square.color === 'w' ? 'b' : 'w')
            const defenders = chess.attackers(square.square, square.color)

            const validAttackers = attackers.filter(attacker => {
                try {
                    new Chess(move.after).move({ from: attacker, to: square.square })
                } catch {
                    return false
                }

                return true
            })

            const validDefenders = defenders.filter(defender => {
                try {
                    const testChess = new Chess(move.after)
                    testChess.move({ from: validAttackers[0], to: square.square })
                    testChess.move({ from: defender, to: square.square })
                } catch {
                    return false
                }

                return true
            })

            const validAttackersPieces = validAttackers.map(attacker => new Chess(move.after).get(attacker)?.type)
            const validDefendersPieces = validDefenders.map(defender => new Chess(move.after).get(defender)?.type)

            if (pieceValue > previousPieceValue) {
                if (validAttackers.length) {
                    if (!validDefenders.length) {
                        sacrifiedValue += pieceValue
                        continue
                    }
                    if (piece === 'q' && !(validAttackersPieces.length === 1 && validAttackersPieces[0] === 'q')) {
                        sacrifiedValue += pieceValue
                        continue
                    }
                }
            }
        }
    }

    if (sacrifiedValue > capturedValue) return true

    return false
}

export async function parsePGN(pgn: string, depth: number) {
    if (!checkDepth(depth)) return

    const pgnFile = readFileSync(path.join(process.cwd(), 'test/pgn/game3.pgn'), 'utf-8')

    const chess = new Chess()
    chess.loadPgn(pgnFile)

    const headers = chess.header()

    const players = getPlayers(headers)
    const time = getTime(headers)

    const metadata = { players, time }

    const moves: move[] = []

    const stockfishFile = path.join(process.cwd(), 'stockfish/stockfish-ubuntu-x86-64-avx2')
    const stockfish = spawn(stockfishFile)

    let moveNumber = 0, previousStaticEval: string[] = [], previousPreviousStaticEval: string[] = [], previousBestMove, previousSacrice = false
    for (const move of chess.history({ verbose: true })) {
        const movement: square[] = [move.from, move.to].map(square => {
            const { col, row } = formatSquare(square)

            return { col, row }
        })

        if (moveNumber === 0) {
            chess.load(move.before)
            const position = chess.board()
            const color = move.color
            const { bestMove, staticEval } = await analyze(stockfish, move.before, depth)
            moves.push({
                position,
                staticEval,
                bestMove,
                color,
            })
            previousBestMove = bestMove
            previousStaticEval = staticEval
        }
        chess.load(move.after)

        const position = chess.board()

        const color: Color = move.color === 'b' ? 'w' : 'b'

        if (chess.isCheckmate()) {
            var sacrifice = false
            var staticEval = ["mate"]
            var bestMove: square[] = []
            var moveRating = getMoveRating(staticEval, previousStaticEval, previousPreviousStaticEval, previousBestMove ?? [], movement, move.after, move.color, sacrifice, previousSacrice)
        } else {
            var sacrifice = isSacrifice(move)
            var { staticEval, bestMove } = await analyze(stockfish, move.after, depth)
            var moveRating = getMoveRating(staticEval, previousStaticEval, previousPreviousStaticEval, previousBestMove ?? [], movement, move.after, move.color, sacrifice, previousSacrice)
        }

        moves.push({
            position,
            movement,
            staticEval,
            bestMove,
            moveRating,
            color,
        })

        previousBestMove = bestMove
        previousPreviousStaticEval = previousStaticEval
        previousStaticEval = staticEval
        moveNumber++
        previousSacrice = sacrifice
    }

    return { metadata, moves }
}