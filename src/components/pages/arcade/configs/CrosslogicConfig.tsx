import { useState } from "react"
import { Form } from "semantic-ui-react"
import { ConfigProps } from "../configs"

import { crosslogics } from "../../../../data/cross-logics"
import { useLocalStorage } from "../../../../util/storage"
import { assoc } from "ramda"

const CrosslogicConfig = ({ setConfig, setOnWin }: ConfigProps<"crosslogic">) => {
    const [ loading, setLoading ] = useState(false);
    const [ completed, setCompleted ] = useLocalStorage<Record<string, boolean>>("crosslogic-completed-levels", {});
    return (
        <Form>
            <Form.Dropdown
                selection search 
                placeholder="Select game"
                options={crosslogics.map((l, i) => ({ text: `${l.story ?? "CrossLogic"} ${completed[i] ? "✓" : ""}`, value: i }))} 
                loading={loading} 
                onChange={(_, { value }) => {
                    setConfig(crosslogics[value as number])
                    setOnWin(() => () => {
                        setCompleted(assoc(`${value}`, true, completed));
                    });
                }}/>

        </Form>
    )
}

export default CrosslogicConfig