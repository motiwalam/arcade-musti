import { useState } from "react"
import { Form } from "semantic-ui-react"
import { ConfigProps } from "../configs"
import { map, flat } from "../../../../util/itertools";
import { dateRange, DAY } from "../../../../util/date";

const start = new Date('2025-08-18');
const end = new Date('2025-09-14');

const levels = Array.from(flat<string>(map(dateRange(start, end, DAY), date => ["easy", "medium", "hard"].map(diff => {
    const [year, month, day] = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()].map(x => `${x}`);
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}-${diff}`;
}))));


const PipsConfig = ({ setConfig }: ConfigProps<"pips">) => {
    const [ loading, setLoading ] = useState(false);
    return (
        <Form>
            <Form.Dropdown
                selection search 
                placeholder="Select Puzzle"
                options={levels.map(l => ({ text: l, value: l }))} 
                loading={loading} 
                onChange={(_, { value }) => {
                    setLoading(true);
                    
                    fetch(`pips-levels/${value}.json`)
                    .then(r => r.json())
                    .then(level => {
                        setConfig(level);
                        setLoading(false);
                    })
                }}/>

        </Form>
    )
}

export default PipsConfig