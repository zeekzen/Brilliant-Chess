"use server"

import { readFileSync } from "fs";
import path from "path";
import { Chess, Color, Move, PAWN, Piece, PieceSymbol, QUEEN, ROOK, Square } from "chess.js";
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

export type moveRating = "forced" | "brilliant" | "great" | "best" | "excellent" | "good" | "book" | "inaccuracy" | "mistake" | "miss" | "blunder"

export interface move {
    fen: string,
    movement?: square[],
    staticEval: string[],
    bestMove: square[],
    moveRating?: moveRating,
    color: Color,
    capture?: PieceSymbol,
    castle?: 'k' | 'q',
}

function invertColor(color: Color): Color {
    return color === 'w' ? 'b' : 'w'
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

function getMoveRating(staticEval: string[], previousStaticEvals: string[][], bestMove: square[], movement: square[], fen: string, color: Color, sacrifice: boolean, previousSacrice: boolean): moveRating {
    const reversePreviousStaticEvals = previousStaticEvals.toReversed()

    if (reversePreviousStaticEvals[0] === undefined) reversePreviousStaticEvals[0] = []
    if (reversePreviousStaticEvals[1] === undefined) reversePreviousStaticEvals[1] = []
    if (reversePreviousStaticEvals[2] === undefined) reversePreviousStaticEvals[2] = []
    if (reversePreviousStaticEvals[3] === undefined) reversePreviousStaticEvals[3] = []

    const winning = Number(staticEval[1]) < 0
    const previousWinig = Number(reversePreviousStaticEvals[0][1]) > 0

    const previousColor = invertColor(color)

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

    function getPreviousStaticEvalAmount(number: number) {
        const checkColor = number % 2 === 0 ? 'b' : 'w'
        return Number(reversePreviousStaticEvals[number][1]) / 100 * (color === checkColor ? -1 : 1)
    }

    const staticEvalAmount = Number(staticEval[1]) / 100 * (color === 'w' ? -1 : 1)

    const isNotMateRelated = staticEval[0] !== 'mate' && reversePreviousStaticEvals[0][0] !== 'mate'
    const wasNotMateRelated = reversePreviousStaticEvals[0][0] !== 'mate' && reversePreviousStaticEvals[1][0] !== 'mate'


    // book
    const openingsFile = readFileSync(path.join(process.cwd(), 'openings/openings.json'), 'utf-8')
    const openings = JSON.parse(openingsFile)

    const openingName = openings[fen]
    if (openingName) return 'book'

    // standard
    function getPreviousStandardRating(number: number) {
        const checkColor = number % 2 === 0 ? 'b' : 'w'
        const evaluationDiff = color === checkColor ? getPreviousStaticEvalAmount(number + 1) - getPreviousStaticEvalAmount(number) : getPreviousStaticEvalAmount(number) - getPreviousStaticEvalAmount(number + 1)
        return getStandardRating(evaluationDiff)
    }

    const evaluationDiff = color === "w" ? getPreviousStaticEvalAmount(0) - staticEvalAmount : staticEvalAmount - getPreviousStaticEvalAmount(0)
    const standardRating = getStandardRating(evaluationDiff)

    // brilliant - sacrifice
    const previousBrilliant = wasNotMateRelated && previousSacrice && getPreviousStandardRating(0) === 'excellent'
    if (!previousBrilliant && isNotMateRelated && standardRating === 'excellent' && sacrifice && (getPreviousStandardRating(0) === 'inaccuracy' || getPreviousStandardRating(0) === 'blunder' || getPreviousStandardRating(2) === 'inaccuracy' || getPreviousStandardRating(2) === 'blunder')) return 'brilliant'

    // brilliant - start mate
    if (sacrifice && reversePreviousStaticEvals[0][0] !== 'mate' && staticEval[0] === 'mate' && winning) return 'brilliant'

    // brilliant - right move to mate
    if (sacrifice && reversePreviousStaticEvals[0][0] === 'mate' && staticEval[0] === 'mate' && keepMating(staticEvalAmount, getPreviousStaticEvalAmount(0), color) && winning) return 'brilliant'

    // great - gaining advantage
    if (
        wasNotMateRelated
        &&
        isNotMateRelated
        &&
        standardRating === 'excellent'
        &&
        (
            (getPreviousStandardRating(0) === 'inaccuracy' || getPreviousStandardRating(0) === 'blunder')
            &&
            (losingGeatAdvantage(getPreviousStaticEvalAmount(0), getPreviousStaticEvalAmount(1), previousColor) || givingGeatAdvantage(getPreviousStaticEvalAmount(0), getPreviousStaticEvalAmount(1), previousColor))
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
    if (reversePreviousStaticEvals[0][0] !== 'mate' && staticEval[0] === 'mate' && winning) return 'excellent'

    // excellent - right move to mate
    if (reversePreviousStaticEvals[0][0] === 'mate' && staticEval[0] === 'mate' && keepMating(staticEvalAmount, getPreviousStaticEvalAmount(0), color) && winning) return 'excellent'

    // good - delay mate
    if (reversePreviousStaticEvals[0][0] === 'mate' && staticEval[0] === 'mate' && !keepMating(staticEvalAmount, getPreviousStaticEvalAmount(0), color) && winning) return 'good'

    // good - advance mate
    if (reversePreviousStaticEvals[0][0] === 'mate' && staticEval[0] === 'mate' && advanceMate(staticEvalAmount, getPreviousStaticEvalAmount(0), color) && !winning) return 'good'

    // mistake - lose advantage
    if (isNotMateRelated && standardRating === "inaccuracy" && (losingGeatAdvantage(staticEvalAmount, getPreviousStaticEvalAmount(0), color) || givingGeatAdvantage(staticEvalAmount, getPreviousStaticEvalAmount(0), color))) return 'mistake'

    // mistake - mate
    if (reversePreviousStaticEvals[0][0] !== 'mate' && staticEval[0] === 'mate' && !winning) return 'mistake'

    // miss - mate
    if (reversePreviousStaticEvals[0][0] === 'mate' && staticEval[0] !== 'mate' && previousWinig) return 'miss'

    // miss - gain advantage
    if (
        isNotMateRelated
        &&
        (
            (getPreviousStandardRating(0) === "inaccuracy" && (losingGeatAdvantage(getPreviousStaticEvalAmount(0), getPreviousStaticEvalAmount(1), previousColor) || givingGeatAdvantage(getPreviousStaticEvalAmount(0), getPreviousStaticEvalAmount(1), previousColor)))
            ||
            getPreviousStandardRating(0) === "blunder"
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

function getAttackersDefenders(chess: Chess, color: Color, to: Square) {
    const attackers = chess.attackers(to, invertColor(color))
    const legalAttackers = attackers.filter(attacker => chess.moves({ verbose: true }).findIndex(move => move.from === attacker && move.to === to) !== -1)
    const legalAttackersPieces = legalAttackers.map(attacker => chess.get(attacker))

    const defenders = chess.attackers(to, color)
    const legalDefenders = defenders.filter(defender => {
        for (const attacker of legalAttackers) {
            const testChess = new Chess(chess.fen())
            try {
                testChess.move({ from: attacker, to: to })
            } catch { }

            if (testChess.moves({ verbose: true }).findIndex(move => move.from === defender && move.to === to) === -1) {
                return false
            }
        }
        return true
    })
    const legalDefendersPieces = legalDefenders.map(defender => chess.get(defender))

    return { attackers: { squares: legalAttackers, pieces: legalAttackersPieces, length: legalAttackers.length }, defenders: { squares: legalDefenders, pieces: legalDefendersPieces, length: legalDefenders.length } }
}

function isSacrifice(move: Move) {
    const chess = new Chess(move.after)

    const board = chess.board()
    for (const row of board) {
        for (const square of row) {
            if (!square || square.type === PAWN) continue
            if (square.color !== move.color) continue //

            const { attackers, defenders } = getAttackersDefenders(chess, move.color, square.square)

            if (!defenders.length && attackers.length && (!move.captured || move.captured === PAWN)) return true
            if (square.type === ROOK && attackers.length && (move.captured !== ROOK && move.captured !== QUEEN) && !(attackers.length === 1 && (attackers.pieces[0]?.type === QUEEN || attackers.pieces[0]?.type === ROOK) && defenders.length)) return true
            if (square.type === QUEEN && attackers.length && move.captured !== QUEEN && !(attackers.length === 1 && attackers.pieces[0]?.type === QUEEN && defenders.length) && !(attackers.length === 1 && attackers.pieces[0]?.type === ROOK && move.captured === ROOK && defenders.length)) return true
        }
    }

    return false
}

function isForced(move: Move) {
    const chess = new Chess(move.before)

    return chess.moves().length === 1
}

export async function parsePGN(pgn: string, depth: number) {
    if (!checkDepth(depth)) return

    const pgnFile = readFileSync(path.join(process.cwd(), 'test/pgn/game12.pgn'), 'utf-8')

    const chess = new Chess()
    chess.loadPgn(pgnFile)

    const headers = chess.header()

    const players = getPlayers(headers)
    const time = getTime(headers)

    const metadata = { players, time }

    const moves: move[] = []

    const stockfishFile = path.join(process.cwd(), 'stockfish/stockfish-ubuntu-x86-64-avx2')
    const stockfish = spawn(stockfishFile)

    let moveNumber = 0, previousBestMove, previousSacrice = false
    const previousStaticEvals: string[][] = []
    for (const move of chess.history({ verbose: true })) {
        const movement: square[] = [move.from, move.to].map(square => {
            const { col, row } = formatSquare(square)

            return { col, row }
        })

        if (moveNumber === 0) {
            const fen = move.before
            chess.load(fen)
            const color = move.color
            const { bestMove, staticEval } = await analyze(stockfish, move.before, depth)
            moves.push({
                fen,
                staticEval,
                bestMove,
                color,
            })
            previousBestMove = bestMove
            // previousStaticEval = staticEval
            previousStaticEvals.push(staticEval)
        }
        const fen = move.after
        chess.load(fen)

        const color = invertColor(move.color)
        const capture = move.captured

        const castle: 'k' | 'q' | undefined = move.san === 'O-O' ? 'k' : move.san === 'O-O-O' ? 'q' : undefined

        const forced = isForced(move)

        console.log(moveNumber)

        if (chess.isCheckmate()) {
            var sacrifice = false
            var staticEval = ["mate"]
            var bestMove: square[] = []
        } else {
            var sacrifice = isSacrifice(move)
            var { staticEval, bestMove } = await analyze(stockfish, move.after, depth)
        }
        const moveRating = forced ? 'forced' : getMoveRating(staticEval, previousStaticEvals, previousBestMove ?? [], movement, move.after, move.color, sacrifice, previousSacrice)

        moves.push({
            fen,
            movement,
            staticEval,
            bestMove,
            moveRating,
            color,
            capture,
            castle,
        })

        previousBestMove = bestMove
        // previousPreviousStaticEval = previousStaticEval
        // previousStaticEval = staticEval
        previousStaticEvals.push(staticEval)
        moveNumber++
        previousSacrice = sacrifice
    }

    return { metadata, moves }
}