
export interface MoveResult {
    reward: number;
    isFailed: boolean;
}

export const failedResult = (reward: number): MoveResult => ({reward, isFailed: true});
export const successfulResult = (reward: number): MoveResult => ({reward, isFailed: false});
