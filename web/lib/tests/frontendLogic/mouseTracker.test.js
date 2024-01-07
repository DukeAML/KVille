import { MouseTracker } from "../../src/frontendLogic/availability/mouseTracker";

describe("mouse Tracker Tests", () => {
    let cells = new Array(48).fill(new Array(7).fill(false));
    let changeAvailabilityAtRowsAndCols = (rowsAndCols, available) => {
        for (let i = 0; i < rowsAndCols.length; i += 1){
            let row = rowsAndCols[i].row;
            let col = rowsAndCols[i].col;
            cells[row][col] = available;
        }
    }
    it("works in basic case", () => {
        let tracker = new MouseTracker();
        tracker.setChangeAvailabilityAtRowsAndCols(changeAvailabilityAtRowsAndCols);
        expect(cells[0][0]).toBe(false);
        tracker.alertStartOfDragAtRowColWithValueChangedTo(0, 0, true);
        expect(cells[0][0]).toBe(true);
        expect(cells[0][1]).toBe(false);
    })
})