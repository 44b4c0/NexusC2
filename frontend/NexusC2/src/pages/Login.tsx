import { useRef, useEffect, useState } from "react"
import Config from "../config"
import axios from "axios"

// components
import Input from "../components/Input"
import Label from "../components/Label"
import Button from "../components/Button"

const Login = () => {
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
                else if(data.session_id === 'valid'){
                    window.location.href = "/home"
                }
            }
        }

        checkAuth()
    }, [])
    const UsernameInput = useRef(null)
    const PasswordInput = useRef(null)
    const [loginError, setLoginError] = useState(false)

    const handleLoginErrorChange = () => {
        if(loginError === true){
            setLoginError(false)
        }
        else if(loginError === false){
            setLoginError(true)
        }
    }
    const handleTextClick = () => {
        window.location.href = '/register'
    }

    const SubmitData = async () => {
        const jsonData = {'Username': UsernameInput.current.value, 'Password': PasswordInput.current.value}
        const response = await axios.post(Config.backendUrl + '/ui/login/', jsonData)
        const data = response.data

        if(data.credentials === 'success'){
            localStorage.setItem('sessionId', data.session_id)

            window.location.reload()
        }
        else{
            handleLoginErrorChange()
        }
    }

    return (
        <div className="h-screen flex justify-center items-center text-white" style={{ backgroundColor: '#0C0C0C' }} >
            <div className="flex flex-col w-96 h-96 items-center justify-center">
                <span className="text-5xl">Sign in</span>
                <div className="flex flex-col m-8">
                    <Label Text="Username" HtmlFor="UsernameInput" />
                    <Input Id="UsernameInput" Ref={UsernameInput} Type="text" />

                    <div className="m-2"/>

                    <Label Text="Password" HtmlFor="PasswordInput" />
                    <Input Id="PasswordInput" Ref={PasswordInput} Type="password" />

                    {loginError ? (<div className="flex items-center justify-center"><span className="text-red-500 font-semibold text-sm">Login failed</span></div>) : (<></>)}

                    <div className="m-1.5" />

                    <div className="flex flex-col items-center justify-center">
                        <Button ButtonText="Submit" ClickCallFunction={SubmitData} />

                        <div className="m-0.5" />

                        <button className="focus:outline-none" onClick={handleTextClick}><span className="text-xs hover:underline focus:outline-none">Don't have an account?</span></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login