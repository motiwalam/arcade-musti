import { useEffect, useMemo, useState } from "react";
import { Bounce, Flip, toast, ToastContainer, ToastOptions } from "react-toastify";
import { Button, Container, Divider, Form, Grid, Header, List, Segment } from "semantic-ui-react";
import { ChallengeProps } from "../../../types";
import dictionary from "../../../data/dictionary";
import { useLocalStorage } from "../../../util/storage";
import { counted_word } from "../../../util/words";
import UnfocusingButton from "../../../util/components/Button";

function histogram(word: string): Record<string, number> {
    const h: Record<string, number> = { };
    for (const c of word) {
        if (c in h) h[c]++;
        else        h[c] = 1;
    }
    return h;
}


function is_subset(h1: Record<string, number>, h2: Record<string, number>): boolean {
    return Object.entries(h1).every(([k, v]) => k in h2 && v <= h2[k])
}


function value(word: string): number {
    // a word's value is its length; but words longer than 6 characters count double
    return word.length + (word.length > 6 ? word.length : 0);
}


const AnagramChallenge = ({ challenge, id, handleWin}: ChallengeProps<"anagram">) => {
    const { letters, use_all, target_score, minlength } = challenge;
    const target_hist = useMemo(() => histogram(letters), [letters]);
    const [ gameState, setGameState ] = useLocalStorage(id, {
        score: 0, 
        guesses: [] as string[]
    });
    const { score, guesses } = gameState;
    const [ guess, setGuess ] = useState("");

    const [ won, setWon ] = useState(score >= target_score);
    useEffect(() => { won && handleWin() }, [won, handleWin]);
    if (!won && score >= target_score) {
        toast.success('Good job!', {
            onOpen: () => setWon(true)
        })
    }

    const handleSubmit = () => {
        if (guess === "") return;

        const toast_options: ToastOptions = { autoClose: 100, transition: Bounce, position: "top-right" };

        if (use_all && [...guess].sort().join('') !== [...letters].sort().join()) {
            return toast.error('you must use all the letters', toast_options)
        }

        if (!is_subset(histogram(guess), target_hist)) {
            return toast.error("you're using too many letters!", toast_options)
        }

        if (guesses.includes(guess)) {
            return toast.error('you already guessed that!', toast_options)
        }

        if (!dictionary.includes(guess)) {
            return toast.error("that word doesn't exist!", toast_options)
        }

        if (guess.length < minlength) {
            return toast.error('thats not enough letters!', toast_options)
        }
        
        toast.success(`nice! +${value(guess)}`, toast_options);

        setGameState({
            guesses: guesses.concat(guess),
            score: score + value(guess)
        });
    }

    return (
        <Container>
            <Header as="h2" dividing>
                Anagrams!
                <Header.Subheader>Get a score of {target_score} to win. {use_all ? 'You must use all the letters.' : `You must use at least ${counted_word(minlength, 'letter')}.`}</Header.Subheader>
            </Header>
            <ToastContainer 
                position="top-center"
                autoClose={2000}
                transition={Flip}
                theme="colored"
            />
            <Grid columns={15}>
                <Grid.Column width={3}>
                    <Segment compact>
                        <Header>Found words</Header>
                        <List>
                            {guesses.map((s, i) => (
                                <List.Item key={i}>{s}</List.Item>
                            ))}
                        </List>
                        <Button attached="bottom" onClick={() => { setGameState({guesses: [], score: 0}); setWon(false) }}>
                            Clear
                        </Button>
                    </Segment>
                </Grid.Column>
                <Grid.Column width={12}>
                    <Container style={{width: "fit-content"}} textAlign="center">
                        <Header as="h2">
                            {letters}
                            <Header.Subheader>
                                Score: {score}
                            </Header.Subheader>
                        </Header>
                        <Divider />
                        <Form onSubmit={handleSubmit}>
                            <Form.Input 
                                placeholder="enter your words here..." 
                                onChange={(_, { value }) => setGuess(value)}
                            />
                            <Form.Field control={UnfocusingButton}>Submit</Form.Field>
                        </Form>
                    </Container>
                </Grid.Column>
            </Grid>
        </Container>
    )
}

export default AnagramChallenge;