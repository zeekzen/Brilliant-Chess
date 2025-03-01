import { redirect } from "next/navigation"

const GITHUB_URL = "https://github.com/wdeloo"

export default function Author() {
    redirect(GITHUB_URL)
}