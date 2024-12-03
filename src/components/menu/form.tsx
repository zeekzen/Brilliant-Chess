"use client"

import { useContext, useRef, useState } from "react"
import Arrow from "../svg/arrow"
import { AnalyzeContext } from "@/context/analyze"

const FORMATS = [
    ["Chess.com", "/images/chesscom.svg"],
    ["Lichess.org", "/images/lichess.svg"],
    ["PGN", "/images/pgn.svg"],
    ["FEN", "/images/json.svg"]
]

export default function Form() {
    const [isSelecting, setSelecting] = useState(false)
    const [selected, select] = useState(0)

    const [data, setData] = useContext(AnalyzeContext)
    
    const inputRef = useRef<HTMLInputElement>(null)

    function analize(e: React.FormEvent) {
        e.preventDefault()

        const value = inputRef.current?.value ?? ""
        setData(value)
    }

    function changeSelected(i: number) {
        select(i)
        setSelecting(false)
    }

    const inputPlaceholder = FORMATS[selected][0] === "Chess.com" || FORMATS[selected][0] === "Lichess.org" ?
        `Enter your ${FORMATS[selected][0]} user here` :
        `Paste your ${FORMATS[selected][0]} code here`

    return (
        <form onSubmit={analize} className="flex flex-col items-center gap-4">
            <input type="text" ref={inputRef} placeholder={inputPlaceholder} className="w-[85%] h-14 p-2 transition-colors text-xl font-bold rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none placeholder:text-placeholder placeholder:font-normal" />
            <div className="w-[85%] flex flex-col gap-4">
                <button type="button" className="flex flex-row gap-1 items-center justify-center w-full h-14 rounded-borderRoundness text-xl bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted transition-colors font-bold relative" onClick={e => { e.preventDefault(); setSelecting(isSelecting => !isSelecting) }}>
                    <img src={FORMATS[selected][1]} className="h-7" />
                    {FORMATS[selected][0]}
                    <div className={`absolute h-full right-6 top-0 flex flex-row items-center ${isSelecting ? "" : "rotate-180"}`}><Arrow class="fill-foregroundGrey" /></div>
                </button>
                <ul style={{ display: isSelecting ? "" : "none" }} className="grid grid-cols-2 gap-4">
                    {FORMATS.map((format, i) => {
                        return (
                            <li key={i}>
                                <button onClick={() => changeSelected(i)} className="flex flex-row gap-1 items-center justify-center h-12 w-full hover:text-foregroundHighlighted rounded-borderRoundness text-md bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover transition-colors font-bold">
                                    <img src={format[1]} className="h-6" />
                                    {format[0]}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <input type="submit" className="w-[85%] h-16 cursor-pointer rounded-borderExtraRoundness text-2xl bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover transition-all font-extrabold hover:shadow-shadowBoxBoxHighlighted" value="Analyze" />
        </form>
    )
}