"use client"

import React, { useEffect, useState, useRef, useContext } from "react"

import Board, { gameStartSound } from "./board"
import Clock from "./clock"
import Name from "./name"
import Evaluation from "./evaluation"
import { AnalyzeContext } from "@/context/analyze"
import { parsePGN, prepareStockfish } from "@/engine/stockfish"
import { PieceSymbol } from "chess.js"
import { getAproxMemory, wasmThreadsSupported } from "@/engine/wasmChecks"
import { pushPageError } from "@/errors/error"

const GAP = 10

const NOT_SUPPORTED_WASM_ERROR = ['WebAssembly threads not supported.', 'Update or switch your browser in order to run this app.']

export default function Game() {
    const [boardSize, setBoardSize] = useState(750)
    const [captured, setCaptured] = useState<{ white: PieceSymbol[], black: PieceSymbol[] }>({ white: [], black: [] })

    const analyzeContext = useContext(AnalyzeContext)

    const [players, setPlayers] = analyzeContext.players
    const [time, setTime] = analyzeContext.time
    const [moveNumber, setMoveNumber] = analyzeContext.moveNumber
    const [game, setGame] = analyzeContext.game
    const [data, setData] = analyzeContext.data
    const [pageState, setPageState] = analyzeContext.pageState
    const [forward, setForward] = analyzeContext.forward
    const [animation, setAnimation] = analyzeContext.animation
    const [white, setWhite] = analyzeContext.white
    const [playing, setPlaying] = analyzeContext.playing
    const [materialAdvantage, setMaterialAdvantage] = analyzeContext.materialAdvantage
    const [result, setResult] = analyzeContext.result
    const [errors, setErrors] = analyzeContext.errors
    const [progress, setProgress] = analyzeContext.progress
    const [tab, setTab] = analyzeContext.tab

    const componentRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<HTMLDivElement>(null)

    const intervalRef = useRef<NodeJS.Timeout>()
    const moveNumberRef = useRef(moveNumber)
    const gameLengthRef = useRef(game.length)
    const tabRef = useRef(tab)

    const engineWorkerRef = useRef<Worker | null>(null)

    useEffect(() => {
        if (!wasmThreadsSupported()) {
            pushPageError(setErrors, NOT_SUPPORTED_WASM_ERROR[0], NOT_SUPPORTED_WASM_ERROR[1])
            return
        }

        engineWorkerRef.current = new window.Worker('/engine/stockfish.js')

        const stockfish = engineWorkerRef.current

        const threads = navigator.hardwareConcurrency ?? 1
        const hash = Math.floor(getAproxMemory() / 4)

        prepareStockfish(stockfish, threads, hash)
    }, [])

    useEffect(() => {
        setAnimation(false)
    }, [moveNumber])

    useEffect(() => {
        gameLengthRef.current = game.length
    }, [game])

    useEffect(() => {
        moveNumberRef.current = moveNumber
    }, [moveNumber])

    useEffect(() => {
        tabRef.current = tab
    }, [tab])

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
        let lastPressed = 0
        function handleKeyDown(e: KeyboardEvent) {
            
            const element = e.target as HTMLElement
            const focusableInputTypes = ['text', 'number', 'password', 'email', 'search', 'tel', 'url']
            if (element.tagName === 'INPUT' && focusableInputTypes.includes(element.getAttribute('type') ?? '')) return

            const now = new Date().getTime()
            const minPressInterval = 50

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault()
                    if (now - lastPressed < minPressInterval) return
                    if (moveNumberRef.current === 0) return

                    setForward(false)
                    setAnimation(true)
                    setMoveNumber(prev => prev - 1)

                    lastPressed = new Date().getTime()
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    if (now - lastPressed < minPressInterval) return
                    if (moveNumberRef.current === gameLengthRef.current - 1) return

                    setForward(true)
                    setAnimation(true)
                    setMoveNumber(prev => prev + 1)

                    lastPressed = new Date().getTime()
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    if (now - lastPressed < minPressInterval) return

                    setMoveNumber(0)

                    lastPressed = new Date().getTime()
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    if (now - lastPressed < minPressInterval) return

                    setMoveNumber(gameLengthRef.current - 1)

                    lastPressed = new Date().getTime()
                    break
                case ' ':
                    e.preventDefault()
                    if (now - lastPressed < minPressInterval) return

                    setPlaying(prev => !prev)

                    lastPressed = new Date().getTime()
                    break
                case 'Tab':
                    e.preventDefault()
                    if (now - lastPressed < minPressInterval) return

                    const tab = tabRef.current

                    if (tab === 'summary') setTab('moves')
                    else if (tab === 'moves') setTab('summary')

                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    async function handlePGN(pgn: string, depth: number) {
        setPageState('loading')

        if (!wasmThreadsSupported()) {
            pushPageError(setErrors, NOT_SUPPORTED_WASM_ERROR[0], NOT_SUPPORTED_WASM_ERROR[1])
            setPageState('default')
            return
        }

        const stockfish = engineWorkerRef.current
        if (!stockfish) return

        const { metadata, moves } = await parsePGN(stockfish, pgn, depth, setProgress) ?? {}

        if (!metadata || !moves) {
            pushPageError(setErrors, 'Error reading PGN', 'Please, provide a valid PGN.')
            setPageState('default')
            return
        }

        setMoveNumber(0)
        setTime(metadata.time)
        setPlayers(metadata.players)
        setGame(moves)
        setResult(metadata.result)
        setProgress(0)
        setAnimation(false)

        setTimeout(() => gameStartSound.play(), 100)
        setPageState('analyze')
    }

    useEffect(() => {
        const { format, depth, string } = data
        if (string) {
            switch (format) {
                case "pgn":
                    handlePGN(string, depth)
                    break
                case "fen":
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
            setResult('1/2-1/2')
            setProgress(0)

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

    useEffect(() => {
        let newCaptured: typeof captured = { white: [], black: [] }
        for (const i in game) {
            if (Number(i) > moveNumber) break
            const move = game[i]
            if (move.capture) newCaptured[move.color === 'w' ? 'black' : 'white'].push(move.capture)
        }
        setCaptured(newCaptured)
    }, [moveNumber])

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
                    <Name materialAdvantage={materialAdvantage} captured={captured[white ? 'black' : 'white']} white={!white}>{`${players[white ? 1 : 0].name} ${players[white ? 1 : 0].elo !== 'NOELO' ? `(${players[white ? 1 : 0].elo})` : ''}`}</Name>
                    <Clock white={!white} colorMoving={game[moveNumber]?.color}>{formatTime(time)}</Clock>
                </div>
                <Board forward={forward} moveRating={game[moveNumber]?.moveRating} bestMove={game[moveNumber]?.bestMove[0] ? game[moveNumber]?.bestMove : undefined} move={game[moveNumber]?.movement} nextMove={game[moveNumber + 1]?.movement} fen={game[moveNumber]?.fen} nextFen={game[moveNumber + 1]?.fen} boardSize={boardSize} white={white} animation={animation} gameEnded={moveNumber === game.length - 1} capture={game[moveNumber]?.capture} nextCapture={game[moveNumber + 1]?.capture} castle={game[moveNumber]?.castle} nextCastle={game[moveNumber + 1]?.castle} setAnimation={setAnimation} />
                <div className="flex flex-row justify-between">
                    <Name materialAdvantage={materialAdvantage} captured={captured[white ? 'white' : 'black']} white={white}>{`${players[white ? 0 : 1].name} ${players[white ? 0 : 1].elo !== 'NOELO' ? `(${players[white ? 0 : 1].elo})` : ''}`}</Name>
                    <Clock white={white} colorMoving={game[moveNumber]?.color}>{formatTime(time)}</Clock>
                </div>
            </div>
        </div>
    )
}