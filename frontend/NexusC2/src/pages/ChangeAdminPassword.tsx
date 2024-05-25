import { useRef, useEffect, useState } from "react"
import Config from "../config"
import axios from "axios"

// components
import Input from "../components/Input"
import Label from "../components/Label"
import Button from "../components/Button"

const ChangeAdminPassword = () => {
    useEffect(() => {
        const checkAuth = async () => {
            const sessionId = localStorage.getItem('sessionId')

            if(sessionId === null){
                localStorage.clear()
            }
            else{
                const jsonData = {'sessionId': sessionId}
                const response = await axios.post(Config.backendUrl + '/ui/_checkauth/', jsonData)
                const data = response.data

                if(data.session_id === 'invalid'){
                    localStorage.clear()
                    window.location.reload()
                    window.location.href = "/"
                }
                else if(data.credentials === 'success'){
                    window.location.href = "/home"
                }
            }
        }

        checkAuth()
    }, [])
    const PasswordInput = useRef('')
    const RepeatPasswordInput = useRef('')
    const [passwordChangeError, setPasswordChangeError] = useState(false)

    const handlePasswordChangeError = () => {
        if(passwordChangeError === true){
            setPasswordChangeError(false)
        }
        else if(passwordChangeError === false){
            setPasswordChangeError(true)
        }
    }

    const SubmitData = async () => {
        const jsonData = {'newPassword': PasswordInput.current, 'newRepeatPassword': RepeatPasswordInput.current, 'sessionId': localStorage.getItem('sessionId')}
        const response = await axios.post(Config.backendUrl + '/ui/changeadminpassword/', jsonData)
        const data = response.data

        if(data.credentials === 'success'){
            window.location.href = "/home"
        }
        else{
            handlePasswordChangeError()
        }
    }

    return (
        <div className="h-screen flex justify-center items-center text-white" style={{ backgroundColor: '#0C0C0C' }} >
            <div className="flex flex-col w-96 h-96 items-center justify-center">
                <span className="sm:text-3xl text-2xl">Change admin password</span>
                <div className="flex flex-col m-8">
                    <Label Text="Password" HtmlFor="PasswordInput" />
                    <Input Id="PasswordInput" Ref={PasswordInput} Type="password" />

                    <div className="m-2"/>

                    <Label Text="Repeat Password" HtmlFor="RepeatPasswordInput" />
                    <Input Id="RepeatPasswordInput" Ref={RepeatPasswordInput} Type="password" />

                    {passwordChangeError ? (<div className="flex items-center justify-center"><span className="text-red-500 font-semibold text-sm">Password change failed</span></div>) : (<></>)}

                    <div className="m-1.5" />

                    <div className="flex flex-col items-center justify-center">
                        <Button ButtonText="Submit" ClickCallFunction={SubmitData} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChangeAdminPassword