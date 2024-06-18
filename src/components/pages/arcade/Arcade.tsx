import { useState } from "react"
import { Card, Container, Grid, Header, Popup, List, Image, Rail, Segment, Icon } from "semantic-ui-react"
import { objectEntries } from "../../../util/object"
import { useLocalStorage } from "../../../util/storage"
import { camel_case } from "../../../util/strings"
import ConfigurationModal from "./ConfigurationModal"
import GameModal from "./GameModal"
import { formatted_details, formatted_name, GameStore } from "./gamestore"
import { SupportedGames, supported_games } from "./supported"
import { assocPath, dissoc } from 'ramda';
import { full_icon_url, mini_icon_url } from "./game_icons"

const Arcade = () => {
    const [activeConfig, setActiveConfig] = useState<SupportedGames>();
    const [gameStore, setGameStore] = useLocalStorage<GameStore>('arcade-saved-games', {});
    const [activeGame, setActiveGame] = useState<JSX.Element>();

    const arcade = (
        <Grid columns={3}>
            {supported_games.map((game, i) => (
                <Grid.Column key={i}>
                    <Card fluid
                        image={full_icon_url(game)}
                        header={camel_case(game)}
                        onClick={() => setActiveConfig(game)}
                    />
                </Grid.Column>
            ))}
        </Grid>
    )

    return (
        <Container>
            <Segment style={{ borderStyle: 'none', boxShadow: 'none', padding: 0 }}>
                {arcade}
                <Rail position="left" close style={{ paddingTop: '1rem' }} size='large'>
                    <Segment>
                        <Header dividing as="h3">Games in progress</Header>
                        {
                            Object.entries(gameStore).length === 0
                                ? (
                                    <p>Start a game and it'll show up here!</p>
                                ) : (
                                    <List relaxed="very">
                                        {objectEntries(gameStore).map(([k, v], i) => {
                                            return (
                                                <List.Item style={{ position: 'relative' }} key={i}>
                                                    <Image style={{ borderRadius: 0 }} avatar src={mini_icon_url(v.details.name)} />
                                                    <Popup
                                                        content={formatted_details(v)}
                                                        trigger={(
                                                            <List.Content
                                                                className="cursor-pointer"
                                                                onClick={() => {
                                                                    setGameStore(assocPath([k, 'details', 'last_played'], new Date().toLocaleString()))
                                                                    setActiveGame((
                                                                        <GameModal
                                                                            uuid={String(k)}
                                                                            game={v.details.name}
                                                                            config={v.config}
                                                                            onClose={() => setActiveGame(undefined)}
                                                                            onWin={() => {
                                                                                setGameStore(dissoc(k));
                                                                                localStorage.removeItem(String(k));
                                                                            }}
                                                                        />
                                                                    ))
                                                                }}>
                                                                <List.Header>{formatted_name(v)}</List.Header>
                                                                <List.Description>
                                                                    last played {v.details.last_played}
                                                                </List.Description>

                                                            </List.Content>
                                                        )}
                                                    />
                                                    <Icon
                                                        style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            cursor: 'pointer'
                                                        }}
                                                        name="delete"
                                                        onClick={() => {
                                                            setGameStore(dissoc(k));
                                                            localStorage.removeItem(String(k))
                                                        }}
                                                    />
                                                </List.Item>
                                            )
                                        })}
                                    </List>
                                )
                        }
                    </Segment>
                </Rail>
            </Segment>
            {activeConfig !== undefined && (
                <ConfigurationModal
                    game={activeConfig}
                    setActiveGame={setActiveGame}
                    setGameStore={setGameStore}
                    onClose={() => setActiveConfig(undefined)} />
            )}
            {activeGame !== undefined && activeGame}
        </Container>
    )
}

export default Arcade