import Game from "@/components/game/game"
import Menu from "@/components/menu/menu"

export default function Home() {
  return (
      <main className="flex flex-row h-[95%] gap-8 items-center select-none">
        <Game />
        <Menu />
      </main>
  )
}
