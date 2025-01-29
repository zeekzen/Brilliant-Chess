"use client"

import Chats from "@/components/svg/chats"
import { sendFeedback } from "@/server/feedback"
import { useState } from "react"

function Required({ spaceLeft, color }: {spaceLeft: number, color: string}) {
    return (
        <span style={{marginLeft: spaceLeft, color }} className="text-lg font-extrabold">*</span>
    )
}

function Guide() {
    return (
        <div className="py-2 text-lg font-bold">
            <div className="flex flex-row gap-2">
                <Required spaceLeft={0} color="crimson" />
                Required
            </div>
            <div>
                <div className="flex flex-row gap-2">
                    <Required spaceLeft={0} color="aqua" />
                    Optional <span className="font-normal">(you'll be notified once the bug is fixed)</span>
                </div>
                <span className="text-foregroundGrey font-normal text-base">&#x26A0; If a similar bug is reported by many users, we may not be able to notify you.</span>
            </div>
        </div>
    )
}

function Chars({ cur, max }: { cur: number, max: number }) {
    return (
        <span style={{color: cur > max ? 'red' : ''}} className="absolute bottom-[2px] right-1 text-xs text-foregroundGrey pointer-events-none select-none">{cur}/{max}</span>
    )
}

type errorFormData = "noDescription" | "nameLength" | "emailLength" | "descriptionLength" | "gameLength"
function getFormDataErrors(formData: FormData, maxLengths: { [key: string]: number }) {
    const errors: errorFormData[] = []

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const description = formData.get('description') as string
    const game = formData.get('game') as string

    if (!description) errors.push('noDescription')
    if (name.length > maxLengths.name) errors.push('nameLength')
    if (email.length > maxLengths.email) errors.push('emailLength')
    if (description.length > maxLengths.description) errors.push('descriptionLength')
    if (game.length > maxLengths.game) errors.push('gameLength')

    return errors
}

const maxLengths = {
    name: 80,
    email: 320,
    description: 1000,
    game: 40000,
}

export default function Feedback() {
    const [descriptionLength, setDescriptionLength] = useState(0)
    const [errors, setErrors] = useState<errorFormData[]>([])

    function handleSubmit(e: React.FormEvent) {
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const formDataErrors = getFormDataErrors(formData, maxLengths)
    
        if (!formDataErrors.length) {
            setErrors([])
            return
        }
    
        setErrors(formDataErrors)
        e.preventDefault()
    }

    return (
        <>
            <div className="flex-grow h-full flex flex-col">
                <h1 className="text-4xl font-extrabold mx-auto mt-6 flex flex-row items-center gap-4 w-fit"><Chats size={35} class="fill-foreground" />Feedback</h1>
                <div className="flex-grow pt-14 p-8">
                    <form onSubmit={handleSubmit} action={(formData) => sendFeedback(formData, maxLengths)} className="max-w-[800px] w-full bg-backgroundBox rounded-borderRoundness m-auto p-6 flex flex-col gap-3">
                        <h2 className="text-2xl font-extrabold">Report a Bug</h2>
                        <Guide />
                        <div className="flex flex-col gap-2">
                            <div>
                                <label className="font-bold text-lg" htmlFor="text">Full Name<Required spaceLeft={2} color="aqua" /></label>
                                <div className="flex flex-row items-center">
                                    <input style={{borderColor: errors?.includes('nameLength') ? 'FireBrick' : ''}} name="name" className="flex h-7 max-w-[25ch] w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none" id="text" type="text" />
                                    <span style={{display: errors?.includes('nameLength') ? '' : 'none'}} className="text-red-700 ml-2 font-bold">Name must be shorter</span>
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-lg" htmlFor="email">Email Address<Required spaceLeft={2} color="aqua" /></label>
                                <div className="flex flex-row items-center">
                                    <input style={{borderColor: errors?.includes('emailLength') ? 'FireBrick' : ''}} name="email" className="flex h-7 max-w-[30ch] w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none" id="email" type="email" />
                                    <span style={{display: errors?.includes('emailLength') ? '' : 'none'}} className="text-red-700 ml-2 font-bold">Email must be shorter</span>
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-lg" htmlFor="description">Bug Description<Required spaceLeft={2} color="crimson" /></label>
                                <div className="flex flex-col">
                                    <div className="relative max-w-[75ch] w-full h-fit">
                                        <textarea style={{borderColor: errors?.includes('descriptionLength') || errors?.includes('noDescription') ? 'FireBrick' : ''}} onChange={e => setDescriptionLength(e.currentTarget.value.length)} name="description" rows={5} className="pr-[60px] flex w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none resize-none" id="description" />
                                        <Chars cur={descriptionLength} max={maxLengths.description} />
                                    </div>
                                    <span style={{display: errors?.includes('descriptionLength') ? '' : 'none'}} className="text-red-700 mt-1 font-bold">Description must be shorter</span>
                                    <span style={{display: errors?.includes('noDescription') ? '' : 'none'}} className="text-red-700 mt-1 font-bold">A description of the bug must be provided</span>
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-lg" htmlFor="game">Game URL or PGN <span className="text-foregroundGrey font-normal">(if needed)</span></label>
                                <div className="flex flex-row">
                                    <textarea style={{borderColor: errors?.includes('gameLength') ? 'FireBrick' : ''}} name="game" rows={1} className="flex h-7 max-w-[45ch] w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none resize-none" id="game" />
                                    <span style={{display: errors?.includes('gameLength') ? '' : 'none'}} className="text-red-700 ml-2 font-bold">Game URL/PGN must be shorter</span>
                                </div>
                            </div>
                            <input type="submit" className="w-fit h-fit py-1 px-2 mt-2 cursor-pointer rounded-borderRoundness text-lg bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover transition-all font-extrabold hover:shadow-shadowBoxBoxHighlighted" value="Submit Bug Report" />
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}