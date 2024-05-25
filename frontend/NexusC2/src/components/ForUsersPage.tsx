import React from "react"

interface ForUsersPageProps {
    usersStats: any;
}

const ForUsersPage: React.FC<ForUsersPageProps> = ({usersStats}) => {
    // const parsedStats = JSON.parse(usersStats)

    const handleProfilePictureButtonClick = (username: string) => {
        window.location.href = "/user/" + username
    }
    
    return (
        <div className="flex flex-row justify-center">
            <div className="flex flex-col items-center">
                <div className="grid sm:grid-cols-6 lg:gird-cols-5 grid-cols-1 gap-4 p-8">
                    {Array.isArray(usersStats) && usersStats.map((item, index) => (
                        <div key={index} className="flex flex-row p-4 items-center justify-center rounded-md hover:shadow-lg" style={{ backgroundColor: '#050505' }}>
                            <button onClick={() => handleProfilePictureButtonClick(item.username)}><img src="../../public/User.png" className="rounded-full w-12 h-12 m-2" /></button>
                            <div className="flex flex-col w-max">
                                <span className="text-md">{item.username}</span>
                                <span className="text-xs">{item.date_of_join}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ForUsersPage