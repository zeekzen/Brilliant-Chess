"use client"

import { useContext, useEffect, useRef, useState } from "react"
import { AnalyzeContext } from "@/context/analyze"
import { TYPES } from "./analyze/form"

import Lens from "../svg/lens"
import Form from "./analyze/form"
import Loading from "./loading/loading"
import GameButtons from "./analysis/gameButtons"
import Pawn from "../svg/pawn"
import SelectChessComGame from "./analyze/selectChessCom"
import Star from "../svg/star"
import BoardIcon from "../svg/boardIcon"
import Summary from "./analysis/summary/summary"
import Moves from "./analysis/moves/moves"
import GameChart from "./analysis/gameChart"
import getOverallGameComment from "./analysis/moves/overallGameComment"

export default function Menu() {
    const [tab, setTab] = useState<'analyze' | 'selectGame' | 'summary' | 'moves'>('analyze')

    const [gameChart, setGameChart] = useState<JSX.Element>(<></>)
    const [gameChartSize, setGameChartSize] = useState({ width: NaN, height: NaN })

    const [username, setUsername] = useState('')

    const [type, setType] = useState(1)
    const [selected, select] = useState(0)

    const [overallGameComment, setOverallGameComment] = useState("")

    const [pageState, setPageState] = useContext(AnalyzeContext).pageState
    const [data, setData] = useContext(AnalyzeContext).data
    const [game, setGame] = useContext(AnalyzeContext).game
    const [players, setPlayers] = useContext(AnalyzeContext).players
    const [result, setResult] = useContext(AnalyzeContext).result

    const menuRef = useRef<HTMLDivElement>(null)

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

    useEffect(() => {
        const container = menuRef.current
        const width = (container?.clientWidth ?? 0) * 0.85

        setGameChartSize({ width, height: 96 })
    }, [])

    useEffect(() => {
        setGameChart(GameChart({ moves: game, size: gameChartSize }))
    }, [gameChartSize, game])

    const { format } = data

    useEffect(() => {
        const playerNames = players.map(player => player.name) as [ string, string ]
        setOverallGameComment(getOverallGameComment(playerNames, result))
    }, [players, result])

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
        { label: "Moves", state: 'moves', icon: (className: string) => <BoardIcon class={className} size={20} />, show: pageState === 'analyze', onClick: () => { } }
    ]

    return (
        <div ref={menuRef} className="h-full select-text bg-backgroundBox rounded-borderRoundness w-[500px] flex flex-col gap-4 overflow-hidden">
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

                {pageState === 'analyze' && tab === 'summary' ? <Summary moves={game} gameChart={gameChart} /> : ''}
                {pageState === 'analyze' && tab === 'moves' ? <Moves gameChart={gameChart} moves={game} overallGameComment={overallGameComment} /> : ''}
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