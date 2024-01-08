export const examples = {
    allFree : {
        availability : new Array(48).fill(true),
        pref : new Array(48).fill(false)
    },
    allBusy : {
        availability : new Array(48).fill(true),
        pref : new Array(48).fill(false)
    },
    randoms : {
        black : [
            {
            availability : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, false, false, false, false,
                            false, false, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],
            pref : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                    false, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],     
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, true , true, true],
                pref : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                        false, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, false, false, false, false, true , true, true],
                pref : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, true, true, true, true, true, false, false, true, true, true, true, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, false, false, false, false, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, true, true, true, true, true, false, false, true, true, true, true, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, true, true, false, true, true, true, true, true, false, false, false, false, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, true, true, false, false, true, true, true, true, false, false, false, false, false , false, false],    
            },
            {
                availability : [false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false , false, false],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, true , true, true],
                pref : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true,
                        true, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, true , true, true],
                pref : [true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, true, true, true, true,
                        true, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true , true, true],
                pref : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, true, true, true, true,
                        true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true , true, true],
                pref : [false, false, false, false, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, true, true, true, true,
                        true, false, true, true, true, true, false, false, false, false, false, false, false, false, false, true, true, true, true, true, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true , true, true],
                pref : [false, false, false, false, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, true, true, true, true,
                        true, false, true, true, true, true, false, false, false, false, false, false, false, false, false, true, true, true, true, true, false, false , false, false],    
            }    

        ],
        blue : [
            {
            availability : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, false, false, false, false,
                            false, false, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],
            pref : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                    false, false, false, false, false, false, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false , false, false],     
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, true , true, true],
                pref : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                        false, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, false, false, false, false, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, true, true, true, true, true, false, false, true, true, true, true, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, false, false, false, false, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, true, true, true, true, true, false, false, true, true, true, true, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, true, true, false, true, true, true, true, true, false, false, false, false, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, true, true, false, false, true, true, true, true, false, false, false, false, false , false, false],    
            },
            {
                availability : [false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false , false, false],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, true , true, true],
                pref : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false, false, false,
                        false, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, true , true, true],
                pref : [true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true,
                        true, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true , true, true],
                pref : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, true, true, true, true,
                        true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true,
                        true, false, true, true, true, true, false, false, false, false, false, false, false, false, false, true, true, true, true, true, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true , true, true],
                pref : [false, false, false, false, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, true, true, true, true,
                        true, false, true, true, true, true, false, false, false, false, false, false, false, false, false, true, true, true, true, true, false, false , false, false],    
            }    

        ],
        white : [
            {
            availability : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, true, true, true, true, true, true, false, false, false, false,
                            false, false, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],
            pref : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                    false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false , false, false],     
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                        false, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, false, false, false, false, true , true, true],
                pref : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, false, false, false, false, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, true, true, false, true, true, true, true, true, false, false, false, false, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, true, true, false, false, true, true, true, true, false, false, false, false, false , false, false],    
            },
            {
                availability : [false, false, false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false , false, false],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                                false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, true , true, true],
                pref : [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true,
                        true, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false,
                        false, false, false, false, false, false, true, true, true, true, true, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true , true, true],
                pref : [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, true, true,
                        true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false , false, false],    
            },
            {
                availability : [false, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true , true, true],
                pref : [false, false, false, false, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, true, true, true, true,
                        true, false, true, true, true, true, false, false, false, false, false, false, false, false, false, true, true, true, true, true, false, false , false, false],    
            },
            {
                availability : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true,
                                true, true, true, true, true, false, false, false, false, false, false, true, true, true, true, true, true, true, true, true, true, true , true, true],
                pref : [false, false, false, false, true, true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, true, true, true, true,
                        true, false, true, true, true, true, false, false, false, false, false, false, false, false, false, true, true, true, true, true, false, false , false, false],    
            }    

        ]

        
    }

}