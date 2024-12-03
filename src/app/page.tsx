import Game from "@/components/game/game"
import Menu from "@/components/menu/menu"
import AnalyzeContextProvider from "@/context/analyze"

export default function Home() {
  return (
    <main className="flex flex-row h-[95%] gap-8 items-center select-none">
      <AnalyzeContextProvider>
        <Game />
        <Menu />
      </AnalyzeContextProvider>
    </main>
  )
}
