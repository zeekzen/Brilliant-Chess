"use client"

import { createContext, useState, Dispatch, SetStateAction } from 'react'

export const AnalyzeContext = createContext<[string, Dispatch<SetStateAction<string>>]>(['', () => {}])

export default function AnalyzeContextProvider(props: { children: React.ReactNode }) {
    const [data, setData] = useState<string>('')

    return (
        <AnalyzeContext.Provider value={[data, setData]}>
            {props.children}
        </AnalyzeContext.Provider>
    )
}