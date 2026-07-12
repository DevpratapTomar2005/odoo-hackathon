import  dotenv from "dotenv";
dotenv.config();


if (!process.env.PORT){
    throw new Error("PORT is not defined in environment variables");
}

if (!process.env.DATABASE_URL){
    throw new Error("DATABASE_URL is not defined in environment variables");
}

if (!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in environment variables");
}

if (!process.env.CORS_ORIGIN){
    throw new Error("CORS_ORIGIN is not defined in environment variables");
}

const config = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ORIGIN: process.env.CORS_ORIGIN
}

export default config;