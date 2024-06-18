import useEventListener from "@use-it/event-listener";
import { useEffect, useState } from "react";
import { Flip, toast, ToastContainer } from "react-toastify";
import { Container, Divider, Header, Icon, List } from "semantic-ui-react";
import { ChallengeProps, Games } from "../../../types";
import { padLeft, padRight, shuffle, withElem } from "../../../util/array";
import Popup from '../../../util/components/Popup';
import { equals } from "../../../util/equality";
import { id } from "../../../util/functools";
import { all, any, array, chunked, filter, first, flat, forEach, grouped, map, product, range, reversed, take, transpose, zip } from "../../../util/itertools";
import Cell from "./Cell";
import { add, assoc, curry, dissoc, modify, repeat, map as Rmap, prop, compose } from 'ramda';
import { flow } from "../../../util/flow";
import Button from "../../../util/components/Button";
import { useLocalStorage } from "../../../util/storage";

import '../../../css/2048.css';

type CellState = {
    value: number;
    merged?: boolean;
}
type Grid = CellState[][];
type Dir = 'left' | 'right' | 'up' | 'down';

function cell(value = 0): CellState {
    return { value }
}

function initialize_grid({ width, height, base, target_power }: Games["game2048"]): Grid {
    const grid: Grid = Array(height).fill(null).map(() => Array(width).fill(0).map(cell));

    const p = Math.min(target_power, 2);
    const ns = Array(Math.min(base, width * height)).fill(null).map(() => (
        Math.random() < 0.1 ? p : 1
    ));
    
    const coords = take(ns.length, shuffle(array(product(range(height), range(width)))));

    forEach(zip(ns, coords), ([n, [y, x]]) => { grid[y][x].value = n });

    return grid;
}

const compress = curry((dir: Dir, grid: Grid): Grid => {
    const horiz = ['left', 'right'].includes(dir);
    const [ size, vects, reform ] = horiz
        ? [ grid[0].length, grid, id ]
        : [ grid.length, transpose(grid), transpose ]
    
    const padFn = (['left', 'up'].includes(dir) ? padRight : padLeft)(size,  cell())
    
    return reform(
        vects.map(v => padFn(v.filter(e => e.value !== 0)))
    )
})

const merge = curry((base: number, dir: Dir, grid: Grid): [number, Grid] => {
    // fuck it mutability it is
    let score = 0;
    const merge_vector = (v: CellState[]): CellState[] => {
        const groups = grouped(v, x => x.value);
        const chunks = flat<CellState[]>(map(groups, x => chunked(x, base)));
        const merged = map(
            chunks, 
            ns => {
                if (ns.length === base) {
                    if (ns[0].value !== 0) {
                        score += base ** (ns[0].value + 1)
                    }
                    if (ns[0].value === 0) return repeat(cell(), base);
                    return [
                        compose(
                            assoc('merged', true),
                            modify('value', add(1))
                        )(ns[0]),
                        ...repeat(cell(), base - 1)
                    ]
                }
                return ns;
            }
        );
        // @ts-ignore
        const r = array(flat<CellState>(merged))
        return r;
    }
    
    const [ vects, before, after, reform ] = ({
        left:  [ grid, id, id, id ],
        right: [ grid, reversed, reversed, id ],
        up:    [ transpose(grid), id, id, transpose ],
        down:  [ transpose(grid), reversed, reversed, transpose ]
    } as const)[dir];
    
    // @ts-ignore
    const r = reform(vects.map(v => after(merge_vector(before(v)))));
    // @ts-ignore
    return [score, r];
})

function check_win(grid: Grid, target: number): boolean {
    return any(map(flat<CellState>(grid), n => n.value === target))
}


function check_lost(grid: Grid, base: number): boolean {
    if (grid.some(row => row.some(n => n.value === 0))) return false;

    const f = (grid: Grid) => all(map(grid, v => all(map(grouped(v, c => c.value), c => c.length < base))));
    return f(grid) && f(transpose(grid))
}


const Game2048Challenge = ({ challenge, handleWin, id }: ChallengeProps<"game2048">) => {
    const { width, height, base, target_power } = challenge;
    const target = base ** target_power;

    const [ { grid, score }, setState ] = useLocalStorage(id, () => ({
        score: 0, grid: initialize_grid(challenge)
    }));

    const setGrid = (g: Grid | ((g: Grid) => Grid)) => setState(state => ({
        ...state, 
        grid: g instanceof Function ? g(state.grid) : g 
    }));

    const setGridYX = (y: number, x: number, e: CellState | ((g: Grid) => CellState)) => {
        setGrid(grid => withElem(grid, y, withElem(grid[y], x, e instanceof Function ? e(grid) : e)))
    }

    const setScore = (s: number | ((s: number) => number)) => setState(state => ({
        ...state,
        score: s instanceof Function ? s(state.score) : s
    }))

    const [ highScore, setHighScore ] = useLocalStorage(`${base},${target_power}-${width}x${height}`, 0);
    
    const [ gridStack, setGridStack ] = useState<Grid[]>([grid]);

    const [ lost, setLost ] = useState(() => check_lost(grid, base));

    const [ newPos, setNewPos ] = useState<[number, number]>();

    const [ won, setWon ] = useState(false);
    useEffect(() => { won && handleWin() }, [won, handleWin])
    if (!won && check_win(grid, target_power)) {
        toast.success('Good job!', {
            onOpen: () => setWon(true)
        })
    }

    const undo = () => {
        setGrid(gridStack.at(-2) ?? grid);
        setLost(false);
        setGridStack(gridStack.slice(0, -1));
    }

    const restart = () => {
        const grid = initialize_grid(challenge);
        setScore(0);
        setGrid(grid);
        setGridStack([grid]);
        setWon(false);
        setLost(false);
    }

    const move = (dir: Dir) => {

        const [move_score, new_grid] = flow(
            compress(dir),
            merge(base, dir),
            ([score, grid]) => [score, compress(dir, grid)]
        )(grid)
        
        if (!equals(grid.flat().map(prop('value')), new_grid.flat().map(prop('value')))) {
            const [y, x] = first(shuffle(array(
                filter(
                    product(range(height), range(width)),
                    ([y, x]) => new_grid[y][x].value === 0
                )
            )));

            if (y !== undefined && x !== undefined) {
                new_grid[y][x] = cell(Math.random() < 0.1 ? 2 : 1);
                setNewPos([y, x])
            }

            setGrid(new_grid);
            const new_score = score + move_score;
            setScore(new_score);
            if (new_score > highScore) setHighScore(new_score);
            setGridStack([...gridStack, new_grid]);
        }
        if (check_lost(new_grid, base)) {
            setLost(true);
            toast.error('Awh ponky :( Better luck next time!');
            return;
        }
    }

    useEventListener('keydown', ({ key }: KeyboardEvent) => {
        if (key === 'u') return undo();
        if (key === 'r') return restart();
        
        if (lost) return;

        const direction = ({
            ArrowLeft: 'left',
            ArrowRight: 'right',
            ArrowDown: 'down',
            ArrowUp: 'up'
        } as const)[key];
        
        direction && move(direction)
    });

    const spacing = 3.9 / (width + 1);
    const su      = 'vw'; // units for spacing
    const scss    = `${spacing}${su}`;
    return (
        <Container>
            <Header as="h2" dividing>
                { target }! &nbsp;
                <span>
                    <Popup trigger={<Icon name="question circle" />}>
                        <Popup.Header>How to play</Popup.Header>
                        <Popup.Content>
                            <List as="ol">
                                <List.Item as="li">Press the arrow keys to move everything in a certain direction. </List.Item>
                                <List.Item as="li">When { base } tiles with the same value line up, they will combine into one tile of greater value. </List.Item>
                                <List.Item as="li">The objective of this game is to obtain the number {target}.</List.Item>
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
            <div className="flex justify-center items-center">
                <div style={{ width: '22vw'  }}>
                    <div className="grid grid-cols-2 place-content-between m-0 p-0">
                        <p className="m-0 p-0" style={{ fontSize: '1.5rem' }}>
                            <b>Score: </b>
                            {score}
                        </p>
                        <p className="m-0 p-0" style={{ textAlign: 'right', fontSize: '1.5rem' }}>
                            <b>High score: </b>
                            {highScore}
                        </p>
                    </div>
                    <div className="rounded-lg" style={{
                        backgroundColor: '#bbada0',
                        padding: `${scss} ${scss}`,
                    }}>
                        <div style={{
                            display: 'grid',
                            width: '100%',
                            aspectRatio: `${width}/${height}`,
                            gridTemplateColumns: `repeat(${width}, calc( (100% - ${scss} * ${width - 1}) / ${width} ))`,
                            gridGap: `${scss}`,
                            userSelect: 'none',
                            position: 'relative'
                        }}>
                            {array(map(product(range(height), range(width)), ([y, x]) => {
                                const { value, merged } = grid[y][x];
                                const [ ny, nx ] = newPos ?? [];
                                return (
                                    <Cell key={`${y},${x}`}
                                        base={base}
                                        power={value}
                                        animation={(() => {
                                            if (y === ny && x === nx) {
                                                return {
                                                    end: () => setNewPos(undefined),
                                                    animprops: {
                                                        animationName: 'appear2048',
                                                        animationDuration: '200ms',
                                                        animationTimingFunction: 'ease',
                                                        animationDelay: '100ms',
                                                        animationFillMode: 'backwards'
                                                    }
                                                }
                                            }

                                            else if (merged) {
                                                return {
                                                    end: () => setGridYX(y, x, grid => assoc('merged', false, grid[y][x])),
                                                    animprops: {
                                                        animationName: 'pop2048',
                                                        animationDuration: '200ms',
                                                        animationTimingFunction: 'ease',
                                                        animationDelay: '100ms',
                                                        animationFillMode: 'backwards'
                                                    }
                                                }
                                            }
                                            return { animprops: {} }
                                        })()}                                        
                                    />
                                )
                            }))}
                        </div>
                    </div>
                    <Divider />
                    <Container style={{ width: '75%' }} textAlign="center" >
                        <Popup 
                            trigger={(
                                <Button 
                                    icon="undo" 
                                    floated="left"
                                    onClick={undo} 
                                />
                            )}
                            content="Undo (u)"
                        />
                        <Button.Group icon>
                            <Button icon="arrow left"  onClick={() => move('left')} />
                            <Button icon="arrow right" onClick={() => move('right')} />
                            <Button icon="arrow down"  onClick={() => move('down')} />
                            <Button icon="arrow up"    onClick={() => move('up')} />
                        </Button.Group>
                        <Popup 
                            trigger={(
                                <Button 
                                    icon="refresh" 
                                    floated="right" 
                                    color={ lost ? 'red' : undefined }
                                    onClick={restart}
                                />
                            )}
                            content="Restart (r)"
                        />
                    </Container>
                </div>
            </div>
        </Container>
    )
}

export default Game2048Challenge;