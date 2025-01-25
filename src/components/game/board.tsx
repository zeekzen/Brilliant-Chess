import { moveRating, position, square } from "@/server/analyze";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { Chess, PieceSymbol, WHITE } from "chess.js";
import { Howl } from "howler";
import { AnalyzeContext } from "@/context/analyze";
import { ConfigContext } from "@/context/config";
import { boardThemes } from "../nav/themes";

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
    forced: { color: "bg-highlightBoard", icon: "forced.svg" },
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

const PIECES_VALUES = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
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

function getSquareId(column: number, row: number) {
    const columnId = String.fromCharCode(97 + column)
    const rowId = 8 - row
    return columnId + rowId
}

function adaptSquare(square: square): square {
    return { col: square.col, row: 7 - square.row }
}

function getCastleRookFromSquare(castle: 'k' | 'q' | undefined, whiteMoving: boolean, position: position): square | undefined {
    if (!castle) return
    return { col: castle === 'k' ? 7 : 0, row: whiteMoving ? 7 : 0 }
}

function getCastleRookToSquare(castle: 'k' | 'q' | undefined, whiteMoving: boolean): square | undefined {
    if (!castle) return
    return { col: castle === 'k' ? 5 : 3, row: whiteMoving ? 7 : 0 }
}

function flipBoard(board: position) {
    for (const row of board) {
        row.reverse()
    }
    board.reverse()
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

    if (!move[1]) {
        const elementPosition = {
            x: (squareSize * move[0].col) + 'px',
            y: (squareSize * move[0].row) + 'px',
        }

        let rounded: string = ''
        if (move[0].row === 0 && move[0].col === 0) rounded = white ? 'rounded-tl-borderRoundness' : 'rounded-br-borderRoundness'
        if (move[0].row === 7 && move[0].col === 0) rounded = white ? 'rounded-bl-borderRoundness' : 'rounded-tr-borderRoundness'
        if (move[0].row === 0 && move[0].col === 7) rounded = white ? 'rounded-tr-borderRoundness' : 'rounded-bl-borderRoundness'
        if (move[0].row === 7 && move[0].col === 7) rounded = white ? 'rounded-br-borderRoundness' : 'rounded-tl-borderRoundness'

        const size = squareSize + 'px'

        return <div style={{ top: white ? elementPosition.y : '', bottom: !white ? elementPosition.y : '', left: white ? elementPosition.x : '', right: !white ? elementPosition.x : '', width: size, height: size }} className={`absolute opacity-80 z-[20] ${props.class} ${rounded}`} />
    }

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
        <svg style={{ top: white ? positionY : '', bottom: !white ? positionY : '', left: white ? positionX : '', right: !white ? positionX : '', transformOrigin: '50% 0', rotate: (-degs) + 'deg' }} className={`absolute opacity-80 z-[60] ${props.class}`} width={width} height={height} xmlns="http://www.w3.org/2000/svg">
            <line x1={lineCenter} y1={height} x2={lineCenter} y2={`${arrowHeadHeight - 1}`} strokeWidth={lineWidth} markerEnd="url(#arrowhead)" />
            <polygon strokeWidth={0} points={`0,${arrowHeadHeight} ${lineCenter},0 ${width},${arrowHeadHeight}`} />
        </svg>
    )
}

export default function Board(props: { boardSize: number, fen?: string, nextFen?: string, move?: square[], nextMove?: square[], bestMove?: square[], moveRating?: moveRating, forward: boolean, white: boolean, animation: boolean, gameEnded: boolean, capture?: PieceSymbol, nextCapture?: PieceSymbol, castle?: 'k' | 'q', nextCastle?: 'k' | 'q', setAnimation: (animation: boolean) => void }) {
    const [arrows, setArrows] = useState<square[][]>([])
    const [boardColors, setBoardColors] = useState<[string, string]>(["", ""])

    const configContext = useContext(ConfigContext)
    const analyzeContext = useContext(AnalyzeContext)

    const [boardTheme, setBoardTheme] = configContext.boardTheme

    const [materialAdvantage, setMaterialAdvantage] = analyzeContext.materialAdvantage

    const pieceRef = useRef<HTMLDivElement>(null)
    const castleRookRef = useRef<HTMLDivElement>(null)

    const { boardSize, bestMove, moveRating, forward, white, animation, gameEnded, capture, nextCapture, castle, nextCastle, setAnimation } = props
    const fen = props.fen ?? DEFAULT_POSITION
    const nextFen = props.nextFen ?? DEFAULT_POSITION
    const move = props.move ?? []
    const nextMove = props.nextMove ?? []

    const squareSize = Math.round(boardSize / 8)
    const guideSize = squareSize / 4
    const leftSize = guideSize / 4.5
    const rightSize = guideSize / 2.5

    const chess = new Chess(fen)
    const board = chess.board()
    if (!white) flipBoard(board)

    const whiteMoving = !(chess.turn() === 'w')

    const castleRookFrom = getCastleRookFromSquare(forward ? castle : nextCastle, forward ? whiteMoving : !whiteMoving, board)
    const castleRookTo = getCastleRookToSquare(forward ? castle : nextCastle, forward ? whiteMoving : !whiteMoving)

    const castleRookMove: square[] = castleRookFrom && castleRookTo ? [castleRookFrom, castleRookTo] : []

    const highlightColor = HIGHLIGHT_STYLE[moveRating as keyof typeof HIGHLIGHT_STYLE]?.color ?? "bg-highlightBoard"
    const highlightIcon = HIGHLIGHT_STYLE[moveRating as keyof typeof HIGHLIGHT_STYLE]?.icon

    const soundChessInstance = forward ? chess : new Chess(nextFen)
    const soundCaptureInstance = forward ? capture : nextCapture
    const soundCastleInstance = forward ? castle : nextCastle

    const selfTurn = !(soundChessInstance.turn() === 'w' ? white : !white)

    useEffect(() => {
        const theme = boardThemes.filter(theme => theme.label === boardTheme)[0]
        const white = theme.white
        const black = theme.black

        setBoardColors([white, black])
    }, [boardTheme])

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
        if (!animation) return
        if (pieceRef.current) animateMove(pieceRef.current, forward ? move : nextMove, 50, forward, white, squareSize)
        if (castleRookRef.current) animateMove(castleRookRef.current, castleRookMove, 40, forward, white, squareSize)
    }, [move, animation])

    let newMaterialAdvantage = 0
    useEffect(() => setMaterialAdvantage(newMaterialAdvantage), [fen])

    function pushArrow(currentArrow: square[]) {
        const repeatedIndex = arrows.findIndex(arrow => JSON.stringify(arrow) === JSON.stringify(currentArrow))
        const isRepeated = repeatedIndex !== -1

        const newArrows = [...arrows]
        if (isRepeated) {
            newArrows.splice(repeatedIndex, 1)
        } else {
            newArrows.push(currentArrow)
        }

        setArrows(newArrows)
    }

    const currentArrow: square[] = []
    function startArrow(x: number, y: number) {
        const rowNumber = Math.floor(y / squareSize)
        const colNumber = Math.floor(x / squareSize)

        const square = { col: white ? colNumber : 7 - colNumber, row: white ? rowNumber : 7 - rowNumber }
        currentArrow[0] = square
    }
    function endArrow(x: number, y: number) {
        const rowNumber = Math.floor(y / squareSize)
        const colNumber = Math.floor(x / squareSize)

        const square = { col: white ? colNumber : 7 - colNumber, row: white ? rowNumber : 7 - rowNumber }
        currentArrow[1] = square

        if (!currentArrow[0] || !currentArrow[1]) return

        pushArrow(currentArrow)
    }

    function restartArrows() {
        setArrows([])
    }

    function handleMouseDown(e: React.MouseEvent) {
        if (e.button === 2) {
            e.preventDefault()
            const element = e.currentTarget
            const elementRect = element.getBoundingClientRect()

            startArrow(e.clientX - elementRect.x, e.clientY - elementRect.y)
        } else {
            setAnimation(false)
            restartArrows()
        }
    }

    function handleMouseUp(e: React.MouseEvent) {
        if (e.button === 2) {
            e.preventDefault()
            setAnimation(false)
            const element = e.currentTarget
            const elementRect = element.getBoundingClientRect()

            endArrow(e.clientX - elementRect.x, e.clientY - elementRect.y)
        }
    }

    function animateMove(element: HTMLElement, move: square[], zIndex: number, forward: boolean, white: boolean, squareSize: number) {
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

        function resetElements() {
            if (!element) return
            element.style.zIndex = ''
            element.style.willChange = ''
        }

        element.style.zIndex = String(zIndex)
        element.style.willChange = 'transform'

        const animation = element.animate(
            [
                { transform: `translate(${forward ? -distance.x : 0}px, ${forward ? distance.y : 0}px)` },
                { transform: `translate(${!forward ? distance.x : 0}px, ${!forward ? -distance.y : 0}px)` },
            ],
            { duration: 100, easing: 'linear', direction: forward ? 'normal' : 'reverse' },
        )

        animation.finished.then(resetElements).catch(resetElements)
        animation.oncancel = resetElements
    }

    return (
        <div onContextMenu={(e) => e.preventDefault()} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} className="grid w-fit h-fit relative" style={{ gridTemplateColumns: `repeat(8, ${squareSize}px)` }}>
            <PreloadRatingImages />
            {
                (() => {
                    const squares: JSX.Element[] = []
                    let rowNumber = white ? 0 : 7
                    for (const row of board) {
                        let columnNumber = white ? 0 : 7
                        for (const square of row) {
                            const squareId = getSquareId(columnNumber, rowNumber)

                            let bgColor, guideColor
                            if (isEven(rowNumber)) {
                                if (isEven(columnNumber)) {
                                    bgColor = boardColors[0]
                                    guideColor = boardColors[1]
                                } else {
                                    bgColor = boardColors[1]
                                    guideColor = boardColors[0]
                                }
                            } else {
                                if (isEven(columnNumber)) {
                                    bgColor = boardColors[1]
                                    guideColor = boardColors[0]
                                } else {
                                    bgColor = boardColors[0]
                                    guideColor = boardColors[1]
                                }
                            }

                            let squareNumGuide, squareLetterGuide
                            if (rowNumber === (white ? 7 : 0)) {
                                squareLetterGuide = <span style={{ right: rightSize, color: guideColor }} className={`absolute bottom-0`}>{squareId[0]}</span>
                            }
                            if (columnNumber === (white ? 0 : 7)) {
                                squareNumGuide = <span style={{ left: leftSize, color: guideColor }} className={`absolute top-0`}>{squareId[1]}</span>
                            }

                            let rounded: string = ''
                            if (rowNumber === 0 && columnNumber === 0) rounded = white ? 'rounded-tl-borderRoundness' : 'rounded-br-borderRoundness'
                            if (rowNumber === 7 && columnNumber === 0) rounded = white ? 'rounded-bl-borderRoundness' : 'rounded-tr-borderRoundness'
                            if (rowNumber === 0 && columnNumber === 7) rounded = white ? 'rounded-tr-borderRoundness' : 'rounded-bl-borderRoundness'
                            if (rowNumber === 7 && columnNumber === 7) rounded = white ? 'rounded-br-borderRoundness' : 'rounded-tl-borderRoundness'

                            let highlighted, highlightedIcon
                            move.forEach((square, i) => {
                                const highlightedSquare = adaptSquare(square)
                                if (highlightedSquare.col === columnNumber && highlightedSquare.row === rowNumber) {
                                    highlighted = <div className={`relative w-full h-full opacity-50 ${highlightColor} ${rounded}`} />
                                    if (i === 1) {
                                        highlightedIcon = highlightIcon && i === 1 ? <Image style={{ transform: 'translateX(50%) translateY(-50%)', width: squareSize / 2.2 }} className="absolute top-0 right-0 z-[50]" alt="move-evaluation" src={`/images/rating/${highlightIcon}`} priority width={120} height={0} /> : ''
                                    }
                                    return
                                }
                            })

                            const toAnimateSquare = forward ? move[1] : nextMove[0]
                            const adaptedToAnimateSquare = toAnimateSquare ? adaptSquare(toAnimateSquare) : { col: NaN, row: NaN }
                            const moved = adaptedToAnimateSquare.col === columnNumber && adaptedToAnimateSquare.row === rowNumber

                            const isCastleRook = forward ? (castleRookTo?.col === columnNumber && castleRookTo?.row === rowNumber) : (castleRookFrom?.col === columnNumber && castleRookFrom?.row === rowNumber)

                            const pieceColor = square?.color
                            const pieceType = square?.type
                            let piece
                            if (pieceColor && pieceType) {
                                const imageColor = PIECES_IMAGES[pieceColor as keyof object]
                                const pieceImages = imageColor[pieceType as keyof object]
                                piece = <div ref={moved ? pieceRef : (isCastleRook ? castleRookRef : null)} className="w-full h-full z-[30] absolute bottom-0 left-0 cursor-grab"><Image alt={`${pieceType}-${pieceColor}`} className="w-full" width={200} height={0} src={`/images/pieces/${pieceImages}`} priority /></div>
                            }

                            squares.push(<div data-square={squareId} key={squareId} style={{ height: squareSize + 'px', width: squareSize + 'px', fontSize: guideSize, backgroundColor: bgColor }} className={`font-bold relative ${rounded}`}>{squareNumGuide}{squareLetterGuide}{piece}{highlighted}{highlightedIcon}</div>)

                            if (square) {
                                if (square?.color === WHITE) {
                                    newMaterialAdvantage += PIECES_VALUES[square.type as keyof typeof PIECES_VALUES]
                                } else {
                                    newMaterialAdvantage -= PIECES_VALUES[square.type as keyof typeof PIECES_VALUES]
                                }
                            }

                            white ? columnNumber++ : columnNumber--
                        }
                        white ? rowNumber++ : rowNumber--
                    }
                    return squares
                })()
            }
            {
                arrows.map((move, i) => {
                    const singleSquare = JSON.stringify(move[0]) === JSON.stringify(move[1])

                    return <Arrow key={i} move={singleSquare ? [move[0]] : move} squareSize={squareSize} class={singleSquare ? "bg-badArrow" : "fill-normalArrow stroke-normalArrow"} white={white} />
                })
            }
            {
                (() => {
                    const adaptedBestMove = bestMove?.map(square => {
                        return adaptSquare(square)
                    })
                    return adaptedBestMove ? <Arrow move={adaptedBestMove} squareSize={squareSize} class="fill-bestArrow stroke-bestArrow" white={white} /> : ''
                })()
            }
        </div>
    )
}