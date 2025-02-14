export default function Sitemap() {
    const protocol = "https"
    const domain = "brilliant-chess.com"

    const baseUrl = protocol + '://' + domain

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            priority: 1,
        },
        {
            url: baseUrl + '/' + 'feedback',
            lastModified: new Date(),
            priority: 0.5,
        },
        {
            url: baseUrl + '/' + 'privacy',
            lastModified: new Date(),
            priority: 0.1,
        },
        {
            url: baseUrl + '/' + 'licenses',
            lastModified: new Date(),
            priority: 0.1,
        },
    ]
}