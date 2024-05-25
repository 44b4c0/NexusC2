import { useEffect, useRef, useState } from "react"

import axios from "axios"
import Config from "../config"

import TopBar from "../components/TopBar"
import SideBar from "../components/SideBar"
import CheckBox from "../components/CheckBox"
import Button from "../components/Button"

const Settings = () => {
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [isSideBarOpened, setIsSideBarOpened] = useState(true)
    const [isAPIUsageEnabled, setIsAPIUsageEnabled] = useState(false)
    const [isRegistrationEnabled, setIsRegistrationEnabled] = useState(false)
    const [isBroadcastEnabled, setIsBroadcastEnabled] = useState(false)
    const [inactiveUsers, setInactiveUsers] = useState([])

    const PasswordInputRef = useRef(null)

    const handleAPIUsageChange = () => {
        setIsAPIUsageEnabled(!isAPIUsageEnabled)
    }
    const handleRegistrationChange = () => {
        setIsRegistrationEnabled(!isRegistrationEnabled)
    }
    const handleBroadcastChange = () => {
        setIsBroadcastEnabled(!isBroadcastEnabled)
    }
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

            if(data.system === 'user_is_admin'){}
            else{
                if(data.user === 'is_active'){
                    window.location.href = "/"
                }
                else{
                    window.location.href = "/thanks"
                }
            }

            const handleResize = () => {
                setIsSmallScreen(window.innerWidth < 768)
            }

            handleResize()
        }

        checkAuth()
    }, [])

    useEffect(() => {
        const getInactiveUsers = async () => {
            const response = await axios.get(Config.backendUrl + '/ui/_getinactiveusers')
            const data = response.data

            setInactiveUsers(data.serialized_users)
        }

        getInactiveUsers()
    }, [])

    useEffect(() => {
        const getSettingsdata = async () => {
            const response = await axios.get(Config.backendUrl + '/ui/_getsettings')
            const data = response.data

            setIsAPIUsageEnabled(data.api_usage)
            setIsRegistrationEnabled(data.registration)
            setIsBroadcastEnabled(data.broadcast)
        }

        getSettingsdata()
    }, [])

    const submitData = async () => {
        const jsonData = {'APIUsage': isAPIUsageEnabled, 'registration': isRegistrationEnabled, 'broadcast': isBroadcastEnabled, 'Password': PasswordInputRef.current, 'sessionId': localStorage.getItem('sessionId')}
        const response = await axios.post(Config.backendUrl + '/ui/_setsettings/', jsonData)
        const data = response.data

        if(data.settings === 'saved_success'){
            window.location.reload()
        }
    }
    const activateUser = async (username: string) => {
        const jsonData = {'Username': username, 'sessionId': localStorage.getItem('sessionId')}
        const response = await axios.post(Config.backendUrl + '/ui/_activateuser/', jsonData)
        const data = response.data

        if(data.user === 'activated'){
            const updatedItems = inactiveUsers.filter(item => item.username !== username)
            setInactiveUsers(updatedItems)
        }
    }
    return (
        <div className="h-screen flex flex-col overflow-hidden text-white" style={{ backgroundColor: '#0C0C0C' }}>
            <TopBar UserType="admin" isSideBarOpened={isSideBarOpened} setIsSideBarOpened={setIsSideBarOpened} />

            <div className="flex flex-row flex-grow">
                {isSideBarOpened && (<SideBar setPageType='' isSideBarBacked={true} />)}
                
                <div className={`${isSideBarOpened && isSmallScreen ? 'opacity-0' : ''} p-16 flex flex-col flex-grow items-center w-full justify-start`}>
                    <div className="flex flex-row justify-between sm:w-96 w-72 items-center align-middle m-2">
                        <div className="flex flex-col">
                            <span className="text-xl">Allow API usage</span>
                            <span className="text-xs font-semibold">This allows access on The Nexus API.</span>
                        </div>
                        <CheckBox checked={isAPIUsageEnabled} handleRefChange={handleAPIUsageChange} />
                    </div>
                    <div className="flex flex-row justify-between sm:w-96 w-72 items-center align-middle m-2">
                        <div className="flex flex-col">
                            <span className="text-xl">Allow registration</span>
                            <span className="text-xs font-semibold">This allows registration on the platform.</span>
                        </div>
                        <CheckBox checked={isRegistrationEnabled} handleRefChange={handleRegistrationChange} />
                    </div>
                    <div className="flex flex-row justify-between sm:w-96 w-72 items-center align-middle m-2">
                        <div className="flex flex-col">
                            <span className="text-xl">Allow broadcasts</span>
                            <span className="text-xs font-semibold">This allows broadcasting commands.</span>
                        </div>
                        <CheckBox checked={isBroadcastEnabled} handleRefChange={handleBroadcastChange} />
                    </div>
                    <div className="flex flex-row justify-between sm:w-96 w-72 items-center align-middle m-2">
                        <div className="flex flex-col">
                            <span className="sm:text-xl text-base">Update Admin password</span>
                            <span className="text-xs font-semibold">This changes admin password.</span>
                        </div>
                        <input type="password" ref={PasswordInputRef.current} className="w-36 h-8 rounded-lg focus:outline-none p-2" style={{ backgroundColor: '#1C1D1A' }} />
                    </div>

                    {/* Verify users from here */}
                    <div className="flex flex-col sm:w-96 w-80 h-64 overflow-y-scroll overflow-x-hidden rounded-md p-2" style={{ backgroundColor: '#050505' }}>
                        {Array.isArray(inactiveUsers) && inactiveUsers.map((item, index) => (
                            <div key={index} className="flex flex-row w-full justify-between p-2 rounded-md h-12 hover:bg-gray-700">
                                <div className="flex flex-row items-center">
                                    <img src="../../public/User.png" className="rounded-full w-8 h-8 m-1" />
                                    <span className="text-md m-1">{item.username}</span>
                                </div>

                                <button onClick={() => activateUser(item.username)}><img src="../../public/user-check.svg" /></button>
                            </div>
                        ))}
                    </div>

                    <div className="m-2"/>

                    <Button ButtonText="Save" ClickCallFunction={submitData}/>
                </div>
            </div>
        </div>
    )
}

export default Settings