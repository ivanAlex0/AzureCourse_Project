const ENV = {
    AzureWebJobsStorage: process.env.AzureWebJobsStorage,
    SBUS_TOPIC: process.env.SBUS_TOPIC,
    SBUS_CONNECTION: process.env.SBUS_CONNECTION,
    COSMOS_DB_URL: process.env.COSMOS_DB_URL,
    COSMOS_DB_NAME: process.env.COSMOS_DB_NAME
};

export default ENV;