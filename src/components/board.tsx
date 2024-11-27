"use client"

function isEven(num: number) {
    return (num % 2) === 0
}

function getRowNumber(num: number, boardProportions: number) {
    return (boardProportions + 1) - (num + 1)
}

function getColumnLetter(num: number, boardProportions: number) {
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

    return letters[num]
}

export default function Board(props: { boardProportions: number, boardColors: string[], boardSize: number }) {
    const { boardProportions, boardColors, boardSize } = props

    const squareSize = boardSize / boardProportions
    const guideSize = squareSize / 4
    const leftSize = guideSize / 4.5
    const rightSize = guideSize / 2.5

    return (
        <div className="grid grid-cols-2 w-fit h-fit rounded-borderRoundness overflow-hidden" style={{gridTemplateColumns: `repeat(${boardProportions}, minmax(0, 1fr))`}}>
            {
                (() => {
                    const squares: JSX.Element[] = []
                    for (let row = 0; row < boardProportions; row++) {
                        for (let column = 0; column < boardProportions; column++) {
                            const squareId = [getColumnLetter(column, boardProportions), getRowNumber(row, boardProportions)]

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
                            if (row === boardProportions - 1) {
                                squareLetterGuide = <span style={{right: rightSize}} className={`absolute bottom-0 text-${guideColor}`}>{squareId[0]}</span>
                            }
                            if (column === 0) {
                                squareNumGuide = <span style={{left: leftSize}} className={`absolute top-0 text-${guideColor}`}>{squareId[1]}</span>
                            }

                            // bg-whiteBoard / bg-blackBoard
                            squares.push(<div key={`${row}-${column}`} style={{height: squareSize, width: squareSize, fontSize: guideSize}} className={`bg-${bgColor} font-bold relative`}>{squareNumGuide}{squareLetterGuide}</div>)
                        }
                    }
                    return squares
                })()
            }
        </div>
    )
}