"use client"

import { useContext } from "react"
import { AnalyzeContext } from "@/context/analyze"
import { FORMATS } from "./form"

import Lens from "../svg/lens"
import Form from "./form"
import Loading from "./loading"

export default function Menu() {
    const [data, setData] = useContext(AnalyzeContext).data
    const [pageState, setPageState] = useContext(AnalyzeContext).pageState

    const format = FORMATS[data[0]][0]

    return (
        <div className="h-full bg-backgroundBox rounded-borderRoundness w-[500px] flex flex-col gap-4">
            <menu className="flex flex-row">
                <li className="flex flex-col items-center justify-center gap-1 py-3 text-sm w-full font-bold"><Lens class="fill-foreground" />Analize Game</li>
            </menu>
            <Form display={pageState === 'default'} setData={setData} />
            {pageState === 'loading' ? <Loading format={format} /> : ''}
        </div>
    )
}