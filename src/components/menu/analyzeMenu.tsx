import { useContext } from "react";
import GameButtons from "./gameButtons";
import GameChart from "./gameChart";
import { AnalyzeContext } from "@/context/analyze";
import RatingCount from "./ratingCount";
import PlayersAccuracy from "./playersAccuracy";


export default function AnalyzeMenu() {
    const [game, setGame] = useContext(AnalyzeContext).game
    const [metadata, setMetadata] = useContext(AnalyzeContext).metadata

    return (
        <div className="flex flex-col gap-3 items-center">
            <GameChart moves={game} />
            <PlayersAccuracy metadata={metadata} moves={game} />
            <hr className="border-neutral-600 w-[85%]" />
            <RatingCount moves={game} />
            <hr className="border-neutral-600 w-[85%]" />
            <GameButtons />
        </div>
    )
}