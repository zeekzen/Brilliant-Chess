import { useContext, useState } from "react";
import GameChart from "./gameChart";
import { AnalyzeContext } from "@/context/analyze";
import RatingCount from "./ratingCount";
import PlayersAccuracy from "./playersAccuracy";
import GameRating from "./gameRating";


export default function AnalyzeMenu() {
    const [accuracy, setAccuracy] = useState({ w: NaN, b: NaN })

    const [game, setGame] = useContext(AnalyzeContext).game
    const [players, setPlayers] = useContext(AnalyzeContext).players
    const [time, setTime] = useContext(AnalyzeContext).time

    return (
        <div className="flex flex-col gap-3 items-center">
            <GameChart moves={game} />
            <PlayersAccuracy accuracy={[accuracy, setAccuracy]} players={players} moves={game} />
            <hr className="border-neutral-600 w-[85%]" />
            <RatingCount moves={game} />
            <hr className="border-neutral-600 w-[85%]" />
            <GameRating time={time} accuracy={accuracy} />
        </div>
    )
}