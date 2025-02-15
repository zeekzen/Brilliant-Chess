import { MetadataRoute } from "next";

export default function Robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/licenses/', '/feedback/done', '/too-many-requests'],
        },
        sitemap: 'https://brilliant-chess.com/sitemap.xml',
    }
}