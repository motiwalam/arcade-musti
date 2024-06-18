import { useEffect, useMemo, useState } from "react";
import { Flip, toast, ToastContainer } from "react-toastify";
import { Container, Header } from "semantic-ui-react";
import { ChallengeProps } from "../../../types";
import { swap } from "../../../util/array";
import { array, map, all, zip, range, concat } from "../../../util/itertools";
import { useLocalStorage } from "../../../util/storage";
import Cell from "./Cell";
import { generate, valid_neighbours } from "./fifteen";

function cell_size(width: number, height: number) {
    const m = Math.max(width, height);
    if (m <= 8) return 25;
    if (m <= 12) return 14
    if (m <= 20) return 9
    return 6
}

function is_complete(grid: number[]) {
    return all(
        map(
            zip(
                concat(range(1, grid.length), [0]),
                grid
            ),
            ([x, y]) => x === y
        )
    )
}

const FifteenChallenge = ({ challenge, handleWin, id }: ChallengeProps<"fifteen">) => {
    const { width, height } = challenge;

    const N = useMemo(() => width * height, [ width, height ])
    const csize = useMemo(() => cell_size(width, height), [ width, height ])

    const [ grid, setGrid ] = useLocalStorage(id, () => generate(width, height));

    const [ won, setWon ] = useState(false);
    useEffect(() => { won && handleWin() }, [won, handleWin]);

    if (!won && is_complete(grid)) {
        toast.success('Good job!', {
            onOpen: () => setWon(true)
        })
    }

    return (
        <Container>
            <Header as="h2" dividing>
                Game of {N - 1}!
            </Header>
            <ToastContainer
                position="top-center"
                autoClose={500}
                transition={Flip}
                theme="colored"
            />
            {
                array(map(range(height), y => (
                    <div key={y} className="flex justify-center">
                        {
                            array(map(range(width), x => {
                                const i = y * width + x;
                                const v = grid[i];
                                return (
                                    <Cell key={x} y={y} x={x}
                                          size={csize}
                                          onClick={() => {
                                            const blank_i = grid.findIndex(n => n === 0);
                                            if (!array(valid_neighbours(width, height, blank_i)).includes(i)) {
                                                // error out
                                                return
                                            }

                                            setGrid(swap(grid, i, blank_i))
                                          }}>
                                            {v !== 0 && v}
                                    </Cell>
                                )
                            }))
                        }
                    </div>
                )))
            }
        </Container>
    )
}

export default FifteenChallenge