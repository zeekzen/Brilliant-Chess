import { AnalyzeContext } from "@/context/analyze"
import { move } from "@/server/analyze"
import { BLACK, WHITE } from "chess.js"
import { useContext, useEffect, useState } from "react"

export default function Moves(props: { gameChart: JSX.Element, moves: move[] }) {
    const { gameChart, moves } = props

    const [turns, setTurns] = useState<[number, string, string][]>([])

    const [moveNumber, setMoveNumber] = useContext(AnalyzeContext).moveNumber
    const [animation, setAnimation] = useContext(AnalyzeContext).animation
    const [forward, setForward] = useContext(AnalyzeContext).forward

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
            <ul className="gap-y-1 overflow-y-auto overflow-x-hidden h-72 w-[85%] select-none flex flex-col">
                {turns.map((turn, i) => {
                    const currentMoveNumber = (i * 2) + 1

                    return (
                        <li key={i} className="flex flex-row text-foregroundGrey items-center">
                            <span className="font-bold w-[33px]">{turn[0]}.</span>
                            <div className="flex flex-row gap-24 text-lg font-extrabold">
                                {turn.slice(1).map((move, j) => {
                                    const isWhite = j === 0
                                    let adjustedMoveNumber = currentMoveNumber
                                    if (!isWhite) adjustedMoveNumber++

                                    const isSelected = moveNumber === adjustedMoveNumber

                                    return <button type="button" key={`${i}-${j}`} onClick={() => handleMoveClick(adjustedMoveNumber)} className={`w-[50px] rounded-borderRoundness border-b-2 ${isSelected ? 'text-foregroundHighlighted bg-backgroundBoxBox border-backgroundBoxBoxHover' : 'border-transparent'}`}>{move}</button>
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