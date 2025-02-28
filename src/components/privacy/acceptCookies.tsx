"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function AcceptCookies() {
    const [isFilled, setIsFilled] = useState(true)

    const pathname = usePathname()
    if (pathname === '/privacy') return

    useEffect(() => {
        const cookies = localStorage.getItem('cookies')

        if (!cookies) {
            setIsFilled(false)
            return
        }

        // code to add cookies
    }, [])

    if (isFilled) return

    const accept = () => {
        localStorage.setItem('cookies', '1')
        window.location.reload()
    }

    const decline = () => {
        localStorage.setItem('cookies', '0')
        window.location.reload()
    }

    return (
        <div className="absolute z-[890] w-full h-full bg-black backdrop-blur-sm bg-opacity-50 flex justify-center items-center">
            <div className="rounded-borderRoundness bg-[#262522] flex flex-col text-2xl p-6 shadow-black shadow-md max-h-screen">
                <h1>This website uses <b>cookies</b>.</h1>
                <span className="text-foregroundGrey text-xl">Please read our <a target="_blank" className="text-blue-600 hover:underline font-bold" href="privacy">privacy policy</a> to continue browsing.</span>
                <div className="mt-6 w-full h-fit flex flex-row items-center gap-3">
                    <button type="button" onClick={accept} className="w-2/3 h-fit py-[6px] cursor-pointer rounded-borderRoundness text-xl bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover transition-all font-extrabold hover:shadow-shadowBoxBoxHighlighted">Allow cookies</button>
                    <button type="button" onClick={decline} className="w-1/3 h-fit py-1 cursor-pointer rounded-borderRoundness text-xl hover:bg-white hover:border-transparent hover:text-foregroundBlackDark transition-all font-extrabold border-2 border-foregroundGrey text-foregroundGrey">Decline</button>
                </div>
            </div>
        </div>
    )
}