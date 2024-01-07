import { createContext } from 'react';

interface DiscretionaryGraceContextType {
	showingDiscretionaryGrace : boolean;
    setShowingDiscretionaryGrace : (b : boolean) => void;
}

export const DiscretionaryGraceContext = createContext<DiscretionaryGraceContextType>({
	showingDiscretionaryGrace : false,
    setShowingDiscretionaryGrace : (b : boolean) => {}
});
