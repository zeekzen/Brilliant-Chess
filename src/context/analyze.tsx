"use client"

import { move } from '@/server/analyze'
import { createContext, useState, Dispatch, SetStateAction } from 'react'

export const AnalyzeContext = createContext<{data: [[number, [string, number]], Dispatch<SetStateAction<[number, [string, number]]>>], pageState: [string, Dispatch<SetStateAction<pageState>>], game: [move[], Dispatch<SetStateAction<move[]>>]}>({data: [[0, ['', NaN]], () => {}], pageState: ['', () => {}], game: [[], () => {}]})

type pageState = 'default' | 'loading' | 'analyze'

export default function AnalyzeContextProvider(props: { children: React.ReactNode }) {
    const [data, setData] = useState<[number, [string, number]]>([0, ['', NaN]])
    const [pageState, setPageState] = useState<pageState>('default')
    const [game, setGame] = useState<move[]>([])

    return (
        <AnalyzeContext.Provider value={{data: [data, setData], pageState: [pageState, setPageState], game: [game, setGame]}}>
            {props.children}
        </AnalyzeContext.Provider>
    )
}