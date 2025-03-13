"use client"

import Image from "next/image"
import GitHub from "../svg/github"
import { useContext, useEffect, useRef } from "react"
import Licenses from "../svg/license"
import Settings from "./settings/settings"
import { ConfigContext } from "@/context/config"

export const DONATE_URL = "https://www.paypal.com/donate/?hosted_button_id=S8SWJBNYZ2WFW"

export default function Nav() {
    const configContext = useContext(ConfigContext)

    const [openedMenu, setOpenedMenu] = configContext.openedMenu
    const boardMenuSettingsRef = configContext.boardMenuSettingsRef

    const topLinksRef = useRef<HTMLDivElement>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    interface TopLink {
        label: string,
        click?: () => any,
        hover?: () => void,
        unHover?: () => void,
        icon: string,
        role: "button"|"link",
    }

    const topLinks: TopLink[] = [
        { label: "Settings", hover: openSettings, icon: `${process.env.NEXT_PUBLIC_BASE_PATH}/images/setting.svg`, role: "button" },
    ]

    interface BotLinks {
        label: string,
        href: string,
        icon: (props: {className: string}) => React.ReactNode,
    }

    const botLinks: BotLinks[] = [
        { label: "Source Code", href: "https://github.com/wdeloo/Brilliant-Chess", icon: (props: {className: string}) => <GitHub class={props.className} /> },
        { label: "Licenses", href: "/licenses", icon: (props: {className: string}) => <Licenses class={props.className} /> },
    ]

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
        <nav className="flex flex-row h-screen w-max relative reduceNav:ml-0 ml-[-4px]">
            <div className="pt-1 pb-6 h-full overflow-y-auto bg-backgroundBox flex flex-col justify-between select-none items-start">
                <div ref={topLinksRef} className="flex flex-col">
                    <a draggable={false} onMouseEnter={() => setOpenedMenu(null)} href="/" className="flex flex-row gap-1 font-extrabold text-xl p-3 transition-colors hover:bg-backgroundBoxHover hover:text-foregroundHighlighted">
                        <Image draggable={false} height={30} width={30} alt="logo" src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/logo.svg`} className="mt-[-2px]" />
                        <div className="h-fit w-fit reduceNav:block hidden">Brilliant<span className="text-sm font-light">Chess</span></div>
                    </a>
                    {topLinks.map((link, i) => {
                        return (
                            <button onClick={link?.click} onMouseEnter={link?.hover} onMouseLeave={link?.unHover} type="button" key={i} className="text-lg outline-none font-bold px-3 py-2 hover:bg-backgroundBoxHover hover:text-foregroundHighlighted transition-colors flex flex-row gap-2">
                                <Image draggable={false} height={28} width={28} alt={link.label} src={link.icon} className="transition-colors" />
                                <div className="h-fit w-fit reduceNav:block hidden">{link.label}</div>
                            </button>
                        )
                    })}
                </div>
                <div className="flex flex-col text-sm font-bold w-full">
                    {botLinks.map((link, i) => {
                        return (
                            <a draggable={false} key={i} target="_blank" href={link.href} className="flex flex-row gap-2 reduceNav:px-3 reduceNav:justify-start justify-center py-2 group hover:bg-backgroundBoxHover text-foregroundGrey hover:text-foregroundHighlighted transition-colors">
                                <link.icon className="fill-foregroundGrey transition-colors group-hover:fill-foregroundHighlighted" />
                                <span className="reduceNav:block hidden">{link.label}</span>
                            </a>
                        )
                    })}
                </div>
            </div>
            <div ref={menuRef} style={{display: openedMenu ? '' : 'none'}} className="h-full z-[500] p-2 bg-backgroundBoxDarker absolute left-full select-none min-w-[300px] overflow-y-auto">
                <Settings hidden={openedMenu !== 'settings'} />
            </div>
        </nav>
    )
}