export default function Evaluation(props: { height: number, white: boolean, advantage: number}) {
    const { height, white, advantage } = props

    const OLD_PERCENTS = [-4, 4]
    const NEW_PERCENTS = [5, 95]

    const winning = advantage >= 0
    const rawPercent = ((advantage - OLD_PERCENTS[0]) * (NEW_PERCENTS[1] - NEW_PERCENTS[0])) / (OLD_PERCENTS[1] - OLD_PERCENTS[0]) + NEW_PERCENTS[0]
    const percent = Math.min(Math.max(rawPercent, NEW_PERCENTS[0]), NEW_PERCENTS[1])

    return (
        <div style={{ height: height }} className={`w-9 bg-evaluationBarBlack overflow-hidden flex flex-col relative ${white ? "justify-end" : "justify-start"}`}>
            <div style={{height: `${percent}%`}} className="w-full bg-evaluationBarWhite" />
            <div className="absolute h-full flex flex-col justify-between w-full py-2 text-xs font-bold">
                <div style={{opacity: !winning ? 100 : 0}} className={`text-center ${white ? "text-foreground" : "text-background"}`}>{Math.abs(advantage).toFixed(1)}</div>
                <div style={{opacity: winning ? 100 : 0}} className={`text-center ${!white ? "text-foreground" : "text-background"}`}>{Math.abs(advantage).toFixed(1)}</div>
            </div>
        </div>
    )
}