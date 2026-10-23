export const HOMEWORK_PAGES:Record<number,[number,number]>={1:[4,9],2:[10,15],3:[16,21],4:[22,27],5:[28,33],6:[34,39],7:[40,45],8:[50,55],9:[56,61],10:[62,67],11:[68,73],12:[74,79]};
export function homeworkPages(unit:number){const [start,end]=HOMEWORK_PAGES[unit]||HOMEWORK_PAGES[1];return `${start}–${end}`}
export function homeworkText(unit:number){return `Speed Phonics 2권 Unit ${unit}, ${homeworkPages(unit)}페이지까지 풀어봐요!`}
