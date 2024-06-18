import { CrosswordProvider, CrosswordGrid, DirectionClues } from "@jaredreisinger/react-crossword";
import { useEffect, useState } from "react";
import { Flip, toast, ToastContainer } from "react-toastify";
import { Container, Header } from "semantic-ui-react";
import { ChallengeProps } from "../../../types";

const CrosswordChallenge = ({ challenge, handleWin }: ChallengeProps<"crossword">) => {
    const { data } = challenge;

    const [won, setWon] = useState(false);
    useEffect(() => { won && handleWin() }, [won, handleWin]);

    return (
        <Container>
            <Header as="h2" dividing>
                Crossword
            </Header>
            <ToastContainer
                position="top-center"
                autoClose={500}
                transition={Flip}
                theme="colored"
            />
            <Container>

                <CrosswordProvider data={data}
                    onCrosswordCorrect={() => !won && toast.success('Good job!', {
                        onOpen: () => setWon(true)
                    })}
                    
                    theme={{
                        columnBreakpoint: '10000px'
                    }}>
                        <div style={{display: 'flex', gap: '2rem'}}>
                            <DirectionClues direction="across" />
                            <div style={{width: '55rem'}}>
                                <CrosswordGrid />
                            </div>
                            <DirectionClues direction="down" />
                        </div>
                    </CrosswordProvider>
            </Container>
        </Container>
    )
}

export default CrosswordChallenge;