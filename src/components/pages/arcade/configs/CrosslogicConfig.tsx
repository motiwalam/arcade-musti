import { useState } from "react"
import { Form } from "semantic-ui-react"
import { ConfigProps } from "../configs"

import { crosslogics } from "../../../../data/cross-logics"

const CrosslogicConfig = ({ setConfig }: ConfigProps<"crosslogic">) => {
    const [ loading, setLoading ] = useState(false);
    return (
        <Form>
            <Form.Dropdown
                selection search 
                placeholder="Select game"
                options={crosslogics.map((l, i) => ({ text: l.story ?? "CrossLogic", value: i }))} 
                loading={loading} 
                onChange={(_, { value }) => {
                    setConfig(crosslogics[value as number])
                }}/>

        </Form>
    )
}

export default CrosslogicConfig