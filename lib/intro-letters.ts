export const INTRO_LETTERS:Record<number,readonly string[]>={8:['B','C','F'],9:['G','P','S']};
export const MIMI_LETTER_IMAGES:Record<number,string>={8:'/images/intro/mimi-bcf.png',9:'/images/intro/mimi-gps.png'};
export const KOGI_LETTER_IMAGE='/images/intro/kogi-l.png';
export const blendLabel=(letter:string)=>`${letter} + L → ${(letter+'L').toLowerCase()}`;
