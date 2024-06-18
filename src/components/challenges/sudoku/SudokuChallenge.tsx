import { useEffect, useMemo, useState } from "react";
import { Flip, toast, ToastContainer } from "react-toastify";
import { Container, Divider, Header, Icon, List } from "semantic-ui-react";
import { ChallengeProps, Games } from "../../../types";
import { equals, withElem } from "../../../util/array";
import { all, array, filter, first, flat, map, range } from "../../../util/itertools";
import Cell from "./Cell";
import Key from "./Key";
import { Status } from "./status";
import { coord_groups, solve_sudoku, visible_coords } from "./sudoku";
import useEventListener from "@use-it/event-listener";
import { clamp } from "../../../util/clamp";
import { create_sudoku } from './sudoku-gen'
import { useLocalStorage } from "../../../util/storage";
import { ValueError } from "../../../util/errors";
import Popup from "../../../util/components/Popup";

import { ReactComponent as NoteSVG } from '../../../data/svg/note.svg';
import { ReactComponent as LightbulbSVG } from '../../../data/svg/lightbulb.svg';
import { ReactComponent as TrashSVG } from '../../../data/svg/trash.svg';
import { ReactComponent as UndoSVG } from '../../../data/svg/undo.svg';

type CellState = {
    value?: number;
    highlighted?: boolean;
    selected?: boolean;
    status: Status;
    notes: (number | undefined)[];
}

type Grid = CellState[][];
type Coord = [number, number];

type Action = {
    coord: Coord;
} & (
    { action: 'value', value: number; prev_value?: number, affected_notes: Coord[] }
  | { action: 'note', idx: number; prev_value?: number }
  | { action: 'delete', value: Pick<CellState, "value" | "notes"> }
)

function cell_size(width: number, height: number) {
    const m = Math.max(width, height);
    if (m <= 8) return 25
    if (m <= 12) return 18
    if (m <= 20) return 12
    return 5
}

function initial_grid(sudoku_size: number, board: Games["sudoku"]["board"]): Grid {
    const grid_size = sudoku_size ** 2;
    const board_values = board === 'random' ? create_sudoku(sudoku_size) : board;
    const grid: Grid = Array(grid_size).fill(0).map((_, y) => Array(grid_size).fill(0).map((_, x) => {
        const v = board_values[y][x];
        return {
            value: v === 0 ? undefined : v,
            notes: Array(grid_size),
            status: v === 0 ? '' : 'given' as Status
        }
    }));

    return grid;
}

function is_complete(grid: Grid, size: number) {
    if (!grid.every(row => row.every(({ value }) => value !== undefined))) return;
    const ssize = size ** 2;
    return all(map(coord_groups(size), group => (new Set(map(group, ([y, x]) => grid[y][x].value)).size === ssize)))
}


function get_solution(grid: Grid, size: number) {
    try {
        return first(solve_sudoku([size, size], grid.map(row => row.map(({ value, status }) => {
            if (status === 'given' && value !== undefined) return value;
            return 0;
        }))))
    } catch (e) {
        throw new ValueError('no solution found')
    }
}

const SudokuChallenge = ({ challenge, id, handleWin }: ChallengeProps<"sudoku">) => {
    const { size, board } = challenge;
    const grid_size = size ** 2;
    const csize = cell_size(grid_size, grid_size);

    const [grid, setGrid] = useLocalStorage<Grid>(id, () => initial_grid(size, board));
    // eslint-disable-next-line
    const solution = useMemo(() => get_solution(grid, size), []);

    const [ undoStack, setUndoStack ] = useState<Action[]>([]);

    const setXY = (y: number, x: number, v: CellState | ((x: Grid) => CellState)) => setGrid(
        grid => withElem(grid, y, withElem(grid[y], x, v instanceof Function ? v(grid) : v))
    );

    const setPropXY = <K extends keyof CellState>(y: number, x: number, k: K, v: CellState[K]) => (
        setXY(y, x, grid => ({ ...grid[y][x], [k]: v }))
    );

    const setNoteXY = (y: number, x: number, v: number) => {
        const p = grid[y][x].notes[v - 1];
        const action: Action = {
            coord: [y, x],
            action: 'note',
            prev_value: p,
            idx: v - 1
        }
        const n = grid[y][x].notes.includes(v) ? undefined : v;
        setPropXY(y, x, 'notes', withElem(grid[y][x].notes, v - 1, n));
        setUndoStack([...undoStack, action])
    }
    
    const clearXY = (y: number, x: number) => {
        if (grid[y][x].status === 'given') return;
        const action: Action = {
            action: 'delete',
            coord: [y, x],
            value: { value: grid[y][x].value, notes: grid[y][x].notes }
        }
        setPropXY(y, x, 'value', undefined);
        setPropXY(y, x, 'notes', Array(grid_size));
        setUndoStack([...undoStack, action]);
    };

    const setValueXY = (y: number, x: number, v: number) => {
        if (grid[y][x].status === 'given') return;
        const val = grid[y][x].value === v ? undefined : v;
        const action: Action = {
            action: 'value',
            coord: [y, x],
            prev_value: grid[y][x].value,
            value: v,
            affected_notes: []
        }
        setPropXY(y, x, 'value', val);
        for (const [y1, x1] of visible_coords([y, x], size)) {
            if (grid[y1][x1].notes.includes(v)) action.affected_notes.push([y1, x1])
            setPropXY(y1, x1, 'notes', withElem(grid[y1][x1].notes, v - 1, undefined))
        }
        setUndoStack([...undoStack, action])
    }

    const revealXY = (y: number, x: number) => {
        setValueXY(y, x, solution[y][x]);
        setPropXY(y, x, 'status', 'given');
    }

    const undo = () => {
        if (undoStack.length === 0) return;
        const action = undoStack.at(-1) as Action;
        const [y, x] = action.coord;
        if (action.action === 'value') {
            setPropXY(y, x, 'value', action.prev_value);
            for (const [y, x] of action.affected_notes) {
                setPropXY(y, x, 'notes', withElem(grid[y][x].notes, action.value - 1, action.value))
            }

        } else if (action.action === 'delete') {
            setXY(y, x, grid => ({ ...grid[y][x], ...action.value }))

        } else if (action.action === 'note') {
            setPropXY(y, x, 'notes', withElem(grid[y][x].notes, action.idx, action.prev_value))
        }

        setUndoStack(undoStack.slice(0, -1));
    }

    const [selected, setSelected] = useState<Coord>();
    const visible = selected && array(visible_coords(selected, size));

    const [noteMode, setNoteMode] = useState(false);
    
    useEventListener('keydown', ({ key, code }: KeyboardEvent) => {
        if (key === 'Shift') setNoteMode(true);
        else if (key.toLowerCase() === 'u') { undo() }
        if (!selected) return;
        const [sy, sx] = selected;
        
        if (key.toLowerCase() === 'c' || key === 'Backspace') {
            clearXY(sy, sx)
        }
        else if (key.toLowerCase() === 'h') {
            revealXY(sy, sx)
        }
        else if (code.startsWith('Digit')) {
            const v = parseInt(code.slice('Digit'.length));
            if (v === 0 || v > grid_size) return;
            if (noteMode) {
                setNoteXY(sy, sx, v)
            } else {
                setValueXY(sy, sx, v);
            }
        }
        else if (key.startsWith('Arrow')) {
            const [yoff, xoff] = {
                'Left': [0, -1],
                'Right': [0, 1],
                'Up': [-1, 0],
                'Down': [1, 0]
            }[key.slice('Arrow'.length)] as number[];

            setSelected([clamp(sy + yoff, 0, grid_size - 1), clamp(sx + xoff, 0, grid_size - 1)])
        }
    })

    useEventListener('keyup', ({ key }: KeyboardEvent) => key === 'Shift' && setNoteMode(false));

    const [ won, setWon ] = useState(false);
    useEffect(() => { won && handleWin() }, [won, handleWin])
    if (!won && is_complete(grid, size)) {
        toast.success('Good job!', {
            onOpen: () => setWon(true)
        })
    }

    return (
        <Container>
            <Header as="h2" dividing>
                Sudoku! &nbsp;
                <span>
                    <Popup trigger={<Icon name="question circle" />}>
                        <Popup.Header>How to play</Popup.Header>
                        <Popup.Content>
                            <List as="ol">
                                <List.Item as="li">Each row, column, and {size}x{size} needs to contain the numbers from 1 to {grid_size} once and only once.</List.Item>
                                <List.Item as="li">Press 'h' or the hint button to reveal the correct value for a cell.</List.Item>
                                <List.Item as="li">Press and hold 'Shift' or click the note button to activate note mode.</List.Item>
                                <List.Item as="li">Press 'u' or click the undo button to undo your latest action.</List.Item>
                                <List.Item as="li">Press 'Backspace' or click the clear button to clear everything in a cell.</List.Item>
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
                {
                    array(map(range(grid_size), y => (
                        <div key={y} className="flex justify-center">
                            {
                                array(map(range(grid_size), x => {
                                    return (
                                        <Cell
                                            key={x}
                                            size={csize}
                                            sudoku_size={size}
                                            y={y} x={x}
                                            {...grid[y][x]}

                                            onHover={[
                                                () => setPropXY(y, x, 'highlighted', true),
                                                () => setPropXY(y, x, 'highlighted', false),
                                            ]}

                                            onClick={() => {
                                                setSelected([y, x]);
                                            }}

                                            selected={selected && equals(selected, [y, x])}
                                            highlighted={(visible && visible.some(c => equals(c, [y, x]))) || grid[y][x].highlighted}
                                            bolded={selected && grid[selected[0]][selected[1]].value}
                                            status={grid[y][x].status !== 'given' ? (() => {
                                                const { value } = grid[y][x];
                                                if (value === undefined) return '';
                                                if (value !== solution[y][x]) return 'incorrect';
                                                return 'correct'
                                            })() : 'given'}
                                        />
                                    )
                                }))
                            }
                        </div>
                    )))
                }

                <Divider />

                <div className="flex justify-center">
                    {
                        array(map(range(grid_size), i => {
                            const count = array(
                                filter(
                                    flat<number | undefined>(map(grid, row => map(row, s => s.value))),
                                    x => x === i + 1
                                )
                            ).length;

                            return (
                                <Key key={i} 
                                    size={csize}
                                    note_mode={noteMode}
                                    complete={count === grid_size}
                                    onClick={() => {
                                        if (!selected) return;
                                        const [sy, sx] = selected;
                                        if (noteMode) {
                                            setPropXY(sy, sx, 'notes', withElem(grid[sy][sx].notes, i, i + 1))
                                        } else {
                                            setValueXY(sy, sx, i + 1);
                                        }
                                    }}>
                                    {i + 1} <sub>({count})</sub>
                                </Key>
                            )
                        }))
                    }
                    <div
                    >

                        <div className="flex justify-center mb-1">
                            {/* note from feathericons.com */}
                            <Key size={(csize / 2) - 0.5} note_mode={noteMode} onClick={() => { setNoteMode(!noteMode) }}>
                                <NoteSVG />
                            </Key>
                            {/* lightbulb from https://github.com/feathericons/feather/issues/150 */}
                            <Key size={(csize / 2) - 0.5} note_mode={false} onClick={() => {
                                if (!selected) return;
                                revealXY(...selected)
                            }}>
                                <LightbulbSVG />
                            </Key>
                        </div>
                        <div className="flex justify-center mb-1">
                            {/* trash from feathericons.com */}
                            <Key size={(csize / 2) - 0.5} note_mode={false} onClick={() => {
                                if (!selected) return;
                                clearXY(...selected);
                            }}>
                                <TrashSVG />
                            </Key>
                            {/* undo from feathericons.com */}
                            <Key size={(csize / 2) - 0.5} note_mode={false} onClick={undo}>
                                <UndoSVG />
                            </Key>
                        </div>

                    </div>
                </div>
            </Container>

        </Container>
    )
}

export default SudokuChallenge;