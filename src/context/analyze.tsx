"use client"

import { createContext, useState, Dispatch, SetStateAction } from 'react'

export const AnalyzeContext = createContext<{data: [[number, string], Dispatch<SetStateAction<[number, string]>>], pageState: [string, Dispatch<SetStateAction<pageState>>]}>({data: [[0, ''], () => {}], pageState: ['', () => {}]})

type pageState = 'default' | 'loading' | 'analyze'

export default function AnalyzeContextProvider(props: { children: React.ReactNode }) {
    const [data, setData] = useState<[number, string]>([0, ''])
    const [pageState, setPageState] = useState<pageState>('default')

    return (
        <AnalyzeContext.Provider value={{data: [data, setData], pageState: [pageState, setPageState]}}>
            {props.children}
        </AnalyzeContext.Provider>
    )
}