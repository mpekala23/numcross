import { useAppSelector } from "@/redux/hooks";
import { Range, cellKey } from "@/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";

function val2color(val: number | null): string {
  if (val === null || val === undefined) return "rgb(0,0,0)"; // black squares
  val = val * Math.sqrt(val);
  return `rgb(50, ${((1 - val) * 255) / 2 + 50}, ${(1 - val) * 255})`;
}

function HeatmapLegend() {
  return (
    <div className="flex justify-center items-center">
      <p className="mr-2">Early</p>
      {Range(25).map((val) => {
        return (
          <div
            key={val}
            className="flex h-2 w-2"
            style={{ backgroundColor: val2color(val / 25) }}
          />
        );
      })}
      <p className="ml-2">Late</p>
    </div>
  );
}

export default function Heatmap() {
  const [rowHeight, setRowHeight] = useState(60);
  const contRef = useRef<HTMLDivElement>(null);
  const solve = useAppSelector((state) => state.progress.solve);
  const numcross = useAppSelector((state) => state.puzzles.today);

  // TODO: This logic has always been jank and custom, should clean up and
  // make component or extensible via hook or something
  const updatePuzzleSize = useCallback(() => {
    if (!contRef.current || !numcross) return;
    const vert = contRef.current.clientHeight / numcross.puzzle.shape[0];
    const horiz = contRef.current.parentElement?.clientWidth
      ? contRef.current.parentElement?.clientWidth / numcross.puzzle.shape[1]
      : 60000;
    setRowHeight(Math.min(vert, horiz));
  }, [setRowHeight, numcross]);

  useEffect(() => {
    updatePuzzleSize();
    window.addEventListener("resize", updatePuzzleSize);
    return () => {
      window.removeEventListener("resize", updatePuzzleSize);
    };
  }, [contRef, updatePuzzleSize]);

  if (!numcross || !solve?.heatmap) return <></>;

  return (
    <div className="my-4">
      <p className="text-center animate-text bg-gradient-to-r from-teal-500 via-purple-500 to-orange-500 bg-clip-text text-transparent font-black">
        Today's Heatmap (in beta)
      </p>
      <div
        className={"relative w-full flex flex-col flex-1 overflow-hidden my-4"}
        ref={contRef}
      >
        {Range(numcross.puzzle.shape[0])
          .map((rowidx) => (
            <div
              key={cellKey(rowidx, -1)}
              className={`flex flex-row w-full justify-center`}
              style={{ height: `${rowHeight}px` }}
            >
              {Range(numcross.puzzle.shape[1]).map((colidx) => {
                let val = solve.heatmap[cellKey(rowidx, colidx)];
                val =
                  val !== null && val !== undefined ? val / solve.time : null;
                return (
                  <div
                    key={cellKey(rowidx, colidx)}
                    style={{
                      height: rowHeight,
                      width: rowHeight,
                      backgroundColor: val2color(val),
                    }}
                  />
                );
              })}
            </div>
          ))
          .flat()}
      </div>
      <HeatmapLegend />
    </div>
  );
}
