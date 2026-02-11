import "dotenv/config";

export const SERVER_PORT = Number(process.env.SERVER_PORT);
export const HASH_SALT_ROUNDS = Number(process.env.HASH_SALT_ROUNDS);

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
