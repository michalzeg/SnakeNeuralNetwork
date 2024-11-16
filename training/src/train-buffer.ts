import { ActionReward } from "./actions";
import { State } from "./state";

export interface TrainBuffer {
    state: State;
    targetVector: ActionReward;
}
