import { Form } from "semantic-ui-react"
import { ConfigProps } from "../configs"
import DICTS from '../../../../data/dictionary';
import { choose_random } from "../../../../util/array";
import { encode } from "../../../../util/coding";
import { LANGS, Lang } from "../../../../types/languages";

function random_word(length: number, language: Lang) {
    const words = DICTS[language].filter(w => w.length === length);
    return encode(choose_random(words));
}

const WordleConfig = ({ setConfig, config }: ConfigProps<"wordle">) => {
    if (config.solution === undefined) {
        setConfig({...config, solution: random_word(config.wordlength, config.language)})
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
                    setConfig({...config, wordlength: num, solution: random_word(num, config.language)});
                }}
            />
            <Form.Input 
                label="Number of guesses"
                type="number"
                min={1}
                value={config.tries}
                onChange={(_, { value }) => setConfig({...config, tries: Number(value)})}
            />
            <Form.Dropdown
                label="Language"
                selection search 
                value={config.language}
                options={LANGS.map(l => ({ text: l, value: l }))} 
                onChange={(_, { value }) => {
                        setConfig({...config, language: value as Lang, solution: random_word(config.wordlength, value as Lang)})
                    }
                }/>
        </Form>
    )
}

export default WordleConfig