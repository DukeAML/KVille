import { createContext } from 'react';
import { CellColorsCoordinator } from '../cellColorsCoordinator';

interface CellColorsContextType {
    cellColorsCoordinator : CellColorsCoordinator;
};

export const CellColorsContext = createContext<CellColorsContextType>({
    cellColorsCoordinator : new CellColorsCoordinator()
});