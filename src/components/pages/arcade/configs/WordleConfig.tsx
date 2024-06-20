import { Form } from "semantic-ui-react"
import { ConfigProps } from "../configs"
import dictionary from '../../../../data/dictionary';
import { choose_random } from "../../../../util/array";
import { encode } from "../../../../util/coding";

function random_word(length: number) {
    const words = dictionary.filter(w => w.length === length);
    return encode(choose_random(words));
}

const WordleConfig = ({ setConfig, config }: ConfigProps<"wordle">) => {
    if (config.solution === undefined) {
        setConfig({...config, solution: random_word(config.wordlength)})
    }
    return (
        <Form>
            <Form.Input 
                label="Number of letters"
                type="number"
                min={1}
                value={config.wordlength}
                onChange={(_, { value }) => {
                    const num = Number(value);
                    setConfig({...config, wordlength: num, solution: random_word(num)});
                }}
            />
            <Form.Input 
                label="Number of guesses"
                type="number"
                min={1}
                value={config.tries}
                onChange={(_, { value }) => setConfig({...config, tries: Number(value)})}
            />
        </Form>
    )
}

export default WordleConfig