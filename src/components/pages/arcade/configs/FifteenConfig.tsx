import { Form } from "semantic-ui-react"
import { ConfigProps } from "../configs"

const FifteenConfig = ({ setConfig, config }: ConfigProps<"fifteen">) => {
    return (
        <Form>
            <Form.Input 
                label="Width"
                type="number"
                min={1}
                value={config.width}
                onChange={(_, { value }) => setConfig({ ...config, width: Number(value) })}
            />
            <Form.Input 
                label="Height"
                type="number"
                min={1}
                value={config.height}
                onChange={(_, { value }) => setConfig({ ...config, height: Number(value) })}
            />
        </Form>
    )
}

export default FifteenConfig