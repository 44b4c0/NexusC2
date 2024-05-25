import React from "react"

interface ClickToCopyTextButtonProps {
    ClickCallFunction: any;
}

const ClickToCopyTextButton: React.FC<ClickToCopyTextButtonProps> = ({ClickCallFunction}) => {
    const handleClick = () => {
        ClickCallFunction()
    }

    return (
        <button className="w-12 h-5 rounded-lg focus:outline-none" style={{ backgroundColor: '#1C1D1A' }} onClick={handleClick}>Copy</button>
    )
}

export default ClickToCopyTextButton