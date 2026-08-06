import { SignalREventType } from './signal-r-event-type';

export type SignalREvent<TValue = unknown> = {
    type: SignalREventType;
    value: TValue;
};