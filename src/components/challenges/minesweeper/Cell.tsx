import useEventListener from "@use-it/event-listener";
import { ReactNode, useState } from "react";
import name_to_hex_map from "../../../data/color-map";
import { BOMB, FLAG } from "./data";
import { CellStatus } from "./status";

export interface CellProps {
    status: CellStatus;
    size: number;
    content: ReactNode;

    onReveal: () => void;
    onFlag: () => void;
}


const Cell = ({ status, size, content, onReveal, onFlag }: CellProps) => {
    const backgroundColor = name_to_hex_map[
        (() => {
            if (status === 'revealed') {
                return content === BOMB ? 'red' : 'white'
            }
            return 'midnight-blue'
        })()
    ];
    const [ isShiftPressed, setIsShiftPressed ] = useState(false);
    
    useEventListener('keydown', ({ key }: KeyboardEvent) => setIsShiftPressed(key === 'Shift'));
    useEventListener('keyup', ({ key }: KeyboardEvent) => key === 'Shift' && setIsShiftPressed(false));

    return (
        <div className="border-solid border-2 flex items-center justify-center mx-0 font-bold rounded dark:text-white"
             style={{
                width: `${size / 4}rem`, 
                height: `${size / 4}rem`, 
                backgroundColor,
                userSelect: 'none',
                fontSize: `${size / 8}rem`,
                lineHeight: `${size / 8}rem`
             }}
             onMouseDown={({ button }) => {
                // right click or shift + left click = flag
                if ((isShiftPressed && button === 0) || (button === 2)) {
                    onFlag()
                } else if (button === 0) {
                    onReveal()
                }
             }}>

             {
                (() => {
                    if (status === 'revealed' && content !== 0) {
                        return content
                    }
                    if (status === 'flagged') {
                        return FLAG
                    }
                    return ''
                })()
             }
        </div>
    )
}

export default Cell;