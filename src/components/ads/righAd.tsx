"use client"

import { useEffect } from "react"

export default function RightAd(props: { pId: string, sId: string, showPlaceHolder: boolean, vertical?: boolean }) {
    useEffect(() => {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch {}
    }, [])

    return (
        <div style={{ backgroundColor: props.showPlaceHolder ? 'black' : '', marginLeft: props.vertical ? 0 : '' }} className={`max-w-72 flex-grow min-w-36 ml-2 overflow-hidden rounded-borderRoundness h-full ${props.vertical ? 'vertical:hidden' : 'hidden vertical:block'}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={props.pId}
                data-ad-slot={props.sId}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    )
}