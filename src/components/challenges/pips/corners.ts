// corners is a function that takes a coordinate pair
// and a set of coordinates represented as a comma-separated strings
// and returns an object indicating whether each of the four corners
// of the current cell should be rounded based on the presence of
// neighboring cells in the set.
export const corners = (coord: [number, number], coordSet: Set<string>) => {
    const [x, y] = coord;
    return {
        topLeft: !coordSet.has(`${x-1},${y}`) && !coordSet.has(`${x},${y-1}`),
        topRight: !coordSet.has(`${x-1},${y}`) && !coordSet.has(`${x},${y+1}`),
        bottomLeft: !coordSet.has(`${x+1},${y}`) && !coordSet.has(`${x},${y-1}`),
        bottomRight: !coordSet.has(`${x+1},${y}`) && !coordSet.has(`${x},${y+1}`),
    };
}