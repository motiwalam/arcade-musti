import { lazy, LazyExoticComponent, Suspense, useState } from "react";
import { Modal } from "semantic-ui-react";
import { SUSPENSE_FALLBACK } from "../../../data/constants";
import { Games } from "../../../types";
import { fromEntries } from "../../../util/object";
import { camel_case, randomString } from "../../../util/strings";
import { ConfigProps, default_config, OnWinHandler } from "./configs";
import GameModal from "./GameModal";
import { GameStore } from "./gamestore";
import { SupportedGames, supported_games } from "./supported";
import { assoc, dissoc } from 'ramda';
import Button from "../../../util/components/Button";

interface ConfigurationModalProps<G extends SupportedGames> {
    onClose: () => void;
    game: G;
    setGameStore: (g: GameStore | ((g: GameStore) => GameStore)) => void;
    setActiveGame: (e?: JSX.Element) => void;
}

// @ts-ignore
const CONFIG_MAP: {
    [G in SupportedGames]: LazyExoticComponent<(p: ConfigProps<G>) => JSX.Element>
} = fromEntries(supported_games.map(g => [
    g, lazy(() => import(`./configs/${camel_case(g)}Config`))
]))

function create_configuration<G extends SupportedGames>(game: G, config: Games[G], setConfig: (x: Games[G]) => void, setOnWin: (x: OnWinHandler | ((x: OnWinHandler) => OnWinHandler)) => void) {
    const C = CONFIG_MAP[game];
    // @ts-ignore
    return <C config={config} setConfig={setConfig} setOnWin={setOnWin} />
}

const ConfigurationModal = <G extends SupportedGames>({ onClose, game, setGameStore, setActiveGame }: ConfigurationModalProps<G>) => {
    const [config, setConfig] = useState<Games[G]>(default_config(game) as Games[G]);

    const [onWin, setOnWin] = useState<OnWinHandler>(() => {});

    return (
        <Modal open onClose={onClose}>
            <Modal.Header>
                Configuration for {camel_case(game)}
            </Modal.Header>

            <Modal.Content>
                <Suspense fallback={SUSPENSE_FALLBACK}>
                    {create_configuration(game, config, setConfig, setOnWin)}
                </Suspense>
            </Modal.Content>

            <Modal.Actions>
                <Button negative onClick={onClose}> Cancel </Button>
                <Button positive onClick={() => {
                    const uuid = randomString(20);
                    const time = new Date().toLocaleString();
                    setGameStore(assoc(uuid, {
                        details: {
                            name: game,
                            started: time,
                            last_played: time
                        },

                        config
                    }))

                    setActiveGame((
                        <GameModal 
                            uuid={uuid}
                            game={game}
                            config={config}
                            onClose={() => setActiveGame(undefined)}
                            onWin={() => {
                                console.log("calling onWin");
                                onWin(uuid);
                                setGameStore(dissoc(uuid));
                                localStorage.removeItem(uuid);
                            }}
                        />
                    ))
                }}>
                    Play
                </Button>
            </Modal.Actions>

        </Modal>
    )
}

export default ConfigurationModal;