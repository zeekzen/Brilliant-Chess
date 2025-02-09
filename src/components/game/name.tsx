import { PieceSymbol } from "chess.js"
import Profile from "../svg/profile"
import CapturedPieces from "./capturedPieces"
import { maxVertical } from "../../../tailwind.config"

export default function Name(props: { white: boolean, children: React.ReactNode, captured: PieceSymbol[], materialAdvantage: number }) {
    const { white, captured, materialAdvantage } = props
    const name = props.children

    return (
        <div className="flex flex-row items-start vertical:text-sm text-[10px] font-bold text-foregroundHighlighted vertical:gap-2 gap-[6px] flex-grow overflow-x-auto overflow-y-hidden">
            <div className={`vertical:h-11 vertical:w-11 h-7 w-7 flex flex-row justify-center items-end ${white ? "bg-backgroundProfileWhite" : "bg-backgroundProfileBlack"}`}>
                <Profile width={window.innerWidth < maxVertical ? 24 : 40} height={window.innerWidth < maxVertical ? 24 : 40} class={`${white ? "fill-foregroundProfileWhite" : "fill-foregroundProfileBlack"}`} />
            </div>
            <div className="flex flex-col justify-between h-7 vertical:h-11">
                <span className="h-fit vertical:pb-[1px] vertical:pt-[2px] select-text text-nowrap">{name}</span>
                <CapturedPieces advantage={materialAdvantage} white={white} pieces={captured} />
            </div>
        </div>
    )
}