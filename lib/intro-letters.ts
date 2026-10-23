export const INTRO_LETTERS:Record<number,readonly string[]>={8:['B','C','F'],9:['G','P','S'],10:['B','C','F'],11:['D','P','T'],12:['S','S','S','S']};
export const RIGHT_LETTERS:Record<number,readonly string[]>={8:['L','L','L'],9:['L','L','L'],10:['R','R','R'],11:['R','R','R'],12:['M','N','T','W']};
export const MIMI_LETTER_IMAGES:Record<number,string>={8:'/images/intro/mimi-bcf.png',9:'/images/intro/mimi-gps.png',10:'/images/intro/mimi-bcf.png',11:'/images/intro/mimi-dpt.png',12:'/images/intro/mimi-gps.png'};
export const KOGI_LETTER_IMAGE='/images/intro/kogi-l.png';
export const blendLabel=(letter:string,right='L')=>`${letter} + ${right} → ${(letter+right).toLowerCase()}`;
