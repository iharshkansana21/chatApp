import { Client, Databases, Account } from 'appwrite';

export const PROJECT_ID = '67dd9110001180472aad'
export const DATABASE_ID = '67dd96a90032486f1c83'
export const COLLECTION_ID_MESSAGES = '67dd96c40009c0161397'

const client = new Client();
client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67dd9110001180472aad');

export const databases = new Databases(client);
export const account = new Account(client);

export default client;