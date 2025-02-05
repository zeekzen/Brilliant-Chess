import Form from "@/components/feedback/form";
import Chats from "@/components/svg/chats";
import ErrorsContextProvider from "@/context/errors";
import PageErrors from "@/components/errors/pageErrors";

export default function Feedback() {
    return (
        <ErrorsContextProvider>
            <div className="flex-grow h-full flex flex-col">
                <PageErrors />
                <header>
                    <h1 className="text-4xl font-extrabold mx-auto mt-6 flex flex-row items-center gap-4 w-fit"><Chats size={35} class="fill-foreground" />Feedback</h1>
                </header>
                <main className="flex-grow pt-14 p-8">
                    <Form />
                </main>
            </div>
        </ErrorsContextProvider>
    )
}