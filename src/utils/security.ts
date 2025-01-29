import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"

export async function getClientIp(headers: Promise<ReadonlyHeaders>) {
    const headerList = await headers
    const clientIp = headerList.get('cf-connecting-ip') ?? headerList.get("x-forwarded-for") ?? headerList.get("x-real-ip") ?? headerList.get("via")
    return clientIp
}

const blacklist = new Map<string, { blockedUntil: number }>()
const BLACKLIST_TIME = 5000
const MAX_ENTRIES = 50000

export function cleanUpBlacklist() {
    const now = Date.now()
    blacklist.forEach((value, key) => {
        if (now >= value.blockedUntil) blacklist.delete(key)
    })
}

export function blacklistIp(ip: string) {
    if (blacklist.size >= MAX_ENTRIES) throw new Error('LimitReached')
    if (blacklist.has(ip)) throw new Error('AlreadyBlacklisted')

    blacklist.set(ip, { blockedUntil: Date.now() + BLACKLIST_TIME })
}