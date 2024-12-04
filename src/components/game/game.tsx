"use client"

import React, { useEffect, useState, useRef, useContext } from "react"

import Board from "./board"
import Clock from "./clock"
import Name from "./name"
import Evaluation from "./evaluation"
import { AnalyzeContext } from "@/context/analyze"
import { parsePGN } from "@/server/analyze"
import { FORMATS } from "../menu/form"

const BOARD_PROPORTIONS = 8
const GAP = 10

export default function Game() {
    const [boardSize, setBoardSize] = useState(750)

    const [time, setTime] = useState('--:--')
    const [names, setNames] = useState(['White (?)', 'Black (?)'])

    const [data, setData] = useContext(AnalyzeContext)

    const componentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        (async () => {
            const dataType = FORMATS[data[0]][0]

            switch (dataType) {
                case "Chess.com":
                    // listChessComGames()
                    break
                case "Lichess.org":
                    // listLichessOrgGames()
                    break
                case "PGN":
                    const {metadata} = await parsePGN()

                    setTime(metadata.time)
                    setNames(metadata.names)
                    break
                case "FEN":
                    // parseFEN()
                    break
            }
        })()
    }, [data])

    useEffect(() => {
        function updateBoardSize() {
            const component = componentRef.current
            const statusBar = component?.getElementsByTagName('div')[0]

            const componentHeight = component?.offsetHeight ?? 0
            const statusBarHeight = statusBar?.offsetHeight ?? 0
            const gapHeight = GAP

            const boardHeight = componentHeight - ((statusBarHeight * 2) + (gapHeight * 2))

            setBoardSize(boardHeight)
        }

        updateBoardSize()

        window.addEventListener('resize', updateBoardSize)

        return () => window.removeEventListener('resize', updateBoardSize)
    }, [])

    return (
        <div style={{gap: GAP}} className="h-full flex flex-row items-center">
            <Evaluation height={boardSize} white={true} advantage={1.49} />
            <div ref={componentRef} className="h-full flex flex-col justify-between">
                <div className="flex flex-row justify-between">
                    <Name white={false}>{names[1]}</Name>
                    <Clock white={false} moving={false}>{time}</Clock>
                </div>
                <Board boardProportions={BOARD_PROPORTIONS} boardSize={boardSize} />
                <div className="flex flex-row justify-between">
                    <Name white={true}>{names[0]}</Name>
                    <Clock white={true} moving={false}>{time}</Clock>
                </div>
            </div>
        </div>
    )
}