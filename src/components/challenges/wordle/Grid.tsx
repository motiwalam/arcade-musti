import CompletedRow from './CompletedRow';
import CurrentRow from './CurrentRow';
import EmptyRow from './EmptyRow';

export interface GridProps {
    solution: string;
    guesses: string[];
    currentGuess: string;
    maxGuesses: number;
}

const Grid = ({ solution, guesses, currentGuess, maxGuesses }: GridProps) => {
    const empties = maxGuesses === 0 ? [] :
                    guesses.length >= maxGuesses - 1 ? [] :
                    Array(maxGuesses - 1 - guesses.length).fill(null);
    return(
        <>
            {guesses.map((guess, i) => (
                <CompletedRow 
                    key={i}
                    solution={solution}
                    guess={guess}
                />
            ))}
            {(maxGuesses === 0 || guesses.length < maxGuesses) && (
                <CurrentRow guess={currentGuess} solution={solution} />
            )}
            {empties.map((_, i) => (<EmptyRow key={i} solution={solution} />))}
        </>
    )
}

export default Grid;