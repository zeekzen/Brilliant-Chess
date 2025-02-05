"use client"

import { ErrorsContext } from "@/context/errors"
import { pushPageError } from "@/components/errors/pageErrors"
import { sendFeedback, ssError } from "@/server/feedback"
import { useContext, useEffect, useRef, useState } from "react"

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

export default function Form() {
    const [descriptionLength, setDescriptionLength] = useState(0)
    const [formErrors, setFormErrors] = useState<errorFormData[]>([])

    const errorsContext = useContext(ErrorsContext)

    const [errors, setErrors] = errorsContext.errors

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)

        if (!nameRef.current || !emailRef.current || !descriptionRef.current || !gameRef.current) return

        const description = params.get('description') ?? ''

        nameRef.current.value = params.get('name') ?? ''
        emailRef.current.value = params.get('email') ?? ''
        descriptionRef.current.value = description
        gameRef.current.value = params.get('game') ?? ''

        setDescriptionLength(description.length)

        const error = params.get('error') as ssError

        if (!error) return

        switch (error) {
            case 'userLimit':
                pushPageError(setErrors, 'For security reasons, bug reports have a cooldown period.', 'Please try again in about 30 minutes.')
                break
            case 'globalLimit':
                pushPageError(setErrors, "We're currently experiencing issues handling the traffic of bug reports.", 'Please try again later. We apologize for the inconvenience.')
                break
            default:
                pushPageError(setErrors, 'An unknown error occurred while processing your bug report.', 'Please try again later.')
        }
    }, [])

    const nameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const descriptionRef = useRef<HTMLTextAreaElement>(null)
    const gameRef = useRef<HTMLTextAreaElement>(null)

    function handleSubmit(e: React.FormEvent) {
        const formData = new FormData(e.currentTarget as HTMLFormElement)
        const formDataErrors = getFormDataErrors(formData, maxLengths)

        if (!formDataErrors.length) {
            setFormErrors([])
            return
        }

        setFormErrors(formDataErrors)
        e.preventDefault()
    }

    return (
                <form onSubmit={handleSubmit} action={(formData) => sendFeedback(formData, maxLengths)} className="max-w-[800px] w-full bg-backgroundBox rounded-borderRoundness m-auto p-6 flex flex-col gap-3">
                    <h2 className="text-2xl font-extrabold">Report a Bug</h2>
                    <Guide />
                    <div className="flex flex-col gap-2">
                        <div>
                            <label className="font-bold text-lg" htmlFor="text">Full Name<Required spaceLeft={2} color="aqua" /></label>
                            <div className="flex flex-row items-center">
                                <input ref={nameRef} style={{borderColor: formErrors?.includes('nameLength') ? 'FireBrick' : ''}} name="name" className="flex h-7 max-w-[25ch] w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none" id="text" type="text" />
                                <span style={{display: formErrors?.includes('nameLength') ? '' : 'none', textShadow: '0 0 2px black'}} className="text-red-600 ml-2 font-bold">Name must be shorter</span>
                            </div>
                        </div>
                        <div>
                            <label className="font-bold text-lg" htmlFor="email">Email Address<Required spaceLeft={2} color="aqua" /></label>
                            <div className="flex flex-row items-center">
                                <input ref={emailRef} style={{borderColor: formErrors?.includes('emailLength') ? 'FireBrick' : ''}} name="email" className="flex h-7 max-w-[30ch] w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none" id="email" type="email" />
                                <span style={{display: formErrors?.includes('emailLength') ? '' : 'none', textShadow: '0 0 2px black'}} className="text-red-600 ml-2 font-bold">Email must be shorter</span>
                            </div>
                        </div>
                        <div>
                            <label className="font-bold text-lg" htmlFor="description">Bug Description<Required spaceLeft={2} color="crimson" /></label>
                            <div className="flex flex-col">
                                <div className="relative max-w-[75ch] w-full h-fit">
                                    <textarea ref={descriptionRef} style={{borderColor: formErrors?.includes('descriptionLength') || formErrors?.includes('noDescription') ? 'FireBrick' : ''}} onChange={e => setDescriptionLength(e.currentTarget.value.length)} name="description" rows={5} className="pr-[60px] flex w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none resize-none" id="description" />
                                    <Chars cur={descriptionLength} max={maxLengths.description} />
                                </div>
                                <span style={{display: formErrors?.includes('descriptionLength') ? '' : 'none', textShadow: '0 0 2px black'}} className="text-red-600 mt-1 font-bold">Description must be shorter</span>
                                <span style={{display: formErrors?.includes('noDescription') ? '' : 'none', textShadow: '0 0 2px black'}} className="text-red-600 mt-1 font-bold">A description of the bug must be provided</span>
                            </div>
                        </div>
                        <div>
                            <label className="font-bold text-lg" htmlFor="game">Game URL or PGN <span className="text-foregroundGrey font-normal">(if needed)</span></label>
                            <div className="flex flex-row">
                                <textarea spellCheck={false} ref={gameRef} style={{borderColor: formErrors?.includes('gameLength') ? 'FireBrick' : ''}} name="game" rows={1} className="flex h-7 max-w-[45ch] w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none resize-none" id="game" />
                                <span style={{display: formErrors?.includes('gameLength') ? '' : 'none', textShadow: '0 0 2px black'}} className="text-red-600 ml-2 font-bold">Game URL/PGN must be shorter</span>
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 h-fit items-center mt-3">
                            <input type="submit" className="w-fit h-fit py-1 px-2 cursor-pointer rounded-borderRoundness text-lg bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover transition-all font-extrabold hover:shadow-shadowBoxBoxHighlighted" value="Submit Bug Report" />
                            <button onClick={() => window.location.replace('/')} type="button" className="select-none py-1 px-2 border-border hover:bg-foreground hover:text-foregroundBlackDark w-fit h-fit font-bold transition-colors border-2 rounded-borderRoundness hover:border-white">Back</button>
                        </div>
                    </div>
                </form>
    )
}