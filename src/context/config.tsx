"use client"

import { createContext, useState, Dispatch, SetStateAction } from 'react'

export const ConfigContext = createContext<{
    boardTheme: [number, Dispatch<SetStateAction<number>>],
}>({
    boardTheme: [0, () => { }],
})

export default function ConfigContextProvider(props: { children: React.ReactNode }) {
    const [boardTheme, setBoardTheme] = useState<number>(0)

    return (
        <ConfigContext.Provider value={{boardTheme: [boardTheme, setBoardTheme]}}>
            {props.children}
        </ConfigContext.Provider>
    )
}