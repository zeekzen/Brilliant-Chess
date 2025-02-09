import { ConfigContext } from "@/context/config"
import { useContext, useEffect } from "react"
import { boardThemes } from "./themes"
import Image from "next/image"

export default function Moves() {
    const configContext = useContext(ConfigContext)

    const [boardTheme, setBoardTheme] = configContext.boardTheme
    const [showLegalMoves, setShowLegalMoves] = configContext.showLegalMoves

    useEffect(() => {
        const showLegalMoves = localStorage.getItem('showLegalMoves')
        if (!showLegalMoves) return
        const numberShowLegalMoves = Number(showLegalMoves)
        if (!isNaN(numberShowLegalMoves)) {
            setShowLegalMoves(Boolean(numberShowLegalMoves))
        } else {
            localStorage.setItem('showLegalMoves', '1')
            setShowLegalMoves(true)
        }
    }, [])

    function toggleShowLegalMoves() {
        const newShowLegalMoves = !showLegalMoves

        localStorage.setItem('showLegalMoves', String(Number(newShowLegalMoves)))

        setShowLegalMoves(newShowLegalMoves)
    }

    return (
        <div>
            <section>
            <h1 className="block bg-backgroundBoxBox font-bold text-nowrap p-3 text-foreground">Moves</h1>
                <button onClick={toggleShowLegalMoves} role="switch" type="button" className="flex flex-row gap-2 items-center hover:text-foregroundHighlighted hover:bg-black transition-colors w-full relative p-2">
                    <div className="grid grid-cols-2 w-fit">
                        {Array.from({ length: 4 }).map((_, i) => {
                            const isEvenCol = i % 2 === 0
                            const isEvenRow = Math.floor(i / 2) % 2 === 0

                            const squareColor = isEvenCol ? (isEvenRow ? boardThemes[boardTheme].white : boardThemes[boardTheme].black) : (isEvenRow ? boardThemes[boardTheme].black : boardThemes[boardTheme].white)

                            return (
                                <div key={i} style={{ backgroundColor: squareColor }} className="h-5 w-5 relative">
                                    {i === 2 ? <div className="bg-opacity-50" style={{ backgroundColor: boardThemes[boardTheme].highlight }}><Image src="/images/pieces/white/bishop.svg" alt="bishop" width={20} height={20} /></div> : null}
                                    {i === 1 && showLegalMoves ? <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center pointer-events-auto"><div className="bg-black opacity-[25%] w-[30%] h-[30%] rounded-full" /></div> : null }
                                </div>
                            )
                        })}
                    </div>
                    <span className="font-bold text-lg">Show legal moves</span>
                    <div style={{backgroundColor: "var(--foreground)", display: showLegalMoves ? '' : 'none'}} className="w-3 h-3 rounded-full absolute right-3" />
                </button>
            </section>
        </div>
    )
}