import React from "react"

interface MaximusInputProps {
    Id: string;
    Ref: any;
    Type: string;
}

const MaximusInput: React.FC<MaximusInputProps> = ({Id, Ref, Type}) => {
    return (
        <input id={Id} type={Type} ref={Ref} className="w-52 sm:w-96 h-12 rounded-lg focus:outline-none p-2" style={{ backgroundColor: '#050505' }} />
    )
}

export default MaximusInput