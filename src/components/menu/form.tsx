import { useRef, useState } from "react"
import Arrow from "../svg/arrow"
import Image from "next/image"

export const FORMATS = [
    ["Chess.com", "/images/chesscom.svg", "platform"],
    ["Lichess.org", "/images/lichess.svg", "platform"],
    ["PGN", "/images/pgn.svg", "format"],
    ["FEN", "/images/json.svg", "format"],
] as const

export const TYPES = [
    ["Quick", "/images/quick.svg", 15, "Depth: 15"],
    ["Standard", "/images/standard.svg", 18, "Depth: 18"],
    ["Deep", "/images/deep.svg", 21, "Depth: 21"],
] as const

export default function Form(props: {setData: (data: [number, [string, number]]) => void, display: boolean}) {
    const [isSelecting, setSelecting] = useState(false)
    const [selected, select] = useState(0)
    const [type, setType] = useState(1)

    const setData = props.setData
    
    const inputRef = useRef<HTMLInputElement>(null)

    function analyze(e: React.FormEvent) {
        e.preventDefault()

        const value = inputRef.current?.value ?? ""
        const depth = TYPES[type][2]
        setData([selected, [value, depth]])
    }

    function changeSelected(i: number) {
        select(i)
        setSelecting(false)

        const input = inputRef.current
        input?.focus()
    }

    function isAPlatform(i: number) {
        return FORMATS[i][2] === "platform"
    }

    const inputPlaceholder = isAPlatform(selected) ?
        `Enter your ${FORMATS[selected][0]} user here` :
        `Paste your ${FORMATS[selected][0]} code here`

    const analyzeValue = isAPlatform(selected) ?
        "List games" :
        "Analyze"

    return (
        <form style={{display: props.display ? '' : 'none'}} onSubmit={analyze} className="flex flex-col items-center gap-4">
            <input type="text" ref={inputRef} placeholder={inputPlaceholder} className="w-[85%] h-14 p-2 transition-colors text-xl font-bold rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none placeholder:text-placeholder placeholder:font-normal" />
            <div className="w-[85%] flex flex-col gap-2">
                <button type="button" className="flex flex-row gap-1 items-center justify-center w-full h-14 rounded-borderRoundness text-xl bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover hover:text-foregroundHighlighted transition-colors font-bold relative" onClick={e => { e.preventDefault(); setSelecting(isSelecting => !isSelecting) }}>
                    <img src={FORMATS[selected][1]} className="h-7" />
                    {FORMATS[selected][0]}
                    <div className={`absolute h-full right-6 top-0 flex flex-row items-center ${isSelecting ? "" : "rotate-180"}`}><Arrow class="fill-foregroundGrey" /></div>
                </button>
                <div className="flex flex-col gap-2" style={{ display: isSelecting ? "" : "none" }}>
                    <h6 className="mt-2 font-bold flex flex-row gap-1"><Image alt="depth" src="/images/formats.svg" width={18} height={0} />Game Formats</h6>
                    <ul className="grid grid-cols-2 gap-3">
                        {FORMATS.map((format, i) => {
                            return (
                                <li key={i}>
                                    <button type="button" onClick={() => changeSelected(i)} style={{gap: i !== 0 ? '.4rem' : '0'}} className="flex flex-row items-center justify-center h-12 w-full hover:text-foregroundHighlighted rounded-borderRoundness text-md bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover transition-colors font-bold">
                                        <Image alt="format" src={format[1]} width={150} height={0} className="h-6 w-fit" priority />
                                        {format[0]}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                    <h6 className="mt-2 font-bold flex flex-row gap-2"><Image alt="depth" src="/images/type.svg" width={20} height={0} />Analysis Type</h6>
                    <ul className="grid grid-cols-3 gap-3">
                        {TYPES.map((depth, i) => {
                            return (
                                <li key={i}>
                                    <button title={depth[3]} type="button" onClick={() => setType(i)} style={{gap: i !== 0 ? '.4rem' : '0'}} className={`flex flex-row items-center justify-center h-10 w-full hover:text-foregroundHighlighted rounded-borderRoundness text-md bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover transition-colors font-bold border-backgroundBoxBoxHighlighted ${type === i ? "border-[2px]" : ""}`}>
                                        <Image alt="format" src={depth[1]} width={150} height={0} className="h-5 w-fit" priority />
                                        {depth[0]}
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
            <input type="submit" className="w-[85%] h-16 cursor-pointer rounded-borderExtraRoundness text-2xl bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover transition-all font-extrabold hover:shadow-shadowBoxBoxHighlighted" value={analyzeValue} />
        </form>
    )
}