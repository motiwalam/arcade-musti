import { map, range, array, deep_copy, scanl, windowed, concat, zip } from "../../../util/itertools";
import { useEffect, useMemo, useState } from "react";
import { Flip, toast, ToastContainer } from "react-toastify";
import { Button, Container, Header, Icon, List } from "semantic-ui-react";
import { ChallengeProps, Color, Games } from "../../../types";
import { equals, withElem } from "../../../util/array";
import Cell from "./Cell";
import { PipeStyle } from "./style";
import { useLocalStorage } from "../../../util/storage";
import Popup from '../../../util/components/Popup';

type Coord = [number, number];
type CellState = { color: Color, pipe_style: PipeStyle };
type LatestStyle = "left" | "right" | "up" | "down" | "terminal"
function valid_next_pos([y1, x1]: Coord, [y2, x2]: Coord) {
    const xdiff = Math.abs(x1 - x2);
    const ydiff = Math.abs(y1 - y2);

    return (xdiff === 1 && ydiff === 0) || (xdiff === 0 && ydiff === 1);
}

function style(last_style: LatestStyle, [y1, x1]: Coord, [y2, x2]: Coord): [PipeStyle, LatestStyle] {
    const style_for_current = (() => {
        if (y1 === y2) {
            return x1 < x2 ? 'right' : 'left'
        }
        return y1 < y2 ? 'down' : 'up'
    })();

    const style_for_old = ({
        left_left: "left",
        left_right: "right",
        left_up: "curb_top_right",
        left_down: "curb_bottom_right",

        right_left: "left",
        right_right: "right",
        right_up: "curb_top_left",
        right_down: "curb_bottom_left",

        up_left: "curb_bottom_left",
        up_right: "curb_bottom_right",
        up_up: "up",
        up_down: "down",

        down_left: "curb_top_left",
        down_right: "curb_top_right",
        down_up: "down",
        down_down: "down",

        terminal_left: "terminal_left",
        terminal_right: "terminal_right",
        terminal_up: "terminal_up",
        terminal_down: "terminal_down"

    } as const)[`${last_style}_${style_for_current}`] ?? 'empty'

    return [style_for_old, style_for_current]
}

function terminal_style(last_style: LatestStyle): PipeStyle {
    return ({
        left: "terminal_right",
        right: "terminal_left",
        down: "terminal_up",
        up: "terminal_down",
        terminal: "terminal"
    } as const)[last_style]
}

function* style_path(path: Coord[], color: Color): Generator<{ coord: Coord, style: PipeStyle, color: Color }> {
    const intermediate = array(scanl(
        windowed(2, path),
        { tentative_style: 'terminal', correct_style: '' },
        ({ tentative_style }, [c1, c2]) => {
            const [os, ns] = style(tentative_style as LatestStyle, c1, c2);
            return {
                correct_style: os,
                tentative_style: ns,
            }
        }
    )).slice(1);

    const end_style = terminal_style(intermediate.at(-1)?.tentative_style as LatestStyle);

    for (const [c, s] of zip(path, concat(map(intermediate, s => s.correct_style), [end_style]))) {
        yield {
            coord: c,
            style: s as PipeStyle,
            color
        }
    }

}

function path_exists(grid: Color[][], start: Coord, end: Coord, color: Color) {
    function _path_exists(visited: Coord[], grid: Color[][], [y1, x1]: Coord, [y2, x2]: Coord, color: Color): boolean {
        if (y1 < 0 || y1 >= grid.length || x1 < 0 || x1 >= grid[0].length) return false;
        if (grid[y1][x1] !== color) return false;
        if (visited.some(coord => equals(coord, [y1, x1]))) return false;

        if (y1 === y2 && x1 === x2) return true;
    
        const offsets = [[-1, 0], [1, 0], [0, 1], [0, -1]];
        return offsets.some(([yoff, xoff]) => {
            const new_start = [y1 + yoff, x1 + xoff] as Coord
            return _path_exists(
                visited.concat([[y1, x1]]),
                grid,
                new_start,
                [y2, x2],
                color
            )
        })
    }

    return _path_exists([], grid, start, end, color);
}


function is_complete(grid: Color[][], terminals: Games["flow"]["terminals"], background: Color) {
    // check all cells are filled
    if (!grid.flat().every(c => c !== background)) return false;
    return terminals.every(({ start, end, color }) => path_exists(grid, start, end, color))
}

function cell_size(width: number, height: number) {
    const m = Math.max(width, height);
    if (m <= 8) return 25
    if (m <= 11) return 18
    if (m <= 15) return 14
    if (m <= 20) return 12
    return 5
}

const FlowChallenge = ({ challenge, id, handleWin }: ChallengeProps<"flow">) => {
    const { width, height, terminals, solutions } = challenge;
    const terminal_points = useMemo(() => terminals.map(o => [o.start, o.end]).flat(), [terminals])
    
    const background: Color = 'white';
    const clear_grid = () => {
        const base: CellState[][] = Array(height).fill(0).map(() => Array(width).fill(0).map(() => ({color: background, pipe_style: "empty"})));
        for (const { start, end, color } of terminals) {
            for (const [y, x] of [start, end]) base[y][x] = { color, pipe_style: "terminal" }
        }
        
        return base;
    }
    const [ grid, setGrid ] = useLocalStorage(id, clear_grid())
    
    const setGridXY = (y: number, x: number, e: CellState) => {
        setGrid(grid => withElem(grid, y, withElem(grid[y], x, e)))
    }

    const [isMouseDown, setIsMouseDown] = useState(false);
    const [selectedColor, setSelectedColor] = useState<Color>(background);
    const [lastPos, setLastPos] = useState<[number, number]>()

    const [ won, setWon ] = useState(false);
    useEffect(() => { won && handleWin() }, [won, handleWin])

    if (!won && is_complete(grid.map(row => row.map(state => state.color)), terminals, background)) {
        toast.success('Good job!', {
            onOpen: () => setWon(true)
        })
    }

    return (
        <Container>
            <Header as="h2" dividing>
                Flow! &nbsp;
                <span>
                    <Popup trigger={<Icon name="question circle" />}>
                        <Popup.Header>How to play</Popup.Header>
                        <Popup.Content>
                            <List as="ol">
                                <List.Item as="li">Connect all dots of the same color so that no paths intersect and every cell is filled.</List.Item>
                                <List.Item as="li">Right click (or shift + left click) on a dot to reveal the correct path for that color.</List.Item>
                            </List>
                        </Popup.Content>
                    </Popup>
                </span>
            </Header>
            <ToastContainer
                position="top-center"
                autoClose={500}
                transition={Flip}
                theme="colored"
            />
            <Container>
                {array(map(range(height), y => (
                    <div key={y} className="flex justify-center">
                        {array(map(range(width), x => {
                            const is_terminal = terminal_points.some(coords => equals([y, x], coords));

                            return (
                                <Cell
                                    y={y} x={x}
                                    size={cell_size(width, height)}
                                    onMouseDown={() => {
                                        if (is_terminal || (!isMouseDown && grid[y][x].color !== background)) {
                                            if (is_terminal) {
                                                // clear all of the existing cells colored by the terminal color
                                                const terminal_color = grid[y][x].color;
                                                setGrid(grid.map((row, y) => (
                                                    row.map((state, x) => {
                                                        if (state.color !== terminal_color) return state;

                                                        if (terminal_points.some(coord => equals([y, x], coord))) {
                                                            return { ...grid[y][x], pipe_style: "terminal" }
                                                        }

                                                        return { color: background, pipe_style: "empty" }
                                                    })
                                                )));
                                            }
                                            setSelectedColor(grid[y][x].color)
                                        } else {
                                            setGridXY(y, x, { color: selectedColor, pipe_style: "empty" })
                                        };
                                        setLastPos([y, x]);
                                        setIsMouseDown(true);
                                    }}
                                    onMouseUp = {() => {
                                        setSelectedColor(background)
                                        setIsMouseDown(false);
                                    }}
                                    onMouseEnter={() => {
                                        if (isMouseDown && lastPos && valid_next_pos(lastPos, [y, x]) && selectedColor !== background) {
                                            const [ly, lx] = lastPos;
                                            const [style_for_last, style_for_current] = style(grid[ly][lx].pipe_style as LatestStyle, lastPos, [y, x]);
                                            if (!is_terminal) {
                                                setGridXY(ly, lx, { ...grid[ly][lx], pipe_style: style_for_last });
                                                setGridXY(y, x, { color: selectedColor, pipe_style: style_for_current });
                                                setLastPos([y, x]);
                                            } else {
                                                if (grid[y][x].color === selectedColor) {
                                                    setGridXY(ly, lx, { ...grid[ly][lx], pipe_style: style_for_last });
                                                    setGridXY(y, x, {
                                                        ...grid[y][x],
                                                        pipe_style: terminal_style(style_for_current)
                                                    })
                                                }
                                            }
                                        }
                                    }}
                                    onReveal={() => {
                                        if (!is_terminal) return;
                                        const gridCopy = deep_copy(grid);
                                        const {color} = gridCopy[y][x]
                                        const solution = solutions[color];

                                        for (const { coord: [y, x], style } of style_path(solution, color)) {
                                            gridCopy[y][x] = {
                                                color, pipe_style: style
                                            }
                                        }

                                        setGrid(gridCopy);
                                    }}
                                    key={x}
                                    terminal={is_terminal}
                                    {...grid[y][x]}
                                />
                            )
                        }))}
                    </div>
                )))}
            </Container>
            <Container textAlign="center" style={{marginTop: 5}}>
                <Button onClick={() => { setGrid(clear_grid); setWon(false) }}>
                    Clear
                </Button>
            </Container>
        </Container>
    )
}

export default FlowChallenge;