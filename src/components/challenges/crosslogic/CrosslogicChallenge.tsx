import { CSSProperties, useEffect, useRef, useState } from "react";
import { Container, Divider, Header, List, Segment } from "semantic-ui-react";
import Button from "../../../util/components/Button";
import { ChallengeProps, Color } from "../../../types";
import { withElem } from "../../../util/array";
import { array, flat, map, product, range, repeat, zip, concat, any, filter, take, all } from "../../../util/itertools";
import Cell from "./Cell";
import { CellStatus } from "./status";
import Checkbox from "react-custom-checkbox";
import * as Icons from 'react-icons/fi'
import { Flip, toast, ToastContainer } from "react-toastify";
import { flow } from "../../../util/flow";
import { equals, is_subset } from "../../../util/equality";
import FittedText from "../../../util/components/FittedText";
import Popup from "../../../util/components/Popup";
import { useLocalStorage } from "../../../util/storage";
const SHADES: readonly Color[] = ['#efefef', 'white'] as const;
const DISABLED = '#bbbbbb';

type GridItem = CellStatus
type Grid = GridItem[][]

const CrossLogicChallenge = ({ challenge, handleWin, id }: ChallengeProps<"crosslogic">) => {
    const { sets, clues, solution, story } = challenge;

    const columns = sets.slice(1);
    const rows = [sets[0], ...sets.slice(2).reverse()]

    const column_names = columns.map(([n]) => n);
    const row_names = rows.map(([n]) => n);

    const column_labels = array(flat<string>(map(columns, s => s[1])));
    const row_labels = array(flat<string>(map(rows, s => s[1])));

    const numsets = sets.length;
    const setsize = sets[0][1].length;
    const size = setsize * (numsets - 1);

    const default_grid = () => Array(size).fill(0).map(() => Array(size).fill('empty'));
    const [grid, setGrid] = useLocalStorage<Grid>(id, default_grid)
    const setGridYX = (y: number, x: number, e: GridItem | ((g: Grid) => GridItem)) => {
        setGrid(grid => {
            const v = e instanceof Function ? e(grid) : e;
            return withElem(grid, y, withElem(grid[y], x, v))
        })
    }

    const [checkedClues, setCheckedClues] = useState(() => Array(clues.length).fill(false));
    const hintToast = useRef<string | number>('');
    const [hintMode, _setHintMode] = useState(false);
    const setHintMode = (m: boolean) => {
        if (m) {
            hintToast.current = toast.info('Choose a cell', {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            });
        } else {
            toast.dismiss(hintToast.current)
        }

        _setHintMode(m)
    }

    const check_win = () => {
        const selected = flow(
            (grid: Grid) => take(setsize, grid),
            (grid: Grid) => grid.map((row, idx) => [row_labels[idx], ...row.map((s, i) => s === 'yes' ? column_labels[i] : null)]),
            (sel: (string | null)[][]) => sel.map(r => r.filter(s => s !== null)) as string[][]
        )(grid);

        if (selected.length !== setsize || !all(map(selected, row => row.length === numsets))) {
            return false;
        }

        return all(
            map(selected, selection => any(
                map(solution, soln => equals(selection, soln))
            ))
        )
    }

    const reveal = (y: number, x: number): CellStatus => {
        const selection = [row_labels[y], column_labels[x]];
        return any(map(solution, set => is_subset(selection, set))) ? 'yes' : 'no'
    }

    const rectify = (grid: Grid): Grid => {
        return grid.map((r, y) => r.map((s, x) => {
            if (s === 'empty') return s;
            if (s === reveal(y, x)) return s;
            return 'empty'
        }))
    }

    const [won, setWon] = useState(false);
    useEffect(() => { won && handleWin() }, [won, handleWin])
    if (!won && check_win()) {
        toast.success('Good job!', {
            onOpen: () => setWon(true)
        })
    }

    const size_p = 25;
    const size_c = (100 - size_p) / (1 + size);

    return (
        <Container>
            <Header as="h2" dividing>
                Cross Logic!
            </Header>
            <ToastContainer
                position="top-center"
                autoClose={500}
                transition={Flip}
                theme="colored"
            />
            <div className="flex justify-center items-center">
                <div style={{
                    width: '50%'
                }}>
                    <div style={{
                        display: 'grid',
                        width: '100%',
                        aspectRatio: '1/1',
                        gridTemplateColumns: `${size_c}% ${size_p}% repeat(${size}, ${size_c}%)`,
                        gridTemplateRows: `${size_c}% ${size_p}% repeat(${size}, ${size_c}%)`,
                        gridGap: '1px',
                        userSelect: 'none'
                    }}>
                        <div style={{
                            outline: '1.5px solid gray',
                            gridRow: `2 / span 1`,
                            gridColumn: `2 / span 1`
                        }}>
                            <img src="detective.jpeg" alt="detective" />
                        </div>

                        {column_names.map((n, i) => (
                            <div key={i} style={{
                                gridRow: `1 / span 1`,
                                gridColumn: `${3 + i * setsize} / span ${setsize}`,
                                textAlign: 'center',
                                fontWeight: 'bold'
                            }}>
                                {n}
                            </div>
                        ))}

                        {row_names.map((n, i) => (
                            <div key={i} style={{
                                gridRow: `${3 + i * setsize} / span ${setsize}`,
                                gridColumn: `1 / span 1`,
                                fontWeight: 'bold'
                            }}>
                                <div style={{
                                    position: 'relative',
                                    width: '100%', height: '100%',
                                }} key={i}>
                                    <div style={{
                                        position: 'absolute',
                                        transformOrigin: 'top left',
                                        left: '0',
                                        top: '50%',
                                        transform: 'rotate(-90deg) translateX(-50%)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {n}
                                    </div>

                                </div>
                            </div>
                        ))}

                        {column_labels.map((l, i) => (
                            <div style={{
                                outline: '1px solid gray',
                                backgroundColor: SHADES[(Math.floor(i / setsize)) % 2],
                                gridColumn: `${i + 3} / span 1`,
                                gridRow: `2 / span 1`
                            }} key={i}>
                                <div style={{
                                    position: 'relative',
                                    width: '100%', height: '100%',
                                }} key={i} id={`column${i}`}>
                                    <div style={{
                                        position: 'absolute',
                                        transformOrigin: 'bottom left',
                                        left: '50%',
                                        bottom: '0',
                                        transform: 'rotate(-90deg) translateY(50%)',
                                        paddingLeft: '10%',
                                    }}>
                                        <FittedText
                                            text={l}
                                            parent={`column${i}`}
                                            new_state={(s, p) => ({ fontSize: s.fontSize - 1, width: p.height - 5 })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {row_labels.map((l, i) => (
                            <div style={{
                                outline: '1px solid gray',
                                backgroundColor: SHADES[(Math.floor(i / setsize)) % 2],
                                gridColumn: `2 / span 1`,
                                gridRow: `${i + 3} / span 1`
                            }} key={i}>
                                <div style={{
                                    textAlign: 'right',
                                    position: 'relative',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    paddingRight: '5%',
                                    width: '100%',
                                    height: '100%'
                                }}>
                                    <FittedText text={l} />
                                </div>
                            </div>
                        ))}

                        {/* GRID */}
                        {array(map(product(range(size), range(size)), ([y, x]) => {
                            const key = `${y},${x}`;
                            const style = {
                                gridRow: `${3 + y} / span 1`,
                                gridColumn: `${3 + x} / span 1`
                            }

                            if (x < size - Math.floor(y / setsize) * setsize) {
                                const sees_yes = (() => {
                                    const basex = setsize * Math.floor(x / setsize);
                                    const basey = setsize * Math.floor(y / setsize);

                                    const coords = filter(concat(
                                        zip(repeat(y, setsize), range(basex, basex + setsize)),
                                        zip(range(basey, basey + setsize), repeat(x, setsize))
                                    ), ([yy, xx]) => yy !== y || xx !== x);

                                    return any(map(coords, ([y, x]) => grid[y][x] === 'yes'));
                                })();

                                const status = (() => {
                                    const s = grid[y][x];
                                    if (s !== 'empty') return s;

                                    return sees_yes ? 'nopassive' : 'empty';
                                })()
                                const disabled = status !== 'empty' && hintMode;
                                const color = disabled
                                    ? DISABLED
                                    : SHADES[(1 + Math.floor(y / setsize) + Math.floor(x / setsize)) % 2];

                                return <Cell key={key}
                                    status={status}
                                    color={color}
                                    onClick={() => {
                                        if (hintMode) {
                                            if (disabled) return;
                                            setGridYX(y, x, reveal(y, x));
                                            setHintMode(false)
                                            return;
                                        }
                                        if (status === 'nopassive') return status;

                                        const current = grid[y][x];
                                        const new_s = ({
                                            empty: 'no',
                                            no: 'yes',
                                            yes: 'empty',
                                            nopassive: 'nopassive'
                                        } as const)[current];

                                        if (new_s === 'yes' && sees_yes) return

                                        setGridYX(y, x, new_s);
                                    }}
                                    style={style}
                                />
                            }
                            return <div key={key} style={style}></div>
                        }))}
                    </div>
                    <Divider />
                    <Segment style={{
                        backgroundColor: '#d0c5f0',
                        padding: '2% 2%',
                        maxHeight: '25vh',
                        overflow: 'scroll',
                        position: 'relative'
                    } as CSSProperties}>
                        {story !== undefined && (
                            <>
                                <Header as="h4">Story</Header>
                                <p>{story}</p>
                            </>
                        )}
                        <Header as="h4">Clues</Header>
                        <List divided relaxed="very">
                            {clues.map((s, i) => (
                                <List.Item key={i} >
                                    <Checkbox
                                        className="cursor-pointer"
                                        checked={checkedClues[i]}
                                        icon={
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flex: 1,
                                                    backgroundColor: "#249010",
                                                    alignSelf: "stretch",
                                                }}
                                            >
                                                <Icons.FiCheck color="white" size={20} />
                                            </div>
                                        }
                                        borderColor={checkedClues[i] ? '#249010' : "#987f57"}
                                        borderRadius={20}
                                        style={{ overflow: "hidden" }}
                                        size={20}
                                        label={s}
                                        labelStyle={{
                                            marginLeft: 5,
                                            color: checkedClues[i] ? '#987f57' : 'black'
                                        }}
                                        onChange={(checked: boolean) => setCheckedClues(withElem(checkedClues, i, checked))}
                                    />
                                </List.Item>
                            ))}
                        </List>
                        <div style={{
                            position: 'absolute',
                            top: `2%`,
                            right: 0
                        }}>
                            <Popup
                                content="Hint"
                                trigger={(
                                    <Button
                                        circular
                                        color={hintMode ? 'red' : undefined}
                                        icon={hintMode ? "cancel" : "search"}
                                        onClick={() => setHintMode(!hintMode)}
                                    />
                                )}
                            />

                            <Popup
                                content="Correct mistakes"
                                trigger={(
                                    <Button
                                        circular
                                        icon="clipboard check"
                                        onClick={() => setGrid(rectify(grid))}
                                    />
                                )}
                            />

                            <Popup
                                content="Restart"
                                trigger={(
                                    <Button
                                        circular
                                        icon="redo"
                                        onClick={() => setGrid(default_grid())}
                                    />
                                )}
                            />


                        </div>
                    </Segment>
                </div>
            </div>
        </Container>
    )
}

export default CrossLogicChallenge;