import { Container, Dimmer, Loader } from "semantic-ui-react";
import packagejson from "../../package.json"

export const BASEURL = packagejson.homepage
export const HOMEURL = `${BASEURL}/`;
export const ARCADEURL = `${BASEURL}/arcade`;

export const SUSPENSE_FALLBACK = (
    <Container>
        <Dimmer active>
            <Loader />
        </Dimmer>
    </Container>
)