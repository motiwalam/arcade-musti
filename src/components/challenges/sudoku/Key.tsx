import classnames from 'classnames';
import { ReactNode } from 'react';

interface KeyProps {
    size: number;
    note_mode: boolean;
    children: ReactNode;
    onClick: () => void;
    complete?: boolean;
}
const Key = ({
    size,
    note_mode, complete,
    children,
    onClick
}: KeyProps) => {
    const classes = classnames(
        'flex items-center justify-center mx-1 border-black border-solid border-2',
        {
            'hover:bg-slate-400 bg-slate-200': note_mode,
            'hover:bg-cyan-400': !note_mode,
            'bg-zinc-500': !!complete
        }
    );

    return (
        <div className={classes}
            style={{
                width: `${size / 4}rem`,
                height: `${size / 4}rem`,
                fontSize: `${size / 8}rem`,
                lineHeight: `${size / 8}rem`,
                userSelect: 'none'
            }}
            onClick={onClick}>
            {children}
        </div>
    )
}

export default Key;