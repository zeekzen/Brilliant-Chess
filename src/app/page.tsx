import BoardMenu from "@/components/boardMenu/boardMenu"
import Game from "@/components/game/game"
import Menu from "@/components/menu/menu"
import Nav from "@/components/nav/nav"
import AnalyzeContextProvider from "@/context/analyze"
import ConfigContextProvider from "@/context/config"
import ErrorsContextProvider from "@/context/errors"
import PageErrors from "@/components/errors/pageErrors"

export default function Home() {
  return (
    <ConfigContextProvider><ErrorsContextProvider>
      <PageErrors />
      <header>
        <Nav />
      </header>
      <main className="flex flex-col vertical:flex-row h-full vertical:p-4 p-2 vertical:gap-2 gap-4 items-center vertical:justify-center select-none w-full overflow-x-hidden overflow-y-auto">
        <AnalyzeContextProvider>
          <div className="h-full flex navTop:flex-row flex-col gap-2 w-min">
            <Game />
            <BoardMenu />
          </div>
          <Menu />
        </AnalyzeContextProvider>
      </main>
    </ErrorsContextProvider></ConfigContextProvider>
  )
}
