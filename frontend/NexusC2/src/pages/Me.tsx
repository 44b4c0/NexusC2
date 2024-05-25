import { useEffect, useState } from "react"
import axios from "axios"
import Config from "../config"

import TopBar from "../components/TopBar"
import LineChart from "../components/LineChart"
import SideBar from "../components/SideBar"
import ClickToCopyTextButton from "../components/ClickToCopyButton"

const Me = () => {
    // const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [isSideBarOpened, setIsSideBarOpened] = useState(true)
    const [userRequestStats, setUserRequestStats] = useState([])
    const [userBroadcastStats, setUserBroadcastStats] = useState([])
    const [Username, setUsername] = useState('')
    const [isUserActive, setIsUserActive] = useState(false)
    const [APIKey, setAPIKey] = useState('')
    useEffect(() => {
        const checker = () => {
            const sessionIdChecker = localStorage.getItem('sessionId')

            if(sessionIdChecker === null){
                window.location.href = "/"
            }
        }
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 768)
        }

        handleResize()
        checker()
    }, [])

    const copyAPIKey = () => {
        const textField = document.createElement("textarea")
        textField.value = APIKey
        document.body.appendChild(textField)
        textField.select()
        document.execCommand("copy")
        textField.remove()
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

            if(data.system === 'user_is_admin'){
                window.location.href = "/"
            }
            else{

                if(data.user === 'is_active'){
                }
                else{
                    window.location.href = '/thanks'
                }
            }
        }
        const getUsername = async () => {
            const sessionId = localStorage.getItem('sessionId')
            const jsonData = {'sessionId': sessionId}
            const response = await axios.get(Config.backendUrl + '/ui/_getusername', {params: jsonData})
            const data = response.data

            localStorage.setItem('Username', data.username)
            setUsername(data.username)
        }

        checkAuth()
        getUsername()
    }, [])
    useEffect(() => {
        const getUserData = async () => {
            const jsonData = {'Username': localStorage.getItem('Username')}
            const response = await axios.get(Config.backendUrl + '/ui/_getuserdata', {params: jsonData})
            const data = response.data

            if(data.system == 'user_not_found'){
                window.location.reload()
            }
            else{
                const deserializedUserData = JSON.parse(data)
                setIsUserActive(deserializedUserData.is_user_active)
                setAPIKey(deserializedUserData.api_key)

                const requestsData = Object.entries(deserializedUserData.monthly_stats_requests).map(([month, data]) => ({ month, data }))
                const broadcastsData = Object.entries(deserializedUserData.monthly_stats_broadcasts).map(([month, data]) => ({ month, data }))

                setUserRequestStats(requestsData)
                setUserBroadcastStats(broadcastsData)

                localStorage.removeItem('Username')
            }
        }

        getUserData()
    }, [])

    return (
        <div className="h-screen flex flex-col overflow-hidden text-white" style={{ backgroundColor: '#0C0C0C' }}>
            <TopBar UserType="User" isSideBarOpened={isSideBarOpened} setIsSideBarOpened={setIsSideBarOpened} />

            <div className="flex flex-row flex-grow">
                {isSideBarOpened && (<SideBar setPageType='' isSideBarBacked={true} />)}
                
                <div className={`${isSideBarOpened && isSmallScreen ? 'opacity-0' : ''} p-16 flex flex-col flex-grow items-center w-full justify-start`}>
                    <img src="../../public/User.png" className="rounded-full w-24 h-24 m-2" />
                    <span className="text-xl">{Username} - <span className={`${isUserActive ? 'text-green-500' : 'text-red-500'}`}>{isUserActive ? 'Active' : 'Inactive'}</span></span>
                    <div className="flex flex-row items-center align-middle justify-center text-xs">
                        <span className="m-2">API Key:</span>
                        <ClickToCopyTextButton ClickCallFunction={copyAPIKey}/>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 p-8">
                        <div className="flex flex-col items-center">
                            <span className="text-xl">Requests of the current year</span>
                            <LineChart data={userRequestStats.map(item => item.data)} labels={userRequestStats.map(item => item.month)} width={900} height={350} />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xl">Broadcasts of the current year</span>
                            <LineChart data={userBroadcastStats.map(item => item.data)} labels={userBroadcastStats.map(item => item.month)} width={900} height={350} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Me