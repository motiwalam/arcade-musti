import { Form, Header, Container } from "semantic-ui-react";
import { ReactNode, useEffect, useState } from "react";
import { Flip, toast, ToastContainer } from "react-toastify";
import Button from './Button';

interface TextValidatorProps {
    header: ReactNode;
    prompt: ReactNode;
    placeholder: string;
    validate: (x: string) => { success: boolean; error?: string }
    handleWin: () => void;
}

const TextValidator = ({
    header,
    prompt,
    validate,
    handleWin,
    placeholder
}: TextValidatorProps) => {
    const [input, setInput] = useState('');
    
    const [ won, setWon ] = useState(false);
    useEffect(() => { won && handleWin() }, [won, handleWin]);

    const handleSubmit = () => {
        const { success, error } = validate(input);
        if (success) {
            toast.success('Good job!', {
                onOpen: () => setWon(true)
            })
        } else {
            toast.error(error ?? 'incorrect!')
        }
    }

    return (    
        <Container>
            <Header as="h2" dividing>
                {header}
            </Header>
            <ToastContainer 
                position="top-center"
                autoClose={2000}
                transition={Flip}
                theme="colored"
            />
            {prompt}
            <div>
                <Form onSubmit={handleSubmit}>
                    <Form.Input
                        placeholder={placeholder}
                        onChange={(_, { value }) => setInput(value)} />
                    <Form.Field control={Button}>Submit</Form.Field>
                </Form>
            </div>
        </Container>
    )
}

export default TextValidator;