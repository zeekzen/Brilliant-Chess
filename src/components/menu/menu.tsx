"use client"

import { useContext, useEffect, useState } from "react"
import { AnalyzeContext } from "@/context/analyze"
import { TYPES } from "./form"

import Lens from "../svg/lens"
import Form from "./form"
import Loading from "./loading"
import AnalyzeMenu from "./analyzeMenu"
import GameButtons from "./gameButtons"
import Play from "../svg/play"
import Pawn from "../svg/pawn"
import SelectChessComGame from "./selectChessCom"
import Star from "../svg/star"

export default function Menu() {
    const [tab, setTab] = useState<'analyze'|'selectGame'|'summary'>('analyze')
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

    function stopSelecting() {
        setTab('analyze')
        setUsername('')
    }

    const { format } = data

    const tabClass = "flex flex-col items-center justify-between gap-1 py-2 text-sm flex-grow font-bold h-16"

    const nonSelectedTabClass = "bg-backgroundBoxBoxDisabled text-foregroundGrey hover:text-foregroundHighlighted group transition-colors cursor-pointer"
    const nonSelectedFillClass = "fill-foregroundGrey group-hover:fill-foregroundHighlighted transition-colors"

    const selectedFill = "fill-foreground"

    return (
        <div className="h-full select-text bg-backgroundBox rounded-borderRoundness w-[500px] flex flex-col gap-4 overflow-hidden">
            <menu className="flex flex-row relative select-none">
                <li onClick={pageState === 'analyze' ? () => setData({format: "fen", string: "", depth: 18}) : stopSelecting} className={`${tabClass} ${tab !== 'analyze' ? nonSelectedTabClass : ''}`}><Lens class={tab !== 'analyze' ? nonSelectedFillClass : selectedFill} />Analyze {pageState === 'analyze' ? 'New' : ''} Game</li>
                <li onClick={() => setTab('selectGame')} className={`${tabClass} pt-3 ${tab !== 'selectGame' ? 'hidden' : ''}`}><Pawn class={selectedFill} />Choose Game</li>
                <li onClick={() => setTab('summary')} className={`${tabClass} ${pageState !== 'analyze' ? 'hidden' : ''} pt-[10px] ${tab !== 'summary' ? nonSelectedTabClass : ''}`}><Star size={20} class={tab === 'summary' ? selectedFill : nonSelectedFillClass} />Summary</li>
            </menu>
            <div className="overflow-y-auto h-full flex flex-col">
                {pageState === 'default' && tab === 'analyze' ? <Form setData={setData} selectGame={(username: string) => {setTab('selectGame'); setUsername(username)}} type={[type, setType]} selected={[selected, select]} /> : ''}
                {pageState === 'default' && tab === 'selectGame' ? <SelectChessComGame username={username} stopSelecting={stopSelecting} depth={TYPES[type][2]} /> : ''}

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