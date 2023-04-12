import {model, Schema, Document} from "mongoose";

export interface IEvent extends Document {
    clientId: number,
    value: string[];
}

const eventSchema = new Schema<IEvent>({
    clientId: Number,
    value: [String]
});

const Event = model('Event', eventSchema, 'event');

export default Event;