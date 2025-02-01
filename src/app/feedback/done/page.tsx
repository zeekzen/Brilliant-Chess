"use client"

import Heart from "@/components/svg/heart"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const secondsToRedirect = 15

export default function Done() {
    const [timer, setTimer] = useState(secondsToRedirect)

    const heartRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        heartRef.current?.animate([
            { fill: 'red', transform: 'scale(1.5) rotate(12deg)' },
            { fill: 'red', transform: 'scale(1.5) rotate(12deg)' },
            { fill: 'red', transform: 'scale(1.5) rotate(12deg)' },
            { fill: 'red', transform: 'scale(1.5) rotate(12deg)' },
            { fill: 'red', transform: 'scale(1.5) rotate(12deg)' },
            { fill: 'red', transform: 'scale(1.5) rotate(12deg)' },
            { fill: 'var(--foregroundHighlighted)', transform: 'scale(1) rotate(12deg)' },
        ],
        { duration: 2000, iterations: 1, delay: 100 })
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => Math.max(prev - 1, 0))
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        if (timer === 0) setTimeout(() => window.location.replace('/'), 1000)
    }, [timer])

    return (
        <main className="w-full h-full overflow-auto flex flex-col justify-center items-center p-8">
            <div className="max-w-[800px] w-full bg-backgroundBox rounded-borderRoundness pt-16 px-16 pb-10 flex flex-col gap-5 items-center">
                <Image className="mb-6" src="/images/done.svg" alt="done" width={80} height={80} />
                <h1 className="text-4xl font-bold text-foregroundHighlighted flex flex-row">Thank You<Heart ref={heartRef} class="fill-foregroundHighlighted ml-1 rotate-12" /></h1>
                <span className="text-lg text-center text-foregroundGrey">Your feedback helps us improve the app.<br />If you find another bug, please report it again.</span>
                <span className="text-xl font-bold">Your report will be reviewed soon.</span>
                <div className="flex flex-col items-center gap-3">
                    <button onClick={() => window.location.replace('/')} type="button" className="px-2 py-1 border-border hover:bg-foreground hover:text-foregroundBlackDark font-bold transition-colors border-2 rounded-borderRoundness hover:border-white">Return to Board</button>
                    <span className="text-lg font-extrabold">{timer}</span>
                </div>
            </div>
        </main>
    )
}