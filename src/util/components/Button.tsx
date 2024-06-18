import { Button as SButton } from "semantic-ui-react";

const Button = ({ children, onClick, autoUnfocus = true, ...props }: SButton["props"] & { autoUnfocus?: boolean }) => {
    const handleClick: typeof onClick = (...args) => {
        // @ts-ignore
        if (autoUnfocus) document.activeElement?.blur();
        onClick && onClick(...args)
    }

    return (
        <SButton { ...props } onClick={handleClick}>{children}</SButton>
    )
}

Button.Or = SButton.Or;
Button.Group = SButton.Group;
Button.Content = SButton.Content;

export default Button