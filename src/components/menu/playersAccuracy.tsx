import { metadata } from "@/context/analyze";
import Profile from "../svg/profile";
import { move } from "@/server/analyze";
import { useEffect, useState } from "react";

export default function PlayersAccuracy(props: {metadata: metadata, moves: move[]}) {
    const { metadata, moves } = props
    const [accuracy, setAccuracy] = useState({w: NaN, b: NaN})

    useEffect(() => {
        const accuracies: {w: number[], b: number[]} = {w: [], b: []}
        let prevWinPerc: number
        moves.forEach((move, i) => {
            if (move.staticEval[0] === 'mate') return

            const white = i%2===1

            const staticEval = -Number(move.staticEval[1])

            const winPerc = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * staticEval)) - 1)

            if (i === 0) {
                prevWinPerc = 100 - winPerc

                return
            }

            const moveAccuracy = winPerc >= prevWinPerc ? 100 : 103.1668 * Math.exp(-0.04354 * (prevWinPerc - winPerc)) - 3.1669

            prevWinPerc = 100 - winPerc
            if (white) {
                accuracies.w.push(moveAccuracy)
            } else {
                accuracies.b.push(moveAccuracy)
            }
        })

        const sumWhite = accuracies.w.reduce((acc, cur) => acc + cur, 0)
        const sumBlack = accuracies.b.reduce((acc, cur) => acc + cur, 0)

        const avgWhite = sumWhite / accuracies.w.length
        const avgBlack = sumBlack / accuracies.b.length

        setAccuracy({w: avgWhite, b: avgBlack})
    }, [])

    function avg(arr: number[]) {
        const sum = arr.reduce((acc, cur) => acc + cur, 0)
        return sum / arr.length
    }

    return (
        <div className="w-[85%] flex flex-col items-end gap-3">
            <div className="w-[262px] flex flex-row justify-between font-extrabold">
                <div className="w-20 flex flex-row justify-center whitespace-nowrap overflow-visible"><span>{metadata?.names[0].split(" ").slice(0, -1).join(" ") ?? 'Unknown'}</span></div>
                <div className="w-20 flex flex-row justify-center whitespace-nowrap overflow-visible"><span>{metadata?.names[1].split(" ").slice(0, -1).join(" ") ?? 'Unknown'}</span></div>
            </div>
            <div className="flex flex-row w-full justify-between items-center">
                <span className="font-bold text-foregroundGrey text-lg">Players</span>
                <div className="flex flex-row w-[262px] justify-between">
                    <div className="h-20 w-20 flex flex-row justify-center items-end bg-backgroundProfileWhite rounded-borderRoundness">
                        <Profile width={70} height={70} class="fill-foregroundProfileWhite" />
                    </div>
                    <div className="h-20 w-20 flex flex-row justify-center items-end bg-backgroundProfileBlack rounded-borderRoundness">
                        <Profile width={70} height={70} class="fill-foregroundProfileBlack" />
                    </div>
                </div>
            </div>
            <div className="flex flex-row w-full justify-between items-center">
                <span className="font-bold text-foregroundGrey text-lg">Accuracy</span>
                <div className="flex flex-row w-[262px] justify-between">
                    <div className="w-20 bg-evaluationBarWhite py-2 rounded-borderRoundness text-2xl font-bold text-evaluationBarBlack text-center">{accuracy.w.toFixed(1)}</div>
                    <div className="w-20 bg-evaluationBarBlack py-2 rounded-borderRoundness text-2xl font-bold text-evaluationBarWhite text-center">{accuracy.b.toFixed(1)}</div>
                </div>
            </div>
        </div>
    )
}