import "dotenv/config";

export const SERVER_PORT = Number(process.env.SERVER_PORT);
export const HASH_SALT_ROUNDS = Number(process.env.HASH_SALT_ROUNDS);
