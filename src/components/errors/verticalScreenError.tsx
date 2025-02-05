"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export default function VerticalScreenError() {
    const [verticalScreenError, setVerticalScreenError] = useState(false)
    const ignored = useRef(false)

    useEffect(() => {
        function handleResize() {
            if (window.innerHeight > window.innerWidth) {
                setVerticalScreenError(true)
            } else {
                setVerticalScreenError(false)
            }
        }

        handleResize()

        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (ignored.current || !verticalScreenError) return null

    function ignore() {
        ignored.current = true
        setVerticalScreenError(false)
    }

    return (
        <div className="fixed text-foregroundHighlighted left-0 right-0 w-screen h-screen bg-error z-[900] flex gap-8 flex-col items-center justify-center p-10">
            <Image src={'/images/rotate-device.svg'} alt="rotate" width={100} height={100} />
            <div className="flex flex-col gap-2">
                <span className="font-extrabold text-xl">Brilliant Chess is not designed to be used in portrait mode.</span>
                <span className="font-bold text-foreground">Please rotate your device or resize the window.</span>
            </div>
            <button className="border-foregroundHighlighted border-2 rounded-borderRoundness p-2 text-lg font-bold hover:bg-foregroundHighlighted hover:text-error transition-colors" type="button" onClick={ignore}>Continue anyway</button>
        </div>
    )
}