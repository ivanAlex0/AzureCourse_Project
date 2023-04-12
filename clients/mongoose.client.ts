import * as mongoose from "mongoose";
import ENV from "../config/env";
import Env from "../config/env";

class MongooseClient {
    private static connected = false;

    static async connect(): Promise<boolean> {
        if (this.connected) {
            return true;
        }

        mongoose.set('strictQuery', true);

        if (!Env.COSMOS_DB_URL) {
            this.connected = false;
            return false;
        }

        await mongoose.connect(ENV.COSMOS_DB_URL as string, {
            dbName: ENV.COSMOS_DB_NAME,
            maxIdleTimeMS: 10 * 2000,
            maxPoolSize: 1,
            waitQueueTimeoutMS: 60 * 10 * 1000
        });

        this.connected = true;
        return true;
    }
}

export default MongooseClient;