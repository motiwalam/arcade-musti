import { Form } from "semantic-ui-react"
import { ConfigProps } from "../configs"

const SudokuConfig = ({ setConfig, config }: ConfigProps<"sudoku">) => {
    return (
        <Form>
            <Form.Input 
                label="Size"
                type="number"
                value={config.size}
                min={1}
                max={5}
                onChange={(_, { value }) => setConfig({...config, size: Number(value)})}
            />
        </Form>
    )
}

export default SudokuConfig