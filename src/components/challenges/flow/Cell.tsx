import useEventListener from "@use-it/event-listener";
import { CSSProperties, useState } from "react";

import name_to_hex_map from "../../../data/color-map";
import { Color } from "../../../types/index";
import { array, range } from "../../../util/itertools";
import { PipeStyle } from "./style";

export interface CellProps {
    y: number; x: number;
    color: Color;
    pipe_style: PipeStyle;
    terminal?: boolean;
    size: number;
    onMouseDown: () => void;
    onMouseEnter: () => void;
    onMouseUp: () => void;
    onReveal: () => void;
}

function inner_attrs(oy: number, ox: number, iy: number, ix: number, style: CSSProperties) {
    const classes = [];

    
    if (oy === 0 && iy === 0)   classes.push(`border-t-2`)
    if (iy === 3 - 1) classes.push(`border-b-2`)
    if (ox === 0 && ix === 0)   classes.push(`border-l-2`)
    if (ix === 3 - 1) classes.push(`border-r-2`)
    
    if (style.backgroundColor !== undefined) classes.splice(0);

    return {
        className: `border-black flex items-center justify-center mx-0 ${classes.join(' ')}`,
        style
    };
}


const Cell = ({
    color,
    terminal,
    size,
    pipe_style,
    y,
    x,
    onReveal,
    ...mouseEvents
}: CellProps) => {
    const backgroundColor = color.startsWith('#') ? color : name_to_hex_map[color as keyof typeof name_to_hex_map];
    
    const inner_styles: CSSProperties[] = Array(9).fill(0).map(() => ({ width: `${size / 4 / 3}rem`, height: `${size / 4 / 3}rem` }));
    const filled_inners = {
        left: [3, 4, 5],
        right: [3, 4, 5],
        down: [1, 4, 7],
        up: [1, 4, 7],
        curb_top_right: [4, 1, 5],
        curb_top_left: [3, 1, 4],
        curb_bottom_right: [4, 5, 7],
        curb_bottom_left: [3, 4, 7],
        full: array(range(9)),
        terminal: [],
        terminal_left: [3],
        terminal_right: [5],
        terminal_up: [1],
        terminal_down: [7],
        empty: [],
        
    }[pipe_style];
    filled_inners.forEach(i => { inner_styles[i].backgroundColor = backgroundColor })

    const [isShiftPressed, setIsShiftPressed] = useState(false);
    useEventListener('keydown', ({ key }: KeyboardEvent) => setIsShiftPressed(key === 'Shift'));
    useEventListener('keyup', ({ key }: KeyboardEvent) => key === 'Shift' && setIsShiftPressed(false));

    return (
        <div className="flex items-center justify-center mx-0"
            style={{
                width: `${size / 4}rem`, 
                height: `${size / 4}rem`, 
                position: 'relative',
                userSelect: 'none',
                // draggable: 'false'
            }}
            {...mouseEvents}
            onClick={({ button }) => {
                if ((isShiftPressed && button === 0) || (button === 2)) {
                    onReveal()
                }
            }}>

                    <div>
                        <div className="flex justify-center">
                            <div {...inner_attrs(y, x, 0, 0, inner_styles[0])}></div>
                            <div {...inner_attrs(y, x, 0, 1, inner_styles[1])}></div>
                            <div {...inner_attrs(y, x, 0, 2, inner_styles[2])}></div>
                        </div>
                        <div className="flex justify-center">
                            <div {...inner_attrs(y, x, 1, 0, inner_styles[3])}></div>
                            <div {...inner_attrs(y, x, 1, 1, inner_styles[4])}></div>
                            <div {...inner_attrs(y, x, 1, 2, inner_styles[5])}></div>

                        </div>
                        <div className="flex justify-center">
                            <div {...inner_attrs(y, x, 2, 0, inner_styles[6])}></div>
                            <div {...inner_attrs(y, x, 2, 1, inner_styles[7])}></div>
                            <div {...inner_attrs(y, x, 2, 2, inner_styles[8])}></div>

                        </div>
                    </div>

                    <div className="rounded-full" style={{
                        ...(terminal ? {backgroundColor} : {}),
                        width: `${size / 6}rem`,
                        height: `${size / 6}rem`,
                        position: 'absolute'
                    }} />
            
        </div>
    )

}

export default Cell;