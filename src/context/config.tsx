"use client"

import { createContext, useState, Dispatch, SetStateAction, useRef } from 'react'

export type menu = "settings" | null

interface usedRatings {
    brilliant: boolean,
    great: boolean,
    best: boolean,
    excellent: boolean,
    good: boolean,
    book: boolean,
    inaccuracy: boolean,
    mistake: boolean,
    miss: boolean,
    blunder: boolean,
    forced: boolean,
}

const defaultUsedRatings: usedRatings = {
    brilliant: true,
    great: true,
    best: true,
    excellent: true,
    good: true,
    book: true,
    inaccuracy: true,
    mistake: true,
    miss: true,
    blunder: true,
    forced: true,
}

export const ConfigContext = createContext<{
    openedMenu: [menu, Dispatch<SetStateAction<menu>>],
    boardTheme: [number, Dispatch<SetStateAction<number>>],
    usedRatings: [usedRatings, Dispatch<SetStateAction<usedRatings>>],

    boardMenuSettingsRef: React.MutableRefObject<HTMLButtonElement | null>,
}>({
    openedMenu: [null, () => { }],
    boardTheme: [0, () => { }],
    usedRatings: [defaultUsedRatings, () => { }],

    boardMenuSettingsRef: { current: null },
})

export default function ConfigContextProvider(props: { children: React.ReactNode }) {
    const [openedMenu, setOpenedMenu] = useState<menu>(null)
    const [boardTheme, setBoardTheme] = useState<number>(0)
    const [usedRatings, setUsedRatings] = useState<usedRatings>(defaultUsedRatings)

    const boardMenuSettingsRef = useRef<HTMLButtonElement>(null)

    return (
        <ConfigContext.Provider value={{ boardTheme: [boardTheme, setBoardTheme], openedMenu: [openedMenu, setOpenedMenu], usedRatings: [usedRatings, setUsedRatings], boardMenuSettingsRef: boardMenuSettingsRef }}>
            {props.children}
        </ConfigContext.Provider>
    )
}