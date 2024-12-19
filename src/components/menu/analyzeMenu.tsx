import { useContext } from "react";
import GameButtons from "./gameButtons";
import GameChart from "./gameChart";
import { AnalyzeContext } from "@/context/analyze";
import RatingCount from "./ratingCount";


export default function AnalyzeMenu() {
    const [game, setGame] = useContext(AnalyzeContext).game

    return (
        <div className="flex flex-col gap-3 items-center">
            <GameChart moves={game} />
            <RatingCount />
            <GameButtons />
        </div>
    )
}