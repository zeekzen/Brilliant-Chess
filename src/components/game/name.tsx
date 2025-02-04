import { PieceSymbol } from "chess.js"
import Profile from "../svg/profile"
import CapturedPieces from "./capturedPieces"

export default function Name(props: { white: boolean, children: React.ReactNode, captured: PieceSymbol[], materialAdvantage: number }) {
    const { white, captured, materialAdvantage } = props
    const name = props.children

    return (
        <div className="flex flex-row items-start text-sm font-bold text-foregroundHighlighted gap-2">
            <div className={`h-11 w-11 flex flex-row justify-center items-end ${white ? "bg-backgroundProfileWhite" : "bg-backgroundProfileBlack"}`}>
                <Profile width={40} height={40} class={`${white ? "fill-foregroundProfileWhite" : "fill-foregroundProfileBlack"}`} />
            </div>
            <div className="flex flex-col justify-between h-11">
                <span className="h-fit pb-[1px] pt-[2px] select-text text-nowrap">{name}</span>
                <CapturedPieces advantage={materialAdvantage} white={white} pieces={captured} />
            </div>
        </div>
    )
}