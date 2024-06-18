import { useState } from "react";
import { Form } from "semantic-ui-react";
import { ConfigProps } from "../configs";
import { scramble as scramble_string } from "../../../../util/strings";

const AnagramConfig = ({ config, setConfig }: ConfigProps<"anagram">) => {
    const [ scramble, setScramble ] = useState(true);
    
    const transform: (x: string) => string = scramble ? scramble_string : x => x
    return (
        <Form>
            <Form.Input 
                type="text"
                label="Letters"
                // value={config.letters}
                onChange={(_, { value }) => setConfig({ ...config, letters: transform(value) }) }
            />
            <Form.Input 
                type="number"
                label="Target score"
                min={1}
                value={config.target_score}
                onChange={(_, { value }) => setConfig({ ...config, target_score: parseFloat(value) })}
            />
            <Form.Input 
                type="number"
                label="Minimum number of letters in a word"
                min={1}
                value={config.minlength}
                onChange={(_, { value }) => setConfig({ ...config, minlength: parseInt(value) })}
            />
            <Form.Group widths="equal">
                <Form.Checkbox 
                    label="Force use all letters"
                    checked={config.use_all}
                    onChange={(_, { checked }) => setConfig({ ...config, use_all: !!checked })}
                />
                <Form.Checkbox 
                    label="Scramble letters"
                    checked={scramble}
                    onChange={(_, { checked }) => setScramble(!!checked)}
                />
            </Form.Group>
        </Form>
    )
}


export default AnagramConfig