export default function Evaluation(props: { height: number, white: boolean, advantage: string[], whiteMoving: boolean}) {
    const { height, white, advantage, whiteMoving } = props

    const OLD_PERCENTS = [-400, 400]
    const NEW_PERCENTS = [5, 95]

    const advantageAmount = Number(advantage[1]) * (whiteMoving ? 1 : -1)

    const winning = advantageAmount >= 0
    const rawPercent = ((advantageAmount - OLD_PERCENTS[0]) * (NEW_PERCENTS[1] - NEW_PERCENTS[0])) / (OLD_PERCENTS[1] - OLD_PERCENTS[0]) + NEW_PERCENTS[0]
    const percent = Math.min(Math.max(rawPercent, NEW_PERCENTS[0]), NEW_PERCENTS[1])

    const displayAdvantage = advantage[0] === 'mate' ? 'M' + Math.abs(advantageAmount) : (Math.abs(advantageAmount) / 100).toFixed(1)

    return (
        <div style={{ height: height }} className={`w-9 bg-evaluationBarBlack overflow-hidden flex flex-col relative ${white ? "justify-end" : "justify-start"}`}>
            <div style={{height: `${percent}%`}} className="w-full bg-evaluationBarWhite" />
            <div className="absolute h-full flex flex-col justify-between w-full py-2 text-xs font-bold">
                <div style={{opacity: !winning ? 100 : 0}} className={`text-center ${white ? "text-foreground" : "text-background"}`}>{displayAdvantage}</div>
                <div style={{opacity: winning ? 100 : 0}} className={`text-center ${!white ? "text-foreground" : "text-background"}`}>{displayAdvantage}</div>
            </div>
        </div>
    )
}