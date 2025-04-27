// src/global.d.ts
/// <reference lib="webworker" />
export {};

declare global {
	interface CacheStorage {
		/**
		 * The default Cloudflare Workers cache binding.
		 */
		readonly default: Cache;
	}
}
