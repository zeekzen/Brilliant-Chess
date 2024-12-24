"use client"

import { move } from '@/server/analyze'
import { createContext, useState, Dispatch, SetStateAction } from 'react'

export type players = {
    name: string;
    elo: string;
}[]

export const AnalyzeContext = createContext<{
    data: [[number, [string, number]], Dispatch<SetStateAction<[number, [string, number]]>>],
    pageState: [string, Dispatch<SetStateAction<pageState>>],
    game: [move[], Dispatch<SetStateAction<move[]>>],
    players: [players, Dispatch<SetStateAction<players>>],
    moveNumber: [number, Dispatch<SetStateAction<number>>],
    forward: [boolean, Dispatch<SetStateAction<boolean>>],
    animation: [boolean, Dispatch<SetStateAction<boolean>>],
    white: [boolean, Dispatch<SetStateAction<boolean>>],
}>({
    data: [[0, ['', NaN]], () => {}],
    pageState: ['', () => {}],
    game: [[], () => {}],
    players: [[], () => {}],
    moveNumber: [0, () => {}],
    forward: [true, () => {}],
    animation: [false, () => {}],
    white: [true, () => {}],
})

type pageState = 'default' | 'loading' | 'analyze'

export default function AnalyzeContextProvider(props: { children: React.ReactNode }) {
    const [data, setData] = useState<[number, [string, number]]>([0, ['', NaN]])
    const [pageState, setPageState] = useState<pageState>('default')
    const [game, setGame] = useState<move[]>([])
    const [players, setPlayers] = useState<players>([{name: 'White', elo: '?'}, {name: 'Black', elo: '?'}])
    const [moveNumber, setMoveNumber] = useState(0)
    const [forward, setForward] = useState(true)
    const [animation, setAnimation] = useState(true)
    const [white, setWhite] = useState(true)

    return (
        <AnalyzeContext.Provider value={{data: [data, setData], pageState: [pageState, setPageState], game: [game, setGame], players: [players, setPlayers], moveNumber: [moveNumber, setMoveNumber], forward: [forward, setForward], white: [white, setWhite], animation: [animation, setAnimation]}}>
            {props.children}
        </AnalyzeContext.Provider>
    )
}