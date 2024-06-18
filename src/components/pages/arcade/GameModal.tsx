import { Suspense } from "react";
import { Button, Modal } from "semantic-ui-react";
import { createChallengeComponent } from "../../../data/challenge-components";
import { SUSPENSE_FALLBACK } from "../../../data/constants";
import { Challenge, Games } from "../../../types";
import { SupportedGames } from "./supported";

type GameModalProps = {
    onClose: () => void;
    onWin: () => void;
    game: SupportedGames;
    config: Games[SupportedGames];
    uuid: string;

}
const GameModal = ({ onClose, onWin, game, config, uuid }: GameModalProps) => {
    return (
        <Modal dimmer="blurring" open onClose={onClose}>
            <Modal.Content>
                <Suspense fallback={SUSPENSE_FALLBACK}>
                    {createChallengeComponent({ type: game, config } as Challenge, uuid, onWin)}
                </Suspense>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose}> Close </Button>
            </Modal.Actions>
        </Modal>
    )
}

export default GameModal;