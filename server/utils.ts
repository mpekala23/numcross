export const Range = (n: number) => {
  return Array.from(Array(n).keys());
};

export const cellKey = (colidx: number, rowidx: number) => {
  return `${colidx},${rowidx}`;
};

export const getESTTimestring = () => {
  return new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
};

function toTwoDigits(n: string) {
  return n.length === 1 ? "0" + n : n;
}

export const getESTDatestring = () => {
  const date = getESTTimestring();
  const splitSpaces = date.split(" ");
  const splitSlashes = splitSpaces[0]
    .slice(0, splitSpaces[0].length - 1)
    .split("/");
  return `${splitSlashes[2]}-${toTwoDigits(splitSlashes[0])}-${toTwoDigits(
    splitSlashes[1]
  )}`;
};
