"use client"

import Image from "next/image"
import GitHub from "./svg/github"
import { useState } from "react"
import Heart from "./svg/heart"

export default function Nav() {
    const [srcHover, setSrcHover] = useState(false)
    const [supportHover, setSupportHover] = useState(false)

    return (
        <nav className="pt-1 pb-6 h-screen w-fit bg-backgroundBox flex flex-col justify-between">
            <div className="flex flex-col font-bold *:p-3 *:transition-colors hover:*:bg-backgroundBoxHover text-lg hover:*:text-foregroundHighlighted">
                <div className="flex flex-row gap-2 text-xl"><Image height={30} width={30} alt="logo" src="images/logo.svg" /><a href="/">Brilliant Chess</a></div>
            </div>
            <div className="flex flex-col *:px-3 *:py-2 *:transition-colors hover:*:bg-backgroundBoxHover text-sm *:text-foregroundGrey hover:*:text-foregroundHighlighted font-bold">
                <a href="https://www.paypal.com/donate/?hosted_button_id=S8SWJBNYZ2WFW" onMouseEnter={() => setSupportHover(true)} onMouseLeave={() => setSupportHover(false)} className="flex flex-row gap-2"><Heart class={`${supportHover ? "fill-foregroundHighlighted" : "fill-foregroundGrey"} transition-colors`} />Support Me</a>
                <a href="https://github.com/wdeloo/Brilliant-Chess" onMouseEnter={() => setSrcHover(true)} onMouseLeave={() => setSrcHover(false)} className="flex flex-row gap-2"><GitHub class={`${srcHover ? "fill-foregroundHighlighted" : "fill-foregroundGrey"} transition-colors`} />Source Code</a>
            </div>
        </nav>
    )
}