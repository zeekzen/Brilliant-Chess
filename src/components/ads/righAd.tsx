"use client"

import { useEffect } from "react"

export default function RightAd(props: { pId: string, sId: string, showPlaceHolder: boolean }) {
    useEffect(() => {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch {}
    }, [])

    return (
        <div style={{ backgroundColor: props.showPlaceHolder ? 'black' : '' }} className="max-w-72 w-full min-w-36 ml-2 overflow-hidden rounded-borderRoundness h-full">
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={`ca-${props.pId}`}
                data-ad-slot={props.sId}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </div>
    )
}