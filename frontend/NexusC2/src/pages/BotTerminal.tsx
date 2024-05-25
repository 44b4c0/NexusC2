import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { Terminal as XTerm, ITerminalOptions } from "@xterm/xterm"
import { useParams } from "react-router-dom"
import "@xterm/xterm/css/xterm.css"
import useWebSocket from "react-use-websocket"
import Config from "../config"

import SideBar from "../components/SideBar"
import TopBar from "../components/TopBar"

const BotTerminal = () => {
    const { roomId } = useParams()
    const [isSideBarOpened, setIsSideBarOpened] = useState(true)
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const terminalRef = useRef<HTMLDivElement>(null)
    const terminal = useRef<XTerm | null>(null)
    const inputBuffer = useRef<string>('')

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 768)
        }

        handleResize()

        if (isSmallScreen) {
            terminalRef.current.style.fontSize = '8px'
            terminal.current?.resize(80, 15)
        } else {
            terminalRef.current.style.fontSize = '16px'
            terminal.current?.resize(80, 25)
        }
    }, [isSmallScreen])

    const { sendMessage } = useWebSocket(
        `${Config.backendUrlWebsocket}/ws/yes/${roomId}/${localStorage.getItem('sessionId')}`, // `yes` means user=user & user!=bot
        {
            onMessage: (messageEvent) => {
                const data = messageEvent.data
                const lines = data.split('\n')
                lines.forEach(line => {
                    terminal.current.writeln(line)
                })
            }
        }
    )
    useEffect(() => {
        const checkAuth = async () => {
            const sessionId = localStorage.getItem('sessionId') || 'sessionId'
            const jsonData = {'sessionId': sessionId}
            const response = await axios.post(Config.backendUrl + '/ui/_checkauth/', jsonData)
            const data = response.data

            if(data.session_id === 'invalid'){
                localStorage.clear()
                window.location.reload()
                window.location.href = "/"
            }
        }

        checkAuth()
    }, [])

    useEffect(() => {
        if(terminalRef.current){
            const options: ITerminalOptions = {}
            terminal.current = new XTerm(options)
            terminal.current.open(terminalRef.current)

            const onData = (data: string) => {
                if(data === '\r'){ // If `ENTER` key was pressed
                    const input = inputBuffer.current.trim()
                    if(input === 'clear'){
                        inputBuffer.current = ''
                        sendMessage(JSON.stringify({type: 'request', data: input, roomId: roomId}))
                        terminal.current?.write('\r\n')
                        terminal.current?.clear()
                    }
                    else{
                        sendMessage(JSON.stringify({type: 'request', data: input, roomId: roomId}))
                        terminal.current?.write('\r\n')
                        inputBuffer.current = '' // Clear InputBuffer for more usage
                    }
                }
                else if(data === '\x7f'){
                    if(inputBuffer.current.length > 0){ // IF `BACKSPACE` key was pressed
                        inputBuffer.current = inputBuffer.current.slice(0, -1)
                        terminal.current?.write('\b \b') // Move cursor back
                    }
                }
                else{
                    terminal.current?.write(data)
                    inputBuffer.current += data
                }
            }

            terminal.current.onData(onData)

            const handleMessage = (message: MessageEvent) => {
                const data = JSON.parse(message.data)
                if(data.type === 'cmd_output'){
                    terminal.current?.write(data)
                }
            }

            window.addEventListener('message', handleMessage)

            return () => {
                if(terminal.current){
                    terminal.current.dispose()
                    window.removeEventListener('message', handleMessage)
                }
            }
        }
    }, [sendMessage])

    return (
        <div className="h-screen flex flex-col overflow-hidden text-white" style={{ backgroundColor: '#0C0C0C' }}>
            <TopBar UserType="User" isSideBarOpened={isSideBarOpened} setIsSideBarOpened={setIsSideBarOpened} />

            <div className="flex flex-row flex-grow">
                {isSideBarOpened && (<SideBar setPageType='' isSideBarBacked={true} />)}
                
                <div className={`${isSideBarOpened && isSmallScreen ? 'opacity-0' : ''} p-16 flex flex-col items-center w-full justify-start`}>
                    <div ref={terminalRef} style={{ width: isSmallScreen ? '320px' : '720px', height: isSmallScreen ? '400px' : '600px' }} />
                </div>
            </div>
        </div>
    )
}

export default BotTerminal