import Script from "next/script"

export default function Analytics(props: { mId: string }) {
    return <Script
                strategy="afterInteractive"
                async={true}
                src="https://analytics.ahrefs.com/analytics.js"
                crossOrigin="anonymous"
                data-key={props.mId}
            ></Script>
}