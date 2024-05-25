import React from "react"

interface MaximusButtonProps {
    ButtonText: string;
    ClickCallFunction: any;
}

const MaximusButton: React.FC<MaximusButtonProps> = ({ButtonText, ClickCallFunction}) => {
    return (
        <button className="w-32 h-9 rounded-lg focus:outline-none" style={{ backgroundColor: '#050505' }} onClick={ClickCallFunction}>{ButtonText}</button>
    )
}

export default MaximusButton