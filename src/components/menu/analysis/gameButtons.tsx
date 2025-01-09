import { useContext, useEffect, useRef, useState } from "react";
import NextMove from "../../svg/nextMove";
import Play from "../../svg/play";
import SkipGame from "../../svg/skipGame";
import Pause from "../../svg/pause";
import { AnalyzeContext } from "@/context/analyze";

export default function GameButtons() {
    const [playPauseHover, setPlayPauseHover] = useState(false)

    const [playing, setPlaying] = useContext(AnalyzeContext).playing
    const [moveNumber, setMoveNumber] = useContext(AnalyzeContext).moveNumber
    const [game, setGame] = useContext(AnalyzeContext).game
    const [forward, setForward] = useContext(AnalyzeContext).forward
    const [animation, setAnimation] = useContext(AnalyzeContext).animation

    const moveNumberRef = useRef(moveNumber)

    useEffect(() => {
        moveNumberRef.current = moveNumber
    }, [moveNumber])

    function previousMove() {
        if (moveNumberRef.current === 0) return
        setForward(false)
        setMoveNumber(prev => prev - 1)
    }

    function nextMove() {
        if (moveNumberRef.current === game.length - 1) return
        setForward(true)
        setMoveNumber(prev => prev + 1)
    }

    function firstMove() {
        setAnimation(false)
        setMoveNumber(0)
    }

    function lastMove() {
        setAnimation(false)
        setMoveNumber(game.length - 1)
    }

    return (
        <div className="w-[85%] rounded-borderRoundness p-3 flex flex-row justify-around items-center">
            <SkipGame click={firstMove} class="h-[45px] rotate-180 fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
            <NextMove click={previousMove} class="h-[25px] rotate-180 fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
            <div onMouseEnter={() => setPlayPauseHover(true)} onMouseLeave={() => setPlayPauseHover(false)}>
                <Play click={() => setPlaying(true)} class={`h-[25px] transition-colors pl-1 ${playPauseHover ? 'fill-foregroundHighlighted' : 'fill-foregroundGrey'} ${playing ? 'hidden' : ''}`} />
                <Pause click={() => setPlaying(false)} class={`h-[25px] transition-colors pr-1 ${playPauseHover ? 'fill-foregroundHighlighted' : 'fill-foregroundGrey'} ${!playing ? 'hidden' : ''}`} />
            </div>
            <NextMove click={nextMove} class="h-[25px] fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
            <SkipGame click={lastMove} class="h-[45px] fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
        </div>
    )
}