/* eslint-disable @typescript-eslint/no-explicit-any */

export type ActionType = 'SETUP' | 'ERROR' | 'QUERY' | 'COMMAND' | 'QUERY_COMPLETE' | 'COMMAND_COMPLETE' | 'STATE_UPDATED';

export interface ActionConfig {
  method?: string;
  authorization?: string;
}

export interface Action {
  type: ActionType;
  payload?: any;
  metadata?: {
    path?: string[];
    correlationId?: string;
  },
  config?: ActionConfig
}

export type Subscription = (data: any) => unknown;

export type State = any;
