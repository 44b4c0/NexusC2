import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Config from "../config"

import axios from "axios"

import TopBar from "../components/TopBar"
import SideBar from "../components/SideBar"
import LineChart from "../components/LineChart"

const UserPage = () => {
    const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const { Username } = useParams()

    const [isUserAdmin, setIsUserAdmin] = useState(false)
    const [isUserActive, setIsUserActive] = useState(false)
    const [isSideBarOpened, setIsSideBarOpened] = useState(true)
    const [userNotFound, setUserNotFound] = useState(false)
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [userBroadcastStats, setUserBroadcastStats] = useState([])
    const [userRequestStats, setUserRequestStats] = useState([])
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
                setIsUserAdmin(true)
            }
            else{
                setIsUserAdmin(false)

                if(data.user === 'is_active'){
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
        const getUserData = async () => {
            const jsonData = {'Username': Username}
            const response = await axios.get(Config.backendUrl + '/ui/_getuserdata', { params: jsonData})
            const data = response.data

            if(data.system == 'user_not_found'){
                setUserNotFound(true)
            }
            else{
                const deserializedUserData = JSON.parse(data)
                const requestsData = Object.entries(deserializedUserData.monthly_stats_requests).map(([month, data]) => ({ month, data }))
                const broadcastsData = Object.entries(deserializedUserData.monthly_stats_broadcasts).map(([month, data]) => ({ month, data }))

                setIsUserActive(deserializedUserData.is_user_active)
                setUserRequestStats(requestsData)
                setUserBroadcastStats(broadcastsData)
            }
        }

        checkAuth()
        getUserData()
    }, [])
    if(isUserAdmin === true){
        if(userNotFound === true){
            return (
                <div className="h-screen flex flex-col overflow-hidden text-white" style={{ backgroundColor: '#0C0C0C' }}>
                    <TopBar UserType="User" isSideBarOpened={isSideBarOpened} setIsSideBarOpened={setIsSideBarOpened} />

                    <div className="flex flex-row flex-grow">
                        {isSideBarOpened && (<SideBar setPageType='' isSideBarBacked={true} />)}

                        <div className={`${isSideBarOpened && isSmallScreen ? 'opacity-0' : ''} p-16 flex flex-col flex-grow items-center w-full justify-center`}>
                            <span className="sm:text-5xl text-xl">User Not found</span>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div className="h-screen flex flex-col overflow-hidden text-white" style={{ backgroundColor: '#0C0C0C' }}>
                <TopBar UserType="admin" isSideBarOpened={isSideBarOpened} setIsSideBarOpened={setIsSideBarOpened} />

                <div className="flex flex-row flex-grow">
                    {isSideBarOpened && (<SideBar setPageType='' isSideBarBacked={true} />)}

                    <div className={`${isSideBarOpened && isSmallScreen ? 'opacity-0' : ''} p-16 flex flex-col flex-grow items-center w-full justify-start`}>
                        <img src="../../public/User.png" className="rounded-full w-24 h-24 m-2" />
                        <span className="text-xl">{Username} - <span className={`${isUserActive ? 'text-green-500' : 'text-red-500'}`}>{isUserActive ? 'Active' : 'Inactive'}</span></span>
                        
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
    else if(isUserAdmin === false){
        if(userNotFound === true){
            return (
                <div className="h-screen flex flex-col overflow-hidden text-white" style={{ backgroundColor: '#0C0C0C' }}>
                    <TopBar UserType="User" isSideBarOpened={isSideBarOpened} setIsSideBarOpened={setIsSideBarOpened} />

                    <div className="flex flex-row flex-grow">
                        {isSideBarOpened && (<SideBar setPageType='' isSideBarBacked={true} />)}

                        <div className={`${isSideBarOpened && isSmallScreen ? 'opacity-0' : ''} p-16 flex flex-col flex-grow items-center w-full justify-start`}>
                            <span className="sm:text-5xl text-xl">User Not found</span>
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div className="h-screen flex flex-col overflow-hidden text-white" style={{ backgroundColor: '#0C0C0C' }}>
                <TopBar UserType="User" isSideBarOpened={isSideBarOpened} setIsSideBarOpened={setIsSideBarOpened} />

                <div className="flex flex-row flex-grow">
                    {isSideBarOpened && (<SideBar setPageType='' isSideBarBacked={true} />)}

                    <div className={`${isSideBarOpened && isSmallScreen ? 'opacity-0' : ''} p-16 flex flex-col flex-grow items-center w-full justify-start`}>
                        <img src="../../public/User.png" className="rounded-full w-24 h-24 m-2" />
                        <span className="text-xl">{Username} - <span className={`${isUserActive ? 'text-green-500' : 'text-red-500'}`}>{isUserActive ? 'Active' : 'Inactive'}</span></span>
                        
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
}

export default UserPage