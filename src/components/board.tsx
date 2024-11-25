"use client"

function isEven(num: number) {
    return (num % 2) == 0
}

function getRowNumber(num: number, boardSize: number) {
    return (boardSize + 1) - (num + 1)
}

function getColumnLetter(num: number, boardSize: number) {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

    return letters[num]
}

export default function Board(props: { boardSize: number, boardColors: string[] }) {
    const { boardSize, boardColors } = props

    return (
        <div className="grid grid-cols-2 w-fit h-fit rounded-borderRoundness overflow-hidden" style={{gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`}}>
            {
                (() => {
                    const squares: JSX.Element[] = []
                    for (let row = 0; row < boardSize; row++) {
                        for (let column = 0; column < boardSize; column++) {
                            const squareId = [getColumnLetter(column, boardSize), getRowNumber(row, boardSize)]

                            let bgColor, guideColor
                            if (isEven(row)) {
                                if (isEven(column)) {
                                    bgColor = boardColors[0]
                                    guideColor = boardColors[1]
                                } else {
                                    bgColor = boardColors[1]
                                    guideColor = boardColors[0]
                                }
                            } else {
                                if (isEven(column)) {
                                    bgColor = boardColors[1]
                                    guideColor = boardColors[0]
                                } else {
                                    bgColor = boardColors[0]
                                    guideColor = boardColors[1]
                                }
                            }

                            // text-whiteBoard / text-blackBoard
                            let squareNumGuide, squareLetterGuide
                            if (row === boardSize - 1) {
                                squareLetterGuide = <span className={`absolute bottom-0 right-2 text-${guideColor}`}>{squareId[0]}</span>
                            }
                            if (column === 0) {
                                squareNumGuide = <span className={`absolute top-0 left-1 text-${guideColor}`}>{squareId[1]}</span>
                            }

                            // bg-whiteBoard / bg-blackBoard
                            squares.push(<div key={`${row}-${column}`} className={`bg-${bgColor} h-24 w-24 text-xl font-bold select-none relative`}>{squareNumGuide}{squareLetterGuide}</div>)
                        }
                    }
                    return squares
                })()
            }
        </div>
    )
}