"use client"

import { boardThemeLabel } from '@/components/nav/themes'
import { createContext, useState, Dispatch, SetStateAction } from 'react'

export const ConfigContext = createContext<{
    boardTheme: [boardThemeLabel, Dispatch<SetStateAction<boardThemeLabel>>],
}>({
    boardTheme: ["Green", () => { }],
})

export default function ConfigContextProvider(props: { children: React.ReactNode }) {
    const [boardTheme, setBoardTheme] = useState<boardThemeLabel>("Green")

    return (
        <ConfigContext.Provider value={{boardTheme: [boardTheme, setBoardTheme]}}>
            {props.children}
        </ConfigContext.Provider>
    )
}