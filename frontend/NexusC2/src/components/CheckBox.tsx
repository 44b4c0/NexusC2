import React from "react"

interface CheckBoxProps {
    checked: boolean;
    handleRefChange: any;
}

const CheckBox: React.FC<CheckBoxProps> = ({checked, handleRefChange}) => {
    return (
        <input type="checkbox" className="focus:outline-none border-none" checked={checked} onChange={handleRefChange} />
    )
}

export default CheckBox