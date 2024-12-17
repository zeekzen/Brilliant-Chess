"use client"

import { createContext, useState, Dispatch, SetStateAction } from 'react'

export const AnalyzeContext = createContext<{data: [[number, [string, number]], Dispatch<SetStateAction<[number, [string, number]]>>], pageState: [string, Dispatch<SetStateAction<pageState>>]}>({data: [[0, ['', NaN]], () => {}], pageState: ['', () => {}]})

type pageState = 'default' | 'loading' | 'analyze'

export default function AnalyzeContextProvider(props: { children: React.ReactNode }) {
    const [data, setData] = useState<[number, [string, number]]>([0, ['', NaN]])
    const [pageState, setPageState] = useState<pageState>('analyze')

    return (
        <AnalyzeContext.Provider value={{data: [data, setData], pageState: [pageState, setPageState]}}>
            {props.children}
        </AnalyzeContext.Provider>
    )
}