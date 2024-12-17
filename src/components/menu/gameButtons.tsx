import { useState } from "react";
import NextMove from "../svg/nextMove";
import Play from "../svg/play";
import SkipGame from "../svg/skipGame";
import Pause from "../svg/pause";

export default function GameButtons() {
    const [playing, setPlaying] = useState(false)
    const [playPauseHover, setPlayPauseHover] = useState(false)

    function togglePlaying() {
        setPlaying(playing => !playing)
    }

    return (
        <div className="w-[85%] rounded-borderRoundness p-3 flex flex-row justify-around items-center">
            <SkipGame class="h-[45px] rotate-180 fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
            <NextMove class="h-[25px] rotate-180 fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
            <div onMouseEnter={() => setPlayPauseHover(true)} onMouseLeave={() => setPlayPauseHover(false)}>
                <Play click={togglePlaying} class={`h-[25px] transition-colors pl-1 ${playPauseHover ? 'fill-foregroundHighlighted' : 'fill-foregroundGrey'} ${playing ? 'hidden' : ''}`} />
                <Pause click={togglePlaying} class={`h-[25px] transition-colors pr-1 ${playPauseHover ? 'fill-foregroundHighlighted' : 'fill-foregroundGrey'} ${!playing ? 'hidden' : ''}`} />
            </div>
            <NextMove class="h-[25px] fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
            <SkipGame class="h-[45px] fill-foregroundGrey transition-colors hover:fill-foregroundHighlighted" />
        </div>
    )
}