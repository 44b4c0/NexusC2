import { useRef } from "react"
import useWebSocket from "react-use-websocket"
import Config from "../config"

import Label from "./Label"
import MaximusInput from "./MaximusInput"
import MaximusButton from "./MaximusButton"

const ForMaximusPage = () => {
    const commandInput = useRef('')
    const { sendMessage } = useWebSocket(
        Config.backendUrlWebsocket + "/ws/yes/None/" + localStorage.getItem('sessionId'),
        {
            onMessage: (messageEvent) => {
                const data = messageEvent.data
            }
        }
    )

    const handleWebsocketCommandShooting = () => {
        const command = commandInput.current
        const dataToSend = JSON.stringify({type: 'broadcast', data: command, roomId: 'None'})
        sendMessage(dataToSend)
        commandInput.current = ''
    }

    return (
        <div className="flex w-screen h-screen items-center justify-center">
            <div className="flex flex-col">
                <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-col">
                        <Label Text="Write a command to shoot" HtmlFor="commandInput" />
                        <div className="m-0.5" />
                        <MaximusInput Id="commandInput" Ref={commandInput} Type="text" />
                    </div>

                    <div className="m-2" />

                    <MaximusButton ButtonText="Shoot" ClickCallFunction={handleWebsocketCommandShooting} />
                </div>
            </div>
        </div>
    )
}

export default ForMaximusPage