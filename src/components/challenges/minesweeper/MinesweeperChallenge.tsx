import { ReactNode, useEffect, useMemo, useState } from "react";
import { Flip, toast, ToastContainer } from "react-toastify";
import { Container, Header, Icon, List } from "semantic-ui-react";
import { ChallengeProps } from "../../../types";
import { equals, shuffle, withElem } from "../../../util/array";
import Popup from "../../../util/components/Popup";
import { array, deep_copy, filter, first, foldl, forEach, groupby, map, min, product, range } from "../../../util/itertools";
import { useLocalStorage } from "../../../util/storage";
import Cell from "./Cell";
import { BOMB } from "./data";
import { CellStatus } from "./status";
import Button from '../../../util/components/Button';
import { objectKeys } from "../../../util/object";

type CellState = { status: CellStatus, content: ReactNode }
type Grid = CellState[][];
type Coord = [number, number]

function cell_size(width: number, height: number) {
    const m = Math.max(width, height);
    if (m <= 8) return 20
    if (m <= 12) return 14
    if (m <= 20) return 9
    return 5
}

function initialize_grid(width: number, height: number, mines: number, forbidden: Coord[] = []): Grid {
    const grid: Grid = Array(height).fill(0).map(() => Array(width).fill(0).map(() => ({ status: 'blocked' as CellStatus, content: '' })));
    const bomb_indices = shuffle(array(
        filter(product(range(height), range(width)), coord => !forbidden.some(c => equals(coord, c)))
    )).slice(0, mines);
    bomb_indices.forEach(([y, x]) => { grid[y][x].content = BOMB });

    forEach(product(range(height), range(width)), ([y, x]) => {
        if (grid[y][x].content === BOMB) return;
        const neighbours = map(product(range(-1, 2), range(-1, 2)), ([yoff, xoff]) => grid[y + yoff]?.[x + xoff]);
        const neighbours_are_bombs = map(neighbours, x => Number(x?.content === BOMB));
        const bomb_count = foldl(neighbours_are_bombs, 0, (a, b) => a + b);
        grid[y][x].content = bomb_count
    });

    return grid;
}

function reveal_coordinate(y: number, x: number, grid: Grid) {
    if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return grid
    if (grid[y][x].status === 'revealed') return grid;

    grid[y][x].status = 'revealed';
    if (grid[y][x].content === 0) {
        forEach(product(range(-1, 2), range(-1, 2)), ([yoff, xoff]) => {
            if (yoff === 0 && xoff === 0) return;
            reveal_coordinate(y + yoff, x + xoff, grid);
        })
    }

    return grid;
}

function check_win(grid: Grid) {
    return grid.every(row => row.every(({ status, content }) => {
        return (content !== BOMB && status === 'revealed') || (content === BOMB && status === 'flagged')
    }))
}

const MinesweeperChallenge = ({ challenge, id, handleWin }: ChallengeProps<"minesweeper">) => {
    const { width, height, mines } = challenge;

    const [ grid, setGrid ] = useLocalStorage<Grid>(id, () => initialize_grid(width, height, mines));
    const [ gridStack, setGridStack ] = useState([grid]);
    const any_revealed = useMemo(() => grid.some(row => row.some(({ status }) => status === 'revealed')), [ grid ]);

    const [ won, setWon ] = useState(false);
    const [ lost, setLost ] = useState(false);

    const make_move = (move: 'flag' | 'reveal', y: number, x: number) => {
        if (lost) return;
        setGridStack([...gridStack, grid])
        switch (move) {
            case 'flag': {
                const { status } = grid[y][x];
                if (status !== 'revealed') {
                    const new_status = status === 'flagged' ? 'blocked' : 'flagged';
                    setGrid(grid => withElem(grid, y, withElem(grid[y], x, { ...grid[y][x], status: new_status })))
                }
            }; break

            case 'reveal': {
                if (grid[y][x].content === BOMB) {
                    if (any_revealed) {
                        toast.error("Oopsie! Looks like you'll have to try again");
                        setLost(true);
                    } else {
                        setGrid(initialize_grid(width, height, mines, [[y, x]]))
                    }
                }

                setGrid(grid => reveal_coordinate(y, x, deep_copy(grid)))
            }; break;
        }
    }

    const undo = () => {
        setGrid(gridStack.at(-1) ?? grid);
        setLost(false);
        setGridStack(gridStack.slice(0, -1));
    }

    const correct_mistakes = () => {
        setGrid(grid => grid.map(row => row.map(state => {
            if (state.status === 'flagged' && state.content !== BOMB) {
                return { ...state, status: 'blocked' }
            }
            return state;
        })))
    }

    const hint = () => {
        const o = groupby(
            filter(product(range(height), range(width)), ([y, x]) => {
                const { status } = grid[y][x];
                if (['revealed', 'flagged'].includes(status)) return false;
                return true;
            }), ([y, x]) => {
                const { content } = grid[y][x];
                if (content === BOMB) return 99;
                return Number(content);
            }
        );
        
        const n = Number(min(objectKeys(o)));
        if (!isNaN(n)) {
            if (n === 99) {
                make_move('flag', ...first(shuffle(o[n]))) 
            } else {
                make_move('reveal', ...first(shuffle(o[n]))) 
            }
        }
    }

    useEffect(() => { won && handleWin() }, [won, handleWin])

    if (!won && check_win(grid)) {
        toast.success('Good job!', {
            onOpen: () => setWon(true)
        })
    }

    const num_flagged = grid.flat().map(r => Number(r.status === 'flagged')).reduce((a, b) => a + b)
    
    return (
        <Container>
            <Header as="h2" dividing>
                Minesweeper! &nbsp;
                <span>
                    <Popup trigger={<Icon name="question circle" />}>
                        <Popup.Header>How to play</Popup.Header>
                        <Popup.Content>
                            <List as="ol">
                                <List.Item as="li">Left click 'reveals' a cell.</List.Item>
                                <List.Item as="li">Right click (or shift + left click) 'flags' a cell.</List.Item>
                                <List.Item as="li">A cell will contain either a mine or a number indicating how many mines occupy the surrounding eight cells.</List.Item>
                                <List.Item as="li">To win, reveal all the cells without a mine and flag all the cells with a mine.</List.Item>
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
            <Container textAlign="center">
                <Header as="h3">
                    Flagged {num_flagged}/{mines} mines
                </Header>
            </Container>
            <Container>
                {array(map(range(height), y => (
                    <div key={y} className="flex justify-center">
                        {array(map(range(width), x => (
                            
                            <Cell key={x} 
                                  size={cell_size(width, height)}
                                  onFlag={() => make_move('flag', y, x)}
                                  onReveal={() => make_move('reveal', y, x)}
                                  {...grid[y][x]}
                            />
                        )))}
                    </div>
                )))}
            </Container>
            <Container textAlign="center" style={{marginTop: 5}}>
                <Button.Group style={{ marginTop: 5 }}>
                    <Popup
                        content={lost ? 'Try again' : 'Reset'}
                        trigger={(
                            <Button 
                                onClick={() => {
                                    setGrid(() => initialize_grid(width, height, mines));
                                    setLost(false);
                                    setWon(false);
                                }} 
                                icon="refresh" 
                                color={lost ? 'red' : undefined}
                            />
                        )}
                    />
                    <Popup 
                        content="Undo"
                        trigger={<Button onClick={undo} icon="undo"></Button>} />
                    <Popup 
                        content="Correct mistakes"
                        trigger={<Button onClick={correct_mistakes} icon="clipboard check"></Button>} />
                    <Popup 
                        content="Hint"
                        trigger={<Button onClick={hint} icon="lightbulb"></Button>} />
                    
                </Button.Group>

            </Container>
        </Container>
    )
}

export default MinesweeperChallenge;