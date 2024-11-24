import Board from "@/components/board";

const BOARD_SIZE = 8
const BOARD_COLORS = ["whiteBoard", "blackBoard"]

export default function Home() {
  return (
    <>
      <main>
        <Board boardSize={BOARD_SIZE} boardColors={BOARD_COLORS} />
      </main>
    </>
  )
}
