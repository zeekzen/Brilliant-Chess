import BoardMenu from "@/components/boardMenu/boardMenu"
import Game from "@/components/game/game"
import Menu from "@/components/menu/menu"
import AnalyzeContextProvider from "@/context/analyze"

export default function Home() {
  return (
    <main className="flex flex-row h-[95%] gap-2 items-center select-none">
      <AnalyzeContextProvider>
        <Game />
        <BoardMenu />
        <Menu />
      </AnalyzeContextProvider>
    </main>
  )
}
