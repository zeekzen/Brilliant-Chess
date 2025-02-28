import Script from "next/script"

export default function Analytics(props: { mId: string }) {
    return <Script
                strategy="afterInteractive"
                async
                src="https://analytics.ahrefs.com/analytics.js"
                data-key={props.mId}
            ></Script>
}