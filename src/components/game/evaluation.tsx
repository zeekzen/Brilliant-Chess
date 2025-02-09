export default function Evaluation(props: { height: number, white: boolean, advantage: string[], whiteMoving: boolean }) {
    const { height, white, advantage, whiteMoving } = props

    const OLD_PERCENTS = [-400, 400]
    const NEW_PERCENTS = [5, 95]

    const advantageAmount = Number(advantage[1]) * (whiteMoving ? 1 : -1)

    const rawPercent = ((advantageAmount - OLD_PERCENTS[0]) * (NEW_PERCENTS[1] - NEW_PERCENTS[0])) / (OLD_PERCENTS[1] - OLD_PERCENTS[0]) + NEW_PERCENTS[0]
    let percent
    if (advantage[0] === 'mate') {
        if (advantage[1]) {
            percent = advantageAmount >= 0 ? 100 : 0
        } else {
            percent = whiteMoving ? 0 : 100
        }
    } else {
        percent = Math.min(Math.max(rawPercent, NEW_PERCENTS[0]), NEW_PERCENTS[1])
    }

    const winning = white ? percent >= 50 : percent <= 50

    let displayAdvantage
    if (advantage[0] === 'mate') {
        displayAdvantage = advantage[1] ?
            'M' + Math.abs(advantageAmount) :
            whiteMoving ? '0-1' : '1-0'
    } else {
        displayAdvantage = (Math.abs(advantageAmount) / 100).toFixed(1)
    }

    return (
        <div style={{ height: height }} className={`vertical:w-9 w-7 bg-evaluationBarBlack overflow-hidden flex flex-col relative ${white ? "justify-end" : "justify-start"}`}>
            <div style={{ height: `${percent}%`, transition: 'height 1.5s', willChange: 'height' }} className="w-full bg-evaluationBarWhite" />
            <div className="absolute h-full flex flex-col justify-between w-full vertical:py-2 py-1 vertical:text-xs text-[9px] font-bold">
                <div style={{ opacity: !winning ? 100 : 0 }} className={`text-center ${white ? "text-foreground" : "text-background"}`}>{displayAdvantage}</div>
                <div style={{ opacity: winning ? 100 : 0 }} className={`text-center ${!white ? "text-foreground" : "text-background"}`}>{displayAdvantage}</div>
            </div>
        </div>
    )
}