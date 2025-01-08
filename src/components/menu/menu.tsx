"use client"

import { useContext, useEffect, useState } from "react"
import { AnalyzeContext } from "@/context/analyze"
import { TYPES } from "./form"

import Lens from "../svg/lens"
import Form from "./form"
import Loading from "./loading"
import AnalyzeMenu from "./analyzeMenu"
import GameButtons from "./gameButtons"
import Pawn from "../svg/pawn"
import SelectChessComGame from "./selectChessCom"
import Star from "../svg/star"

export default function Menu() {
    const [tab, setTab] = useState<'analyze' | 'selectGame' | 'summary'>('analyze')

    const [username, setUsername] = useState('')

    const [type, setType] = useState(1)
    const [selected, select] = useState(0)

    const [pageState, setPageState] = useContext(AnalyzeContext).pageState
    const [data, setData] = useContext(AnalyzeContext).data

    useEffect(() => {
        if (pageState === 'default') setTab('analyze')
        if (pageState === 'loading') setTab('analyze')
        if (pageState === 'analyze') setTab('summary')
    }, [pageState])

    useEffect(() => {
        if (username) {
            setTab('selectGame')
        } else {
            setTab('analyze')
        }
    }, [username])

    function stopSelecting() {
        setTab('analyze')
        setUsername('')
    }

    const { format } = data

    interface Tab {
        label: string,
        state: typeof tab,
        icon: (className: string) => React.ReactNode,
        show: boolean,
        onClick: () => void
    }

    const tabs: Tab[] = [
        { label: `Analize${pageState === 'analyze' ? ' new' : ''} Game`, state: "analyze", icon: (className: string) => <Lens class={className} size={20} />, show: true, onClick: () => { if (pageState === 'analyze') setData({ format: "fen", string: "", depth: 18 }); if (tab === 'selectGame') setUsername('') } },
        { label: "Choose Game", state: "selectGame", icon: (className: string) => <Pawn class={className} size={20} />, show: tab === 'selectGame', onClick: () => { } },
        { label: "Summary", state: "summary", icon: (className: string) => <Star class={className} size={20} />, show: pageState === 'analyze', onClick: () => { } },
    ]

    return (
        <div className="h-full select-text bg-backgroundBox rounded-borderRoundness w-[500px] flex flex-col gap-4 overflow-hidden">
            <menu className="flex flex-row relative select-none">
                {tabs.map((t, i) => {
                    if (!t.show) return

                    const isSelected = tab === t.state
                    return <li key={i} onClick={() => { setTab(t.state); t.onClick() }} className={`w-full flex flex-col gap-1 group items-center py-2 text-sm ${isSelected ? 'text-foreground' : 'bg-backgroundBoxBoxDisabled text-foregroundGrey cursor-pointer transition-colors hover:text-foregroundHighlighted'}`}>{t.icon(isSelected ? "fill-foreground" : "fill-foregroundGrey transition-colors group-hover:fill-foregroundHighlighted")}{t.label}</li>
                })}
            </menu>
            <div className="overflow-y-auto h-full flex flex-col">
                {pageState === 'default' && tab === 'analyze' ? <Form setData={setData} selectGame={(username: string) => { setUsername(username) }} type={[type, setType]} selected={[selected, select]} /> : ''}
                {pageState === 'default' && tab === 'selectGame' ? <SelectChessComGame username={username} stopSelecting={() => setUsername('')} depth={TYPES[type][2]} /> : ''}

                {pageState === 'loading' && tab === 'analyze' ? <Loading format={format} /> : ''}

                {pageState === 'analyze' ? <AnalyzeMenu /> : ''}
            </div>
            {pageState === 'analyze' ? (
                <div className="flex flex-col gap-1 pb-1 items-center">
                    <hr className="border-neutral-600 w-[85%]" />
                    <GameButtons />
                </div>
            ) : ''}
        </div>
    )
}