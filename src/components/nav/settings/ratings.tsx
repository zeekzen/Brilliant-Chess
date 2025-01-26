import { capitalizeFirst } from "@/components/menu/analyze/selectChessCom"
import { ConfigContext } from "@/context/config"
import Image from "next/image"
import { useContext } from "react"

const ratings = [
    "brilliant",
    "great",
    "best",
    "excellent",
    "good",
    "book",
    "inaccuracy",
    "mistake",
    "miss",
    "blunder",
    "forced",
]

export default function Ratings() {
    const configContext = useContext(ConfigContext)

    const [usedRatings, setUsedRatings] = configContext.usedRatings

    return (
        <section>
            <h1 className="block bg-backgroundBoxBox font-bold text-nowrap p-3 text-foreground">Ratings</h1>
            {ratings.map((rating, i) => {
                const src = `/images/rating/${rating}.svg`
                const color = rating === 'forced' ? 'var(--highlightGood)' : `var(--highlight${capitalizeFirst(rating)})`

                function toggleRating() {
                    setUsedRatings({
                        ...usedRatings,
                        [rating]: !usedRatings[rating as keyof typeof usedRatings]
                    })
                }

                return (
                    <button onClick={toggleRating} type="button" key={i} className="flex flex-row gap-2 items-center hover:text-foregroundHighlighted hover:bg-black transition-colors w-full relative p-2">
                        <Image alt={rating} src={src} height={35} width={35} className="w-10 h-10 p-[2.5px]" />
                        <span className="font-bold text-lg">{capitalizeFirst(rating)}</span>
                        <div style={{backgroundColor: color, display: usedRatings[rating as keyof typeof usedRatings] ? '' : 'none'}} className="w-3 h-3 rounded-full absolute right-3" />
                    </button>
                )
            })}
        </section>
    )
}