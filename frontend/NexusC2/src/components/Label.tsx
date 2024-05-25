import React from "react"

interface LabelProps {
    Text: string;
    HtmlFor: string;
}

const Input: React.FC<LabelProps> = ({Text, HtmlFor}) => {
    return (
        <label className="text-xs" htmlFor={HtmlFor}>{Text}</label>
    )
}

export default Input