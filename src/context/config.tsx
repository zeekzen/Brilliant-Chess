"use client"

import { createContext, useState, Dispatch, SetStateAction, useRef } from 'react'

export type menu = "settings" | null

export const ConfigContext = createContext<{
    openedMenu: [menu, Dispatch<SetStateAction<menu>>],
    boardTheme: [number, Dispatch<SetStateAction<number>>],

    boardMenuSettingsRef: React.MutableRefObject<HTMLButtonElement | null>,
}>({
    openedMenu: [null, () => { }],
    boardTheme: [0, () => { }],

    boardMenuSettingsRef: { current: null }
})

export default function ConfigContextProvider(props: { children: React.ReactNode }) {
    const [openedMenu, setOpenedMenu] = useState<menu>(null)
    const [boardTheme, setBoardTheme] = useState<number>(0)

    const boardMenuSettingsRef = useRef<HTMLButtonElement>(null)

    return (
        <ConfigContext.Provider value={{ boardTheme: [boardTheme, setBoardTheme], openedMenu: [openedMenu, setOpenedMenu], boardMenuSettingsRef: boardMenuSettingsRef }}>
            {props.children}
        </ConfigContext.Provider>
    )
}