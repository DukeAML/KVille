import { scheduleAlgorithm} from "../../../src/scheduling/algorithm.js";
import { TENTING_COLORS} from "../../../data/phaseData.js";
import { AlgoAnalysis} from "./analysis.js";
import { generateInput } from "./generateInputs.js";
import { scheduleDates } from "../../../data/scheduleDates.js";
describe("result tests", () => {
    it("", () => {
        let analysis = "";
        [TENTING_COLORS.BLACK, TENTING_COLORS.BLUE, TENTING_COLORS.WHITE].forEach((tentType) => {
            let startDate = scheduleDates.startOfBlack;
            if (tentType == TENTING_COLORS.BLUE){
                startDate = scheduleDates.startOfBlue;
            } else if (tentType == TENTING_COLORS.WHITE){
                startDate = scheduleDates.startOfWhite;
            }
            let {people, tenterSlotsGrid} = generateInput(startDate, 7, tentType, 0.5, 0.2, 12);
            let beforeTime = Date.now();
            let scheduledSlots = scheduleAlgorithm(people, tenterSlotsGrid);
            let afterTime = Date.now();
            let runtimeMS = afterTime - beforeTime;
            let algoAnalysis = new AlgoAnalysis(people, scheduledSlots, tenterSlotsGrid, runtimeMS);
            analysis += algoAnalysis.printAnalysis("analysis for algo with " + tentType + " tent type") + "\n";


        })
        console.log(analysis);
        
        

    })
})


