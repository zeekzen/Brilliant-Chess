"use client"

import { createContext, useState, Dispatch, SetStateAction } from 'react'

export const AnalyzeContext = createContext<[[number, string], Dispatch<SetStateAction<[number, string]>>]>([[0, ''], () => {}])

export default function AnalyzeContextProvider(props: { children: React.ReactNode }) {
    const [data, setData] = useState<[number, string]>([0, ''])

    return (
        <AnalyzeContext.Provider value={[data, setData]}>
            {props.children}
        </AnalyzeContext.Provider>
    )
}