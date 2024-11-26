import Board from "@/components/board"
import Menu from "@/components/menu"

const BOARD_SIZE = 8
const BOARD_COLORS = ["whiteBoard", "blackBoard"]

export default function Home() {
  return (
      <main className="flex flex-row">
        <Board boardProportions={BOARD_SIZE} boardColors={BOARD_COLORS} boardSize={750} />
        <Menu />
      </main>
  )
}
