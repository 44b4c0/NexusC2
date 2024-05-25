import React from "react"
import axios from "axios"
import Config from "../config"

interface TopBarProps {
    UserType: string;
    isSideBarOpened: boolean;
    setIsSideBarOpened: any;
}

const TopBar: React.FC<TopBarProps> = ({UserType, isSideBarOpened, setIsSideBarOpened}) => {
    if(UserType === 'admin'){
        const handleUserButtonClick = () => {
            window.location.href = "/me"
        }
        const handleSettingsButtonClick = () => {
            window.location.href = "/settings"
        }
        const handleLogOutButtonClick = async () => {
            const sessionId = localStorage.getItem('sessionId')
            const jsonData = {'sessionId': sessionId}
            const response = await axios.post(Config.backendUrl + '/ui/logout/', jsonData)
            const data = response.data

            if(data.system === 'success'){
                localStorage.clear()
                window.location.reload()
                window.location.href = "/"
            }
        }
        const handleSideBarButtonClick = () => {
            setIsSideBarOpened(!isSideBarOpened)
        }
        return (
            <div className="flex flex-row h-20 text-white items-center p-5 justify-between" style={{ backgroundColor: '#050505' }}>
                <span className="sm:text-3xl sm:inline-block hidden">NexusC2 - Admin Dashboard</span>
                <button onClick={handleSideBarButtonClick} className="sm:hidden inline-block"><img src="../../public/align-justify.svg" className="sm:m-3 m-2" /></button>
                <div className="flex flex-row">
                    <button onClick={handleSettingsButtonClick} className="focus:outline-none"><img src="../../public/settings.svg" className="sm:m-3 m-2" /></button>
                    <button onClick={handleLogOutButtonClick} className="focus:outline-none"><img src="../../public/log-out.svg" className="sm:m-3 m-2" /></button>
                </div>
            </div>
        )
    }
    else{
        const handleUserButtonClick = () => {
            window.location.href = "/me"
        }
        const handleLogOutButtonClick = async () => {
            const sessionId = localStorage.getItem('sessionId')
            const jsonData = {'sessionId': sessionId}
            const response = await axios.post(Config.backendUrl + '/ui/logout/', jsonData)
            const data = response.data

            if(data.system === 'success'){
                localStorage.clear()
                window.location.reload()
                window.location.href = "/"
            }
        }
        const handleSideBarButtonClick = () => {
            setIsSideBarOpened(!isSideBarOpened)
        }
        return (
            <div className="flex flex-row h-20 text-white items-center p-5 justify-between" style={{ backgroundColor: '#050505' }}>
                <span className="sm:text-3xl sm:inline-block hidden">NexusC2 - User Dashboard</span>
                <button onClick={handleSideBarButtonClick} className="sm:hidden inline-block focus:outline-none"><img src="../../public/align-justify.svg" className="sm:m-3 m-2" /></button>
                <div className="flex flex-row">
                    <button onClick={handleUserButtonClick} className="focus:outline-none" ><img src="../../public/user.svg" className="sm:m-3 m-2" /></button>
                    <button onClick={handleLogOutButtonClick} className="focus:outline-none" ><img src="../../public/log-out.svg" className="sm:m-3 m-2" /></button>
                </div>
            </div>
        )
    }
}

export default TopBar