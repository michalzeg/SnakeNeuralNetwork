import { Action } from "./actions";
import { State } from "./state";

export interface ReplayBuffer {
    state: State;
    action: Action;
    reward: number;
    nextState: State;
    done: boolean;
}
