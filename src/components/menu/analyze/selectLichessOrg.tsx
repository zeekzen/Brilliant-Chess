import { useContext, useEffect, useRef, useState } from "react"
import Arrow from "../../svg/arrow"
import { AnalyzeContext } from "@/context/analyze"
import Image from "next/image"

const PLAYER_URL = 'https://lichess.org/@/'

function getMonthName(month: number) {
    switch (month) {
        case 1: return 'January'
        case 2: return 'February'
        case 3: return 'March'
        case 4: return 'April'
        case 5: return 'May'
        case 6: return 'June'
        case 7: return 'July'
        case 8: return 'August'
        case 9: return 'September'
        case 10: return 'October'
        case 11: return 'November'
        case 12: return 'December'
        default: return ''
    }
}

function Loading(props: {whatIsLoading: string}) {
    const [ellipsis, setEllipsis] = useState('')

    const ellipsisRef = useRef(ellipsis)

    useEffect(() => {ellipsisRef.current = ellipsis}, [ellipsis])

    useEffect(() => {
        function animateEllipsis() {
            const ellipsis = ellipsisRef.current

            if (ellipsis.length >= 3) {
                setEllipsis('')
            } else {
                setEllipsis(ellipsis + '.')
            }
        }

        const ellipsisInterval = setInterval(animateEllipsis, 300)

        return () => clearInterval(ellipsisInterval)
    }, [])

    return (
                <div className="flex flex-col flex-grow">
                    <div className="flex-grow flex flex-col justify-center items-center">
                        <div className="w-[70%] bg-backgroundBox relative overflow-hidden rounded-borderExtraRoundness text-lg text-foregroundGrey flex flex-col gap-14 pb-4 pt-14 items-center">
                            <div className="w-40 flex flex-col items-center gap-4">
                                <Image className="animate-[pulse_1.25s_cubic-bezier(0.4,_0,_0.6,_1)_infinite;] scale-x-[-1] fill-backgroundBoxBoxHighlighted" width={60} height={60} src='/images/files.svg' alt="files" />
                                <span className="text-xl text-foreground font-bold">{props.whatIsLoading}</span>
                                <span className="w-full ml-14">Fetching api{ellipsis}</span>
                            </div>
                            <button className="hover:text-foreground transition-colors" type="button">Cancel</button>
                        </div>
                    </div>
                </div>
    )
}

function SimpleLoading(props: {whatIsLoading: string}) {
    const [ellipsis, setEllipsis] = useState('')

    const ellipsisRef = useRef(ellipsis)

    useEffect(() => {ellipsisRef.current = ellipsis}, [ellipsis])

    useEffect(() => {
        function animateEllipsis() {
            const ellipsis = ellipsisRef.current

            if (ellipsis.length >= 3) {
                setEllipsis('')
            } else {
                setEllipsis(ellipsis + '.')
            }
        }

        const ellipsisInterval = setInterval(animateEllipsis, 300)

        return () => clearInterval(ellipsisInterval)
    }, [])

    return (
        <div className="font-extrabold text-2xl animate-[pulse_1.25s_cubic-bezier(0.4,_0,_0.6,_1)_infinite;] w-48 my-4 m-auto">
            Loading {props.whatIsLoading}{ellipsis}
        </div>
    )
}

function Games(props: { url: string, username: string, depth: number }) {
    const { url, username, depth } = props

    const [gamesInfo, setGamesInfo] = useState<{ whiteName: string, blackName: string, whiteElo: number, blackElo: number, result: 'white' | 'black' | 'draw', timestamp: number, pgn: string }[]>([])
    const [loading, setLoading] = useState(true)

    const [data, setData] = useContext(AnalyzeContext).data

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const res = await fetch(url, { headers: { Accept: "application/x-ndjson" } })
                if (!res.ok) throw new Error('Error fetching games')

                const text = await res.text()
                
                const jsonArr: { players: { black: { user: { name: string }, rating: number }, white: { user: { name: string }, rating: number } }, winner: "white"|"black", createdAt: number, pgn: string }[] = text.split("\n").map(text => {
                    try {
                        return JSON.parse(text)
                    } catch {
                        return null
                    }
                }).filter(obj => obj)

                const newGamesInfo: typeof gamesInfo = jsonArr.map(json => {
                    const whiteName = json.players.white.user.name
                    const whiteElo = json.players.white.rating

                    const blackName = json.players.black.user.name
                    const blackElo = json.players.black.rating
                    
                    const result = json.winner

                    const timestamp = json.createdAt

                    const pgn = json.pgn

                    return { whiteElo, whiteName, blackElo, blackName, result, timestamp, pgn }
                })

                setLoading(false)
                setGamesInfo(newGamesInfo)
            } catch (e) {
                console.error(e)
            }
        })()
    }, [])

    if (gamesInfo.length === 0 && !loading) {
        return (
            <div className="text-center font-bold text-2xl my-4">No games found in this month...</div>
        )
    }

    return (
        <>
            {loading ? <SimpleLoading whatIsLoading="games" /> : null}
            <table className="w-full">
                <thead style={{display: loading ? 'none' : ''}}>
                    <tr>
                        <th className="py-2 text-left pl-8">Players</th>
                        <th className="py-2 text-left px-6">Result</th>
                        <th className="py-2 text-left pr-8">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {gamesInfo.map((gameInfo, i) => {
                        const { whiteName, blackName, whiteElo, blackElo, result, timestamp, pgn } = gameInfo

                        const whiteWon = result === 'white'
                        const blackWon = result === 'black'
                        const draw = result === 'draw'

                        const isWin = (whiteWon && whiteName.toUpperCase() === username.toUpperCase()) || (blackWon && blackName.toUpperCase() === username.toUpperCase())
                        const isLoss = (whiteWon && whiteName.toUpperCase() !== username.toUpperCase()) || (blackWon && blackName !== username)

                        const date = new Date(timestamp)

                        return (
                            <tr onClick={() => setData({ format: 'pgn', string: pgn, depth })} className="border-b-[1px] cursor-pointer select-none border-border transition-colors hover:bg-backgroundBoxHover" key={i}>
                                <td className="text-lg flex flex-col py-4 w-64 overflow-hidden pl-8">
                                    <div className="font-bold flex flex-row items-center gap-2"><div className={`h-4 min-h-4 w-4 min-w-4 bg-evaluationBarWhite rounded-borderRoundness ${whiteWon ? 'border-[3px] border-winGreen' : ''}`} />{whiteName} ({whiteElo})</div>
                                    <div className="font-bold flex flex-row items-center gap-2"><div className={`h-4 w-4 bg-evaluationBarBlack rounded-borderRoundness ${blackWon ? 'border-[3px] border-winGreen' : ''}`} />{blackName} ({blackElo})</div>
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex flex-row items-center gap-3">
                                        <div className="flex w-4 flex-col text-foregroundGrey font-bold text-lg"><span>{whiteWon ? 1 : blackWon ? 0 : <>&#189;</>}</span><span>{blackWon ? 1 : whiteWon ? 0 : <>&#189;</>}</span></div>
                                        <div style={{ mixBlendMode: 'screen' }} className={`h-5 w-5 rounded-borderRoundness text-xl font-extrabold flex justify-center items-center text-black ${isWin ? 'bg-winGreen' : isLoss ? 'bg-lossRed' : 'bg-foregroundGrey'}`}><div className="w-fit h-fit">{isWin ? '+' : isLoss ? '-' : '='}</div></div>
                                    </div>
                                </td>
                                <td className="py-4 pr-8">
                                    {getMonthName(date.getMonth() + 1).slice(0, 3)} <span className="font-bold text-xl">{date.getDate()}</span>, {date.getFullYear()}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
}

export default function SelectLichessOrgGame(props: { username: string, depth: number }) {
    const { username, depth } = props

    const [dates, setDates] = useState<{ month: number, year: number, url: string }[]>([])
    const [hovered, setHovered] = useState<number>(NaN)
    const [selected, setSelected] = useState<number>(NaN)
    const [loading, setLoading] = useState(true)

    const toggleSelected = (number: number) => {
        setSelected(prev => prev === number ? NaN : number)
    }

    useEffect(() => {
        (async () => {
            try {
                setLoading(true)
                const resFirstGame = await fetch(`https://lichess.org/api/games/user/${username}?sort=dateAsc&max=1`, { headers: { Accept: "application/x-ndjson" } })
                if (!resFirstGame.ok) throw new Error('Error fetching archives')
                
                const jsonFirstGame: { createdAt: number } = await resFirstGame.json()
                const dateFirstGame = new Date(jsonFirstGame.createdAt)

                const resLastGame = await fetch(`https://lichess.org/api/games/user/${username}?sort=dateDesc&max=1`, { headers: { Accept: "application/x-ndjson" } })
                if (!resLastGame.ok) throw new Error('Error fetching archives')
                
                const jsonLastGame: { createdAt: number } = await resLastGame.json()
                const dateLastGame = new Date(jsonLastGame.createdAt)

                const currentDate = new Date(dateFirstGame)
                const newDates: typeof dates = []
                while (currentDate <= dateLastGame) {
                    const sinceDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0)
                    const untilDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1, 0, 0, 0, 0)
                    untilDate.setMilliseconds(untilDate.getMilliseconds() - 1)

                    const month = currentDate.getMonth()
                    const year = currentDate.getFullYear()

                    newDates.push({month: month + 1, year, url: `https://lichess.org/api/games/user/${username}?since=${sinceDate.getTime()}&until=${untilDate.getTime()}&pgnInJson=true`})
                    currentDate.setMonth(currentDate.getMonth() + 1)
                }

                setLoading(false)
                setDates(newDates.toReversed())
            } catch (e) {
                console.error(e)
            }
        })()
    }, [username])

    return (
        <div className={`overflow-x-hidden overflow-y-auto ${loading ? " flex flex-col justify-center flex-grow" : ''}`}>
            <h1 style={{display: loading ? 'none' : ''}} className="text-2xl py-4 px-8 sticky text-foreground"><a target="_blank" href={`${PLAYER_URL}${username}`} className="hover:underline text-foregroundHighlighted text-3xl font-bold">{username}</a>'s games</h1>
            <hr style={{display: loading ? 'none' : ''}} className="border-border" />
            <div className="flex flex-col w-full">
                {loading ? <Loading whatIsLoading="Archives" /> : null}
                {dates.map((date, i) => {
                    return (
                        <div key={i}>
                            <button onClick={() => toggleSelected(i)} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(NaN)} type="button" className={`${hovered === i || selected === i ? 'text-foregroundHighlighted' : 'text-foregroundGrey'} hover:bg-backgroundBoxHover w-full tracking-wide transition-colors text-2xl px-8 py-4 flex flex-row justify-between items-center`}>
                                <span><b>{date.year}</b> {getMonthName(date.month)}</span>
                                <div style={{ opacity: hovered === i || selected === i ? '100' : '0', transform: `rotate(${selected !== i ? '180deg' : '0'})` }} className="transition-opacity"><Arrow class="fill-foregroundHighlighted" /></div>
                            </button>
                            {selected === i ?
                                <Games url={date.url} username={username} depth={depth} />
                                : ''}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}