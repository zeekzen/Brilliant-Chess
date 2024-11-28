"use client"

import { useState } from "react"
import Arrow from "../svg/arrow"

const FORMATS = [
    "Chess.com",
    "Lichess.org",
    "PGN",
    "JSON"
]

function analize(e: React.FormEvent) {
    e.preventDefault()
}

export default function Form() {
    const [isSelecting, setSelecting] = useState(false)
    const [selected, select] = useState(0)

    function changeSelected(i: number) {
        select(i)
        setSelecting(false)
    }

    return (
        <form onSubmit={analize} className="flex flex-col items-center gap-4">
            <input type="text" className="w-[85%] h-14 p-2 transition-colors text-xl rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none" />
            <div className="w-[85%] flex flex-col gap-4">
                <button type="button" className="w-full h-14 rounded-borderRoundness text-xl bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted transition-colors font-bold relative" onClick={e => {e.preventDefault(); setSelecting(isSelecting => !isSelecting)}}>
                    {FORMATS[selected]}
                    <div className={`absolute h-full right-6 top-0 flex flex-row items-center ${isSelecting ? "" : "rotate-180"}`}><Arrow class="fill-foregroundGrey" /></div>
                </button>
                <ul style={{display: isSelecting ? "" : "none"}} className="grid grid-cols-2 gap-4">
                    {FORMATS.map((format, i) => {
                        return (
                            <li key={i}><button onClick={() => changeSelected(i)} className="h-12 w-full hover:text-foregroundHighlighted rounded-borderRoundness text-md bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover transition-colors font-bold">{format}</button></li>
                        )
                    })}
                </ul>
            </div>
            <input type="submit" className="w-[85%] h-16 rounded-borderExtraRoundness text-2xl bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover transition-colors font-extrabold hover:shadow-shadowBoxBoxHighlighted" value="Analyze" />
        </form>
    )
}