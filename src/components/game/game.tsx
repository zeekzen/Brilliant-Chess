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
    
    const [moveNumber, setMoveNumber] = useContext(AnalyzeContext).moveNumber
    const [game, setGame] = useContext(AnalyzeContext).game
    const [data, setData] = useContext(AnalyzeContext).data
    const [pageState, setPageState] = useContext(AnalyzeContext).pageState
    const [metadata, setMetadata] = useContext(AnalyzeContext).metadata
    const [forward, setForward] = useContext(AnalyzeContext).forward
    const [white, setWhite] = useContext(AnalyzeContext).white

    const componentRef = useRef<HTMLDivElement>(null)

    function focusBoard() {
        const element = componentRef.current?.parentElement

        element?.focus()
    }

    async function handlePGN(pgn: string, depth: number) {
        setPageState('loading')

        const {metadata, moves} = await parsePGN(pgn, depth) ?? {}

        if (!metadata || !moves) {
            console.error('ERROR PARSING PGN')
            setPageState('default')
            return
        }

        setMetadata(metadata)
        setTime(metadata.time)
        setNames(metadata.names)
        setGame(moves)

        focusBoard()
        setPageState('analyze')
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault()
                if (moveNumber === 0) return
                setForward(false)
                setMoveNumber(prev => prev - 1)
                break
            case 'ArrowRight':
                e.preventDefault()
                if (moveNumber === game.length - 1) return
                setForward(true)
                setMoveNumber(prev => prev + 1)
                break
            case 'ArrowUp':
                e.preventDefault()
                setForward(true)
                setMoveNumber(0)
                break
            case 'ArrowDown':
                e.preventDefault()
                setForward(false)
                setMoveNumber(game.length - 1)
                break
        }
    }

    useEffect(() => {
        if (data[1]) {
            const dataType = FORMATS[data[0]][0]
            const [ code, depth ] = data[1]

            switch (dataType) {
                case "Chess.com":
                    // listChessComGames()
                    break
                case "Lichess.org":
                    // listLichessOrgGames()
                    break
                case "PGN":
                    handlePGN(code, depth)
                    break
                case "FEN":
                    // parseFEN()
                    break
            }
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
            <Evaluation height={boardSize} white={white} advantage={game[moveNumber]?.staticEval ?? ['cp', 0]} whiteMoving={moveNumber%2 === 0} />
            <div ref={componentRef} className="h-full flex flex-col justify-between">
                <div className="flex flex-row justify-between">
                    <Name white={!white}>{names[1]}</Name>
                    <Clock white={!white} colorMoving={game[moveNumber]?.color}>{time}</Clock>
                </div>
                <Board forward={forward} moveRating={game[moveNumber]?.moveRating} bestMove={game[moveNumber]?.bestMove[0] ? game[moveNumber]?.bestMove : undefined} move={game[moveNumber]?.movement} nextMove={game[moveNumber + 1]?.movement} position={game[moveNumber]?.position} boardProportions={BOARD_PROPORTIONS} boardSize={boardSize} white={white} />
                <div className="flex flex-row justify-between">
                    <Name white={white}>{names[0]}</Name>
                    <Clock white={white} colorMoving={game[moveNumber]?.color}>{time}</Clock>
                </div>
            </div>
        </div>
    )
}