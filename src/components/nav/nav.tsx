"use client"

import Image from "next/image"
import GitHub from "../svg/github"
import { useContext, useEffect, useRef, useState } from "react"
import Heart from "../svg/heart"
import Licenses from "../svg/license"
import Settings from "./settings/settings"
import { ConfigContext, menu } from "@/context/config"

export default function Nav() {
    const [srcHover, setSrcHover] = useState(false)
    const [supportHover, setSupportHover] = useState(false)
    const [licensesHover, setLicensesHover] = useState(false)

    const configContext = useContext(ConfigContext)

    const [openedMenu, setOpenedMenu] = configContext.openedMenu
    const boardMenuSettingsRef = configContext.boardMenuSettingsRef

    const topLinksRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    interface Link {
        label: string,
        click?: () => any,
        hover?: () => void,
        unHover?: () => void,
        icon: { src: string, alt: string },
        role: "button"|"link",
    }

    const topLinks: Link[] = [
        { label: "Settings", click: toggleSettings, hover: openSettings, icon: { src: "/images/setting.svg", alt: "Settings" }, role: "button" },
        { label: "Feedback", hover: () => setOpenedMenu(null), click: () => window.open("/feedback", "_blank", "noopener,noreferrer"), icon: { src: "/images/megaphone.svg", alt: "Contact Us" }, role: "link" },
        { label: "Donate", hover: () => setOpenedMenu(null), click: () => window.open("https://www.paypal.com/donate/?hosted_button_id=S8SWJBNYZ2WFW", "_blank", "noopener,noreferrer"), icon: { src: "/images/donate.svg", alt: "Donate" }, role: "link" },
    ]

    function toggleSettings() {
        setOpenedMenu(prev => prev === "settings" ? null : "settings")
    }

    function openSettings() {
        setOpenedMenu("settings")
    }

    function closeMenu() {
        setOpenedMenu(null)
    }

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                !menuRef.current?.contains(e.target as Node)
                &&
                !topLinksRef.current?.contains(e.target as Node)
                &&
                !boardMenuSettingsRef.current?.contains(e.target as Node)
            ) {
                closeMenu()
            }
        }

        document.addEventListener('mousedown', handleClick)
    }, [])

    return (
        <nav className="flex flex-row h-screen relative">
            <div className="pt-1 pb-6 h-full w-fit bg-backgroundBox flex flex-col justify-between">
                <div ref={topLinksRef} className="flex flex-col">
                    <a href="/" className="flex flex-row gap-1 font-extrabold text-xl p-3 transition-colors hover:bg-backgroundBoxHover hover:text-foregroundHighlighted">
                        <Image height={30} width={30} alt="logo" src="images/logo.svg" className="mt-[-2px]" />
                        <div className="h-fit w-fit">Brilliant<span className="text-sm font-light">Chess</span></div>
                    </a>
                    {topLinks.map((link, i) => {
                        return (
                            <button onClick={link?.click} onMouseEnter={link?.hover} onMouseLeave={link?.unHover} type="button" key={i} className="text-lg font-bold px-3 py-2 hover:bg-backgroundBoxHover hover:text-foregroundHighlighted transition-colors flex flex-row gap-2">
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
            <div ref={menuRef} style={{display: openedMenu ? '' : 'none'}} className="h-full z-[500] p-2 bg-backgroundBoxDarker absolute left-full select-none min-w-[300px] overflow-y-auto">
                <Settings hidden={openedMenu !== 'settings'} />
            </div>
        </nav>
    )
}