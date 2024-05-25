import React from "react"

interface ButtonProps {
    ButtonText: string;
    ClickCallFunction: any;
}

const Button: React.FC<ButtonProps> = ({ButtonText, ClickCallFunction}) => {
    return (
        <button className="w-32 h-9 rounded-lg focus:outline-none" style={{ backgroundColor: '#1C1D1A' }} onClick={ClickCallFunction}>{ButtonText}</button>
    )
}

export default Button