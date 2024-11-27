import Lens from "./svg/lens";

export default function Menu() {
    return (
        <div className="h-full bg-backgroundBox rounded-borderRoundness w-[500px]">
            <menu className="flex flex-row">
                <li className="flex flex-col items-center justify-center gap-1 py-3 text-sm w-full"><Lens class="fill-foreground" />Analize Game</li>
            </menu>
        </div>
    )
}