import BoardMenu from "@/components/boardMenu/boardMenu"
import Game from "@/components/game/game"
import Menu from "@/components/menu/menu"
import Nav from "@/components/nav/nav"
import AnalyzeContextProvider from "@/context/analyze"
import ConfigContextProvider from "@/context/config"
import PageErrors from "@/errors/error"

export default function Home() {
  return (
    <>
      <ConfigContextProvider>
        <header>
          <Nav />
        </header>
        <main className="flex flex-row h-[95%] gap-2 items-center select-none">
          <AnalyzeContextProvider>
            <PageErrors />
            <Game />
            <BoardMenu />
            <Menu />
          </AnalyzeContextProvider>
        </main>
      </ConfigContextProvider>
    </>
  )
}
