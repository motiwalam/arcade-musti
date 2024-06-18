import { CSSProperties } from "react";
import FittedText from "../../../util/components/FittedText";

const font_colors = [
    '#776e65',
    '#776e65',
    '#776e65',
];
const default_font = '#f9f6f2';
const cell_colors = [
    'rgba(238, 228, 218, 0.35)',
    '#eee4da',
    '#ede0c8',
    '#f2b179',
    '#f59563',
    '#f67c5f',
    '#f65e3b',
    '#edcf72',
    '#edcc61',
    '#edc850',
    '#edc53f',
    '#edc22e'
];
const default_color = '#3c3a32'
type CellProps = {
    base: number;
    power: number;
    style?: CSSProperties;
    animation?: {
        start?: () => void;
        end?: () => void;
        animprops: CSSProperties
    }
}

const Cell = ({ base, power, style, animation }: CellProps) => {
    return (
        <div style={{
            backgroundColor: cell_colors[0],
            width: '100%',
            aspectRatio: '1/1',
        }}>
            <div className="flex justify-center items-center rounded"
                style={{
                    height: '100%',
                    userSelect: 'none',
                    color: font_colors[power] ?? default_font,
                    fontWeight: 'bold',
                    transition: 'transform 100ms ease-in-out',
                    backgroundColor: cell_colors[power] ?? default_color,
                    ...style,
                    ...animation?.animprops,
                    fontSize: 55
                }}
                onAnimationStart={animation?.start ?? (() => {})}
                onAnimationEnd={animation?.end ?? (() => {})}
                >
                <FittedText initial_size={55}
                    text={power === 0 ? '' : String(base ** power)}
                    transform_parent={({ width }) => ({ width, height: width })}
                />
            </div>
        </div>
    )
}

export default Cell;