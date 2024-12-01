"use server"

import { readFileSync } from "fs";
import path from "path";
import { Chess } from "chess.js";

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
        if (hours) {
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

export async function parsePGN() {
    const pgnFile = readFileSync(path.join(process.cwd(), 'test/pgn/game1.pgn'), 'utf-8')

    const chess = new Chess()
    chess.loadPgn(pgnFile)

    const headers = chess.header()

    const names = getNames(headers)
    const time = getTime(headers)

    console.log(names, time)
}