"use client"

function isEven(num: number) {
    return (num % 2) == 0
}

export default function Board(props: { boardSize: number, boardColors: string[] }) {
    const { boardSize, boardColors } = props

    return (
        <div className={`m-10 grid grid-cols-2 w-fit h-fit rounded-[.25rem] overflow-hidden`} style={{gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`}}>
            {
                (() => {
                    const squares: JSX.Element[] = []
                    for (let row = 0; row < boardSize; row++) {
                        for (let square = 0; square < boardSize; square++) {
                            let bgColor
                            if (isEven(row)) {
                                if (isEven(square)) {
                                    bgColor = boardColors[0]
                                } else {
                                    bgColor = boardColors[1]
                                }
                            } else {
                                if (isEven(square)) {
                                    bgColor = boardColors[1]
                                } else {
                                    bgColor = boardColors[0]
                                }
                            }

                            // bg-whiteBoard / bg-blackBoard
                            squares.push(<div key={`${row}-${square}`} className={`bg-${bgColor} h-24 w-24`} />)
                        }
                    }
                    return squares
                })()
            }
        </div>
    )
}