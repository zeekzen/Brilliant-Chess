import { AnalyzeContext } from "@/context/analyze"
import { move, moveRating } from "@/server/analyze"
import Image from "next/image"
import { useContext, useEffect, useRef, useState } from "react"

const RATING_STYLE = {
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

function getRatingStyle(rating: moveRating | undefined, prevRating: moveRating | undefined, nextRating: moveRating | undefined): { src: string, textClass: string } | undefined {
    if (!rating) return

    const path = '/images/rating/'

    if (rating === 'book' && nextRating !== 'book') return { src: path + RATING_STYLE[rating].icon, textClass: RATING_STYLE[rating].color }

    if (rating === 'best' && prevRating === 'inaccuracy') return { src: path + RATING_STYLE[rating].icon, textClass: RATING_STYLE[rating].color }

    if (rating === 'blunder' || rating === 'mistake' || rating === 'miss' || rating === 'great' || rating === 'brilliant') return { src: path + RATING_STYLE[rating].icon, textClass: RATING_STYLE[rating].color }

    return
}

export default function Moves(props: { gameChart: JSX.Element, moves: move[] }) {
    const { gameChart, moves } = props

    const [turns, setTurns] = useState<[number, string, string][]>([])

    const [moveNumber, setMoveNumber] = useContext(AnalyzeContext).moveNumber
    const [animation, setAnimation] = useContext(AnalyzeContext).animation
    const [forward, setForward] = useContext(AnalyzeContext).forward

    const moveListRef = useRef<HTMLUListElement>(null)
    const currentMoveRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const realMoves = moves.slice(1)

        const newTurns: [number, string, string][] = []
        for (let i = 0; i < realMoves.length; i += 2) {
            const turn = realMoves.slice(i, i + 2) as [move, move]
            const turnNumber = (i + 2) / 2
            newTurns.push([turnNumber, turn[0].san ?? '', turn[1].san ?? ''])
        }

        setTurns(newTurns)
    }, [moves])

    useEffect(() => {
        currentMoveRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        })

        if (moveNumber === 0) {
            moveListRef.current?.scrollTo({
                behavior: "smooth",
                top: 0,
            })
        }
    }, [moveNumber])

    function handleMoveClick(number: number) {
        setMoveNumber(number)

        const numberDiff = moveNumber - number

        if (numberDiff === 1) {
            setAnimation(true)
            setForward(false)
        } else if (numberDiff === -1) {
            setAnimation(true)
            setForward(true)
        } else {
            setAnimation(false)
        }
    }

    return (
        <div className="flex flex-col gap-3 items-center">
            <ul ref={moveListRef} className="gap-y-1 overflow-y-auto overflow-x-hidden h-72 w-[85%] select-none flex flex-col">
                {turns.map((turn, i) => {
                    const currentMoveNumber = (i * 2) + 1

                    return (
                        <li key={i} className="flex flex-row text-foregroundGrey items-center">
                            <span className="font-bold w-[33px]">{turn[0]}.</span>
                            <div className="flex flex-row text-lg font-extrabold">
                                {turn.slice(1).map((move, j) => {
                                    const isWhite = j === 0
                                    let adjustedMoveNumber = currentMoveNumber
                                    if (!isWhite) adjustedMoveNumber++

                                    const isSelected = moveNumber === adjustedMoveNumber

                                    const rating = moves[adjustedMoveNumber].moveRating

                                    const prevRating = moves[adjustedMoveNumber - 1]?.moveRating
                                    const nextRating = moves[adjustedMoveNumber + 1]?.moveRating

                                    const ratingStyle = getRatingStyle(rating, prevRating, nextRating)

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
            <div>
                {gameChart}
            </div>
        </div>
    )
}