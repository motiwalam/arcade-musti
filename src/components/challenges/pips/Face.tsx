import { Face } from "./types";

/** Pip layout indices on a 3×3 grid (0..8). */
const PIPS: Record<Face, number[]> = {
  0: [],
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** Map grid index (0..8) → SVG (x,y) in a 100×100 viewBox. */
const idxToXY = (i: number) => {
  const rows = [18, 50, 82]; // generous margins so tiny sizes still look good
  const cols = [18, 50, 82];
  const r = Math.floor(i / 3);
  const c = i % 3;
  return { x: cols[c], y: rows[r] };
};


const FaceSVG: React.FC<{ value: Face }> = ({ value }) => (
  <svg
    viewBox="0 0 100 100"
    className="h-full w-full rounded-xl bg-white"
    aria-hidden
  >
    {/* Slight inner padding via invisible rect to preserve corner rounding */}
    <defs>
      <clipPath id="faceClip">
        <rect x="0" y="0" width="100" height="100" rx="10" ry="10" />
      </clipPath>
    </defs>
    <g clipPath="url(#faceClip)">
      {PIPS[value].map((i) => {
        const { x, y } = idxToXY(i);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={8.5}
            className="fill-neutral-800"
          />
        );
      })}
    </g>
  </svg>
);

export default FaceSVG;