import { MetadataRoute } from "next"

export default function Sitemap(): MetadataRoute.Sitemap {
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
    ]
}