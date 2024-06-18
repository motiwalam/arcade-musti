import Cell from './Cell';

export interface CurrentRowProps {
    solution: string;
    guess: string;
}

const CurrentRow = ({ guess, solution }: CurrentRowProps) => {
    const splitGuess = guess.split("");
    const emptyCells = Array(solution.length - splitGuess.length).fill(null);

    return (
        <div className="flex justify-center mb-1">
            {splitGuess.map((l, i) => (<Cell key={i} value={l}/>))}
            {emptyCells.map((_, i) => (<Cell key={i} />))}
        </div>
    )
}

export default CurrentRow;