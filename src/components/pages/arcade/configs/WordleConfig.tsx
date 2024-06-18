import { Form } from "semantic-ui-react"
import { ConfigProps } from "../configs"

const WordleConfig = ({ setConfig, config }: ConfigProps<"wordle">) => {
    return (
        <Form>
            <Form.Input 
                label="Number of letters"
                type="number"
                min={1}
                value={config.word}
                onChange={(_, { value }) => setConfig({...config, word: Number(value)})}
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