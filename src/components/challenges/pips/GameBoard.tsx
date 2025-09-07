import { useMemo } from "react";
import { Games } from "../../../types";
import BackgroundCell from "./BackgroundCell";
import { corners } from "./corners";
import RegionCell, { RegionColors } from "./RegionCell";
import DropCell from "./DropCell";
import { occupiedCells, Placement, placementValueAt } from "./types";

export interface GameBoardProps {
    regions: Games["pips"]["regions"];
    placements: Placement[];
    setPlacements: (placements: Placement[]) => void;
    coordinateSet: Set<string>;
    numRows: number;
    numCols: number;
}

const REGION_COLORS: RegionColors[] = ["purple", "pink", "teal", "orange", "blue", "green"];

const GameBoard = ({ regions, coordinateSet, numRows, numCols, placements, setPlacements }: GameBoardProps) => {
    const [nonEmptyRegions] = useMemo(() => {
        return [regions.filter(region => region.type !== 'empty')];
    }, [regions]);

    const cellToPlacement = useMemo(() => {
        const map = new Map<string, Placement>();
        placements.forEach(placement => {
            occupiedCells(placement).forEach(([x, y]) => {
                map.set(`${x},${y}`, placement);
            });
        });
        return map;
    }, [placements]);

    // render a grid of Cell components with the computed size
    return (
        <div data-board-root className="w-[50%] mx-auto relative"
            style={{
                maxWidth: `${numCols * 1.3 * 50}px`
            }}>
            {/* background grid */}
            <div
                className="grid w-full pointer-events-none"
                style={{
                    gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${numRows}, minmax(0, 1fr))`,
                }}
            >
                {Array.from({ length: numRows * numCols }, (_, idx) => {
                    const x = Math.floor(idx / numCols);
                    const y = idx % numCols;

                    const invisible = !coordinateSet.has(`${x},${y}`);

                    const roundedCorners = corners([x, y], coordinateSet);
                    return (
                        <BackgroundCell
                            key={`${x}-${y}`}
                            invisible={invisible}
                            roundedCorners={roundedCorners}
                        />
                    );
                })}
            </div>
            <div className="absolute z-[10] inset-0 size-[100%] pointer-events-none">
                {/* region cell grid */}
                <div
                    className="grid w-full relative"
                    style={{
                        gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${numRows}, minmax(0, 1fr))`,
                    }}
                >
                    {Array.from({ length: numRows * numCols }, (_, idx) => {
                        const x = Math.floor(idx / numCols);
                        const y = idx % numCols;

                        const parentRegion = regions.find(region =>
                            region.indices.some(([rx, ry]) => rx === x && ry === y)
                        );
                        const regionIndex = parentRegion ? nonEmptyRegions.indexOf(parentRegion) : -1;

                        return (
                            <RegionCell
                                key={`${x}-${y}`}
                                x={x}
                                y={y}
                                parentRegion={parentRegion}
                                regionColor={regionIndex >= 0 ? REGION_COLORS[regionIndex % REGION_COLORS.length] : undefined}
                            />
                        );
                    })}
                </div>
            </div>
            <div className="absolute inset-0 size-[100%]" style={{
                pointerEvents: 'all'
            }}>
                {/* overlay to capture pointer events and hold dominoe faces */}
                <div className="grid w-full relative"
                    style={{
                        gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${numRows}, minmax(0, 1fr))`,
                    }}
                >
                    {Array.from({ length: numRows * numCols }, (_, idx) => {
                        const x = Math.floor(idx / numCols);
                        const y = idx % numCols;

                        const placement = cellToPlacement.get(`${x},${y}`);
                        const value = placement ? placementValueAt(placement, x, y) : null;

                        return (
                            <DropCell
                                key={`${x}-${y}`}
                                x={x}
                                y={y}
                                value={value}
                                invisible={!coordinateSet.has(`${x},${y}`)}
                                onShiftClick={() => {
                                    if (placement) {
                                        // remove this placement
                                        const newPlacements = placements.filter(p => p !== placement);
                                        // update state
                                        // Note: setPlacements is passed from parent component
                                        setPlacements(newPlacements);
                                    }
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default GameBoard;
