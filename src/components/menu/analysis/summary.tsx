import { useContext, useState } from "react";
import GameChart from "./gameChart";
import { AnalyzeContext } from "@/context/analyze";
import RatingCount from "./ratingCount";
import PlayersAccuracy from "./playersAccuracy";
import GameRating from "./gameRating";
import { accuracyPhases } from "./playersAccuracy";

export default function Summary() {
    const [accuracy, setAccuracy] = useState({ w: NaN, b: NaN })
    const [accuracyPhases, setAccuracyPhases] = useState<accuracyPhases>({ opening: { w: [], b: [] }, middlegame: { w: [], b: [] }, endgame: { w: [], b: [] } })

    const [game, setGame] = useContext(AnalyzeContext).game
    const [players, setPlayers] = useContext(AnalyzeContext).players
    const [time, setTime] = useContext(AnalyzeContext).time

    return (
        <div className="flex flex-col gap-3 items-center">
            <GameChart moves={game} />
            <PlayersAccuracy setAccuracyPhases={setAccuracyPhases} accuracy={[accuracy, setAccuracy]} players={players} moves={game} />
            <hr className="border-neutral-600 w-[85%]" />
            <RatingCount moves={game} />
            <hr className="border-neutral-600 w-[85%]" />
            <GameRating accuracy={accuracy} accuracyPhases={accuracyPhases} />
        </div>
    )
}