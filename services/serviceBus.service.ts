import {ServiceBusClient, ServiceBusSender} from "@azure/service-bus";
import ENV from "../config/env";

class ServiceBusService{
    private readonly client: ServiceBusClient;
    private readonly sender: ServiceBusSender;
    private readonly topic: string;

    constructor() {
        this.topic = ENV.SBUS_TOPIC;

        try{
            this.client = new ServiceBusClient(ENV.SBUS_CONNECTION);
            this.sender = this.client.createSender(this.topic);
        }catch (e){
            console.log(e)
        }
    };

    sendMessage(event: any, sessionId: string): Promise<void>{
        return this.sender.sendMessages({body: event, sessionId});
    }
}

export default ServiceBusService;