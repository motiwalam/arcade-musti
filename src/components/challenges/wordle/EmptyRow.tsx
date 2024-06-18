import Cell from './Cell';

export interface EmptyRowProps {
    solution: string;
}

const EmptyRow = ({ solution }: EmptyRowProps) => {
    const emptyCells = Array(solution.length).fill(null);
    return (
        <div className="flex justify-center mb-1">
            {emptyCells.map((_, i) => (<Cell key={i} />))}
        </div>
    )
}

export default EmptyRow;