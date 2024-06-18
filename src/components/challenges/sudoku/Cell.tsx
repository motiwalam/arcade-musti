import { array, map, range } from "../../../util/itertools";
import { Status } from "./status";

interface CellProps {
    sudoku_size: number;
    size: number;
    
    value?: number;
    notes: (number | undefined)[]

    y: number; x: number;

    highlighted?: boolean;
    selected?: boolean;
    bolded?: number;
    status: Status;
    onHover: [() => void, () => void];
    onClick: () => void;
}

function border_classes(oy: number, ox: number, iy: number, ix: number, sudoku_size: number) {
    const classes = [];

    const tsize = oy === 0 ? 4 : 2;
    const bsize = (oy + 1) % sudoku_size === 0 ? 4 : 2;
    const lsize = ox === 0 ? 4 : 2;
    const rsize = (ox + 1) % sudoku_size === 0 ? 4 : 2;

    if (oy === 0 && iy === 0)   classes.push(`border-t-${tsize}`)
    if (iy === sudoku_size - 1) classes.push(`border-b-${bsize}`)
    if (ox === 0 && ix === 0)   classes.push(`border-l-${lsize}`)
    if (ix === sudoku_size - 1) classes.push(`border-r-${rsize}`)

    return classes.join(' ');
}

const Cell = ({
    sudoku_size, size, 
    value, notes, 
    y, x,
    highlighted, selected, status, bolded,
    onHover: [onMouseEnter, onMouseLeave],
    onClick
}: CellProps) => {

    return (
        <div className="flex items-center justify-center mx-0 dark:text-white"
            style={{
                width: `${size / 4}rem`,
                height: `${size / 4}rem`,
                fontSize: `${size / 8}rem`,
                lineHeight: `${size / 8}rem`,
                position: 'relative',
                userSelect: 'none',
                ...(!(highlighted || selected) ? undefined : {
                    backgroundColor: `rgba(0, 255, 255, ${selected ? 1 : 0.3}`,
                })
            }}
            {...{ onMouseEnter, onMouseLeave, onClick }}>
            
            <div>
                {
                    array(map(range(sudoku_size), y2 => (
                        <div key={y2} className="flex justify-center">
                            {
                                array(map(range(sudoku_size), x2 => {
                                    const idx = y2 * sudoku_size + x2;
                                    return (
                                        <div className={"border-black flex items-center mx-0 justify-center " + border_classes(y, x, y2, x2, sudoku_size)}
                                            style={{
                                                width: `${size / 4 / sudoku_size}rem`,
                                                height: `${size / 4 / sudoku_size}rem`,
                                                fontSize: `${size / 6 / sudoku_size + (bolded === notes[idx] ? 0.2 : 0)}rem`,
                                                lineHeight: `${size / 6 / sudoku_size}rem`,
                                                ...(
                                                    bolded === notes[idx]
                                                    ? { fontWeight: 1000 }
                                                    : {}
                                                )
                                            }}
                                            key={x2}>
                                            { value === undefined && notes[idx] }
                                        </div>
                                    )
                                }))
                            }
                        </div>
                    )))
                }
            </div>
            
            <div className="flex items-center justify-center" style={{
                position: 'absolute',
                width: `${size / 4}rem`,
                height: `${size / 4}rem`,
                ...(
                     status === 'given' 
                   ? { color: 'black' }
                   : status === 'correct'
                   ? {color: 'blue'}
                   : status === 'incorrect'
                   ? {color: 'red'}
                   : {}
                ),
                ...(
                    bolded === value
                  ? { fontWeight: 700 }
                  : {}
                )
            }}>
                {value}
            </div>

        </div>
    )

}

export default Cell;