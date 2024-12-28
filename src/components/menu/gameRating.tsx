import RatingBox from "./ratingBox"

function getRating(accuracy: number): number {
    function nonLinearFunction(x: number): number {
        return 1.5 * Math.pow(x, 4)
    }

    const minAccuracy = 40
    const maxAccuracy = 100

    const minRating = 300
    const maxRating = 3000

    const normalizedAccuracy = (accuracy - minAccuracy) / (maxAccuracy - minAccuracy)
    const nonLinearAccuracy = nonLinearFunction(normalizedAccuracy)

    const rating = ((maxRating - minRating) * nonLinearAccuracy) + minRating
    const roundedRating = Math.round(rating / 50) * 50

    return isNaN(roundedRating) ? 0 : roundedRating
}

export default function GameRating(props: { accuracy: { w: number, b: number } }) {
    const { accuracy } = props

    return (
        <div className="w-[85%] flex flex-col items-end gap-3">
            <div className="flex flex-row w-full justify-between items-center">
                <span className="font-bold text-foregroundGrey text-lg">Game Rating</span>
                <div className="flex flex-row w-[262px] justify-between">
                    <RatingBox white>{getRating(accuracy.w)}</RatingBox>
                    <RatingBox>{getRating(accuracy.b)}</RatingBox>
                </div>
            </div>
        </div>
    )
}