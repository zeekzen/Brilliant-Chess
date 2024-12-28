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

    const [players, setPlayers] = useContext(AnalyzeContext).players
    const [time, setTime] = useContext(AnalyzeContext).time
    const [moveNumber, setMoveNumber] = useContext(AnalyzeContext).moveNumber
    const [game, setGame] = useContext(AnalyzeContext).game
    const [data, setData] = useContext(AnalyzeContext).data
    const [pageState, setPageState] = useContext(AnalyzeContext).pageState
    const [forward, setForward] = useContext(AnalyzeContext).forward
    const [animation, setAnimation] = useContext(AnalyzeContext).animation
    const [white, setWhite] = useContext(AnalyzeContext).white
    const [playing, setPlaying] = useContext(AnalyzeContext).playing

    const componentRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<HTMLDivElement>(null)

    const intervalRef = useRef<NodeJS.Timeout>()
    const moveNumberRef = useRef(moveNumber)
    const gameLengthRef = useRef(game.length)

    useEffect(() => {
        gameLengthRef.current = game.length
    }, [game])

    useEffect(() => {
        moveNumberRef.current = moveNumber
    }, [moveNumber])

    useEffect(() => {
        if (playing) {
            function nextMove() {
                if (moveNumberRef.current === gameLengthRef.current - 1) return
                setForward(true)
                setAnimation(true)
                setMoveNumber(prev => prev + 1)
            }
            nextMove()
            intervalRef.current = setInterval(nextMove, 1000)
        } else {
            clearInterval(intervalRef.current)
        }

        return () => clearInterval(intervalRef.current)
    }, [playing])

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const element = e.target as HTMLElement
            const focusableInputTypes = ['text', 'number', 'password', 'email', 'search', 'tel', 'url']
            if (element.tagName === 'INPUT' && !focusableInputTypes.includes(element.getAttribute('type') ?? '')) return

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault()
                    if (moveNumberRef.current === 0) return
                    setForward(false)
                    setAnimation(true)
                    setMoveNumber(prev => prev - 1)
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    if (moveNumberRef.current === gameLengthRef.current - 1) return
                    setForward(true)
                    setAnimation(true)
                    setMoveNumber(prev => prev + 1)
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setAnimation(false)
                    setMoveNumber(0)
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    setAnimation(false)
                    setMoveNumber(gameLengthRef.current - 1)
                    break
                case ' ':
                    e.preventDefault()
                    setPlaying(prev => !prev)
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    async function handlePGN(pgn: string, depth: number) {
        setPageState('loading')

        const { metadata, moves } = await parsePGN(pgn, depth) ?? {}

        if (!metadata || !moves) {
            console.error('ERROR PARSING PGN')
            setPageState('default')
            return
        }

        setMoveNumber(0)
        setTime(metadata.time)
        setPlayers(metadata.players)
        setGame(moves)

        setPageState('analyze')
    }

    useEffect(() => {
        if (data[1][0]) {
            const dataType = FORMATS[data[0]][0]
            const [code, depth] = data[1]

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
        } else {
            setTime(0)
            setPlayers([{ name: 'White', elo: '?' }, { name: 'Black', elo: '?' }])
            setGame([])
            setWhite(true)
            setPlaying(false)
            setMoveNumber(0)

            setPageState('default')
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

    function formatTime(seconds: number): string {
        const noTime = '--:--'

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

    return (
        <div ref={gameRef} tabIndex={0} style={{ gap: GAP }} className="h-full flex flex-row items-center outline-none">
            <Evaluation height={boardSize} white={white} advantage={game[moveNumber]?.staticEval ?? ['cp', 0]} whiteMoving={moveNumber % 2 === 0} />
            <div ref={componentRef} className="h-full flex flex-col justify-between">
                <div className="flex flex-row justify-between">
                    <Name white={!white}>{`${players[white ? 1 : 0].name} (${players[white ? 1 : 0].elo})`}</Name>
                    <Clock white={!white} colorMoving={game[moveNumber]?.color}>{formatTime(time)}</Clock>
                </div>
                <Board forward={forward} moveRating={game[moveNumber]?.moveRating} bestMove={game[moveNumber]?.bestMove[0] ? game[moveNumber]?.bestMove : undefined} move={game[moveNumber]?.movement} nextMove={game[moveNumber + 1]?.movement} position={game[moveNumber]?.position} boardProportions={BOARD_PROPORTIONS} boardSize={boardSize} white={white} animation={animation} />
                <div className="flex flex-row justify-between">
                    <Name white={white}>{`${players[white ? 0 : 1].name} (${players[white ? 0 : 1].elo})`}</Name>
                    <Clock white={white} colorMoving={game[moveNumber]?.color}>{formatTime(time)}</Clock>
                </div>
            </div>
        </div>
    )
}