import redis from "@/lib/redis"
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"

export async function getClientIp(headers: Promise<ReadonlyHeaders>) {
    const headerList = await headers
    const clientIp = headerList.get('cf-connecting-ip') ?? headerList.get("x-forwarded-for") ?? headerList.get("x-real-ip") ?? headerList.get("via")
    return clientIp
}

const BLACKLIST_TIME = 1800
const MAX_ENTRIES = 50000

export async function blacklistIp(ip: string) {
    const entries = await redis.dbsize()
    if (entries >= MAX_ENTRIES) throw new Error('LimitReached')

    const added = await redis.set(ip, "", "EX", BLACKLIST_TIME, "NX")
    if (!added) throw new Error('AlreadyBlacklisted')
}