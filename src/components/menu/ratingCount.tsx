import { move } from "@/server/analyze";
import Image from "next/image";
import { useEffect, useState } from "react";

const ratings = [
    "brilliant", // text-highlightBrilliant
    "great", // text-highlightGreat
    "best", // text-highlightBest
    "excellent", // text-highlightExcellent
    "good", // text-highlightGood
    "book", // text-highlightBook
    "inaccuracy", // text-highlightInaccuracy
    "mistake", // text-highlightMistake
    "miss", // text-highlightMiss
    "blunder", // text-highlightBlunder
]

function title(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function RatingCount(props: {moves: move[]}) {
    const [counter, setCounter] = useState<{w: {[key: string]: number}, b: {[key: string]: number}}>({w: {}, b: {}})
    const { moves } = props

    useEffect(() => {
        const newCounter: {w: {[key: string]: number}, b: {[key: string]: number}} = {w: {}, b: {}}
        moves.forEach((move, i) => {
            const rating = move.moveRating as string
            const color = i%2===0 ? 'b' : 'w'

            newCounter[color][rating] = newCounter[color][rating] + 1 || 1
        })
        setCounter(newCounter)
    }, [])

    return (
        <div className="w-[85%] flex flex-col gap-3 justify-center pr-[35px]">
            {ratings.map(rating => {
                const titleRating = title(rating)

                return (
                    <div key={rating} className="flex flex-row items-center justify-between">
                        <span className="font-bold text-foregroundGrey text-lg">{titleRating}</span>
                        <div className="flex flex-row text-xl font-extrabold w-48">
                            <span className={`w-[81px] text-left text-highlight${titleRating}`}>{counter.w[rating] ?? 0}</span>
                            <Image className="select-none" alt={rating} src={`/images/rating/${rating}.svg`} width={30} height={30} priority />
                            <span className={`w-[81px] text-right text-highlight${titleRating}`}>{counter.b[rating] ?? 0}</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}