export type Face = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Placement = {
    index: number; // dominoe index

    // coordinates of dominoe
    // top cell when dominoe is vertical,
    // left cell when dominoe is horizontal
    anchorX: number;
    anchorY: number;

    // number of 90° clockwise rotations from initial orientation
    turns: number;

    // faces when placed in left-to-right (i.e turns == 0) orientation
    faces: [Face, Face];
}

export function occupiedCells({ anchorX, anchorY, turns }: Placement): [number, number][] {
    const parity = turns % 2;

    const anchor = [anchorX, anchorY];
    const other = parity === 0 ? [anchorX, anchorY + 1] : [anchorX + 1, anchorY];
    return [anchor, other] as [number, number][];
}

// precondition: (x, y) is occupied by placement
export function placementValueAt(placement: Placement, x: number, y: number): Face { 
    const { anchorX, anchorY, turns, faces } = placement;
    const isAnchor = (x === anchorX && y === anchorY);

    const rot = turns % 4 as 0 | 1 | 2 | 3;

    switch (rot) {
        case 0: return isAnchor ? faces[0] : faces[1];
        case 1: return isAnchor ? faces[0] : faces[1];
        case 2: return isAnchor ? faces[1] : faces[0];
        case 3: return isAnchor ? faces[1] : faces[0];
    }
}