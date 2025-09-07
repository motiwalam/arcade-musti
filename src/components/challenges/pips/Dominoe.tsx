import React from "react";

import FaceSVG from "./Face";
import { Face } from "./types";

export interface DominoeProps {
  faces: [Face, Face];
  /** Optional extra classes for sizing/styling from parent. */
  className?: string;
}


const Dominoe: React.FC<DominoeProps> = ({ faces, className }) => {

  return (
    <div
      className={[
        "relative grid overflow-hidden rounded-lg border border-black bg-neutral-50",
        "grid-cols-2 aspect-[2/1]",
        // soft shadow; border remains crisp when scaled down
        "shadow-[0_1px_0_rgba(0,0,0,0.03),0_4px_10px_rgba(0,0,0,0.06)]",
        className ?? "w-40", // smaller default than before so it scales nicely
      ].join(" ")}
      aria-label={`Domino ${faces[0]}-${faces[1]}`}
      role="img"
    >
      <div className="p-1">
        <FaceSVG value={faces[0]} />
      </div>
      <div className="p-1">
        <FaceSVG value={faces[1]} />
      </div>

      {/* separator */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-neutral-300" />
    </div>
  );
};

export default Dominoe;
