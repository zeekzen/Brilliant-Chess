"use client"

import { useContext } from "react"
import { AnalyzeContext } from "@/context/analyze"
import { FORMATS } from "./form"

import Lens from "../svg/lens"
import Form from "./form"
import Loading from "./loading"
import AnalyzeMenu from "./analyzeMenu"
import GameButtons from "./gameButtons"
import Play from "../svg/play"

export default function Menu() {
    const [data, setData] = useContext(AnalyzeContext).data
    const [pageState, setPageState] = useContext(AnalyzeContext).pageState

    const format = FORMATS[data[0]][0]

    return (
        <div className="h-full select-text bg-backgroundBox rounded-borderRoundness w-[500px] flex flex-col gap-4">
            <menu className="flex flex-row relative">
                <button style={{ display: pageState === 'analyze' ? '' : 'none' }} title="Exit" onClick={() => setData([0, ["", 0]])} className="absolute left-5 top-1/2 translate-y-[-50%]"><Play class="w-5 fill-foregroundGrey hover:fill-foregroundHighlighted transition-colors rotate-180" /></button>
                <li className="flex flex-col items-center justify-center gap-1 py-3 text-sm w-full font-bold"><Lens class="fill-foreground" />Analize Game</li>
            </menu>
            <div className="overflow-y-auto h-full flex flex-col">
                {pageState === 'default' ? <Form setData={setData} /> : ''}
                {pageState === 'loading' ? <Loading format={format} /> : ''}
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