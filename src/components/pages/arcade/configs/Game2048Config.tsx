import { Form } from "semantic-ui-react";
import { ConfigProps } from "../configs";

const Game2048Config = ({ setConfig, config }: ConfigProps<"game2048">) => {
    return (
        <Form>
            <Form.Group widths="equal">
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
            </Form.Group>

            <Form.Input 
                label="Base (number of numbers before things merge)"
                type="number"
                min={2}
                value={config.base}
                onChange={(_, { value }) => setConfig({ ...config, base: Number(value) })}
            />

            <Form.Input
                label={`Target power: ${config.base} ^ ${config.target_power} = ${config.base ** config.target_power}`}
                type="number"
                min={1}
                value={config.target_power}
                onChange={(_, { value }) => setConfig({ ...config, target_power: Number(value) })} 
            />
        </Form>
    )
}

export default Game2048Config;