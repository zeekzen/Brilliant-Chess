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
import { pushPageError } from "@/components/errors/pageErrors"
import { ErrorsContext } from "@/context/errors"
import { maxVertical } from "../../../tailwind.config"

const GAP = 10

const NOT_SUPPORTED_WASM_ERROR = ['WebAssembly threads not supported.', 'Update or switch your browser in order to run this app.']

export interface Controller {
    back: () => void
    forward: () => void
    first: () => void
    last: () => void
    play: () => void
    pause: () => void
    togglePlay: () => void
}

export default function Game() {
    const [boardSize, setBoardSize] = useState(750)
    const [gameHeight, setGameHeight] = useState(850)
    const [captured, setCaptured] = useState<{ white: PieceSymbol[], black: PieceSymbol[] }>({ white: [], black: [] })

    const analyzeContext = useContext(AnalyzeContext)
    const errorsContext = useContext(ErrorsContext)

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
    const [progress, setProgress] = analyzeContext.progress
    const [tab, setTab] = analyzeContext.tab
    const [analyzeController, setAnalyzeController] = analyzeContext.analyzeController

    const [errors, setErrors] = errorsContext.errors

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

        const errorTimeout = setTimeout(() => pushPageError(setErrors, 'The browser is having some troubles loading Stockfish', 'Try restarting the browser'), 5000);
        (async () => {
            await prepareStockfish(stockfish, threads, hash)
            clearTimeout(errorTimeout)
        })()

        return () => clearTimeout(errorTimeout)
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

    const gameController: Controller = {
        back: () => {
            if (moveNumberRef.current === 0) return

            setForward(false)
            setAnimation(true)
            setMoveNumber(prev => prev - 1)
        },
        forward: () => {
            if (moveNumberRef.current === gameLengthRef.current - 1) return

            setForward(true)
            setAnimation(true)
            setMoveNumber(prev => prev + 1)
        },
        first: () => {
            setMoveNumber(0)
        },
        last: () => {
            setMoveNumber(gameLengthRef.current - 1)
        },
        togglePlay: () => {
            setPlaying(prev => !prev)
        },
        play: () => {
            setPlaying(true)
        },
        pause: () => {
            setPlaying(false)
        }
    }

    useEffect(() => {
        let lastPressed = 0
        function handleKeyDown(e: KeyboardEvent) {
            
            const element = e.target as HTMLElement
            const focusableInputTypes = ['text', 'number', 'password', 'email', 'search', 'tel', 'url']
            if (element.tagName === 'INPUT' && focusableInputTypes.includes(element.getAttribute('type') ?? '')) return
            if (element.tagName === 'TEXTAREA') return

            const now = new Date().getTime()
            const minPressInterval = 25

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault()
                    if (now - lastPressed < minPressInterval) return

                    gameController.back()

                    lastPressed = new Date().getTime()
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    if (now - lastPressed < minPressInterval) return

                    gameController.forward()

                    lastPressed = new Date().getTime()
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    if (now - lastPressed < minPressInterval) return

                    gameController.first()

                    lastPressed = new Date().getTime()
                    break
                case 'ArrowDown':
                    e.preventDefault()
                    if (now - lastPressed < minPressInterval) return

                    gameController.last()

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

        try {
            const { metadata, moves } = await parsePGN(stockfish, pgn, depth, setProgress, analyzeController.signal)

            setTime(metadata.time)
            setPlayers(metadata.players)
            setGame(moves)
            setResult(metadata.result)
            setAnimation(false)
    
            setTimeout(() => gameStartSound.play(), 100)
            setPageState('analyze')
        } catch (e: any) {
            if (e.message === 'PGN') {
                pushPageError(setErrors, 'Error reading PGN', 'Please, provide a valid PGN.')
            }

            setPageState('default')
            setAnalyzeController(new AbortController())
        }

        setProgress(0)
        setMoveNumber(0)
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

            const navWidth = document.getElementsByTagName("nav")[0]?.offsetWidth ?? 0
            const evalWidth = 36
            const menuWidth = 290
            const rightAdWidth = 144
            const boardMenuWidth = 17
            const gapWidth = 8
            const paddingWidth = 16

            if (window.innerWidth < maxVertical) {
                const newBoardSize = roundBoardSize(window.innerHeight - ((statusBarHeight * 2) + (gapHeight * 2) + (paddingWidth * 2)))

                setBoardSize(newBoardSize)
                setGameHeight(newBoardSize + (statusBarHeight * 2) + (gapHeight * 2))

                return
            }

            const boardHeight = componentHeight - ((statusBarHeight * 2) + (gapHeight * 2))
            const maxWidth = window.innerWidth - (navWidth + paddingWidth + evalWidth + GAP + gapWidth + boardMenuWidth + gapWidth + menuWidth + paddingWidth + rightAdWidth + paddingWidth)

            const newBoardSize = roundBoardSize(Math.min(boardHeight, maxWidth))

            setBoardSize(newBoardSize)
            setGameHeight(newBoardSize + (statusBarHeight * 2) + (gapHeight * 2))
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

    function roundBoardSize(boardSize: number) {
        return Math.round(boardSize / 8) * 8
    }

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
        <div ref={gameRef} tabIndex={0} style={{ gap: GAP }} className="h-full flex flex-row outline-none">
            <div style={{ height: gameHeight }} className="flex items-center">
                <Evaluation height={boardSize} white={white} advantage={game[moveNumber]?.staticEval ?? ['cp', 0]} whiteMoving={moveNumber % 2 === 0} />
            </div>
            <div ref={componentRef} style={{gap: GAP}} className="h-full flex flex-col justify-start">
                <div style={{ width: boardSize }} className="flex flex-row justify-between">
                    <Name materialAdvantage={materialAdvantage} captured={captured[white ? 'black' : 'white']} white={!white}>{`${players[white ? 1 : 0].name} ${players[white ? 1 : 0].elo !== 'NOELO' ? `(${players[white ? 1 : 0].elo})` : ''}`}</Name>
                    <Clock white={!white} colorMoving={game[moveNumber]?.color}>{formatTime(time)}</Clock>
                </div>
                <Board controller={gameController} forward={forward} moveRating={game[moveNumber]?.moveRating} bestMove={game[moveNumber]?.bestMove[0] ? game[moveNumber]?.bestMove : undefined} previousBestMove={game[moveNumber - 1]?.bestMove} move={game[moveNumber]?.movement} nextMove={game[moveNumber + 1]?.movement} fen={game[moveNumber]?.fen} nextFen={game[moveNumber + 1]?.fen} boardSize={boardSize} white={white} animation={animation} gameEnded={moveNumber === game.length - 1} capture={game[moveNumber]?.capture} nextCapture={game[moveNumber + 1]?.capture} castle={game[moveNumber]?.castle} nextCastle={game[moveNumber + 1]?.castle} setAnimation={setAnimation} result={result} />
                <div style={{ width: boardSize }} className="flex flex-row justify-between">
                    <Name materialAdvantage={materialAdvantage} captured={captured[white ? 'white' : 'black']} white={white}>{`${players[white ? 0 : 1].name} ${players[white ? 0 : 1].elo !== 'NOELO' ? `(${players[white ? 0 : 1].elo})` : ''}`}</Name>
                    <Clock white={white} colorMoving={game[moveNumber]?.color}>{formatTime(time)}</Clock>
                </div>
            </div>
        </div>
    )
}