import FaceSVG from "./Face";
import { Face } from "./types";

export interface DropCellProps {
    x: number;
    y: number;

    invisible: boolean;

    value: Face | null;

    onShiftClick?: () => void;
}

const DropCell = ({ x, y, invisible, value, onShiftClick }: DropCellProps) => {
    
    if (invisible) {
        return <div className="invisible aspect-square pointer-events-none" />;
    }

    return (
        <div 
            data-board-cell
            data-row={x}
            data-col={y}
            className="aspect-square relative flex z-[1] size-[100%]"
            onClick={e => {
                if (onShiftClick && e.shiftKey) {
                    onShiftClick();
                }
            }}
            >

            {value !== null && (<FaceSVG value={value} />)}

        </div>
    )
}

export default DropCell;