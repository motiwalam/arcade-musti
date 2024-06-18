import { useState } from "react";
import { Divider, Form, Icon } from "semantic-ui-react";
import { equals } from "../../../../util/array";
import { array, map, range, take } from "../../../../util/itertools";
import { promiseIn } from "../../../../util/promise";
import { arith_ops, Operator } from "../../../challenges/game24/operators";
import { solve } from "../../../challenges/game24/solve";
import { ConfigProps } from "../configs";

const randN = (n: number, l: number, u: number) => array(map(range(n), () => Math.floor(Math.random() * (u - l)) + l))

async function generate([n, l, u]: number[], t: number, ops: Operator[]): Promise<number[]> {
    let ns;
    while (take(1, solve(
        ns = randN(n, l, u),
        t, ops
    )).length === 0) {}
    return ns
}

const Game24Config = ({ config, setConfig }: ConfigProps<"game24">) => {
    const [n, setN] = useState(4);
    const [lower, setLower] = useState(1);
    const [upper, setUpper] = useState(10);

    const [random, setRandom] = useState(true);

    const regenerate = () => {
        if (!random) return;
        const ns = generate(
            [n, lower, upper], 
            config.target, 
            config.operators.map(s => arith_ops.filter(o => o.name === s)[0])
        );
        const timeout = promiseIn(5 * 1000, 'TIMED OUT' as const);
        
        Promise.race([ns, timeout])
        .then(r => {
            if (r === 'TIMED OUT') return
            setConfig(config => ({
                ...config,
                numbers: r
            }))
        })

    }


    const [listInput, setListInput] = useState(config.numbers.join(' '));
    const list = listInput.split(' ').filter(e => e).map(n => parseFloat(n));
    
    const setList = () => {
        if (list.every(n => typeof n === 'number' && !isNaN(n))) {
            setConfig({ ...config, numbers: list })
        }
    }

    return (
        <Form>
            <Form.Input
                type="number"
                label="Target value"
                value={config.target}
                min={1}
                onChange={(_, { value }) => {
                    const target = parseInt(value);
                    setConfig({ ...config, target: isNaN(target) ? 24 : target }); regenerate()
                }}
            />
            {
                random
                    ? (
                        <Form.Group widths="equal">
                            <Form.Input
                                type="number"
                                label="Number of numbers"
                                value={n}
                                min={1}
                                onChange={(_, { value }) => { setN(parseInt(value)); regenerate() }}
                            />
                            <Form.Input
                                type="number"
                                label="Lower bound for possible numbers"
                                value={lower}
                                onChange={(_, { value }) => { setLower(parseFloat(value)); regenerate() }}
                            />
                            <Form.Input
                                type="number"
                                label="Upper bound for possible numbers"
                                value={upper}
                                onChange={(_, { value }) => { setUpper(parseFloat(value)); regenerate() }}
                            />
                        </Form.Group>
                    )
                    : (
                        <Form.Input 
                            label="Numbers (space separated)"
                            type="text"
                            value={listInput}
                            onChange={(_, { value }) => { setListInput(value); setList() }}
                            icon={!equals(list, config.numbers) ? <Icon name="close" color="red" /> : undefined}
                        />
                    )
            }
            <Form.Dropdown
                label="Allowed operators"
                multiple
                value={config.operators}
                options={[..."+-*/^"].map(s => ({
                    text: s,
                    value: s
                }))}
                onChange={(_, { value }) => {
                    setConfig({ ...config, operators: value as string[] });
                    regenerate()
                }}
            />
            <Divider />
            <Form.Checkbox
                label="Generate randomly"
                checked={random}
                onChange={(_, { checked }) => { setRandom(!!checked); checked ? regenerate() : setList() }}
            />
            <Form.Dropdown
                label="Solutions to generate"
                selection
                value={config.solutions_to_calc}
                onChange={(_, { value }) => { setConfig({ ...config, solutions_to_calc: value as "all" | number }); regenerate() }}
                options={[
                    { text: "all", value: "all" },
                    { text: "1", value: 1 }
                ]}
            />

        </Form>
    )
}

export default Game24Config