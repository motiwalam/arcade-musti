import Cell from './Cell';
import { getGuessStatuses } from './statuses';

export interface CompletedRowProps {
    solution: string;
    guess: string;
}

const CompletedRow = ({ solution, guess }: CompletedRowProps) => {
    const statuses = getGuessStatuses(solution, guess);
    const splitGuess = guess.split("");
    return (
        <div className="flex justify-center mb-1">
            {splitGuess.map((l, i) => (
                <Cell 
                    key={i}
                    value={l}
                    status={statuses[i]}
                />
            ))}
        </div>
    )
}

export default CompletedRow;
