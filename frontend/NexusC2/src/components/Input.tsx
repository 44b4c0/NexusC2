import React from "react"

interface InputProps {
    Id: string;
    Ref: any;
    Type: string;
}

const Input: React.FC<InputProps> = ({Id, Ref, Type}) => {
    return (
        <input id={Id} type={Type} ref={Ref} className="w-52 h-12 rounded-lg focus:outline-none p-2" style={{ backgroundColor: '#1C1D1A' }} />
    )
}

export default Input