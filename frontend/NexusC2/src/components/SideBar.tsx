import React from "react"

interface SideBarProps {
    isSideBarBacked: boolean;
    setPageType: any;
}

const SideBar: React.FC<SideBarProps> = ({isSideBarBacked, setPageType}) => {
    const handleChartButtonClick = () => {
        setPageType('Stats')
    }
    const handleBotBaseButtonClick = () => {
        setPageType('BotBase')
    }
    const handleUsersButtonClick = () => {
        setPageType('Users')
    }
    const handleBroadcastButtonClick = () => {
        setPageType('Maximus') // Maximus Broadcaster v1.0
    }
    const handleBackButtonClick = () => {
        window.location.href = "/home"
    }
    if(isSideBarBacked === false){
        return (
            <div className="flex flex-col min-h-screen w-52 pt-8 p-4 text-white" style={{ backgroundColor: '#050505' }}>
                <button onClick={handleChartButtonClick} className="flex flex-row w-max m-1 focus:outline-none">
                    <img src="../../public/bar-chart.svg" className="m-0.5" style={{ width: "30px", height: "30px" }} />
                    <span className="text-2xl m-0.5">Stats/Charts</span>
                </button>
                <button onClick={handleBotBaseButtonClick} className="flex flex-row w-max m-1 focus:outline-none">
                    <img src="../../public/database.svg" className="m-0.5" style={{ width: "30px", height: "30px" }} />
                    <span className="text-2xl m-0.5">Bot base</span>
                </button>
                <button onClick={handleUsersButtonClick} className="flex flex-row w-max m-1 focus:outline-none">
                    <img src="../../public/users.svg" className="m-0.5" style={{ width: "30px", height: "30px" }} />
                    <span className="text-2xl m-0.5">Users</span>
                </button>
                <button onClick={handleBroadcastButtonClick} className="flex flex-row w-max m-1 focus:outline-none">
                    <img src="../../public/terminal.svg" className="m-0.5" style={{ width: "30px", height: "30px" }} />
                    <span className="text-2xl m-0.5">Broadcasts</span>
                </button>
            </div>
        )
    }
    else{
        return (
            <div className="flex flex-col min-h-screen w-52 pt-8 p-4 text-white" style={{ backgroundColor: '#050505' }}>
                <button onClick={handleBackButtonClick} className="flex flex-row w-max m-1 focus:outline-none">
                    <img src="../../public/arrow-left.svg" className="m-0.5" style={{ width: "30px", height: "30px" }} />
                    <span className="text-2xl m-0.5">Go back</span>
                </button>
            </div>
        )
    }
}

export default SideBar