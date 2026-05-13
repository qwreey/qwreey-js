# Cached Getter (`cached-getter.ts`)

A utility for caching the result of an asynchronous function for a specified Time-To-Live (TTL, `interval`). If `getValue` is called multiple times within the TTL, it returns the cached result instead of executing the function again, preventing redundant operations.

## Real-world Use Case

This is particularly useful when fetching program-wide settings from a database. If the configuration is not critically sensitive to real-time updates, caching it reduces unnecessary database queries and improves performance.

## Classes

### `CachedGetter<Res>`
Caches a single asynchronous function result based on the provided TTL interval (in milliseconds).

**Example:**
```typescript
import { CachedGetter } from './cached-getter.js';

// Cache database settings for 60 seconds (60000ms)
const getDbSettings = new CachedGetter(async () => {
  return await db.settings.findFirst();
}, 60 * 1000);

// Executes the DB query
const config1 = await getDbSettings.getValue();

// Returns the cached promise; no additional DB query is made
const config2 = await getDbSettings.getValue(); 
```

### `CachedGetterMap<Res, Key>`
A mapped variant of `CachedGetter`. It caches multiple results based on unique keys, storing them internally in a `Map`.

**Example:**
```typescript
import { CachedGetterMap } from './cached-getter.js';

// Cache user-specific data for 5 minutes
const getUserData = new CachedGetterMap(async (userId: string) => {
  return await db.users.findUnique({ where: { id: userId } });
}, 5 * 60 * 1000);

// Executes the query for 'user-A'
await getUserData.getValue('user-A');

// Returns cached result for 'user-A'
await getUserData.getValue('user-A');

// Executes a new query for 'user-B' since the key is different
await getUserData.getValue('user-B');
```
