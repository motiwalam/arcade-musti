import { Container, Divider, Header, Icon, List, Popup, Button } from "semantic-ui-react";
import { ChallengeProps } from "../../../types";
import { ToastContainer, Flip, toast } from "react-toastify";
import Dominoe from "./Dominoe";
import { Face, Placement, occupiedCells, placementValueAt } from "./types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameBoard from "./GameBoard";
import { createPortal } from "react-dom"; // add this
import { useLocalStorage } from "../../../util/storage";

type DragState = {
  index: number;
  faces: [Face, Face];
  turns: number;
  x: number;
  y: number;
};

const checkWin = (regions: ChallengeProps<"pips">["challenge"]["regions"], placements: Placement[]): boolean => {
    const cellToPlacement = new Map<string, Placement>();
    placements.forEach(placement => {
        occupiedCells(placement).forEach(([x, y]) => {
            cellToPlacement.set(`${x},${y}`, placement);
        });
    });

    return regions.every(region => {
        if (region.type === 'empty') return true;

        const cellValues = region.indices.map(([x, y]) => {
            const placement = cellToPlacement.get(`${x},${y}`);
            if (!placement) return null;
            return placementValueAt(placement, x, y);
        });

        // some cell is unfilled
        if (cellValues.some(v => v === null)) return false;

        if (region.type === 'equals') {
            return cellValues.every(v => v === cellValues[0]);
        }

        if (region.type === 'unequal') {
            const uniqueValues = new Set(cellValues);
            return uniqueValues.size === cellValues.length;
        }

        const valueSum = (cellValues as number[]).reduce((a, b) => a + b, 0);

        switch (region.type) {
            case 'sum':
                return valueSum === region.target;
            case 'less':
                return valueSum < region.target;
            case 'greater':
                return valueSum > region.target;
        }
    });
}


const PipsChallenge = ({ challenge, id, handleWin }: ChallengeProps<"pips">) => {
    const { regions } = challenge;
    const [coordinateSet] = useMemo(() => {
        const set = new Set<string>();
        regions.forEach(region => {
            region.indices.forEach(([x, y]) => {
                set.add(`${x},${y}`);
            });
        });
        return [set];
    }, [regions]);

    // compute maximum X and Y coordinates from regions to determine grid size
    // from the indices of all regions
    const [maxX, maxY] = useMemo(() => {
        let maxX = 0;
        let maxY = 0;
        regions.forEach((region) => {
            region.indices.forEach(([x, y]) => {
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            });
        });
        return [maxX, maxY];
    }, [regions]);

    const numRows = maxX + 1;
    const numCols = maxY + 1;

    const [dominoeTurns, setDominoeTurns] = useState<number[]>(Array.from({ length: challenge.dominoes.length }, () => 0));
    const [activeDominoe, setActiveDominoe] = useState<number | null>(null);

    const [placements, setPlacements] = useLocalStorage<Placement[]>(id, []);
    const placedDominoes = new Set(placements.map(p => p.index));

    const placedCells = useMemo(() => {
        return new Set<string>(placements.flatMap(p => occupiedCells(p).map(([x, y]) => `${x},${y}`)));
    }, [placements]);

    // Measure one board cell so we can size dragged dominoes to exactly 1x2 cells
    const [cellSize, setCellSize] = useState<number | null>(null);
    useEffect(() => {
        const measure = () => {
            const el = document.querySelector("[data-board-cell]") as HTMLElement | null;
            if (el) {
                const rect = el.getBoundingClientRect();
                // assuming square cells
                setCellSize(rect.width);
            }
        };
        // measure after board renders
        const rAF = requestAnimationFrame(measure);
        window.addEventListener("resize", measure);
        return () => {
            cancelAnimationFrame(rAF);
            window.removeEventListener("resize", measure);
        };
    }, []);

    const [drag, setDrag] = useState<DragState | null>(null);
    const draggingRef = useRef(false);
    const dragRef = useRef<DragState | null>(null); // keep current drag in a ref

    const computeDominoePlacement = useCallback((ev: MouseEvent, currentDrag: DragState): Placement | string => {
        const boardCell = (document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null)?.closest("[data-board-cell]") as HTMLElement | null;
        if (!boardCell) return "out of bounds";

        const anchorRow = parseInt(boardCell.dataset.row ?? "-1");
        const anchorCol = parseInt(boardCell.dataset.col ?? "-1");
        if (!(anchorRow >= 0 && anchorCol >= 0)) return "invalid cell";

        const placement: Placement = {
            index: currentDrag.index,
            anchorX: anchorRow,
            anchorY: anchorCol,
            turns: currentDrag.turns,
            faces: currentDrag.faces,
        };

        const occupied = occupiedCells(placement);

        if (!occupied.every(([x, y]) => coordinateSet.has(`${x},${y}`))) {
            return "out of bounds";
        }

        if (occupied.some(([x, y]) => placedCells.has(`${x},${y}`))) {
            return "overlaps another dominoe";
        }

        return placement;
    }, [coordinateSet, placedCells]);

    // Clear game state
    const clearGame = useCallback(() => {
        setPlacements([]);
        setDominoeTurns(Array.from({ length: challenge.dominoes.length }, () => 0));
        setActiveDominoe(null);
        setDrag(null);
        dragRef.current = null;
        draggingRef.current = false;
        toast.dismiss();
    }, [challenge.dominoes.length]);

    const [ won, setWon ] = useState(false);
    useEffect(() => { won && handleWin() }, [won, handleWin])
    if (!won && placements.length === challenge.dominoes.length && checkWin(regions, placements)) {
        toast.success('Good job!', {
            onOpen: () => setWon(true)
        })
    }

    return (
        <Container onClick={() => {
                    setActiveDominoe(null);
                    setDominoeTurns(dominoeTurns.map(t => [1, 3].includes(t % 4) ? t - 1 : t));
                }} >
            <div className="flex items-center justify-between">
                <Header as="h2" dividing>
                    Pips! (puzzle {challenge.name}) &nbsp;
                    <span>
                        <Popup popper={<div style={{ filter: 'none' }}></div>}
 trigger={<Icon name="question circle" />}>
                            <Popup.Header>How to play</Popup.Header>
                            <Popup.Content>
                                <List as="ol">
                                    <List.Item as="li">Tile the grid with the given dominoes.</List.Item>
                                    <List.Item as="li">Drag a dominoe onto the grid to place it. Click on a dominoe to rotate it.</List.Item>
                                    <List.Item as="li">Shift-click on a placed dominoe to remove it from the grid.</List.Item>
                                    <List.Item as="li">Each region imposes different constraints on the cells in that region that must all be satisfied.</List.Item>
                                    <List.Item as="li">Sum constraints indicate that the total number of pips (dots) in the region must be the given number.</List.Item>
                                    <List.Item as="li">Less-than/Greater-than constraints indicate that the total number of pips (dots) in the region must be less than or greater than the given number.</List.Item>
                                    <List.Item as="li">Equal constraints say that all cells in the region have the same number of pips in them.</List.Item>
                                    <List.Item as="li">Unequal constraints say that no cells in the region have the same number of pips in them.</List.Item>
                                </List>
                            </Popup.Content>
                        </Popup>
                    </span>
                </Header>

                <Button
                    basic
                    onClick={(e) => { e.stopPropagation(); clearGame(); }}
                    aria-label="Clear game state"
                >
                    <Icon name="trash" />
                    Clear
                </Button>
            </div>

            <ToastContainer
                position="top-center"
                autoClose={500}
                transition={Flip}
                theme="colored"
            />

            <GameBoard 
                regions={regions} 
                coordinateSet={coordinateSet} 
                numRows={numRows} 
                numCols={numCols} 
                placements={placements} 
                setPlacements={setPlacements} 
            />

            <Divider />
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-4 w-[60%] mx-auto">
                    {challenge.dominoes.map((ds, i) => {
                        const turns = dominoeTurns[i] ?? 0;
                        const isActive = (activeDominoe === i);
                        const isDraggingThis = drag?.index === i;
                        const isPlaced = placedDominoes.has(i);

                        return (
                            <div key={i} className={"bg-gray-200 rounded-lg " + (isActive ? "z-[100]" : "")}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => {
                                        draggingRef.current = false;
                                        const startX = e.clientX;
                                        const startY = e.clientY;
                                        const idx = i;
                                        const faces = ds as [Face, Face];
                                        const startTurns = dominoeTurns[idx] ?? 0;

                                        const onMove = (ev: MouseEvent) => {
                                            const dx = ev.clientX - startX;
                                            const dy = ev.clientY - startY;
                                            if (!draggingRef.current && Math.hypot(dx, dy) > 4) {
                                                draggingRef.current = true;
                                                setActiveDominoe(idx);
                                                const next: DragState = {
                                                    index: idx,
                                                    faces,
                                                    turns: startTurns,
                                                    x: ev.clientX,
                                                    y: ev.clientY,
                                                };
                                                dragRef.current = next;      // update ref
                                                setDrag(next);               // update state
                                            } else if (draggingRef.current) {
                                                const prev = dragRef.current;
                                                const next: DragState = {
                                                    index: idx,
                                                    faces,
                                                    turns: dominoeTurns[idx] ?? prev?.turns ?? startTurns,
                                                    x: ev.clientX,
                                                    y: ev.clientY,
                                                };
                                                dragRef.current = next;      // keep ref current
                                                setDrag(next);
                                            }
                                        };

                                        const onUp = (ev: MouseEvent) => {
                                            window.removeEventListener("mousemove", onMove);
                                            window.removeEventListener("mouseup", onUp);

                                            if (draggingRef.current) {
                                                const currentDrag = dragRef.current;
                                                if (currentDrag) {
                                                    const placement = computeDominoePlacement(ev, currentDrag);
                                                    if (typeof placement === "string") {
                                                        toast.error(`Could not place dominoe: ${placement}`);
                                                    } else {
                                                        setPlacements(prev => [...prev, placement]); // functional update
                                                    }
                                                }
                                                setDrag(null);
                                                dragRef.current = null; // clear ref
                                                draggingRef.current = false;
                                                ev.preventDefault();
                                                ev.stopPropagation();
                                            }
                                        };

                                        window.addEventListener("mousemove", onMove);
                                        window.addEventListener("mouseup", onUp);
                                    }}
                                    onClick={e => {
                                        // suppress rotate if we were dragging
                                        if (draggingRef.current) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            return;
                                        }
                                        setActiveDominoe(i);
                                        setDominoeTurns(dominoeTurns.map((t, j) => {
                                            if (i === j) return t + 1;
                                            if ([1, 3].includes(t % 4)) return t - 1;
                                            return t
                                        }));
                                        e.stopPropagation();
                                    }}
                                    //aria-label={`Rotate domino ${faces[0]}-${faces[1]}, current orientation ${oris[i]}`}
                                    className={[
                                    // square wrapper to avoid clipping while rotating
                                    "w-20 ",
                                    // center the domino within the square
                                    "grid place-items-center",
                                    // interaction + animation
                                    "transition-transform duration-300 ease-in-out transform-gpu",
                                    "rotate-[var(--deg)]",
                                    isActive ? "opacity-75 scale-[1.1]" : "",
                                    (isDraggingThis || isPlaced) ? "opacity-0 pointer-events-none" : "", // hide while dragging
                                    ].join(" ")}

                                    style={{ ["--deg" as any]: `${turns * 90}deg` }}
                                >
                                        {/* Keep Dominoe in baseline layout; rotate the wrapper instead */}
                                        <Dominoe faces={ds} className="w-full" />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Drag overlay that follows the mouse, sized to 1x2 cells and rotated to current orientation */}
                {drag && cellSize && createPortal((() => {
                    const parity = ((drag.turns % 4) + 4) % 4; // normalize to 0..3
                    const isVertical = parity === 1 || parity === 3;
                    const width = isVertical ? cellSize : cellSize * 2;
                    const height = isVertical ? cellSize * 2 : cellSize;
                    const deg = parity * 90;

                    return (
                        <div
                            className="opacity-75"
                            style={{
                                position: "fixed",
                                left: drag.x,
                                top: drag.y,
                                width,
                                height,
                                zIndex: 2000,
                                pointerEvents: "none",
                                transform: `translate(-50%, -50%) rotate(${deg}deg)`,
                                transformOrigin: "center center",
                                filter: 'none',
                            }}
                        >
                            <Dominoe faces={drag.faces} />
                        </div>
                    );
                })(), document.body)}
        </Container>
    )    
}

export default PipsChallenge;