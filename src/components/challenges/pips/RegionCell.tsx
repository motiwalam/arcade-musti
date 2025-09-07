import { useMemo } from "react";
import { Games } from "../../../types";
import { corners } from "./corners";

export type RegionColors = "purple" | "pink" | "teal" | "orange" | "blue" | "green";

const REGION_BG_COLOR_MAP: Record<RegionColors, string> = {
    purple: "bg-[rgba(128,70,177,0.3)]",
    pink: "bg-[rgba(249,58,122,0.3)]",
    teal: "bg-[rgba(0,163,184,0.3)]",
    orange: "bg-[rgba(253,157,9,0.3)]",
    blue: "bg-[rgba(70,79,177,0.3)]",
    green: "bg-[rgba(84,118,1,0.3)]",
};

const REGION_BORDER_COLOR_MAP: Record<RegionColors, string> = {
    purple: "border-[#8046b1]",
    pink: "border-[#ea004e]",
    teal: "border-[#006471]",
    orange: "border-[#ca4e00]",
    blue: "border-[#003674]",
    green: "border-[#4c6b00]",
};

const REGION_LABEL_COLOR_MAP: Record<RegionColors, string> = {
    purple: "bg-[#9251ca]",
    pink: "bg-[#db137a]",
    teal: "bg-[#008293]",
    orange: "bg-[#d15609]",
    blue: "bg-[#464fb1]",
    green: "bg-[#547601]"
};

export interface RegionCellProps {
    x: number;
    y: number;
    parentRegion?: Games["pips"]["regions"][number];
    regionColor?: RegionColors;
}

interface RegionLabelProps {
    type: Games["pips"]["regions"][number]["type"];
    target?: number;
    colorClass: string;
}

const regionLabelClipPath = "polygon( 9.033% 35.294%, 3.446% 40.881%, 3.446% 40.881%, 2.205% 42.339%, 1.24% 43.934%, 0.551% 45.632%, 0.138% 47.399%, -0% 49.2%, 0.138% 51.001%, 0.551% 52.767%, 1.24% 54.465%, 2.205% 56.06%, 3.446% 57.519%, 40.881% 94.954%, 40.881% 94.954%, 42.339% 96.194%, 43.934% 97.159%, 45.632% 97.848%, 47.399% 98.262%, 49.2% 98.4%, 51.001% 98.262%, 52.767% 97.848%, 54.465% 97.159%, 56.06% 96.194%, 57.519% 94.954%, 94.954% 57.519%, 94.954% 57.519%, 96.194% 56.06%, 97.159% 54.465%, 97.848% 52.767%, 98.262% 51.001%, 98.4% 49.2%, 98.262% 47.399%, 97.848% 45.632%, 97.159% 43.934%, 96.194% 42.339%, 94.954% 40.881%, 57.519% 3.446%, 57.519% 3.446%, 56.06% 2.205%, 54.465% 1.24%, 52.767% 0.551%, 51.001% 0.138%, 49.2% -0%, 47.399% 0.138%, 45.632% 0.551%, 43.934% 1.24%, 42.339% 2.205%, 40.881% 3.446%, 38.235% 6.091%, 38.235% 17.647%, 38.235% 17.647%, 38.004% 20.51%, 37.336% 23.225%, 36.266% 25.757%, 34.83% 28.069%, 33.067% 30.125%, 31.01% 31.889%, 28.698% 33.324%, 26.166% 34.394%, 23.451% 35.063%, 20.588% 35.294%, 9.033% 35.294% )"; 
const RegionLabel = ({ type, target, colorClass }: RegionLabelProps) => {
    const text = (() => {
        switch (type) {
            case "empty": return "";
            case "unequal": return "≠";
            case "equals": return "=";
            case "sum": return target?.toString() ?? "?";
            case "greater": return `>${target ?? "?"}`;
            case "less": return `<${target ?? "?"}`;
        }
    })();
    return (
        <span className={`
            absolute flex justify-center items-center
            top-[63%] left-[60%]
            size-[80%] text-white
            z-[10] 
            leading-[20px]
            text-center
            tracking-[.01em]
            ${colorClass}
        `} style={{
            font: "800 1.33em nyt-franklin,Arial",
            WebkitClipPath: regionLabelClipPath,
            clipPath: regionLabelClipPath,
        }}>
            <span className={`
                mt-[4%] flex relative justify-center items-center
                size-[100%]
                text-[16.75px]
            `}>
                {text}
            </span>
        </span>
    );
}

const RegionCell = ({ x, y, parentRegion, regionColor }: RegionCellProps) => {
    const regionCoordinateSet = useMemo(() => {
        const s = new Set<string>();
        parentRegion?.indices.forEach(([x, y]) => s.add(`${x},${y}`));
        return s;
    }, [parentRegion]);

    const [brX, brY] = useMemo(() => {
        if (!parentRegion) return [-1, -1];
        const maxX = Math.max(...parentRegion.indices.map(([x, _y]) => x));
        const maxY = Math.max(...parentRegion.indices.filter(([x, _y]) => x === maxX).map(([_x, y]) => y));
        return [maxX, maxY];
    }, [parentRegion]); 
    
    const isBottomRightCell = (x === brX && y === brY);

    // if there is no parent region, render a hidden cell
    if (!parentRegion || !regionColor || parentRegion.type === 'empty') {
        return <div className="invisible aspect-square" />;
    }

    const roundedCorners = corners([x, y], regionCoordinateSet);
    const borderClasses = (
        (roundedCorners.topLeft ? "rounded-tl-lg " : "") +
        (roundedCorners.topRight ? "rounded-tr-lg " : "") +
        (roundedCorners.bottomLeft ? "rounded-bl-lg " : "") +
        (roundedCorners.bottomRight ? "rounded-br-lg " : "")
    );

    const neighborCellsInRegion = {
        top: regionCoordinateSet.has(`${x-1},${y}`),
        bottom: regionCoordinateSet.has(`${x+1},${y}`),
        left: regionCoordinateSet.has(`${x},${y-1}`),
        right: regionCoordinateSet.has(`${x},${y+1}`),
    };

    // unset border and margin on sides that have neighbors in the same region
    const sideClasses = (
        (neighborCellsInRegion.top ? "border-t-0 mt-0 " : "border-t-2 mt-[.11em] ") +
        (neighborCellsInRegion.bottom ? "border-b-0 mb-0 " : "border-b-2 mb-[.11em] ") +
        (neighborCellsInRegion.left ? "border-l-0 ml-0 " : "border-l-2 ml-[.11em] ") +
        (neighborCellsInRegion.right ? "border-r-0 mr-0 " : "border-r-2 mr-[.11em] ")
    );

    const regionBgColorClass = REGION_BG_COLOR_MAP[regionColor];
    const regionBorderColorClass = REGION_BORDER_COLOR_MAP[regionColor];
    return (
        <div className={`
            aspect-square relative flex size-[100%]
        `}>
            <div className={`
                aspect-square
                flex relative
                width-[100%]
                ${regionBgColorClass}
                ${regionBorderColorClass}
                border-dashed 
                ${borderClasses}
                ${sideClasses}
            `}>
            </div>
            {isBottomRightCell && <RegionLabel colorClass={REGION_LABEL_COLOR_MAP[regionColor]} type={parentRegion.type} target={'target' in parentRegion ? parentRegion.target : undefined} />}

        </div>
    );
}

export default RegionCell;
