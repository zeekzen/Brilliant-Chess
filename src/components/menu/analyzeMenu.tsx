import { useContext } from "react";
import GameButtons from "./gameButtons";
import GameChart from "./gameChart";
import { AnalyzeContext } from "@/context/analyze";


export default function AnalyzeMenu() {
    const [game, setGame] = useContext(AnalyzeContext).game

    return (
        <div className="flex flex-col gap-3 items-center">
            <GameChart moves={game} />
            <GameButtons />
        </div>
    )
}