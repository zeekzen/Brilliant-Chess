import { move } from "@/server/analyze"
import { useEffect, useRef, useState } from "react"

export default function GameChart(props: {moves: move[]}) {
    const { moves } = props

    const [svgSize, setSvgSize] = useState<{height: number, width: number}>({height: 0, width: 0})

    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        const container = svgRef.current?.parentElement
        setSvgSize({height: 96, width: (container?.offsetWidth ?? 0) * 0.85})
    }, [])

    function getMoveY(move: move, moveNumber: number) {
        const OLD_PERCENTS = [-400, 400]
        const NEW_PERCENTS = [0.1, 0.9]

        const advantage = move.staticEval ?? ['cp', 0]
        const whiteMoving = moveNumber%2 === 0

        const advantageAmount = Number(advantage[1]) * (whiteMoving ? 1 : -1)

        const rawPercent = ((advantageAmount - OLD_PERCENTS[0]) * (NEW_PERCENTS[1] - NEW_PERCENTS[0])) / (OLD_PERCENTS[1] - OLD_PERCENTS[0]) + NEW_PERCENTS[0]
        let percent
        if (advantage[0] === 'mate') {
            if (advantage[1]) {
                percent = advantageAmount >= 0 ? 1 : 0
            } else {
                percent = whiteMoving ? 0 : 1
            }
        } else {
            percent = Math.min(Math.max(rawPercent, NEW_PERCENTS[0]), NEW_PERCENTS[1])
        }

        return percent
    }

    function getMoveX(moveNumber: number, maxNumber: number) {
        return moveNumber / maxNumber
    }

    const totalMoves = moves.length - 1

    return (
        <svg width={svgSize.width} height={svgSize.height} ref={svgRef} className="bg-evaluationBarBlack rounded-borderRoundness">
            <path fill="#ffffff"
                d={`M 0 ${svgSize.height * 0.5} ${
                    moves.map((move, moveNumber) => {
                        const xRelation = getMoveX(moveNumber, totalMoves)
                        const yRelation = 1 - getMoveY(move, moveNumber)

                        const x = svgSize.width * xRelation
                        const y = svgSize.height * yRelation

                        return `L ${x} ${y}`
                    }).join(" ")
                } L ${svgSize.width} ${svgSize.height} L 0 ${svgSize.height}`}
            />
            <line x1={0} y1={svgSize.height / 2} x2={svgSize.width} y2={svgSize.height / 2} className="stroke-neutral-600 opacity-50 stroke-2" />
        </svg>
    )
}