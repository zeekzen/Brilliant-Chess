import { MetadataRoute } from "next";

export default function Robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            disallow: '/licenses/',
        },
        sitemap: 'https://brilliant-chess.com/sitemap.xml',
    }
}