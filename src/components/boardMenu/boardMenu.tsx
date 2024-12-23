"use client"

import { AnalyzeContext } from '@/context/analyze'
import Image from 'next/image'
import { useContext } from 'react'

export default function BoardMenu() {
    const [white, setWhite] = useContext(AnalyzeContext).white

    return (
        <div className="flex flex-col justify-between h-full">
            <div className='flex flex-col gap-2'>
                <button type='button'><Image src="/images/settings.svg" title='Settings' alt="Settings" width={17} height={0} /></button>
                <button onClick={() => setWhite(prev => !prev)} type='button'><Image src="/images/flip.svg" title='Flip Board' alt="Flip Board" width={17} height={0} /></button>
            </div>
            <div>
                
            </div>
        </div>
    )
}