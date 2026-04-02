import { Client, Account, Databases, Storage, Functions } from 'appwrite';
import ENV from '../config/env';

const endpoint = ENV.appwrite.endpoint;
const projectId = ENV.appwrite.projectId;

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// Default Database ID
export const DATABASE_ID = ENV.appwrite.databaseId;

export default client;
