"use client"

import Image from "next/image"
import GitHub from "../svg/github"
import { useState } from "react"
import Heart from "../svg/heart"
import Licenses from "../svg/license"
import Settings from "./settings"

type menu = "settings" | null

export default function Nav() {
    const [srcHover, setSrcHover] = useState(false)
    const [supportHover, setSupportHover] = useState(false)
    const [licensesHover, setLicensesHover] = useState(false)

    const [openedMenu, setOpenedMenu] = useState<menu>(null)

    interface Link {
        label: string,
        click: () => any,
        hover: () => void,
        unHover: () => void,
        icon: { src: string, alt: string },
    }

    const topLinks: Link[] = [
        { label: "Settings", click: () => setOpenedMenu(prev => prev === "settings" ? null : "settings"), hover: () => { }, unHover: () => { }, icon: { src: "/images/setting.svg", alt: "Settings" } }
    ]

    return (
        <nav className="flex flex-row h-screen relative">
            <div className="pt-1 pb-6 h-full w-fit bg-backgroundBox flex flex-col justify-between">
                <div className="flex flex-col">
                    <a href="/" className="flex flex-row gap-1 font-extrabold text-xl p-3 transition-colors hover:bg-backgroundBoxHover hover:text-foregroundHighlighted">
                        <Image height={30} width={30} alt="logo" src="images/logo.svg" className="mt-[-2px]" />
                        <div className="h-fit w-fit">Brilliant<span className="text-sm font-light">Chess</span></div>
                    </a>
                    {topLinks.map((link, i) => {
                        return (
                            <button onClick={link.click} type="button" key={i} className="text-lg font-bold px-3 py-2 hover:bg-backgroundBoxHover hover:text-foregroundHighlighted transition-colors flex flex-row gap-2">
                                <Image height={28} width={28} alt={link.icon.alt} src={link.icon.src} className="transition-colors" />
                                <div className="h-fit w-fit">{link.label}</div>
                            </button>
                        )
                    })}
                </div>
                <div className="flex flex-col *:px-3 *:py-2 *:transition-colors hover:*:bg-backgroundBoxHover text-sm *:text-foregroundGrey hover:*:text-foregroundHighlighted font-bold">
                    <a target="_blank" href="https://github.com/wdeloo" onMouseEnter={() => setSrcHover(true)} onMouseLeave={() => setSrcHover(false)} className="flex flex-row gap-2"><GitHub class={`${srcHover ? "fill-foregroundHighlighted" : "fill-foregroundGrey"} transition-colors`} />Author</a>
                    <a target="_blank" href="https://www.paypal.com/donate/?hosted_button_id=S8SWJBNYZ2WFW" onMouseEnter={() => setSupportHover(true)} onMouseLeave={() => setSupportHover(false)} className="flex flex-row gap-2"><Heart class={`${supportHover ? "fill-foregroundHighlighted" : "fill-foregroundGrey"} transition-colors`} />Support Me</a>
                    <a target="_blank" href="/licenses" onMouseEnter={() => setLicensesHover(true)} onMouseLeave={() => setLicensesHover(false)} className="flex flex-row gap-2"><Licenses class={`${licensesHover ? "fill-foregroundHighlighted" : "fill-foregroundGrey"} transition-colors`} />Licenses</a>
                </div>
            </div>
            <div style={{display: openedMenu ? '' : 'none'}} className="h-full z-[500] p-2 bg-backgroundBoxDarker absolute left-full select-none min-w-[300px]">
                {openedMenu === 'settings' ? <Settings /> : null}
            </div>
        </nav>
    )
}