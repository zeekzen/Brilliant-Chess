import { moveRating, position, square } from "@/server/analyze";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Chess, PieceSymbol } from "chess.js";
import { Howl } from "howler";

const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

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
    brilliant: { color: "bg-highlightBrilliant", icon: "brilliant.svg" },
    great: { color: "bg-highlightGreat", icon: "great.svg" },
    best: { color: "bg-highlightBest", icon: "best.svg" },
    excellent: { color: "bg-highlightExcellent", icon: "excellent.svg" },
    good: { color: "bg-highlightGood", icon: "good.svg" },
    book: { color: "bg-highlightBook", icon: "book.svg" },
    inaccuracy: { color: "bg-highlightInaccuracy", icon: "inaccuracy.svg" },
    mistake: { color: "bg-highlightMistake", icon: "mistake.svg" },
    miss: { color: "bg-highlightMiss", icon: "miss.svg" },
    blunder: { color: "bg-highlightBlunder", icon: "blunder.svg" },
}

const moveSelfSound = new Howl({
    src: ['/sounds/move-self.mp3'],
    preload: true,
})

const moveOpponentSound = new Howl({
    src: ['/sounds/move-opponent.mp3'],
    preload: true,
})

const moveCheckSound = new Howl({
    src: ['/sounds/move-check.mp3'],
    preload: true,
})

const gameEndSound = new Howl({
    src: ['/sounds/game-end.mp3'],
    preload: true,
})

export const gameStartSound = new Howl({
    src: ['/sounds/game-start.mp3'],
    preload: true,
})

const captureSound = new Howl({
    src: ['/sounds/capture.mp3'],
    preload: true,
})

const castleSound = new Howl({
    src: ['/sounds/castle.mp3'],
    preload: true,
})

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
    return { col: square.col, row: (boardProportions - 1) - square.row }
}

function getCastleRookFromSquare(castle: 'k' | 'q' | undefined, whiteMoving: boolean, position: position): square | undefined {
    if (!castle) return
    if (whiteMoving) {
        const row = castle === 'k' ? position[7] : position[7].toReversed()
        const col = row.findIndex(square => square?.type === 'r' && square?.color === 'w')
        return { col: castle === 'k' ? 7 - col : col, row: 7 }
    } else {
        const row = castle === 'k' ? position[0] : position[0].toReversed()
        const col = row.findIndex(square => square?.type === 'r' && square?.color === 'b')
        return { col: castle === 'k' ? 7 - col : col, row: 0 }
    }
}

function getCastleRookToSquare(castle: 'k' | 'q' | undefined, whiteMoving: boolean): square | undefined {
    if (!castle) return
    return { col: castle === 'k' ? 5 : 3, row: whiteMoving ? 7 : 0 }
}

function PreloadRatingImages() {
    const preloaders = []
    for (const rating in HIGHLIGHT_STYLE) {
        const url = '/images/rating/' + HIGHLIGHT_STYLE[rating as keyof typeof HIGHLIGHT_STYLE].icon

        preloaders.push(
            <Image key={rating} alt={"preload " + rating} src={url} priority hidden width={1} height={0} />
        )
    }

    return preloaders
}

function Arrow(props: { move: square[], squareSize: number, class: string, white: boolean }) {
    const { move, squareSize, white } = props
    const [from, to] = move

    const fromElementPosition = {
        x: squareSize * from.col,
        y: squareSize * from.row,
    }

    const toElementPosition = {
        x: squareSize * to.col,
        y: squareSize * to.row,
    }

    const distance = {
        x: (fromElementPosition.x - toElementPosition.x) * (white ? 1 : -1),
        y: (fromElementPosition.y - toElementPosition.y) * (white ? 1 : -1),
    }

    const realDistance = Math.sqrt((distance.x ** 2) + (distance.y ** 2))

    const angle = Math.atan2(distance.x, distance.y)
    const degs = angle * (180 / Math.PI)

    const width = squareSize / 2
    const lineCenter = width / 2
    const lineWidth = width * (3 / 7)
    const arrowHeadHeight = lineWidth * 1.6
    const height = realDistance - arrowHeadHeight

    const positionX = `${toElementPosition.x + (squareSize / 2) - (width / 2)}px`
    const positionY = `${toElementPosition.y + (squareSize / 2) - (white ? 0 : height)}px`

    return (
        <svg style={{ top: white ? positionY : '', bottom: !white ? positionY : '', left: white ? positionX : '', right: !white ? positionX : '', transformOrigin: '50% 0', rotate: (-degs) + 'deg' }} className={`absolute opacity-80 z-40 ${props.class}`} width={width} height={height} xmlns="http://www.w3.org/2000/svg">
            <line x1={lineCenter} y1={height} x2={lineCenter} y2={`${arrowHeadHeight - 1}`} strokeWidth={lineWidth} markerEnd="url(#arrowhead)" />
            <polygon strokeWidth={0} points={`0,${arrowHeadHeight} ${lineCenter},0 ${width},${arrowHeadHeight}`} />
        </svg>
    )
}

function MoveAnimation(props: { move: square[], squareSize: number, forward: boolean, white: boolean, className: string, zIndex: number }) {
    const { move, squareSize, forward, white , className, zIndex } = props
    if (move.length === 0) return
    const [from, to] = move

    const fromElementPosition = {
        bottom: squareSize * from.row,
        left: squareSize * from.col,
    }

    const toElementPosition = {
        bottom: squareSize * to.row,
        left: squareSize * to.col,
    }

    const distance = {
        x: (toElementPosition.left - fromElementPosition.left) * (white ? 1 : -1),
        y: (toElementPosition.bottom - fromElementPosition.bottom) * (white ? 1 : -1),
    }

    return (
        <style>
            {`
                @keyframes ${className} {
                    0% {
                        transform: translate(${forward ? -distance.x : 0}px, ${forward ? distance.y : 0}px);
                    }
                    100% {
                        transform: translate(${!forward ? distance.x : 0}px, ${!forward ? -distance.y : 0}px);
                    }
                }
                .${className} {
                    animation: ${className} 100ms linear ${forward ? 'forwards' : 'reverse'};
                    will-change: transform;
                    z-index: ${zIndex};
                }
            `}
        </style>
    )
}

export default function Board(props: { boardProportions: number, boardSize: number, fen?: string, nextFen?: string, move?: square[], nextMove?: square[], bestMove?: square[], moveRating?: moveRating, forward: boolean, white: boolean, animation: boolean, gameEnded: boolean, capture?: PieceSymbol, nextCapture?: PieceSymbol, castle?: 'k' | 'q', nextCastle?: 'k' | 'q' }) {
    const [arrows, setArrows] = useState<square[][]>([])

    const pieceRef = useRef<HTMLDivElement>(null)
    const castleRookRef = useRef<HTMLDivElement>(null)

    const { boardProportions, boardSize, bestMove, moveRating, forward, white, animation, gameEnded, capture, nextCapture, castle, nextCastle } = props
    const fen = props.fen ?? DEFAULT_POSITION
    const nextFen = props.nextFen ?? DEFAULT_POSITION
    const move = props.move ?? []
    const nextMove = props.nextMove ?? []

    const squareSize = boardSize / boardProportions
    const guideSize = squareSize / 4
    const leftSize = guideSize / 4.5
    const rightSize = guideSize / 2.5

    const chess = new Chess(fen)
    const position = chess.board()

    const whiteMoving = !(chess.turn() === 'w')

    const castleRookFrom = getCastleRookFromSquare(forward ? castle : nextCastle, forward ? whiteMoving : !whiteMoving, position)
    const castleRookTo = getCastleRookToSquare(forward ? castle : nextCastle, forward ? whiteMoving : !whiteMoving)

    const castleRookMove: square[] = castleRookFrom && castleRookTo ? [castleRookFrom, castleRookTo] : []

    console.log(castleRookMove)

    // text-whiteBoard / text-blackBoard
    // bg-whiteBoard / bg-blackBoard
    const BOARD_COLORS = ["whiteBoard", "blackBoard"]

    const highlightColor = HIGHLIGHT_STYLE[moveRating as keyof typeof HIGHLIGHT_STYLE]?.color ?? "bg-highlightBoard"
    const highlightIcon = HIGHLIGHT_STYLE[moveRating as keyof typeof HIGHLIGHT_STYLE]?.icon

    const soundChessInstance = forward ? chess : new Chess(nextFen)
    const soundCaptureInstance = forward ? capture : nextCapture
    const soundCastleInstance = forward ? castle : nextCastle

    const selfTurn = !(soundChessInstance.turn() === 'w' ? white : !white)

    useEffect(() => {
        if (!props.fen) return

        if (soundChessInstance.isCheck()) {
            moveCheckSound.play()
        } else if (soundCastleInstance) {
            castleSound.play()
        } else if (soundCaptureInstance) {
            captureSound.play()
        } else {
            if (selfTurn) {
                moveSelfSound.play()
            } else {
                moveOpponentSound.play()
            }
        }

        if (gameEnded) {
            gameEndSound.play()
        }
    }, [fen])

    useEffect(() => {
        for (const piece of document.getElementsByClassName('moveAnimation')) {
            piece.classList.remove('moveAnimation')
        }
        if (pieceRef.current) {
            if (!animation) return
            void pieceRef.current.offsetWidth
            pieceRef.current.classList.add('moveAnimation')
        }
    }, [move, animation])

    useEffect(() => {
        for (const piece of document.getElementsByClassName('castleAnimation')) {
            piece.classList.remove('castleAnimation')
        }
        if (!castle && !nextCastle) return
        if (castleRookRef.current) {
            if (!animation) return
            void castleRookRef.current.offsetWidth
            castleRookRef.current.classList.add('castleAnimation')
        }
    }, [move, animation])

    return (
        <div className="grid w-fit h-fit relative" style={{ gridTemplateColumns: `repeat(${boardProportions}, minmax(0, 1fr))` }}>
            <PreloadRatingImages />
            <MoveAnimation zIndex={40} className="moveAnimation" move={forward ? move : nextMove} squareSize={squareSize} forward={forward} white={white} />
            <MoveAnimation zIndex={30} className="castleAnimation" move={castleRookMove} squareSize={squareSize} forward={forward} white={white} />
            {
                (() => {
                    const squares: JSX.Element[] = []
                    for (let row = white ? 0 : boardProportions - 1; white ? row < boardProportions : row >= 0; white ? row++ : row--) {
                        for (let column = white ? 0 : boardProportions - 1; white ? column < boardProportions : column >= 0; white ? column++ : column--) {
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
                            move.forEach((square, i) => {
                                const highlightedSquare = adaptSquare(square, boardProportions)
                                if (highlightedSquare.col === column && highlightedSquare.row === row) {
                                    highlighted = <div className={`relative w-full h-full opacity-50 ${highlightColor}`} />
                                    if (i === 1) {
                                        highlightedIcon = highlightIcon && i === 1 ? <Image style={{ transform: 'translateX(50%) translateY(-50%)', width: squareSize / 2.2 }} className="absolute top-0 right-0 z-10" alt="move-evaluation" src={`/images/rating/${highlightIcon}`} priority width={120} height={0} /> : ''
                                    }
                                    return
                                }
                            })

                            let squareNumGuide, squareLetterGuide
                            if (row === (white ? boardProportions - 1 : 0)) {
                                squareLetterGuide = <span style={{ right: rightSize }} className={`absolute bottom-0 text-${guideColor}`}>{squareId[0]}</span>
                            }
                            if (column === (white ? 0 : boardProportions - 1)) {
                                squareNumGuide = <span style={{ left: leftSize }} className={`absolute top-0 text-${guideColor}`}>{squareId[1]}</span>
                            }

                            let rounded
                            if (row === 0 && column === 0) rounded = white ? 'rounded-tl-borderRoundness' : 'rounded-br-borderRoundness'
                            if (row === boardProportions - 1 && column === 0) rounded = white ? 'rounded-bl-borderRoundness' : 'rounded-tr-borderRoundness'
                            if (row === 0 && column === boardProportions - 1) rounded = white ? 'rounded-tr-borderRoundness' : 'rounded-bl-borderRoundness'
                            if (row === boardProportions - 1 && column === boardProportions - 1) rounded = white ? 'rounded-br-borderRoundness' : 'rounded-tl-borderRoundness'

                            const toAnimateSquare = forward ? move[1] : nextMove[0]
                            const adaptedToAnimateSquare = toAnimateSquare ? adaptSquare(toAnimateSquare, boardProportions) : { col: NaN, row: NaN }
                            const moved = adaptedToAnimateSquare.col === column && adaptedToAnimateSquare.row === row

                            const isCastleRook = forward ? (castleRookTo?.col === column && castleRookTo?.row === row) : (castleRookFrom?.col === column && castleRookFrom?.row === row)

                            const pieceColor = position[row][column]?.color
                            const pieceType = position[row][column]?.type
                            const imageColor = PIECES_IMAGES[pieceColor as keyof object] ?? {}
                            const pieceImages = imageColor[pieceType as keyof object]
                            const piece = pieceImages ? <div ref={moved ? pieceRef : (isCastleRook ? castleRookRef : null)} className="w-full h-full z-10 absolute bottom-0 left-0 cursor-grab"><Image alt={`${pieceType}-${pieceColor}`} className="w-full" width={200} height={0} src={`/images/pieces/${pieceImages}`} priority /></div> : ''

                            squares.push(<div data-square={`${column}${row}`} key={`${column}${row}`} style={{ height: squareSize, width: squareSize, fontSize: guideSize }} className={`bg-${bgColor} font-bold relative ${rounded ?? ''}`}>{squareNumGuide}{squareLetterGuide}{piece}{highlighted}{highlightedIcon}</div>)
                        }
                    }
                    return squares
                })()
            }
            {
                arrows.map(move => {
                    return <Arrow move={move} squareSize={squareSize} class="" white={white} />
                })
            }
            {
                (() => {
                    const adaptedBestMove = bestMove?.map(square => {
                        return adaptSquare(square, boardProportions)
                    })
                    return adaptedBestMove ? <Arrow move={adaptedBestMove} squareSize={squareSize} class="fill-bestArrow stroke-bestArrow" white={white} /> : ''
                })()
            }
        </div>
    )
}