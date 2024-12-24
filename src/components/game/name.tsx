import Profile from "../svg/profile"

export default function Name(props: { white: boolean, children: React.ReactNode }) {
    const { white } = props
    const name = props.children

    return (
        <div className="flex flex-row items-start text-sm font-bold text-foregroundHighlighted gap-2">
            <div className={`h-10 w-10 flex flex-row justify-center items-end ${white ? "bg-backgroundProfileWhite" : "bg-backgroundProfileBlack"}`}>
                <Profile width={35} height={35} class={`${white ? "fill-foregroundProfileWhite" : "fill-foregroundProfileBlack"}`} />
            </div>
            <span className="h-full pt-[2px] select-text">{props.children}</span>
        </div>
    )
}