import kvjs from "@heyputer/kv.js";

const kv = new kvjs();

const set = async (hash: string, key: string, value: any, ttl?: number) => {
  kv.set(hash + key, JSON.stringify(value));
  if (ttl) kv.expire(hash + key, ttl);
};

const get = async (hash: string, key: string) => {
  const value = kv.get(hash + key);
  if (!value || value === "") return undefined;
  return JSON.parse(value);
};

export default { get, set };
