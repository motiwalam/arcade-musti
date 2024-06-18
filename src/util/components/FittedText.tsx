import React, { CSSProperties } from "react";
import * as ReactDOM from 'react-dom';

interface Size {
    width: number; height: number
}

export interface FittedTextProps {
    text: string;
    initial_size?: number;
    parent?: string;
    transform_parent?: (x: DOMRect) => Size;
    transform_child? : (x: DOMRect) => Size;
    resize?: (parent: Size, child: Size) => boolean;
    new_state?: (state: FittedTextState, parent_size: Size, child_size: Size) => FittedTextState
}

type FittedTextState = CSSProperties & { fontSize: number }

class FittedText extends React.Component<FittedTextProps, FittedTextState> {
    textEl: React.RefObject<HTMLDivElement>
    constructor(props: FittedTextProps) {
        super(props);

        this.textEl = React.createRef();

        this.state = {
            fontSize: props.initial_size ?? 16
        }
    }

    componentDidMount() { this.componentDidUpdate() }

    componentDidUpdate() {
        if (this.textEl.current === null) {
            console.error('FittedText:', 'no reference to dom node')
            return
        }

        const {
            parent,
            transform_parent = x => x,
            transform_child  = x => x,
            resize = (p, c) => c.width > p.width || c.height > p.height,
            new_state = state => ({ ...state, fontSize: state.fontSize - 1 })
        } = this.props;

        const referenceElement = (() => {
            if (parent !== undefined) return document.getElementById(parent);
            return ReactDOM.findDOMNode(this)?.parentNode
        })() as HTMLElement;

        const sizeP = transform_parent(referenceElement.getBoundingClientRect());
        const sizeC = transform_child(this.textEl.current.getBoundingClientRect());
         
        if (resize(sizeP, sizeC)) {
            this.setState(new_state(this.state, sizeP, sizeC))
        }

    }

    render() {
        return (
            <div ref={this.textEl} style={this.state}>
                { this.props.text }
            </div>
        )
    }
}


export default FittedText;