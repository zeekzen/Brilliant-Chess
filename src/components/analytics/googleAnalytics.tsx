import Script from "next/script";

export default function GoogleAnalytics(props: { mId: string }) {
    return (
        <>
            <Script strategy="afterInteractive" async src={`https://www.googletagmanager.com/gtag/js?id=${props.mId}`}></Script>
            <Script strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || []
                    function gtag(){dataLayer.push(arguments)}
                    gtag('js', new Date())

                    gtag('consent', 'default', {
                        'analytics_storage': 'denied',
                    })

                    gtag('config', '${props.mId}')
                `}
            </Script>
        </>
    )
}