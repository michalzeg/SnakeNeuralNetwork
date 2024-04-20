export type Action = 'up' | 'right' | 'down' | 'left';
export type ActionIndex = number;
export const actions: Action[] = ['up', 'right', 'down', 'left'];

export const actionsCount = actions.length;
export const getActionFromIndex = (index: ActionIndex): Action => actions[index];
export const getActionIndex = (action: Action): ActionIndex => actions.indexOf(action);

export type ActionReward = [
    rewardTop: number,
    rewardRight: number,
    rewardBottom: number,
    rewardLeft: number
  ];