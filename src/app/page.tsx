import RightAd from "@/components/ads/righAd"
import BoardMenu from "@/components/boardMenu/boardMenu"
import Game from "@/components/game/game"
import Menu from "@/components/menu/menu"
import Nav from "@/components/nav/nav"
import AnalyzeContextProvider from "@/context/analyze"
import ConfigContextProvider from "@/context/config"
import ErrorsContextProvider from "@/context/errors"
import PageErrors from "@/errors/pageErrors"

export default function Home() {
  return (
    <ConfigContextProvider><ErrorsContextProvider>
      <PageErrors />
      <header>
        <Nav />
      </header>
      <main className="flex flex-col vertical:flex-row h-full p-4 vertical:gap-2 gap-4 items-center vertical:justify-center select-none w-full overflow-x-hidden overflow-y-auto">
        <AnalyzeContextProvider>
          <div className="h-full flex flex-row gap-2 w-min">
            <Game />
            <BoardMenu />
            <RightAd vertical showPlaceHolder={process.env.NODE_ENV === 'development'} pId={process.env.PUBLISHER_ID ?? ''} sId="" />
          </div>
          <Menu />
        </AnalyzeContextProvider>
        <RightAd showPlaceHolder={process.env.NODE_ENV === 'development'} pId={process.env.PUBLISHER_ID ?? ''} sId="" />
      </main>
    </ErrorsContextProvider></ConfigContextProvider>
  )
}
