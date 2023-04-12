import {AzureFunction, Context} from "@azure/functions";
import MongooseClient from "../clients/mongoose.client";
import Event, {IEvent} from "../models/event";

const consumer: AzureFunction = async (
    context: Context,
    event: IEvent
): Promise<void> => {
    await MongooseClient.connect();

    const existingEvent = await Event.findOne({
        clientId: event.clientId
    });

    if(!existingEvent){
        const newEvent = new Event({
            clientId: event.clientId,
            value: [event.value]
        });

        await newEvent.save();
    }else {
        existingEvent.set({
            value: [...existingEvent.value, event.value]
        });

        existingEvent.save();
    }
}

export default consumer;