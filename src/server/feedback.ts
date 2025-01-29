"use server"

import { blacklistIp, getClientIp } from "../utils/security"
import { headers } from "next/headers"

function getFormDataError(formData: FormData, maxLengths: { [key: string]: number }) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const description = formData.get('description') as string
    const game = formData.get('game') as string

    if (!description) return true
    if (name.length > maxLengths.name) return true
    if (email.length > maxLengths.email) return true
    if (description.length > maxLengths.description) return true
    if (game.length > maxLengths.game) return true

    return false
}

export async function sendFeedback(formData: FormData, maxLengths: { [key: string]: number }) {
    if (getFormDataError(formData, maxLengths)) {
        console.warn('error en el formulario')
        return
    }

    const clientIp = await getClientIp(headers()) ?? 'unknown'

    try {
        blacklistIp(clientIp)
    } catch (e: any) {
        if (e.message === 'LimitReached') console.warn('limite alcanzado')
        if (e.message === 'AlreadyBlacklisted') console.warn('ya esta blacklisteada')

        return
    }
}