"use server"

import { redirect } from "next/navigation"
import { blacklistIp, getClientIp } from "../utils/security"
import { headers } from "next/headers"
import db from "@/lib/sqlite"

function getFormDataError(formData: FormData, maxLengths: { [key: string]: number }) {
    const name = sanitizeUserInput(formData.get('name') as string)
    const email = sanitizeUserInput(formData.get('email') as string)
    const description = sanitizeUserInput(formData.get('description') as string)
    const game = sanitizeUserInput(formData.get('game') as string)

    if (!description) return true
    if (name.length > maxLengths.name) return true
    if (email.length > maxLengths.email) return true
    if (description.length > maxLengths.description) return true
    if (game.length > maxLengths.game) return true

    return false
}

export type ssError = "unknown" | "userLimit" | "globalLimit"

function getErrorUrlParams(formData: FormData, error: ssError) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const description = formData.get('description') as string
    const game = formData.get('game') as string

    const params = new URLSearchParams()
    params.append('error', error)
    params.append('name', name)
    params.append('email', email)
    params.append('description', description)
    // params.append('game', game)

    return params.toString()
}

function sanitizeUserInput(str: string) {
    let sanitizedStr = str
    sanitizedStr = sanitizedStr.trim()
    sanitizedStr = sanitizedStr.replace(/[\x00-\x1F\x7F]/g, '')
    sanitizedStr = sanitizedStr.replace(/[&<>"']/g, match => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[match] || match))

    return sanitizedStr
}

function storeBug(formData: FormData) {
    const name = sanitizeUserInput(formData.get('name') as string)
    const email = sanitizeUserInput(formData.get('email') as string)
    const description = sanitizeUserInput(formData.get('description') as string)
    const game = sanitizeUserInput(formData.get('game') as string)

    const stmt = db.prepare('insert into bugs (name, email, description, game) values (?, ?, ?, ?);')
    stmt.run(name, email, description, game)
}

export async function sendFeedback(formData: FormData, maxLengths: { [key: string]: number }) {
    if (getFormDataError(formData, maxLengths)) {
        redirect('/feedback?' + 'error=unknown')
    }

    const clientIp = await getClientIp(headers()) ?? 'unknown'

    try {
        await blacklistIp(clientIp)
        storeBug(formData)
    } catch (e: any) {
        if (e.message === 'LimitReached') redirect('/feedback?' + getErrorUrlParams(formData, 'globalLimit'))
        if (e.message === 'AlreadyBlacklisted') redirect('/feedback?' + getErrorUrlParams(formData, 'userLimit'))
        redirect('/feedback?' + getErrorUrlParams(formData, 'unknown'))
    }

    redirect('/feedback/done')
}