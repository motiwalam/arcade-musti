import { Games, ChallengeProps } from "../../../types";
import { Header, Button, Modal, List } from "semantic-ui-react";

import BigEval from "bigeval";
import { sorted } from "../../../util/array";
import { useState } from "react";
import TextValidator from "../../../util/components/TextValidator";
import { array, take, zip, map, all } from "../../../util/itertools";
import { solve } from "./solve";
import { arith_ops } from "./operators";
import { Node } from "./trees";
import { counted_word } from "../../../util/words";
import Popup from '../../../util/components/Popup';

type Game24 = Games["game24"];

const calculator = new BigEval();

function tree_match(compiled: any, game: Game24) {
    function count_tree(compiled: any, counts: {
        numbers: number[],
        operators: string[],
        functions: string[]
    }) {
        if (compiled === undefined) return;
        if (compiled.type === '#') {
            counts.numbers.push(parseFloat(compiled.value))
        }
        else if (compiled.type === '*') {
            counts.operators.push(compiled.value);
            count_tree(compiled.left, counts);
            count_tree(compiled.right, counts);
        }
        else if (compiled.type === 'f') {
            counts.functions.push(compiled.value);
            for (const t of compiled.args) {
                count_tree(t, counts)
            }
        }
    }

    const counts = {
        numbers: [] as number[],
        operators: [] as string[],
        functions: [] as string[]
    };

    count_tree(compiled, counts);

    // no functions allowed
    if (counts.functions.length > 0) {
        return {
            success: false,
            error: `You are not allowed to use functions! You used: ${counts.functions.join(', ')}`
        }
    };
    // check only used allowed operators
    if (!counts.operators.every(o => game.operators.includes(o))) {
        return {
            success: false,
            error: `You are not allowed to use the operators: ${counts.operators.filter(o => !game.operators.includes(o)).join(', ')}`
        }
    }
    // check used the correct number of numbers
    if (counts.numbers.length !== game.numbers.length) {
        return {
            success: false,
            error: `You have to use all of the numbers!`
        }
    }
    // check all numbers used
    if (!all(map(zip(sorted(counts.numbers), sorted(game.numbers)), ([a, b]) => a === b))) {
        return {
            success: false,
            error: `You have to use all of the numbers`
        }
    };

    return { success: true, error: '' };
}

function conforms(expression: string, game: Game24) {
    try {
        const compiled = calculator.compile(expression);
        const result = parseFloat(calculator.exec(expression));

        if (result !== game.target) {
            return {
                success: false,
                error: `That equals ${result}, not ${game.target}!`
            }
        };
        return tree_match(compiled, game);
    } catch (err) {
        return {
            success: false, error: "eugh! could not compute :("
        }
    }
}

function format_numbers(numbers: number[]) {
    return (<code>{numbers.join(',')}</code>)
}

function format_operators(operators: string[]) {
    return (<code>{operators.map(o => `${o}`).join(',')}</code>)
}

const Game24Challenge = ({ challenge, handleWin }: ChallengeProps<"game24">) => {
    const { numbers, target, operators, solutions_to_calc = 'all' } = challenge;

    const [loading, setLoading] = useState(false);
    const [solns, setSolns] = useState<string[]>();
    const [disabled, setDisabled] = useState(solutions_to_calc === 0);
    const [showingSolns, setShowingSolns] = useState(false);

    const solutions_button = (
        <Button color="yellow"
            disabled={disabled}
            style={{ marginTop: 10 }}
            loading={loading}
            onClick={() => {
                if (solns !== undefined) {
                    setShowingSolns(true)
                } else {
                    setLoading(true);
                    (async () => {
                        const transform: (x: Generator<Node>) => Iterable<Node>
                            = solutions_to_calc === 'all' || solutions_to_calc === 0 ? x => x : x => take(solutions_to_calc, x)
                        const solns = array(new Set(map(transform(solve(numbers, target, arith_ops.filter(o => operators.includes(o.name)))), String)));
                        setSolns(solns);
                        setLoading(false);
                        setShowingSolns(true)
                    })()
                }
            }}>
            Show solutions
        </Button>
    )

    return (
        <>
            <TextValidator
                header={`Game of ${target}!`}
                prompt={(
                    <Header as="h4" style={{ marginTop: 0 }}>
                        Use the numbers
                        &nbsp; {format_numbers(numbers)} &nbsp;
                        and the operators
                        &nbsp; {format_operators(operators)} &nbsp;
                        to make the number <code>{target}</code>
                    </Header>
                )}
                validate={input => conforms(input, challenge)}
                handleWin={() => { setDisabled(false); handleWin() }}
                placeholder="enter your solution here..."
            />

            {
                disabled 
                ? (
                    <Popup 
                        trigger={<div style={{ width: 'fit-content', height: 'fit-content' }}>{solutions_button}</div>}
                        content="No cheating for you, hehe"
                    />
                )
                : solutions_button
            }

            <Modal dimmer="blurring" open={showingSolns && solns !== undefined} onClose={() => setShowingSolns(false)}>
                <Modal.Header>
                    Showing {counted_word(solns?.length ?? 0, 'solution')}
                </Modal.Header>
                <Modal.Content scrolling>
                    <List>
                        {solns?.map(s => (<List.Item><code>{s}</code></List.Item>))}
                    </List>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={() => setShowingSolns(false)}> Close </Button>
                </Modal.Actions>
            </Modal>
        </>
    )
}

export default Game24Challenge;