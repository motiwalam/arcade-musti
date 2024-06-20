import Keyboard, { KeyboardButtonTheme } from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import '../../../css/Wordle.css';
import { Button, Container, Divider, Header, Modal } from "semantic-ui-react";
import { ToastContainer, Flip, toast } from 'react-toastify';
import { ChallengeProps } from "../../../types";
import Grid from "./Grid";
import dictionary from '../../../data/dictionary';
import { useEffect, useMemo, useState } from "react";
import useEventListener from "@use-it/event-listener";
import { useLocalStorage } from "../../../util/storage";
import { CharStatus, getGuessStatuses } from "./statuses";
import { zip } from "itertools";
import { choose_random } from "../../../util/array";
import { decode } from "../../../util/coding";

const layout = {
    default: [
        'q w e r t y u i o p',
        'a s d f g h j k l',
        '{enter} z x c v b n m {bksp}'
    ]
}

const display = {
    '{enter}': 'enter',
    '{bksp}': 'backspace'
}

function random_word(length: number) {
    const words = dictionary.filter(w => w.length === length);
    return choose_random(words)
}

const WordleChallenge = ({ challenge, id, handleWin }: ChallengeProps<"wordle">) => {
    const { wordlength, tries, solution } = challenge;

    const [ soln, setSoln ] = useState(solution === undefined ? random_word(wordlength) : decode(solution));
    const [ guesses, setGuesses ] = useLocalStorage<string[]>(id, []);
    const [ currentGuess, setCurrentGuess ] = useState("");
    const [ failed, setFailed ] = useState(false);
    const [ won, setWon ] = useState(false);

    const buttonTheme = useMemo<KeyboardButtonTheme[]>(() => {
        // get status for each character in each guess
        // take the priority
        const charStatuses = guesses.flatMap(guess => zip(guess, getGuessStatuses(soln, guess)));
        const statusMap: Record<string, CharStatus> = {};
        for (const [c, s] of charStatuses) {
            if (statusMap[c] === 'correct') continue;
            if (statusMap[c] === 'present' && s !== 'correct') continue;
            statusMap[c] = s;
        }
        return Object.entries(statusMap).map(([c, s]) => (
            {
                class: "hg-" + s,
                buttons: c
            }
        ));
    }, [soln, guesses]);

    useEffect(() => { won && handleWin() }, [won, handleWin])

    const handleKeyPress = (key: string) => {
        if (key === '{enter}') {
            if (won) return;
            // no more guesses left
            if (tries > 0 && guesses.length >= tries) return;

            if (currentGuess.length !== soln.length) {
                return toast.error('Not enough letters');
            }

            if (!dictionary.includes(currentGuess)) {
                return toast.error('Invalid guess')
            }

            setGuesses(guesses.concat(currentGuess));
            setCurrentGuess('');

            if (currentGuess === soln) {
                toast.success('Good job!', {
                    autoClose: 2000,
                    onOpen: () => setWon(true)
                });
                return;
            }

            // last guess and did not win
            if (guesses.length === tries - 1) {
                setFailed(true);
            }

        } else if (key === '{bksp}') {
            setCurrentGuess(currentGuess.slice(0, -1));
        } else {
            setCurrentGuess((currentGuess + key).slice(0, soln.length));
        }
    }

    useEventListener('keydown', (({ key }: KeyboardEvent) => {
        if (key === 'Backspace') return handleKeyPress('{bksp}');
        if (key === 'Enter') return handleKeyPress('{enter}');
        if ("abcdefghijklmnopqrstuvwxyz".includes(key)) return handleKeyPress(key);
    }))

    return (
        <Container>
            <Header as="h2">
                Wordle!
                <Header.Subheader>
                    Guess the {solution === undefined ? '(random)' : ''} word{
                        tries === 0 ? '! You have unlimited tries!' : ` in ${tries} tries!`
                    }
                </Header.Subheader>
            </Header>
            <Divider />
            <ToastContainer 
                position="top-center"
                autoClose={500}
                transition={Flip}
                theme="colored"
            />
            <Grid solution={soln} guesses={guesses} currentGuess={currentGuess} maxGuesses={tries}/>
            <Divider />
            <Keyboard onKeyPress={handleKeyPress} layout={layout} display={display} buttonTheme={buttonTheme}/>

            {failed && (
                <Modal open>
                    <Modal.Header>Aw :( Better luck next time!</Modal.Header>
                    <Modal.Content>
                        <p>You didn't get it in the required number of tries :(</p>
                        <p>Do you wanna try again?</p>
                        <p>P.S: the word was {soln}.</p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button 
                          onClick={() => setFailed(false)}
                          negative>
                            Later
                        </Button>
                        <Button
                          onClick={() => {
                              setGuesses([]);
                              setCurrentGuess("");
                              setFailed(false);
                              setSoln(solution === undefined ? random_word(wordlength) : solution)
                          }}
                          positive>
                            Yes
                        </Button>
                    </Modal.Actions>
                </Modal>
            )}
        </Container>
    )
}

export default WordleChallenge;