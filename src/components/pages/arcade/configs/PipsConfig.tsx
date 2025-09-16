import { useState } from "react"
import { Form } from "semantic-ui-react"
import { ConfigProps } from "../configs"
import { map, flat } from "../../../../util/itertools";
import { dateRange, DAY } from "../../../../util/date";
import { useLocalStorage } from "../../../../util/storage";
import { assoc } from "ramda";

const start = new Date('2025-08-18');
const end = new Date('2025-09-16');

const levels = Array.from(flat<string>(map(dateRange(start, end, DAY), date => ["easy", "medium", "hard"].map(diff => {
    const [year, month, day] = [date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()].map(x => `${x}`);
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}-${diff}`;
}))));


const PipsConfig = ({ setConfig, setOnWin }: ConfigProps<"pips">) => {
    const [ loading, setLoading ] = useState(false);
    const [completed, setCompleted] = useLocalStorage<Record<string, boolean>>("pips-completed-levels", {});

    return (
        <Form>
            <Form.Dropdown
                selection search 
                placeholder="Select Puzzle"
                options={levels.map(l => ({
                    text: `${l} ${completed[l] ? "✓" : ""}`,
                    value: l
                }))} 
                loading={loading} 
                onChange={(_, { value }) => {
                    setLoading(true);
                    
                    fetch(`pips-levels/${value}.json`)
                    .then(r => r.json())
                    .then(level => {
                        setConfig(level);
                        // this weird double function thing is because state setters can take a function or a value
                        // but we want to setOnWin to a function that calls setCompleted, so we need to wrap it in another function
                        setOnWin(() => () => {
                            setCompleted(assoc(`${value}`, true, completed));
                        });
                        setLoading(false);
                    })
                }}/>

        </Form>
    )
}

export default PipsConfig