"use client"

import { useContext } from "react"
import { AnalyzeContext } from "@/context/analyze"
import { FORMATS } from "./form"

import Lens from "../svg/lens"
import Form from "./form"
import Loading from "./loading"
import AnalyzeMenu from "./analyzeMenu"
import GameButtons from "./gameButtons"

export default function Menu() {
    const [data, setData] = useContext(AnalyzeContext).data
    const [pageState, setPageState] = useContext(AnalyzeContext).pageState

    const format = FORMATS[data[0]][0]

    return (
        <div className="h-full select-text bg-backgroundBox rounded-borderRoundness w-[500px] flex flex-col gap-4">
            <menu className="flex flex-row">
                <li className="flex flex-col items-center justify-center gap-1 py-3 text-sm w-full font-bold"><Lens class="fill-foreground" />Analize Game</li>
            </menu>
            <div className="overflow-y-auto h-full flex flex-col">
                <Form display={pageState === 'default'} setData={setData} />
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