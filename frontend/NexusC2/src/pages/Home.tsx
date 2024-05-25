import { useEffect, useState } from "react"
import axios from "axios"
import Config from "../config"

import TopBar from "../components/TopBar"
import SideBar from "../components/SideBar"
import ForStatsPage from "../components/ForStatsPage"
import ForBotBasePage from "../components/ForBotBasePage"
import ForUsersPage from "../components/ForUsersPage"
import ForMaximusPage from "../components/ForMaximusPage"

const Home = () => {
    useEffect(() => {
        const checker = () => {
            const sessionIdChecker = localStorage.getItem('sessionId')

            if(sessionIdChecker === null){
                window.location.href = "/"
            }
        }

        checker()
    }, [])
    const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const [isUserAdmin, setIsUserAdmin] = useState(false)
    const [isSmallScreen, setIsSmallScreen] = useState(false)
    const [isSideBarOpened, setIsSideBarOpened] = useState(true)
    const [botJoinStats, setBotJoinStats] = useState([])
    const [userJoinStats, setUserJoinStats] = useState([])
    const [apiStats, setApiStats] = useState([])
    const [pageType, setPageType] = useState('Stats')
    const [botBaseStats, setBotBaseStats] = useState([])
    const [usersStats, setUsersStats] = useState([])
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
                    window.location.href = '/thanks'
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
        const getBotStatsData = async () => {
            const response = await axios.get(Config.backendUrl + '/ui/_getbotstats/')
            const data = response.data.monthly_stats

            const statsArray = labels.map(month => ({ month, value: data[month] }))
            setBotJoinStats(statsArray)
        }
        const getUserStatsData = async () => {
            const response = await axios.get(Config.backendUrl + '/ui/_getuserstats/')
            const data = response.data.monthly_stats

            const statsArray = labels.map(month => ({ month, value: data[month] }))
            setUserJoinStats(statsArray)
        }
        const getApiUsageStatsData = async () => {
            const response = await axios.get(Config.backendUrl + '/ui/_getapistats/')
            const data = response.data.monthly_stats

            const statsArray = labels.map(month => ({ month, value: data[month] }))
            setApiStats(statsArray)
        }
        const getBotBaseStats = async () => {
            const response = await axios.get(Config.backendUrl + '/ui/_getbotbasestats/')
            const data = response.data.serialized_bots

            setBotBaseStats(data)
        }
        const getUsersStatsData = async () => {
            const response = await axios.get(Config.backendUrl + '/ui/_getusersstats/')
            const data = response.data.serialized_users

            setUsersStats(data)
        }
        getBotStatsData()
        getUserStatsData()
        getApiUsageStatsData()
        getBotBaseStats()
        getUsersStatsData()

        const intervalId = setInterval(getBotBaseStats, 2500)
        return () => clearInterval(intervalId)
    }, [])
    if(isUserAdmin === true){
        return (
            <div className="flex flex-col h-screen overflow-hidden text-white" style={{ backgroundColor: '#0C0C0C' }}>
                <TopBar UserType="admin" isSideBarOpened={isSideBarOpened} setIsSideBarOpened={setIsSideBarOpened} />

                <div className="flex flex-row flex-grow">
                    {isSideBarOpened && (<SideBar setPageType={setPageType} isSideBarBacked={false} />)}

                    <div className={`${isSideBarOpened && isSmallScreen ? 'opacity-0' : ''}`}>
                        {
                            pageType === 'Stats' ? <ForStatsPage botJoinStats={botJoinStats} userJoinStats={userJoinStats} apiStats={apiStats} /> :
                            pageType === 'BotBase' ? <ForBotBasePage botBaseStats={botBaseStats} /> :
                            pageType === 'Users' ? <ForUsersPage usersStats={usersStats} /> :
                            pageType === 'Maximus' ? <ForMaximusPage /> : null
                        }
                    </div>
                </div>
            </div>
        )
    }
    else{
        return (
            <div className="flex flex-col h-screen overflow-hidden text-white" style={{ backgroundColor: '#0C0C0C' }}>
                <TopBar UserType="User" isSideBarOpened={isSideBarOpened} setIsSideBarOpened={setIsSideBarOpened} />

                <div className="flex flex-row flex-grow">
                    {isSideBarOpened && (<SideBar setPageType={setPageType} isSideBarBacked={false} />)}

                    <div className={`${isSideBarOpened && isSmallScreen ? 'opacity-0' : ''}`}>
                        {
                            pageType === 'Stats' ? <ForStatsPage botJoinStats={botJoinStats} userJoinStats={userJoinStats} apiStats={apiStats} /> :
                            pageType === 'BotBase' ? <ForBotBasePage botBaseStats={botBaseStats} /> :
                            pageType === 'Users' ? <ForUsersPage usersStats={usersStats} /> :
                            pageType === 'Maximus' ? <ForMaximusPage /> : null
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Home