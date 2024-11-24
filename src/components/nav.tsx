export default function Nav() {
    return (
        <nav className="pt-1 pb-6 h-screen w-fit bg-backgroundBox flex flex-col justify-between">
            <div className="flex flex-col font-bold *:p-2 *:transition-colors hover:*:bg-backgroundBoxHover text-lg hover:*:text-foregroundHighlighted">
                <a href="/">Brilliant Chess</a>
                <a href="/analize">Analyze</a>
                <a href="/play">1v1</a>
            </div>
            <div className="flex flex-col *:px-2 *:py-1 *:transition-colors hover:*:bg-backgroundBoxHover text-sm *:text-foregroundGrey hover:*:text-foregroundHighlighted font-bold">
                <a href="#">Support Me</a>
                <a href="https://github.com/wdeloo/Brilliant-Chess">Source Code</a>
            </div>
        </nav>
    )
}