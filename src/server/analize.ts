"use server"

import { readFileSync } from "fs";
import path from "path";
import { Chess } from "chess.js";

function formatTime(seconds: number): string {
    const toTwoDigits = (num: number) => {
        return String(num).padStart(2, '0')
    }

    const getMinutes = (seconds: number) => {
        return [Math.floor(seconds / 60), seconds % 60]
    }

    const getHours = (minutes: number) => {
        return Math.floor(minutes / 60)
    }

    const getDays = (hours: number) => {
        return Math.floor(hours / 24)
    }

    const [minutes, restSeconds] = getMinutes(seconds)

    const hours = getHours(minutes)
    if (hours) {
        const days = getDays(hours)
        if (days) {
            return `${days} ${days > 1 ? 'days' : 'day'}`
        }
        return `${hours} ${hours > 1 ? 'hours' : 'hour'}`
    }
    return `${toTwoDigits(minutes)}:${toTwoDigits(restSeconds)}`
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

    const seconds = headers.TimeControl ?? null

    const formattedTime = formatTime(Number(seconds))

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