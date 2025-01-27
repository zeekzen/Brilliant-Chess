import Image from "next/image"
import { RATING_STYLE } from "./moves"
import { moveRating } from "@/engine/stockfish"

const RATING_FORMATS_GUIDE = {
    _isA_Move: 'is a _ move',
    _isAn_Move: 'is an _ move',
    _is_: 'is _',
    _isAn_: 'is an _',
    _isA_: 'is a _',
}

const RATING_FORMATS = {
    book: RATING_FORMATS_GUIDE._isA_Move,
    forced: RATING_FORMATS_GUIDE._is_,
    brilliant: RATING_FORMATS_GUIDE._is_,
    great: RATING_FORMATS_GUIDE._isA_Move,
    best: RATING_FORMATS_GUIDE._is_,
    excellent: RATING_FORMATS_GUIDE._is_,
    good: RATING_FORMATS_GUIDE._is_,
    inaccuracy: RATING_FORMATS_GUIDE._isAn_,
    mistake: RATING_FORMATS_GUIDE._isA_,
    miss: RATING_FORMATS_GUIDE._isA_,
    blunder: RATING_FORMATS_GUIDE._isA_,
}

function formatEval(evaluation: string[], white: boolean) {
    const number = (Number(evaluation[1]) / 100) * (white ? 1 : -1)
            
    let prevChar = ''
    if (number > 0) prevChar = '+'
    if (number < 0) prevChar = '-'

    return (
        <div style={{backgroundColor: prevChar === '-' ? 'var(--evaluationBarBlack)' : 'var(--evaluationBarWhite)', color: prevChar === '-' ? 'var(--foreground)' : 'var(--foregroundBlack)', filter: prevChar === '-' ? '' : 'brightness(0.9)'}} className="rounded-borderRoundness px-2 py-1 font-extrabold w-[61px] text-center">
            {(() => {
                if (evaluation[0] === 'mate' && evaluation[1]) {
                    return prevChar + "M" + Math.abs(Number(evaluation[1]))
                } else if (!evaluation[1]) {
                    if (white) return '0-1'
                    else return '1-0'
                } else {
                    return prevChar + Math.abs(number).toFixed(2)
                }
            })()}
        </div>
    )
}

export default function Comments(props: { comment?: string, rating?: moveRating, moveSan?: string, evaluation: string[], white: boolean, overallGameComment: string }) {
    const { comment, rating, moveSan, evaluation, white, overallGameComment } = props

    if (!comment || !rating || !moveSan) {
        return (
            <div className="bg-white w-[85%] rounded-borderExtraRoundness p-4 font-bold text-lg text-foregroundBlack" dangerouslySetInnerHTML={{ __html: overallGameComment }} />
        )
    }

    const ratingSrc = '/images/rating/' + RATING_STYLE[rating].icon

    return (
        <div style={{backgroundColor: "#ffffff"}} className="h-44 w-[85%] p-4 rounded-borderExtraRoundness text-foregroundBlack text-lg font-bold flex flex-col gap-1">
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row items-center gap-2">
                    <Image src={ratingSrc} alt={'rating'} width={32} height={32} />
                    <span>{moveSan} {RATING_FORMATS[rating].replace('_', rating)}</span>
                </div>
                {formatEval(evaluation, white)}
            </div>
            <div>
                {comment}
            </div>
        </div>
    )
}