import { ReactNode } from "react";

interface CellProps {
    y: number; x: number;
    size: number;
    children: ReactNode;
    onClick: () => void;
}

function attrs(y: number, x: number, size: number) {
    const classes = ['border-b-2', 'border-r-2'];
    if (y === 0) classes.push('border-t-2')
    if (x === 0) classes.push('border-l-2')

    return {
        className: `border-black border-solid bg-slate-200 flex items-center justify-center mx-0 ${classes.join(' ')}`,
        style: {
            width: `${size / 4}rem`,
            height: `${size / 4}rem`,
            fontSize: `${size / 8}rem`,
            lineHeight: `${size / 8}rem`,
            userSelect: 'none'
        } as const
    }
}

const Cell = ({ y, x, size, onClick, children }: CellProps) => {
    return (
        <div {...attrs(y, x, size)} onClick={onClick}>
            {children}
        </div>
    )
}

export default Cell;