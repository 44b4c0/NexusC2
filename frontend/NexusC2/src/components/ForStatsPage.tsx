import React from "react"

import LineChart from "./LineChart"

interface StatsData {
    value: number;
    month: string;
}

interface ForStatsPageProps {
    botJoinStats: StatsData[];
    userJoinStats: StatsData[];
    apiStats: StatsData[];
}

const ForStatsPage: React.FC<ForStatsPageProps> = ({botJoinStats, userJoinStats, apiStats}) => {
    const labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    return (
        <div className="flex flex-row">
            <div className="flex flex-col">
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 p-8">
                    <div className="flex flex-col items-center">
                        <span className="text-xl">BotJoins of the current year</span>
                        <LineChart data={botJoinStats.map(item => item.value)} labels={labels.map(item => item)} width={800} height={250} />
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xl">User registrations of the current year</span>
                        <LineChart data={userJoinStats.map(item => item.value)} labels={labels.map(item => item)} width={800} height={250} />
                    </div>
                    <div className="flex flex-col items-center sm:col-span-2">
                        <span className="text-xl">API usage of the current year</span>
                        <LineChart data={apiStats.map(item => item.value)} labels={labels.map(item => item)} width={800} height={200} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForStatsPage