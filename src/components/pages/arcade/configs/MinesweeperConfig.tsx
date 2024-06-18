import { Form } from "semantic-ui-react"
import { ConfigProps } from "../configs"

const MinesweeperConfig = ({ setConfig, config }: ConfigProps<"minesweeper">) => {
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
            <Form.Input
                label="Number of mines"
                type="number"
                min={0}
                value={config.mines}
                onChange={(_, { value }) => setConfig({ ...config, mines: Number(value) })}
            />
        </Form>
    )
}

export default MinesweeperConfig