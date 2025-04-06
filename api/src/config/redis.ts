import redis from "redis";

const initRedis = async () => {
  const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  redisClient.on("ready", () => console.log("Redis Client Connected"));
  await redisClient.connect();

  return redisClient;
}

export { initRedis };