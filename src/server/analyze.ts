"use server"

import { readFileSync } from "fs";
import path, { resolve } from "path";
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

export interface move {
    position: position,
    movement: square[],
    evaluation: number,
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

async function analyze(program: ChildProcessWithoutNullStreams, fen: string) {
    program.stdin.write(`position fen ${fen}\n`)

    const evaluation = await getEvaluation(program)

    return { evaluation }
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

    let moveNumber = 0
    for (const move of chess.history({verbose: true})) {
        if (moveNumber === 0) {
            chess.load(move.before)
            analyze(stockfish, move.before)
            moves.push({
                position: chess.board(),
                movement: [],
                evaluation: 0,
            })
        }
        chess.load(move.after)

        const movement = [move.from, move.to].map(square => {
            const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

            const col = letters.indexOf(square[0])
            const row = Number(square[1]) - 1

            return {col, row}
        })

        const { evaluation } = await analyze(stockfish, move.after)

        moves.push({
            position: chess.board(),
            movement: movement,
            evaluation: evaluation,
        })

        moveNumber++
    }

    return {metadata, moves}
}