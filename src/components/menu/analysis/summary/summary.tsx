import { useContext, useState } from "react";
import { AnalyzeContext } from "@/context/analyze";
import RatingCount from "./ratingCount";
import PlayersAccuracy from "./playersAccuracy";
import GameRating from "./gameRating";
import { accuracyPhases } from "./playersAccuracy";
import { move } from "@/engine/stockfish";
import GameChart from "../gameChart";

export default function Summary(props: { moves: move[], container: HTMLElement }) {
    const { moves, container } = props

    const [accuracy, setAccuracy] = useState({ w: NaN, b: NaN })
    const [accuracyPhases, setAccuracyPhases] = useState<accuracyPhases>({ opening: { w: [], b: [] }, middlegame: { w: [], b: [] }, endgame: { w: [], b: [] } })

    const analyzeContext = useContext(AnalyzeContext)

    const [players, setPlayers] = analyzeContext.players

    return (
        <div className="flex flex-col gap-3 items-center">
            <GameChart moves={moves} container={container} />
            <PlayersAccuracy setAccuracyPhases={setAccuracyPhases} accuracy={[accuracy, setAccuracy]} players={players} moves={moves} />
            <hr className="border-neutral-600 w-[85%]" />
            <RatingCount moves={moves} />
            <hr className="border-neutral-600 w-[85%]" />
            <GameRating accuracy={accuracy} accuracyPhases={accuracyPhases} />
        </div>
    )
}