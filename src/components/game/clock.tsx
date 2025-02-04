import { Color } from "chess.js"

export default function Clock(props: { white: boolean, colorMoving: Color, children: React.ReactNode }) {
    const { white, colorMoving } = props
    const time = props.children

    const moving = white ? colorMoving === 'w' : colorMoving === 'b'

    return (
        <div className={`flex text-nowrap justify-end pr-3 text-2xl font-bold items-center h-11 w-36 rounded-borderRoundness ${moving ? "" : "opacity-50"} ${white ? "bg-backgroundWhiteClock" : "bg-backgroundBlackClock"} ${white ? "text-backgroundBlackClock" : "text-backgroundWhiteClock"}`}>
            {time}
        </div>
    )
}