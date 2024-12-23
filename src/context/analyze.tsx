"use client"

import { move } from '@/server/analyze'
import { createContext, useState, Dispatch, SetStateAction } from 'react'

export type metadata = {names: string[];time: string}|undefined

export const AnalyzeContext = createContext<{
    data: [[number, [string, number]], Dispatch<SetStateAction<[number, [string, number]]>>],
    pageState: [string, Dispatch<SetStateAction<pageState>>],
    game: [move[], Dispatch<SetStateAction<move[]>>],
    metadata: [metadata, Dispatch<SetStateAction<metadata>>],
    moveNumber: [number, Dispatch<SetStateAction<number>>],
    forward: [boolean, Dispatch<SetStateAction<boolean>>],
    white: [boolean, Dispatch<SetStateAction<boolean>>],
}>({
    data: [[0, ['', NaN]], () => {}],
    pageState: ['', () => {}],
    game: [[], () => {}],
    metadata: [undefined, () => {}],
    moveNumber: [0, () => {}],
    forward: [true, () => {}],
    white: [true, () => {}],
})

type pageState = 'default' | 'loading' | 'analyze'

export default function AnalyzeContextProvider(props: { children: React.ReactNode }) {
    const [data, setData] = useState<[number, [string, number]]>([0, ['', NaN]])
    const [pageState, setPageState] = useState<pageState>('default')
    const [game, setGame] = useState<move[]>([])
    const [metadata, setMetadata] = useState<metadata>(undefined)
    const [moveNumber, setMoveNumber] = useState(0)
    const [forward, setForward] = useState(true)
    const [white, setWhite] = useState(true)

    return (
        <AnalyzeContext.Provider value={{data: [data, setData], pageState: [pageState, setPageState], game: [game, setGame], metadata: [metadata, setMetadata], moveNumber: [moveNumber, setMoveNumber], forward: [forward, setForward], white: [white, setWhite]}}>
            {props.children}
        </AnalyzeContext.Provider>
    )
}