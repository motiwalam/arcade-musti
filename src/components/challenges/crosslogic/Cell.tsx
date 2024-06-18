import { Color } from "../../../types";
import { ReactComponent as CrossSVG } from '../../../data/svg/cross.svg';
import { ReactComponent as CrossPassiveSVG } from '../../../data/svg/crosspassive.svg';
import { ReactComponent as CheckSVG } from '../../../data/svg/check.svg';
import { CellStatus } from "./status";
import { CSSProperties } from "react";

interface CellProps {
    // size: number;
    status: CellStatus;
    color: Color;
    onClick: () => void;
    style?: CSSProperties
}


const Cell = ({ status, color, onClick, style }: CellProps) => {
    return (
        <div className="flex justify-center items-center cursor-pointer" style={{
            outline: `1px solid gray`,
            backgroundColor: color,
            userSelect: 'none',
            ...style
        }} onClick={onClick}>
            {
                {
                    yes: (<CheckSVG />), 
                    no: (<CrossSVG />),
                    nopassive: (<CrossPassiveSVG />),
                    empty: undefined
                }[status]
            }
        </div>
    )
}

export default Cell;