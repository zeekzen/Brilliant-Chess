import { players } from "@/context/analyze";
import Profile from "../svg/profile";
import { move, position } from "@/server/analyze";
import { Dispatch, SetStateAction, useEffect } from "react";
import RatingBox from "./ratingBox";

function isEndOpening(position: position) {
    let nonDeveloppedBlack = 0, nonDeveloppedWhite = 0
    for (const square of position[0]) {
        if (square?.color === 'w') continue
        if (square?.type === 'n' || square?.type === 'b' || square?.type === 'q') nonDeveloppedBlack++
    }
    for (const square of position[position.length - 1]) {
        if (square?.color === 'b') continue
        if (square?.type === 'n' || square?.type === 'b' || square?.type === 'q') nonDeveloppedWhite++
    }

    const developpedBlack = 5 - nonDeveloppedBlack
    const developpedWhite = 5 - nonDeveloppedWhite

    if (developpedBlack > 2 && developpedWhite > 1) return true
    if (developpedWhite > 2 && developpedBlack > 1) return true
    if (developpedBlack > 3) return true
    if (developpedWhite > 3) return true
}

function isEndMiddlegame(position: position) {
    let whitePieces = 0, blackPieces = 0
    for (const row of position) {
        for (const square of row) {
            if (square?.type === 'r' || square?.type === 'n' || square?.type === 'b' || square?.type === 'q') {
                if (square.color === 'w') whitePieces++
                else blackPieces++
            }
        }
    }

    if (whitePieces < 3 && blackPieces < 3) return true
    if (whitePieces < 2 || blackPieces < 2) return true
}

export function avg(arr: number[]) {
    const sum = arr.reduce((acc, cur) => acc + cur, 0)
    return sum / arr.length
}

export default function PlayersAccuracy(props: { players: players, moves: move[], accuracy: [{ w: number, b: number }, Dispatch<SetStateAction<{ w: number, b: number }>>], setAccuracyPhases: Dispatch<SetStateAction<{ opening: { w: number[], b: number[] }, middlegame: { w: number[], b: number[] }, endgame: { w: number[], b: number[] } }>> }) {
    const { players, moves, setAccuracyPhases } = props
    const [accuracy, setAccuracy] = props.accuracy

    useEffect(() => {
        const accuracies: { w: number[], b: number[] } = { w: [], b: [] }
        const accuraciesPhases: { opening: { w: number[], b: number[] }, middlegame: { w: number[], b: number[] }, endgame: { w: number[], b: number[] } } = { opening: { w: [], b: [] }, middlegame: { w: [], b: [] }, endgame: { w: [], b: [] } }

        function pushAccuracies(white: boolean, value: number) {
            if (white) {
                accuracies.w.push(value)
            } else {
                accuracies.b.push(value)
            }
        }

        function pushAccuraciesPhase(white: boolean, value: number, phase: 'opening' | 'middlegame' | 'endgame') {
            if (white) {
                accuraciesPhases[phase].w.push(value)
            } else {
                accuraciesPhases[phase].b.push(value)
            }
        }

        let gamePhase: 'opening' | 'middlegame' | 'endgame' = 'opening'
        function pushAccuraciesPhaseSwitch(white: boolean, moveAccuracy: number, position: position) {
            switch (gamePhase) {
                case 'opening':
                    if (isEndOpening(position)) gamePhase = 'middlegame'
                    pushAccuraciesPhase(white, moveAccuracy, 'opening')
                    break
                case 'middlegame':
                    if (isEndMiddlegame(position)) gamePhase = 'endgame'
                    pushAccuraciesPhase(white, moveAccuracy, 'middlegame')
                    break
                case 'endgame':
                    pushAccuraciesPhase(white, moveAccuracy, 'endgame')
                    break
            }
        }

        let prevWinPerc: number
        let prevMateIn = NaN
        moves.forEach((move, i) => {
            const white = i % 2 === 1

            if (move.staticEval[0] === 'mate') {
                if (!move.staticEval[1]) {
                    const value = 100

                    pushAccuracies(white, value)
                    pushAccuraciesPhaseSwitch(white, value, move.position)
                } else {
                    const mateIn = Number(move.staticEval[1])
                    if (isNaN(prevMateIn)) {
                        const value = mateIn > 0 ? 0 : 100

                        pushAccuracies(white, value)
                        pushAccuraciesPhaseSwitch(white, value, move.position)
                    } else if (Math.abs(mateIn) < Math.abs(prevMateIn)) {
                        const value = mateIn > 0 ? 0 : 100
                        // you advanced your opponents checkmate
                        // you did the right move to checkmate

                        pushAccuracies(white, value)
                        pushAccuraciesPhaseSwitch(white, value, move.position)
                    } else if (Math.abs(mateIn) > Math.abs(prevMateIn)) {
                        if (mateIn > 0) {
                            // you retarded your opponents checkmate (probably a bug)
                        } else {
                            // you retarded your checkmate
                            const value = 50
                            pushAccuracies(white, value)
                            pushAccuraciesPhaseSwitch(white, value, move.position)
                        }
                    } else if (Math.abs(mateIn) === Math.abs(prevMateIn)) {
                        if (mateIn > 0) {
                            // you did not advance your opponents checkmate
                        } else {
                            // you retarded your checkmate a little
                            const value = 50
                            pushAccuracies(white, value)
                            pushAccuraciesPhaseSwitch(white, value, move.position)
                        }
                    }

                    prevMateIn = mateIn
                }

                return
            } else if (!isNaN(prevMateIn)) {
                if (prevMateIn > 0) {
                    pushAccuracies(white, 0)
                } else {
                    pushAccuracies(white, 100)
                }

                prevMateIn = NaN
                return
            }

            const staticEval = -Number(move.staticEval[1])

            const winPerc = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * staticEval)) - 1)

            if (i === 0) {
                prevWinPerc = 100 - winPerc

                return
            }

            const moveAccuracy = winPerc >= prevWinPerc ? 100 : 103.1668 * Math.exp(-0.04354 * (prevWinPerc - winPerc)) - 3.1669

            prevMateIn = NaN
            prevWinPerc = 100 - winPerc
            pushAccuracies(white, moveAccuracy)
            pushAccuraciesPhaseSwitch(white, moveAccuracy, move.position)
        })

        const avgWhite = avg(accuracies.w)
        const avgBlack = avg(accuracies.b)

        setAccuracy({ w: avgWhite, b: avgBlack })
        setAccuracyPhases(accuraciesPhases)
    }, [])

    return (
        <div className="w-[85%] flex flex-col items-end gap-3">
            <div className="w-[262px] flex flex-row justify-between font-extrabold">
                <div className="w-20 flex flex-row justify-center whitespace-nowrap overflow-visible"><span>{players[0].name}</span></div>
                <div className="w-20 flex flex-row justify-center whitespace-nowrap overflow-visible"><span>{players[1].name}</span></div>
            </div>
            <div className="flex flex-row w-full justify-between items-center">
                <span className="font-bold text-foregroundGrey text-lg">Players</span>
                <div className="flex flex-row w-[262px] justify-between">
                    <div className="h-20 w-20 flex flex-row justify-center items-end bg-backgroundProfileWhite rounded-borderRoundness">
                        <Profile width={70} height={70} class="fill-foregroundProfileWhite" />
                    </div>
                    <div className="h-20 w-20 flex flex-row justify-center items-end bg-backgroundProfileBlack rounded-borderRoundness">
                        <Profile width={70} height={70} class="fill-foregroundProfileBlack" />
                    </div>
                </div>
            </div>
            <div className="flex flex-row w-full justify-between items-center">
                <span className="font-bold text-foregroundGrey text-lg">Accuracy</span>
                <div className="flex flex-row w-[262px] justify-between">
                    <RatingBox white>{accuracy.w.toFixed(1)}</RatingBox>
                    <RatingBox>{accuracy.b.toFixed(1)}</RatingBox>
                </div>
            </div>
        </div>
    )
}