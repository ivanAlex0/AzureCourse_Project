import {BlobServiceClient, ContainerClient} from "@azure/storage-blob";
import ENV from "../config/env";

class StorageAccountService {
    private client: BlobServiceClient;

    constructor() {
        try {
            this.client = BlobServiceClient.fromConnectionString(ENV.AzureWebJobsStorage);
        } catch (e) {
            console.log(e);
        }
    }

    async getContainerClient(name: string): Promise<ContainerClient>{
        const container = this.client.getContainerClient(name);

        if(!await container.exists()){
            console.log("Container does not exist");
        }

        return container;
    }

    async moveBlob(name: string, inputContainer: string, destinationContainer: string): Promise<void> {
        const src = await this.getContainerClient(inputContainer);
        const dest = await this.getContainerClient(destinationContainer);

        const sourceBlob = src.getBlobClient(name);

        const destinationBlob = dest.getBlobClient(name);

        const copyPoller = await destinationBlob.beginCopyFromURL(sourceBlob.url);
        await copyPoller.pollUntilDone();

        await sourceBlob.delete();
    }
}

export default StorageAccountService;