import Board from "@/components/board"
import Menu from "@/components/menu"

const BOARD_PROPORTIONS = 8
const BOARD_COLORS = ["whiteBoard", "blackBoard"]
const BOARD_SIZE = 750

export default function Home() {
  return (
      <main className="flex flex-row h-[95%] gap-8 items-center">
        <Board boardProportions={BOARD_PROPORTIONS} boardColors={BOARD_COLORS} boardSize={BOARD_SIZE} />
        <Menu />
      </main>
  )
}
