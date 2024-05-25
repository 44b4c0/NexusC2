import React from "react"

interface ForBotBasePageProps {
    botBaseStats: any;
}

const ForBotBasePage: React.FC<ForBotBasePageProps> = ({botBaseStats}) => {
    const parsedStats = JSON.parse(botBaseStats)

    const handleBotClick = (roomId: string) => {
        window.location.href = "/terminal/" + roomId
    }

    return (
        <div className="flex flex-row justify-center">
            <div className="flex flex-col items-center">
                <div className="grid sm:grid-cols-4 lg:grid-cols-3 grid-cols-1 gap-4 p-8">
                    {Array.isArray(parsedStats) && parsedStats.map((item, index) => (
                        <div key={index} className="flex flex-row p-4 items-center justify-center rounded-md hover:shadow-lg" style={{ backgroundColor: '#050505' }}>
                            {
                            item.fields.os === 'Windows' ? <button className="flex flex-row" onClick={() => handleBotClick(item.fields.room_id)}><img src="../../public/Windows.png" className="rounded-full w-12 h-12 m-2" /><div className={`w-2 h-2 ${item.fields.is_being_used ? ('bg-red-500') : (item.fields.is_online ? 'bg-green-500' : 'bg-gray-500')} rounded-full`}/></button> :
                            item.fields.os === 'Linux' ? <button className="flex flex-row" onClick={() => handleBotClick(item.fields.room_id)}><img src="../../public/Linux.png" className="rounded-full w-12 h-12 m-2" /><div className={`w-2 h-2 ${item.fields.is_being_used ? ('bg-red-500') : (item.fields.is_online ? 'bg-green-500' : 'bg-gray-500')} rounded-full`}/></button> :
                            <button className="flex flex-row" onClick={() => handleBotClick(item.fields.room_id)}><img src="../../public/Unknown.png" className="rounded-full w-12 h-12 m-2" /><div className={`w-2 h-2 ${item.fields.is_being_used ? ('bg-red-500') : (item.fields.is_online ? 'bg-green-500' : 'bg-gray-500')} rounded-full`}/></button>
                            }
                            <div className="flex flex-col justify-center m-2">
                                <span className="m-2 text-lg">OS: {item.fields.os}</span>
                                <div className="flex flex-row">
                                    <span className="text-xs">User: {item.fields.user}</span>
                                    <div className="m-1" />
                                    <span className="text-xs">IPv4: {item.fields.ip_address}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ForBotBasePage