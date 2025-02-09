import { BISHOP, KNIGHT, PAWN, PieceSymbol, QUEEN, ROOK } from "chess.js";
import Image from "next/image";
import { maxVertical } from "../../../tailwind.config";

const PIECES_IMAGES = {
    w: {
        p: 'white/pawn.svg',
        r: 'white/rook.svg',
        n: 'white/knight.svg',
        b: 'white/bishop.svg',
        q: 'white/queen.svg',
    },
    b: {
        p: 'black/pawn.svg',
        r: 'black/rook.svg',
        n: 'black/knight.svg',
        b: 'black/bishop.svg',
        q: 'black/queen.svg',
    }
}

const PIECES_ORDER = [ PAWN, BISHOP, KNIGHT, ROOK, QUEEN ]

function formatAdvantage(advantage: number) {
    return advantage > 0 ? `+${advantage}` : ''
}

export default function CapturedPieces(props: { white: boolean, pieces: PieceSymbol[], advantage: number }) {
    const { white, pieces, advantage } = props

    const groupedPieces = pieces.reduce((acc: { [key: string]: number }, piece: PieceSymbol) => {
        acc[piece] = acc[piece] ? acc[piece] + 1 : 1
        return acc
    }, {})

    return (
        <div className="flex flex-row h-full items-end vertical:gap-2 gap-1">
            <div className="w-fit h-full flex flex-row ml-[-3px]">
                {Object.entries(groupedPieces).sort((a, b) => PIECES_ORDER.indexOf(a[0]) - PIECES_ORDER.indexOf(b[0])).map(([piece, count], i) => {
                    const src = `/images/simplePieces/${PIECES_IMAGES[!white ? 'w' : 'b' as keyof object][piece as keyof object]}`
                    const outlineColor = "var(--border)"
                    const smallSize = window.innerWidth < maxVertical ? 8 : 15
                    const mediumSize = window.innerWidth < maxVertical ? 10 : 17
                    const bigSize = window.innerWidth < maxVertical ? 12 : 19
                    return (
                        <div className="mb-[1px] flex flex-row items-end" key={i}>
                            {Array.from({ length: count }).map((_, i) => {
                                return <Image
                                    key={i}
                                    className={`${piece === PAWN ? 'mx-[2px]' : piece === ROOK || piece === KNIGHT || piece === BISHOP ? 'mx-[1px]' : ''} ${i !== 0 ? 'vertical:ml-[-10px] ml-[-7px]' : ''}`}
                                    priority alt={piece}
                                    width={piece === PAWN ? smallSize : piece === ROOK || piece === KNIGHT || piece === BISHOP ? mediumSize : bigSize}
                                    height={piece === PAWN ? smallSize : piece === ROOK || piece === KNIGHT || piece === BISHOP ? mediumSize : bigSize}
                                    style={{filter: `drop-shadow(1px 0 0 ${outlineColor}) drop-shadow(-1px 0 0 ${outlineColor}) drop-shadow(0 1px 0 ${outlineColor}) drop-shadow(0 -1px 0 ${outlineColor})`}}
                                    src={src}
                                />
                            })}
                        </div>
                    )
                })}
            </div>
            <span className="text-foregroundGrey h-fit font-light text-[8px] vertical:text-[17px]">{white ? formatAdvantage(advantage) : formatAdvantage(-advantage)}</span>
        </div>
    )
}