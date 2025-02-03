"use client"

import { useEffect } from "react"

export default function RightAd(props: { pId: string, sId: string }) {
    useEffect(() => {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch {}
    }, [])

    return (
        <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={`ca-${props.pId}`}
            data-ad-slot={props.sId}
            data-ad-format="auto"
            data-full-width-responsive="true"
        />
    )
}