import { AnalyzeContext } from "@/context/analyze"
import { move, moveRating } from "@/engine/stockfish"
import Image from "next/image"
import { useContext, useEffect, useRef, useState } from "react"
import Comments from "./comments"
import { WHITE } from "chess.js"
import GameChart from "../gameChart"

export const RATING_STYLE = {
    forced: { color: "text-highlightBoard", icon: "forced.svg" },
    brilliant: { color: "text-highlightBrilliant", icon: "brilliant.svg" },
    great: { color: "text-highlightGreat", icon: "great.svg" },
    best: { color: "text-highlightBest", icon: "best.svg" },
    excellent: { color: "text-highlightExcellent", icon: "excellent.svg" },
    good: { color: "text-highlightGood", icon: "good.svg" },
    book: { color: "text-highlightBook", icon: "book.svg" },
    inaccuracy: { color: "text-highlightInaccuracy", icon: "inaccuracy.svg" },
    mistake: { color: "text-highlightMistake", icon: "mistake.svg" },
    miss: { color: "text-highlightMiss", icon: "miss.svg" },
    blunder: { color: "text-highlightBlunder", icon: "blunder.svg" },
}

function getRatingStyle(moveNumber: number, rating: moveRating | undefined, prevRating: moveRating | undefined, nextRating: moveRating | undefined, lastBookMove: number): { src: string, textClass: string } | undefined {
    if (!rating) return

    const path = '/images/rating/'

    if (moveNumber === lastBookMove) return { src: path + RATING_STYLE[rating].icon, textClass: RATING_STYLE[rating].color }

    if (rating === 'best' && prevRating === 'inaccuracy') return { src: path + RATING_STYLE[rating].icon, textClass: RATING_STYLE[rating].color }

    if (rating === 'blunder' || rating === 'mistake' || rating === 'miss' || rating === 'great' || rating === 'brilliant') return { src: path + RATING_STYLE[rating].icon, textClass: RATING_STYLE[rating].color }

    return
}

export function getLastBookMove(moves: move[]) {
    for (let i = moves.length - 1; i >= 0; i--) {
        if (moves[i].moveRating === 'book') return i
    }

    return -1
}

export default function Moves(props: { moves: move[], overallGameComment: string, chartSize: {width: number, height: number} }) {
    const { moves, overallGameComment, chartSize } = props

    const [turns, setTurns] = useState<[number, string, string | undefined][]>([])
    const [movesHeight, setMovesHeight] = useState(0)

    const analyzeContext = useContext(AnalyzeContext)

    const [moveNumber, setMoveNumber] = analyzeContext.moveNumber
    const [animation, setAnimation] = analyzeContext.animation
    const [forward, setForward] = analyzeContext.forward

    const componentRef = useRef<HTMLDivElement>(null)
    const commentsRef = useRef<HTMLDivElement>(null)
    const moveListRef = useRef<HTMLUListElement>(null)
    const gameChartRef = useRef<HTMLDivElement>(null)
    const currentMoveRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const realMoves = moves.slice(1)

        const newTurns: typeof turns = []
        for (let i = 0; i < realMoves.length; i += 2) {
            const turn = realMoves.slice(i, i + 2) as [move, move]
            const turnNumber = (i + 2) / 2

            if (turn[1]) {
                newTurns.push([turnNumber, turn[0].san ?? '', turn[1].san ?? ''])
            } else {
                newTurns.push([turnNumber, turn[0].san ?? '', undefined])
            }
        }

        setTurns(newTurns)
    }, [moves])

    useEffect(() => {
        currentMoveRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })

        if (moveNumber === 0) {
            void moveListRef.current?.offsetHeight

            moveListRef.current?.scrollTo({
                behavior: "smooth",
                top: 0,
            })
        }
    }, [moveNumber])

    useEffect(() => {
        setTimeout(() => {
            currentMoveRef.current?.scrollIntoView({
                behavior: 'instant',
                block: 'start',
            })
    
            if (moveNumber === 0) {
                void moveListRef.current?.offsetHeight
    
                moveListRef.current?.scrollTo({
                    behavior: "instant",
                    top: 0,
                })
            }
        }, 0)
    }, [])

    useEffect(() => {
        function resizeMoves() {
            if (!componentRef.current || !commentsRef.current || !moveListRef.current || !gameChartRef.current) return

            const totalHeight = componentRef.current.offsetHeight

            const commentsHeight = commentsRef.current.offsetHeight
            const gameChartHeight = gameChartRef.current.offsetHeight

            const newMovesHeight = totalHeight - (commentsHeight + gameChartHeight)

            setMovesHeight(newMovesHeight)
        }

        resizeMoves()

        window.addEventListener('resize', resizeMoves)

        return () => window.removeEventListener('resize', resizeMoves)
    }, [])

    function handleMoveClick(number: number) {
        setMoveNumber(number)

        const numberDiff = moveNumber - number

        if (numberDiff === 1) {
            setAnimation(true)
            setForward(false)
        } else if (numberDiff === -1) {
            setAnimation(true)
            setForward(true)
        }
    }

    const lastBookMove = getLastBookMove(moves)

    return (
        <div ref={componentRef} className="flex flex-col gap-3 items-center h-full">
            <div ref={commentsRef} className="w-full flex flex-col items-center">
                <Comments comment={moves[moveNumber]?.comment} rating={moves[moveNumber]?.moveRating} moveSan={moves[moveNumber]?.san} evaluation={moves[moveNumber].staticEval} white={moves[moveNumber].color === WHITE} overallGameComment={overallGameComment} />
            </div>
            <ul style={{height: (movesHeight || '100%')}} ref={moveListRef} className="gap-y-1 overflow-y-auto overflow-x-hidden w-[85%] select-none flex flex-col">
                {turns.map((turn, i) => {
                    const currentMoveNumber = (i * 2) + 1
                    return (
                        <li key={i} className="flex flex-row text-foregroundGrey items-center">
                            <span className="font-bold w-[33px]">{turn[0]}.</span>
                            <div className="flex flex-row text-lg font-extrabold">
                                {turn.slice(1).map((move, j) => {
                                    if (!move) return null

                                    const isWhite = j === 0
                                    let adjustedMoveNumber = currentMoveNumber
                                    if (!isWhite) adjustedMoveNumber++

                                    const isSelected = moveNumber === adjustedMoveNumber

                                    const rating = moves[adjustedMoveNumber].moveRating

                                    const prevRating = moves[adjustedMoveNumber - 1]?.moveRating
                                    const nextRating = moves[adjustedMoveNumber + 1]?.moveRating

                                    const ratingStyle = getRatingStyle(adjustedMoveNumber, rating, prevRating, nextRating, lastBookMove)

                                    const fgColorClass = ratingStyle ? ratingStyle.textClass : isSelected ? 'text-foregroundHighlighted' : ''

                                    return (
                                        <div ref={isSelected ? currentMoveRef : null} key={`${i}-${j}`} className="w-[180px] flex flex-row gap-1 items-center">
                                            <button type="button" onClick={() => handleMoveClick(adjustedMoveNumber)} className="w-[22px]">{ratingStyle ? <Image src={ratingStyle.src} alt={rating ?? ''} width={22} height={22} /> : ''}</button>
                                            <button type="button" onClick={() => handleMoveClick(adjustedMoveNumber)} className={`rounded-borderRoundness border-b-2 text-left px-2 w-fit ${isSelected ? 'bg-backgroundBoxBox border-backgroundBoxBoxHover' : 'border-transparent'} ${fgColorClass}`}>{move}</button>
                                        </div>
                                    )
                                })}
                            </div>
                        </li>
                    )
                })}
            </ul>
            <div ref={gameChartRef}>
                <GameChart size={chartSize} moves={moves} />
            </div>
        </div>
    )
}