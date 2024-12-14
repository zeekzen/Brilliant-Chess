import { moveRating, position, square } from "@/server/analyze";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

const DEFAULT_POSITION = [
    [
        { square: 'a8', type: 'r', color: 'b' },
        { square: 'b8', type: 'n', color: 'b' },
        { square: 'c8', type: 'b', color: 'b' },
        { square: 'd8', type: 'q', color: 'b' },
        { square: 'e8', type: 'k', color: 'b' },
        { square: 'f8', type: 'b', color: 'b' },
        { square: 'g8', type: 'n', color: 'b' },
        { square: 'h8', type: 'r', color: 'b' }
    ],
    [
        { square: 'a7', type: 'p', color: 'b' },
        { square: 'b7', type: 'p', color: 'b' },
        { square: 'c7', type: 'p', color: 'b' },
        { square: 'd7', type: 'p', color: 'b' },
        { square: 'e7', type: 'p', color: 'b' },
        { square: 'f7', type: 'p', color: 'b' },
        { square: 'g7', type: 'p', color: 'b' },
        { square: 'h7', type: 'p', color: 'b' }
    ],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [
      { square: 'a2', type: 'p', color: 'w' },
      { square: 'b2', type: 'p', color: 'w' },
      { square: 'c2', type: 'p', color: 'w' },
      { square: 'd2', type: 'p', color: 'w' },
      { square: 'e2', type: 'p', color: 'w' },
      { square: 'f2', type: 'p', color: 'w' },
      { square: 'g2', type: 'p', color: 'w' },
      { square: 'h2', type: 'p', color: 'w' }
    ],
    [
      { square: 'a1', type: 'r', color: 'w' },
      { square: 'b1', type: 'n', color: 'w' },
      { square: 'c1', type: 'b', color: 'w' },
      { square: 'd1', type: 'q', color: 'w' },
      { square: 'e1', type: 'k', color: 'w' },
      { square: 'f1', type: 'b', color: 'w' },
      { square: 'g1', type: 'n', color: 'w' },
      { square: 'h1', type: 'r', color: 'w' }
    ]
]

const PIECES_IMAGES = {
    w: {
        p: 'white/pawn.svg',
        r: 'white/rook.svg',
        n: 'white/knight.svg',
        b: 'white/bishop.svg',
        q: 'white/queen.svg',
        k: 'white/king.svg'
    },
    b: {
        p: 'black/pawn.svg',
        r: 'black/rook.svg',
        n: 'black/knight.svg',
        b: 'black/bishop.svg',
        q: 'black/queen.svg',
        k: 'black/king.svg',
    }
} 

const HIGHLIGHT_STYLE = {
    best: {color: "bg-highlightBest", icon: "best.svg"},
    excellent: {color: "bg-highlightExcellent", icon: "excellent.svg"},
    good: {color: "bg-highlightGood", icon: "good.svg"},
    inaccuracy: {color: "bg-highlightInaccuracy", icon: "inaccuracy.svg"},
    mistake: {color: "bg-highlightMistake", icon: "mistake.svg"},
    miss: {color: "bg-highlightMiss", icon: "miss.svg"},
    blunder: {color: "bg-highlightBlunder", icon: "blunder.svg"},
}

function isEven(num: number) {
    return (num % 2) === 0
}

function getRowNumber(num: number, boardProportions: number) {
    return (boardProportions + 1) - (num + 1)
}

function getColumnLetter(num: number) {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

    return letters[num]
}

function adaptSquare(square: square, boardProportions: number): square {
    return {col: square.col, row: (boardProportions - 1) - square.row}
}

function Arrow(props: { move: square[], squareSize: number, class: string }) {
    const { move, squareSize } = props
    const [from, to] = move

    const fromElementPosition = {
        top: squareSize * from.row,
        left: squareSize * from.col,
    }

    const toElementPosition = {
        top: squareSize * to.row,
        left: squareSize * to.col,
    }

    const distance = {
        x: fromElementPosition.left - toElementPosition.left,
        y: fromElementPosition.top - toElementPosition.top,
    }

    const realDistance = Math.sqrt((distance.x ** 2) + (distance.y ** 2))
    
    const angle = Math.atan2(distance.x, distance.y)
    const degs = angle * (180 / Math.PI)

    const width = squareSize / 2
    const lineCenter = width / 2
    const lineWidth = width * (3/7)
    const arrowHeadHeight = lineWidth * 1.6
    const height = realDistance - arrowHeadHeight

    const top = `${toElementPosition.top + (squareSize / 2)}px`
    const left = `${toElementPosition.left + (squareSize / 2) - (width / 2)}px`

    return (
        <svg style={{top, left, transformOrigin: '50% 0', rotate: (-degs)+'deg'}} className={`absolute opacity-80 z-40 ${props.class}`} width={width} height={height} xmlns="http://www.w3.org/2000/svg">
            <line x1={lineCenter} y1={height} x2={lineCenter} y2={`${arrowHeadHeight - 1}`} strokeWidth={lineWidth} markerEnd="url(#arrowhead)" />
            <polygon strokeWidth={0} points={`0,${arrowHeadHeight} ${lineCenter},0 ${width},${arrowHeadHeight}`} />
        </svg>
    )
}

export default function Board(props: { boardProportions: number, boardSize: number, position?: position, highlight?: square[], bestMove?: square[], moveRating?: moveRating }) {
    const [arrows, setArrows] = useState<square[][]>([])

    const { boardProportions, boardSize } = props
    const position = props.position ?? DEFAULT_POSITION
    const highlight = props.highlight ?? []
    const bestMove = props.bestMove
    const moveRating = props.moveRating

    const squareSize = boardSize / boardProportions
    const guideSize = squareSize / 4
    const leftSize = guideSize / 4.5
    const rightSize = guideSize / 2.5

    // text-whiteBoard / text-blackBoard
    // bg-whiteBoard / bg-blackBoard
    const BOARD_COLORS = ["whiteBoard", "blackBoard"]

    const highlightColor = HIGHLIGHT_STYLE[moveRating as keyof typeof HIGHLIGHT_STYLE]?.color ?? "bg-highlightBoard"
    const highlightIcon = HIGHLIGHT_STYLE[moveRating as keyof typeof HIGHLIGHT_STYLE]?.icon

    return (
        <div className="grid w-fit h-fit rounded-borderRoundness overflow-hidden relative" style={{ gridTemplateColumns: `repeat(${boardProportions}, minmax(0, 1fr))` }}>
            {
                (() => {
                    const squares: JSX.Element[] = []
                    for (let row = 0; row < boardProportions; row++) {
                        for (let column = 0; column < boardProportions; column++) {
                            const squareId = [getColumnLetter(column), getRowNumber(row, boardProportions)]

                            let bgColor, guideColor
                            if (isEven(row)) {
                                if (isEven(column)) {
                                    bgColor = BOARD_COLORS[0]
                                    guideColor = BOARD_COLORS[1]
                                } else {
                                    bgColor = BOARD_COLORS[1]
                                    guideColor = BOARD_COLORS[0]
                                }
                            } else {
                                if (isEven(column)) {
                                    bgColor = BOARD_COLORS[1]
                                    guideColor = BOARD_COLORS[0]
                                } else {
                                    bgColor = BOARD_COLORS[0]
                                    guideColor = BOARD_COLORS[1]
                                }
                            }

                            let highlighted, highlightedIcon
                            highlight.forEach((square, i) => {
                                const highlightedSquare = adaptSquare(square, boardProportions)
                                if (highlightedSquare.col === column && highlightedSquare.row === row) {
                                    highlighted = <div className={`relative w-full h-full opacity-50 ${highlightColor}`} />
                                    if (i === 1) {
                                        highlightedIcon = highlightIcon && i === 1 ? <Image style={{transform: 'translateX(50%) translateY(-50%)', width: squareSize/2.2}} className="absolute top-0 right-0 z-10" alt="move-evaluation" src={`/images/rating/${highlightIcon}`} width={120} height={0} /> : ''
                                    }
                                    return
                                }
                            })

                            let squareNumGuide, squareLetterGuide
                            if (row === boardProportions - 1) {
                                squareLetterGuide = <span style={{ right: rightSize }} className={`absolute bottom-0 text-${guideColor}`}>{squareId[0]}</span>
                            }
                            if (column === 0) {
                                squareNumGuide = <span style={{ left: leftSize }} className={`absolute top-0 text-${guideColor}`}>{squareId[1]}</span>
                            }

                            const pieceColor = position[row][column]?.color
                            const pieceType = position[row][column]?.type
                            const imageColor = PIECES_IMAGES[pieceColor as keyof object] ?? {}
                            const pieceImages = imageColor[pieceType as keyof object]
                            const piece = pieceImages ? <div className="w-full h-full z-10 absolute top-0 left-0 cursor-grab"><Image alt={`${pieceType}-${pieceColor}`} className="w-full" width={200} height={0} src={`/images/pieces/${pieceImages}`} /></div> : ''

                            squares.push(<div data-square={`${column}${row}`} key={`${column}${row}`} style={{ height: squareSize, width: squareSize, fontSize: guideSize }} className={`bg-${bgColor} font-bold relative`}>{squareNumGuide}{squareLetterGuide}{piece}{highlighted}{highlightedIcon}</div>)
                        }
                    }
                    return squares
                })()
            }
            {
                arrows.map(move => {
                    return <Arrow move={move} squareSize={squareSize} class="" />
                })
            }
            {
                (() => {
                    const adaptedBestMove = bestMove?.map(square => {
                        return adaptSquare(square, boardProportions)
                    })
                    return adaptedBestMove ? <Arrow move={adaptedBestMove} squareSize={squareSize} class="fill-bestArrow stroke-bestArrow" /> : ''
                })()
            }
        </div>
    )
}