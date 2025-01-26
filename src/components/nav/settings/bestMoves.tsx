import { ConfigContext } from "@/context/config"
import { useContext, useEffect } from "react"
import { boardThemes } from "./themes"
import { Arrow } from "@/components/game/board"
import Image from "next/image"

export default function BestMoves() {
    const configContext = useContext(ConfigContext)

    const [boardTheme, setBoardTheme] = configContext.boardTheme
    const [showArrows, setShowArrows] = configContext.showArrows

    useEffect(() => {
        const showArrows = localStorage.getItem('showArrows')
        if (!showArrows) return
        const numberShowArrows = Number(showArrows)
        if (!isNaN(numberShowArrows)) {
            setShowArrows(Boolean(numberShowArrows))
        } else {
            localStorage.setItem('showArrows', '1')
            setShowArrows(true)
        }
    }, [])

    function toggleShowArrows() {
        const newShowArrows = !showArrows

        localStorage.setItem('showArrows', String(Number(newShowArrows)))

        setShowArrows(newShowArrows)
    }

    return (
        <section>
            <h1 className="block bg-backgroundBoxBox font-bold text-nowrap p-3 text-foreground">Best Moves</h1>
            <button onClick={toggleShowArrows} type="button" className="flex flex-row gap-2 items-center hover:text-foregroundHighlighted hover:bg-black transition-colors w-full relative p-2">
                            <div className="grid grid-cols-2 w-fit relative">
                                {Array.from({ length: 4 }).map((_, i) => {
                                    const isEvenCol = i % 2 === 0
                                    const isEvenRow = Math.floor(i / 2) % 2 === 0
            
                                    const squareColor = isEvenCol ? (isEvenRow ? boardThemes[boardTheme].white : boardThemes[boardTheme].black) : (isEvenRow ? boardThemes[boardTheme].black : boardThemes[boardTheme].white)
            
                                    return (
                                        <div key={i} style={{ backgroundColor: squareColor }} className="h-5 w-5 relative">
                                            {i === 2 ? <Image src="/images/pieces/white/queen.svg" width={20} height={20} alt="queen" className="absolute top-0 left-0" /> : null}
                                        </div>
                                    )
                                })}
                                <Arrow move={[{ col: 0, row: 1 }, {col: 1, row: 1}]} squareSize={20} white class="fill-normalArrow stroke-normalArrow" />
                            </div>
                            <span className="font-bold text-lg">Show arrows</span>
                            <div style={{backgroundColor: "var(--foreground)", display: showArrows ? '' : 'none'}} className="w-3 h-3 rounded-full absolute right-3" />
                        </button>
        </section>
    )
}