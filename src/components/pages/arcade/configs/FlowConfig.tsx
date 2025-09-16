import { useState } from "react"
import { Form } from "semantic-ui-react"
import { choose_random } from "../../../../util/array"
import { parse_flow_free_level } from "../../../challenges/flow/flow-level-specs"
import { ConfigProps } from "../configs"
import { useLocalStorage } from "../../../../util/storage"
import { assoc } from "ramda"

const levels = [
    '5x5',
    '5x6',
    '5x7',
    '5x8',
    '5x9',
    '5x10',
    '5x11',
    '6x6',
    '6x7',
    '6x8',
    '6x9',
    '6x10',
    '6x11',
    '6x12',
    '7x7',
    '7x8',
    '7x9',
    '7x10',
    '7x11',
    '7x12',
    '7x13',
    '8x8',
    '8x9',
    '8x10',
    '8x11',
    '8x12',
    '8x13',
    '8x14',
    '9x9',
    '9x10',
    '9x11',
    '9x12',
    '9x13',
    '9x14',
    '9x15',
    '10x10',
    '10x11',
    '10x12',
    '10x13',
    '10x14',
    '10x15',
    '11x11',
    '11x12',
    '11x13',
    '11x14',
    '11x15',
    '11x16',
    '12x12',
    '12x14',
    '12x15',
    '13x13',
    '13x15',
    '13x16',
    '14x14',
    '14x17',
    '15x15',
    '15x18'
]

const FlowConfig = ({ setConfig, setOnWin }: ConfigProps<"flow">) => {
    const [ loading, setLoading ] = useState(false);
    const [ completed, setCompleted ] = useLocalStorage<Record<string, boolean>>("flow-completed-levels", {});
    
    return (
        <Form>
            <Form.Dropdown
                selection search 
                placeholder="Select Size"
                options={levels.map(l => ({ text: `${l} ${completed[l] ? "✓" : ""}`, value: l }))}
                loading={loading}
                onChange={(_, { value }) => {
                    setLoading(true);
                    
                    fetch(`flow-levels/${value}.txt`)
                    .then(r => r.text())
                    .then(ls => {
                        const packs = ls.split('\n');
                        const level = choose_random(packs);
                        const [w, h] = (value as string).split('x');
                        setConfig(parse_flow_free_level(
                            level,
                            w === h ? 'square' : 'rectangle'
                        ));
                        setOnWin(() => () => {
                            setCompleted(assoc(`${value}`, true, completed));
                        });
                        setLoading(false);
                    })
                }}/>

        </Form>
    )
}

export default FlowConfig