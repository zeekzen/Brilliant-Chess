import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"

export async function getClientIp(headers: Promise<ReadonlyHeaders>) {
    const headerList = await headers
    const clientIp = headerList.get('cf-connecting-ip') ?? headerList.get("x-forwarded-for") ?? headerList.get("x-real-ip") ?? headerList.get("via")
    return clientIp
}

const BLACKLIST_TIME = 5000
const MAX_ENTRIES = 50000

export function cleanUpBlacklist() {

}

export function blacklistIp(ip: string) {
    
}