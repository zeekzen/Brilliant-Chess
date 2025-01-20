import { AnalyzeContext } from "@/context/analyze"
import { move } from "@/server/analyze"
import { useContext, useEffect, useState } from "react"

export default function GameChart(props: { moves: move[], size: { width: number, height: number } }) {
    const { moves, size } = props

    const [hoveredMove, setHoveredMove] = useState(NaN)

    const [moveNumber, setMoveNumber] = useContext(AnalyzeContext).moveNumber
    const [animation, setAnimation] = useContext(AnalyzeContext).animation
    const [forward, setForward] = useContext(AnalyzeContext).forward

    const totalMoves = moves.length - 1
    const hoveredMoveX = getMoveX(hoveredMove, totalMoves) * size.width
    const moveNumberX = getMoveX(moveNumber, totalMoves) * size.width

    function hoverMove(e: React.MouseEvent) {
        const svg = e.currentTarget as SVGAElement
        const svgPosition = svg.getBoundingClientRect().x

        const mousePosition = e.clientX

        const mouseInSvgPosition = mousePosition - svgPosition

        const moveSize = size.width / totalMoves
        const move = Math.round(mouseInSvgPosition / moveSize)

       setHoveredMove(move)
    }

    function changeMoveNumber() {
        if (hoveredMove === moveNumber) return

        if (Math.abs(moveNumber - hoveredMove) === 1) {
            setAnimation(true)
        } else {
            setAnimation(false)
        }
        if (hoveredMove > moveNumber) {
            setForward(true)
        } else {
            setForward(false)
        }
        setMoveNumber(hoveredMove)
    }

    function getMoveY(move: move, moveNumber: number) {
        const OLD_PERCENTS = [-400, 400]
        const NEW_PERCENTS = [0.075, 0.925]

        const advantage = move.staticEval ?? ['cp', 0]
        const whiteMoving = moveNumber % 2 === 0

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

    return (
        <svg onClick={changeMoveNumber} onMouseMove={hoverMove} onMouseLeave={() => setHoveredMove(NaN)} width={size.width} height={size.height} className="bg-evaluationBarBlack rounded-borderRoundness">
            <path fill="#ffffff"
                d={`M 0 ${size.height * 0.5} ${moves.map((move, moveNumber) => {
                    const xRelation = getMoveX(moveNumber, totalMoves)
                    const yRelation = 1 - getMoveY(move, moveNumber)

                    const x = size.width * xRelation
                    const y = size.height * yRelation

                    return `L ${x} ${y}`
                }).join(" ")
                    } L ${size.width} ${size.height} L 0 ${size.height}`}
            />
            <line x1={0} y1={size.height / 2} x2={size.width} y2={size.height / 2} className="stroke-neutral-500 opacity-75 stroke-2" />
            <line style={{display: !moveNumber ? 'none' : ''}} x1={moveNumberX} y1={size.height} x2={moveNumberX} y2={0} className="stroke-neutral-500 opacity-75 stroke-[3px]" />
            { isNaN(hoveredMoveX) ? '' : <line x1={hoveredMoveX} y1={size.height} x2={hoveredMoveX} y2={0} className="stroke-neutral-500 opacity-50 stroke-2" /> }
        </svg>
    )
}