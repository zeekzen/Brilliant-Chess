"use client"

import React, { useEffect, useState, useRef, useContext } from "react"

import Board, { gameStartSound } from "./board"
import Clock from "./clock"
import Name from "./name"
import Evaluation from "./evaluation"
import { AnalyzeContext } from "@/context/analyze"
import { formatSquare, move, parseMove, parsePGN, prepareStockfish, square } from "@/engine/stockfish"
import { Chess, PieceSymbol, WHITE } from "chess.js"
import { getAproxMemory, wasmSupported, wasmThreadsSupported } from "@/engine/wasmChecks"
import { pushPageError, pushPageWarning } from "@/components/errors/pageErrors"
import { ErrorsContext } from "@/context/errors"
import { maxVertical } from "../../../tailwind.config"
import { ConfigContext } from "@/context/config"

const NOT_SUPPORTED_WASM_THREADS_WARNING = ['WebAssembly threads not supported', 'The app may run slower. Try updating your browser for better performance.']
const NOT_SUPPORTED_WASM_ERROR = ['WebAssembly not supported', 'The app needs this feature to run properly. Try updating your browser in order to run this app.']

export type arrow = square[]
export interface AllGameArrows { [key: number]: arrow[] }

export default function Game() {
    const [boardSize, setBoardSize] = useState(750)
    const [gameHeight, setGameHeight] = useState(850)
    const [captured, setCaptured] = useState<{ white: PieceSymbol[], black: PieceSymbol[] }>({ white: [], black: [] })
    const [arrows, setArrows] = useState<AllGameArrows>({0: []})
    const [gap, setGap] = useState(10)

    const analyzeContext = useContext(AnalyzeContext)
    const errorsContext = useContext(ErrorsContext)
    const configContext = useContext(ConfigContext)

    const [players, setPlayers] = analyzeContext.players
    const [time, setTime] = analyzeContext.time
    const [moveNumber, setMoveNumber] = analyzeContext.moveNumber
    const [game, setGame] = analyzeContext.game
    const [data] = analyzeContext.data
    const setPageState = analyzeContext.pageState[1]
    const [forward] = analyzeContext.forward
    const [animation, setAnimation] = analyzeContext.animation
    const [white, setWhite] = analyzeContext.white
    const [playing, setPlaying] = analyzeContext.playing
    const [materialAdvantage] = analyzeContext.materialAdvantage
    const [result, setResult] = analyzeContext.result
    const setProgress = analyzeContext.progress[1]
    const [tab, setTab] = analyzeContext.tab
    const [analyzeController, setAnalyzeController] = analyzeContext.analyzeController
    const [customLine] = analyzeContext.customLine
    const [returnedToNormalGame] = analyzeContext.returnedToNormalGame

    const gameController = analyzeContext.gameController

    const setErrors = errorsContext.errors[1]

    const [boardSounds] = configContext.boardSounds

    const componentRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<HTMLDivElement>(null)

    const intervalRef = useRef<NodeJS.Timeout>()
    const tabRef = useRef(tab)

    const engineWorkerRef = useRef<Worker | null>(null)

    useEffect(() => {
        if (!wasmThreadsSupported()) {
            if (!wasmSupported()) {
                pushPageError(setErrors, NOT_SUPPORTED_WASM_ERROR[0], NOT_SUPPORTED_WASM_ERROR[1])
                return
            }

            pushPageWarning(setErrors, NOT_SUPPORTED_WASM_THREADS_WARNING[0], NOT_SUPPORTED_WASM_THREADS_WARNING[1])
            engineWorkerRef.current = new window.Worker(`${process.env.NEXT_PUBLIC_BASE_PATH}/engine/stockfish-single.js`)
        } else {
            engineWorkerRef.current = new window.Worker(`${process.env.NEXT_PUBLIC_BASE_PATH}/engine/stockfish.js`)
        }

        const stockfish = engineWorkerRef.current

        const threads = navigator.hardwareConcurrency ?? 1
        const hash = Math.floor(getAproxMemory() / 4)

        const errorTimeout = setTimeout(() => pushPageError(setErrors, 'The browser is having some troubles loading Stockfish', "If the app doesn't work properly try restarting the browser."), 15000);
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
        tabRef.current = tab
    }, [tab])

    useEffect(() => {
        if (playing) {
            function nextMove() {
                gameController.forward()
            }
            nextMove()
            intervalRef.current = setInterval(nextMove, 1000)
        } else {
            clearInterval(intervalRef.current)
        }

        return () => clearInterval(intervalRef.current)
    }, [playing])

    function createArrowsObject(length: number) {
        const newArrows: AllGameArrows = {}
        Array.from({ length }).forEach((_, i) => {
            newArrows[i] = []
        })

        return newArrows
    }

    function cleanArrows() {
        setArrows({ 0: [] })
    }

    function cleanCurrentArrows() {
        setArrows(prev => {return {...prev, [moveNumber]: []}})
    }

    function pushArrow(currentArrow: arrow) {
        const repeatedIndex = arrows[moveNumber].findIndex(arrow => JSON.stringify(arrow) === JSON.stringify(currentArrow))
        const isRepeated = repeatedIndex !== -1

        const newArrows = [...arrows[moveNumber]]
        if (isRepeated) {
            newArrows.splice(repeatedIndex, 1)
        } else {
            newArrows.push(currentArrow)
        }

        setArrows(prev => {return {...prev, [moveNumber]: newArrows}})
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

                    gameController.togglePlay()

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
            if (!wasmSupported()) {
                pushPageError(setErrors, NOT_SUPPORTED_WASM_ERROR[0], NOT_SUPPORTED_WASM_ERROR[1])
                setPageState('default')
                return
            }

            pushPageWarning(setErrors, NOT_SUPPORTED_WASM_THREADS_WARNING[0], NOT_SUPPORTED_WASM_THREADS_WARNING[1])
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
            setArrows(createArrowsObject(moves.length))
    
            if (boardSounds) setTimeout(() => gameStartSound.play(), 100)
            setPageState('analyze')
        } catch (e: any) {
            switch (e.message) {
                case 'pgn':
                    pushPageError(setErrors, 'Error reading PGN', 'Please, provide a valid PGN.')
                    break
                case 'canceled':
                    break
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
            cleanArrows()

            setPageState('default')
        }
    }, [data])

    useEffect(() => {
        function updateBoardSize() {
            const newGap = window.innerWidth < maxVertical ? 6 : 10
            setGap(newGap)

            const component = componentRef.current
            const statusBar = component?.getElementsByTagName('div')[0]

            const componentHeight = component?.offsetHeight ?? 0
            const statusBarHeight = statusBar?.offsetHeight ?? 0
            const gapHeight = newGap

            const navWidth = document.getElementsByTagName("nav")[0]?.offsetWidth ?? 0
            const evalWidth = 36
            const menuWidth = 290
            const rightAdWidth = 144
            const boardMenuWidth = 17
            const gapWidth = 8
            const paddingWidth = 16

            if (window.innerWidth < maxVertical) {
                const paddingWidth = 8
                const newBoardSize = roundBoardSize(window.innerHeight - ((statusBarHeight * 2) + (gapHeight * 2) + (paddingWidth * 2)))

                setBoardSize(newBoardSize)
                setGameHeight(newBoardSize + (statusBarHeight * 2) + (gapHeight * 2))

                return
            }

            const boardHeight = componentHeight - ((statusBarHeight * 2) + (gapHeight * 2))
            const maxWidth = window.innerWidth - (navWidth + paddingWidth + evalWidth + gapHeight + gapWidth + boardMenuWidth + gapWidth + menuWidth + paddingWidth + rightAdWidth + paddingWidth)

            const newBoardSize = roundBoardSize(Math.min(boardHeight, maxWidth))

            setBoardSize(newBoardSize)
            setGameHeight(newBoardSize + (statusBarHeight * 2) + (gapHeight * 2))
        }

        updateBoardSize()

        window.addEventListener('resize', updateBoardSize)

        return () => window.removeEventListener('resize', updateBoardSize)
    }, [])

    useEffect(() => {
        const newCaptured: typeof captured = { white: [], black: [] }
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

    function analyzeMove(previousFen: string, movement: { from: string, to: string }, previousSacrifice: boolean, previousStaticEvals: string[][], previousBestMove?: square[]): Promise<move> {
        return new Promise(async (resolve, reject) => {
            const signal = analyzeController.signal

            function handleAbort() {
                reject(new Error('canceled'))
                signal.removeEventListener('abort', handleAbort)
                setProgress(0)
            }

            const stockfish = engineWorkerRef.current
            if (!stockfish) return
    
            const { depth } = data
    
            const chess = new Chess(previousFen)
            const move = chess.move(movement)
    
            const analyzedMovement = await parseMove(stockfish, depth, move, chess, previousStaticEvals, previousBestMove, previousSacrifice, {}, handleAbort, signal)
            resolve(analyzedMovement)
        })
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

    const previousMove = (() => {
        if (customLine.moveNumber === 0) {
            return game[moveNumber]
        }
        if (customLine.moveNumber > 0) {
            return customLine.moves[customLine.moveNumber - 1]
        }
        return game[moveNumber - 1]
    })()

    const move = (() => {
        if (customLine.moveNumber >= 0) {
            return customLine.moves[customLine.moveNumber]
        }
        return game[moveNumber]
    })()

    const nextMove = (() => {
        if (customLine.moveNumber >= 0) {
            return customLine.moves[customLine.moveNumber + 1]
        }
        if (returnedToNormalGame) {
            const { from, to } = new Chess(game[moveNumber].fen).move(returnedToNormalGame)
            return { ...game[moveNumber], movement: [formatSquare(from), formatSquare(to)] }
        }
        return game[moveNumber + 1]
    })()

    return (
        <div ref={gameRef} tabIndex={0} style={{ gap: gap }} className="h-full flex flex-row outline-none">
            <div style={{ height: gameHeight }} className="flex items-center">
                <Evaluation height={boardSize} white={white} advantage={game[moveNumber]?.staticEval ?? ['cp', 0]} whiteMoving={(game[moveNumber]?.color ?? WHITE) === WHITE} />
            </div>
            <div ref={componentRef} style={{ gap: gap }} className="h-full flex flex-col justify-start">
                <div style={{ width: boardSize }} className="flex flex-row justify-between">
                    <Name materialAdvantage={materialAdvantage} captured={captured[white ? 'black' : 'white']} white={!white}>{`${players[white ? 1 : 0].name} ${players[white ? 1 : 0].elo !== 'NOELO' ? `(${players[white ? 1 : 0].elo})` : ''}`}</Name>
                    <Clock white={!white} colorMoving={game[moveNumber]?.color}>{formatTime(time)}</Clock>
                </div>
                <Board
                    cleanArrows={cleanCurrentArrows}
                    arrows={arrows[moveNumber] ?? []}
                    sacrifice={move?.sacrifice}
                    controller={gameController}
                    forward={forward}
                    moveRating={move?.moveRating}
                    bestMove={move?.bestMove[0] ? move?.bestMove : undefined}
                    previousBestMove={previousMove?.bestMove}
                    move={move?.movement}
                    nextMove={nextMove?.movement}
                    fen={move?.fen}
                    nextFen={nextMove?.fen}
                    boardSize={boardSize}
                    white={white}
                    animation={animation}
                    gameEnded={moveNumber === game.length - 1}
                    capture={move?.capture}
                    nextCapture={nextMove?.capture}
                    castle={move?.castle}
                    nextCastle={nextMove?.castle}
                    setAnimation={setAnimation}
                    result={result}
                    pushArrow={pushArrow}
                    analyzeMove={analyzeMove}
                    previousStaticEvals={move?.previousStaticEvals}
                />
                <div style={{ width: boardSize }} className="flex flex-row justify-between">
                    <Name materialAdvantage={materialAdvantage} captured={captured[white ? 'white' : 'black']} white={white}>{`${players[white ? 0 : 1].name} ${players[white ? 0 : 1].elo !== 'NOELO' ? `(${players[white ? 0 : 1].elo})` : ''}`}</Name>
                    <Clock white={white} colorMoving={game[moveNumber]?.color}>{formatTime(time)}</Clock>
                </div>
            </div>
        </div>
    )
}