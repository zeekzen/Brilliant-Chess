export default function Clock(props: { white: boolean, moving: boolean, time: string }) {
    const { white, moving, time } = props

    return (
        <div className={`flex justify-end pr-3 text-2xl font-bold items-center h-10 w-36 rounded-borderRoundness ${moving ? "" : "opacity-50"} ${white ? "bg-backgroundWhiteClock" : "bg-backgroundBlackClock"} ${white ? "text-backgroundBlackClock" : "text-backgroundWhiteClock"}`}>
            {time}
        </div>
    )
}