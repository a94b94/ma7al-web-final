import { LRUCache } from "lru-cache";

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
  max?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60 * 1000, // 1 دقيقة
  });

  return {
    check: (res: any, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        if (tokenCount[0] === 0) tokenCache.set(token, tokenCount);
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > (options?.max || 10);

        res.setHeader("X-RateLimit-Limit", options?.max || 10);
        res.setHeader("X-RateLimit-Remaining", isRateLimited ? 0 : (options?.max || 10) - currentUsage);

        return isRateLimited
          ? reject(new Error("❗ تم تجاوز الحد المسموح للطلبات."))
          : resolve();
      }),
  };
}
