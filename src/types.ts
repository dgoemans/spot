export type ActionType = 'SETUP' | 'ERROR' | 'QUERY' | 'COMMAND' | 'QUERY_COMPLETE' | 'COMMAND_COMPLETE' | 'STATE_UPDATED';

export interface Action {
  type: ActionType;
  payload?: any;
  metadata?: {
    path?: string[];
  },
  config?: ActionConfig
}

export interface ActionConfig {
  method?: string;
}

export type Subscription = (data: any) => unknown;

export type State = any;