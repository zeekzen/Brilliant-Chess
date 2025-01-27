import Chats from "@/components/svg/chats"

function Required({ spaceLeft, color }: {spaceLeft: number, color: string}) {
    return (
        <span style={{marginLeft: spaceLeft, color }} className="text-lg font-extrabold">*</span>
    )
}

function Guide() {
    return (
        <div className="py-2 text-lg font-bold">
            <div className="flex flex-row gap-2">
                <Required spaceLeft={0} color="crimson" />
                Required
            </div>
            <div>
                <div className="flex flex-row gap-2">
                    <Required spaceLeft={0} color="aqua" />
                    Optional <span className="font-normal">(you'll be notified once the bug is fixed)</span>
                </div>
                <span className="text-foregroundGrey font-normal text-base">&#x26A0; If a similar bug is reported by many users, we may not be able to notify you.</span>
            </div>
        </div>
    )
}

export default function Feedback() {
    return (
        <div className="flex-grow h-full flex flex-col">
            <h1 className="text-4xl font-extrabold mx-auto mt-6 flex flex-row items-center gap-4 w-fit"><Chats size={35} class="fill-foreground" />Feedback</h1>
            <div className="flex-grow pt-14 p-8">
                <form className="max-w-[800px] w-full bg-backgroundBox rounded-borderRoundness m-auto p-6 flex flex-col gap-3">
                    <h2 className="text-2xl font-extrabold">Report a Bug</h2>
                    <Guide />
                    <div className="flex flex-col gap-2">
                        <div>
                            <label className="font-bold text-lg" htmlFor="text">Full Name<Required spaceLeft={2} color="aqua" /></label>
                            <input name="name" className="flex h-7 max-w-[25ch] w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none" id="text" type="text" />
                        </div>
                        <div>
                            <label className="font-bold text-lg" htmlFor="email">Email Address<Required spaceLeft={2} color="aqua" /></label>
                            <input name="email" className="flex h-7 max-w-[30ch] w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none" id="email" type="email" />
                        </div>
                        <div>
                            <label className="font-bold text-lg" htmlFor="description">Bug Description<Required spaceLeft={2} color="crimson" /></label>
                            <textarea name="description" rows={3} className="flex max-w-[50ch] w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none resize-none" id="description" />
                        </div>
                        <div>
                            <label className="font-bold text-lg" htmlFor="game">Game URL or PGN <span className="text-foregroundGrey font-normal">(if needed)</span></label>
                            <textarea name="game" rows={1} className="flex h-7 max-w-[45ch] w-full items-center transition-colors px-1 rounded-borderRoundness border-border hover:border-borderHighlighted focus:border-borderHighlighted border-solid border-[1px] bg-backgroundBoxBox outline-none resize-none" id="game" />
                        </div>
                        <input type="submit" className="w-fit h-fit py-1 px-2 mt-2 cursor-pointer rounded-borderRoundness text-lg bg-backgroundBoxBoxHighlighted hover:bg-backgroundBoxBoxHighlightedHover transition-all font-extrabold hover:shadow-shadowBoxBoxHighlighted" value="Submit Bug Report" />
                    </div>
                </form>
            </div>
        </div>
    )
}