import { ReactNode } from "react";
import { Games } from "../../../types";
import { camel_case } from "../../../util/strings";
import { SupportedGames } from "./supported";
import { trimmed } from "../../../util/strings";
import { counted_word } from "../../../util/words";
import { Card, Image } from "semantic-ui-react";
import { pick } from "ramda";
import { full_icon_url } from "./game_icons";

export type SavedGame<G extends SupportedGames> = {
    details: {
        name: G,
        started: string;
        last_played: string;
    };

    config: Games[G]
}

export type GameStore = {
    [id: string]: SavedGame<SupportedGames>
}

export function formatted_name(x: SavedGame<any>): ReactNode {
    const { name } = x.details;
    switch (name) {
        case 'wordle': {
            const wordlength = x.config.wordlength;
            return `Wordle (${counted_word(wordlength, 'letter')})`
        }

        case 'flow':
            return `Flow ${x.config.width}x${x.config.height}`

        case 'anagram':
            return `Anagram${x.config.letters ? `(${trimmed(10, x.config.letters)})` : ''}`;

        case 'minesweeper':
            return `Minesweeper ${x.config.width}x${x.config.height}`;
            
        case 'game24':
            return `Game of ${x.config.target}`;

        case 'sudoku':
            return `Sudoku ${x.config.size ** 2}x${x.config.size ** 2}`;

        case 'fifteen':
            return x.config.width * x.config.height - 1;

        case 'game2048':
            return x.config.base ** x.config.target_power;

        case 'crosslogic':
            return x.config.story ?? "CrossLogic"

        default:
            return camel_case(name);
    }
}

function formatted_config({ details, config }: SavedGame<any>): ReactNode {
    const { name } = details;
    const pretty = <T,>(x: T) => (<pre>{JSON.stringify(x, null, 5)}</pre>)
    const partial = (...args: PropertyKey[]) => pretty(pick(args, config));
    switch (name) {
        case 'flow': return partial('width', 'height');
        case 'sudoku': return partial('size');
        case 'wordle':
            if (typeof config.word === 'string') return partial('tries')
            else return pretty(config);
            
        default:
            return pretty(config)
    }
}

export function formatted_details(x: SavedGame<any>): ReactNode {
    return (
        <Card>
            <Image src={full_icon_url(x.details.name)} />
            <Card.Content>
                <Card.Header>{camel_case(x.details.name)}</Card.Header>
                <Card.Meta>Last played {x.details.last_played}</Card.Meta>
                <Card.Description>
                    { formatted_config(x) }
                </Card.Description>
            </Card.Content>
        </Card>
    )
}