"use server"

import FENBoard from "fen-chess-board";
import pgnParser from 'pgn-parser'
import { readFileSync } from "fs";
import path from "path";

function getHeader(headers: Array<any>, name: string, noFoundStr: string | null): string {
    return headers.filter(header => header.name === name)[0]?.value ?? noFoundStr
}

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
            return `${days} days`
        }
        return `${hours} hours`
    }

    return `${toTwoDigits(minutes)}:${toTwoDigits(restSeconds)}`
}

function getNames(headers: Array<any>) {
    const NO_NAME = 'Unknown'
    const NO_ELO = '?'

    const whiteName = getHeader(headers, "White", NO_NAME)
    const blackName = getHeader(headers, "Black", NO_NAME)

    const whiteElo = getHeader(headers, "WhiteElo", NO_ELO)
    const blackElo = getHeader(headers, "BlackElo", NO_ELO)

    const fullWhiteName = `${whiteName} (${whiteElo})`
    const fullBlackName = `${blackName} (${blackElo})`

    return [fullWhiteName, fullBlackName]
}

function getTime(headers: Array<any>) {
    const NO_TIME = '--:--'

    const seconds = getHeader(headers, "TimeControl", null)

    const formattedTime = formatTime(Number(seconds))

    return formattedTime
}

export async function parsePGN() {
    const pgnFile = readFileSync(path.join(process.cwd(), 'test/pgn/game1.pgn'), 'utf-8')
    const [result] = pgnParser.parse(pgnFile)

    const headers = result.headers

    const names = getNames(headers)
    const time = getTime(headers)
}