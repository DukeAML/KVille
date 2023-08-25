import { createContext } from 'react';
import { CellColorsCoordinator } from '../../../components/pageSpecific/groups/groupCode/schedule/cellColorsCoordinator';

interface CellColorsContextType {
    cellColorsCoordinator : CellColorsCoordinator;
};

export const CellColorsContext = createContext<CellColorsContextType>({
    cellColorsCoordinator : new CellColorsCoordinator()
});