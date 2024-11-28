"use client"

import React, { useEffect, useState, useRef } from "react"

import Board from "./board"
import Clock from "./clock"

const BOARD_PROPORTIONS = 8

export default function Game() {
    const [boardSize, setBoardSize] = useState(750)

    const componentRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function updateBoardSize() {
            const component = componentRef.current
            const statusBar = component?.getElementsByTagName('div')[0]
            
            const componentHeight = component?.offsetHeight ?? 0
            const statusBarHeight = statusBar?.offsetHeight ?? 0
            const gapHeight = 9

            const boardHeight = componentHeight - ((statusBarHeight * 2) + (gapHeight * 2))

            setBoardSize(boardHeight)
        }
        
        updateBoardSize()

        window.addEventListener('resize', updateBoardSize)

        return () => window.removeEventListener('resize', updateBoardSize)
    }, [])

    return (
        <div ref={componentRef} className="h-full flex flex-col justify-between">
                <div className="flex flex-row justify-between">-<Clock white={false} moving={false} time="10:00" /></div>
                <Board boardProportions={BOARD_PROPORTIONS} boardSize={boardSize} />
                <div className="flex flex-row justify-between">-<Clock white={true} moving={false} time="10:00" /></div>
        </div>
    )
}