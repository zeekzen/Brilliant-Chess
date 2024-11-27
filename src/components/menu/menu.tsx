import Lens from "../svg/lens"
import Form from "./form"

export default function Menu() {
    return (
        <div className="h-full bg-backgroundBox rounded-borderRoundness w-[500px] flex flex-col gap-4">
            <menu className="flex flex-row">
                <li className="flex flex-col items-center justify-center gap-1 py-3 text-sm w-full font-bold"><Lens class="fill-foreground" />Analize Game</li>
            </menu>
            <Form />
        </div>
    )
}