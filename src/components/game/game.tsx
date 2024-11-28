"use client"

import Board from "./board"
import Clock from "./clock"

const BOARD_PROPORTIONS = 8
const BOARD_COLORS = ["whiteBoard", "blackBoard"]
const BOARD_SIZE = 750

export default function Game() {
    return (
        <div className="h-full flex flex-col gap-2">
                <div className="flex flex-row justify-between">-<Clock white={false} moving={false} time="10:00" /></div>
                <Board boardProportions={BOARD_PROPORTIONS} boardColors={BOARD_COLORS} boardSize={BOARD_SIZE} />
                <div className="flex flex-row justify-between">-<Clock white={true} moving={false} time="10:00" /></div>
        </div>
    )
}