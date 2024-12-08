"use client"

import React, { useEffect, useState, useRef, useContext } from "react"

import Board from "./board"
import Clock from "./clock"
import Name from "./name"
import Evaluation from "./evaluation"
import { AnalyzeContext } from "@/context/analyze"
import { parsePGN, move, square } from "@/server/analyze"
import { FORMATS } from "../menu/form"

const BOARD_PROPORTIONS = 8
const GAP = 10

export default function Game() {
    const [boardSize, setBoardSize] = useState(750)

    const [time, setTime] = useState('--:--')
    const [names, setNames] = useState(['White (?)', 'Black (?)'])
    const [game, setGame] = useState<move[]>([])
    const [moveNumber, setMoveNumber] = useState(0)

    const [data, setData] = useContext(AnalyzeContext)

    const componentRef = useRef<HTMLDivElement>(null)

    async function handlePGN() {
        const {metadata, moves} = await parsePGN()

        setTime(metadata.time)
        setNames(metadata.names)
        setGame(moves)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        switch (e.key) {
            case 'ArrowLeft':
                setMoveNumber(prev => Math.max(prev - 1, 0))
                break
            case 'ArrowRight':
                setMoveNumber(prev => Math.min(prev + 1, game.length - 1))
                break
            case 'ArrowUp':
                setMoveNumber(0)
                break
            case 'ArrowDown':
                setMoveNumber(game.length - 1)
                break
        }
    }

    useEffect(() => {
        const dataType = FORMATS[data[0]][0]
        const dataCode = data[1]

        switch (dataType) {
            case "Chess.com":
                // listChessComGames()
                break
            case "Lichess.org":
                // listLichessOrgGames()
                break
            case "PGN":
                handlePGN()
                break
            case "FEN":
                // parseFEN()
                break
        }
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
        <div tabIndex={0} onKeyDown={handleKeyDown} style={{gap: GAP}} className="h-full flex flex-row items-center outline-none">
            <Evaluation height={boardSize} white={true} advantage={game[moveNumber]?.evaluation ?? 0} />
            <div ref={componentRef} className="h-full flex flex-col justify-between">
                <div className="flex flex-row justify-between">
                    <Name white={false}>{names[1]}</Name>
                    <Clock white={false} moving={false}>{time}</Clock>
                </div>
                <Board bestMove={game[moveNumber]?.bestMove[0] ? game[moveNumber]?.bestMove : undefined} highlight={game[moveNumber]?.movement} position={game[moveNumber]?.position} boardProportions={BOARD_PROPORTIONS} boardSize={boardSize} />
                <div className="flex flex-row justify-between">
                    <Name white={true}>{names[0]}</Name>
                    <Clock white={true} moving={false}>{time}</Clock>
                </div>
            </div>
        </div>
    )
}