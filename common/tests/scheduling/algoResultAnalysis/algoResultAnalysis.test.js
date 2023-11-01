import { scheduleAlgorithm} from "../../../src/scheduling/algorithm.js";
import { TENTING_COLORS} from "../../../data/phaseData.js";
import { AlgoAnalysis} from "./analysis.js";
import { generateInput } from "./generateInputs.js";
import { scheduleDates } from "../../../data/scheduleDates.js";
describe("result tests", () => {
    it("", () => {
        [TENTING_COLORS.WHITE].forEach((tentType) => {
            let {people, tenterSlotsGrid} = generateInput(scheduleDates.startOfTenting, 3, tentType, 0.5, 0.2);
            let beforeTime = Date.now();
            let scheduledSlots = scheduleAlgorithm(people, tenterSlotsGrid);
            console.log(scheduledSlots.length);
            let afterTime = Date.now();
            let runtimeMS = afterTime - beforeTime;
            let algoAnalysis = new AlgoAnalysis(people, scheduledSlots, tenterSlotsGrid, runtimeMS);
            console.log("analysis for algo with " + tentType + " tent type");
            algoAnalysis.printAnalysis();
        })
        
        

    })
})


