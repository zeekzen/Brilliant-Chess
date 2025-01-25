import Themes from "./themes";

export default function Settings({ hidden }: { hidden: boolean }) {
    return (
        <div style={{ display: hidden ? 'none' : '' }}>
            <Themes />
        </div>
    )
}