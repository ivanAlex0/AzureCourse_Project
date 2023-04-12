import {AzureFunction, Context} from "@azure/functions";
import {CsvParserStream, parse} from "fast-csv";
import ServiceBusService from "../services/serviceBus.service";
import StorageAccountService from "../services/storageAccount.service";
import {IEvent} from "../models/event";

const serviceBusService: ServiceBusService = new ServiceBusService();
const storageAccountService: StorageAccountService = new StorageAccountService();

const parseBlob = async (blobData: string | Buffer): Promise<void> =>
    new Promise((resolve, reject) => {
       const stream: CsvParserStream<IEvent, IEvent> = parse<IEvent, IEvent>({
           delimiter: ',',
           headers: true
       })

        stream.on('data', (data: IEvent) => {
           serviceBusService.sendMessage(data, `${data.clientId}`);
        });

       stream.on('end', () => {
           resolve();
           return;
       })

        stream.write(blobData);
        stream.end();
    });

const importer: AzureFunction = async (
    context: Context,
    inputBlob: string | Buffer
): Promise<void> => {
    await parseBlob(inputBlob);

    await storageAccountService.moveBlob(context.bindingData.name, "input", "output");
}

export default importer;