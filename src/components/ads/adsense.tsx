import Script from "next/script"

export default function Adsense(props: { pId: string }) {
    return (
        <Script
            async={true}
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${props.pId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    )
}