/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as classifieds from "../classifieds.js";
import type * as collections from "../collections.js";
import type * as http from "../http.js";
import type * as jobs from "../jobs.js";
import type * as locationActivity from "../locationActivity.js";
import type * as minerals from "../minerals.js";
import type * as safety from "../safety.js";
import type * as seed from "../seed.js";
import type * as seedCentralWA from "../seedCentralWA.js";
import type * as seedExpandedWA from "../seedExpandedWA.js";
import type * as seedMassiveWA from "../seedMassiveWA.js";
import type * as seedRegional from "../seedRegional.js";
import type * as social from "../social.js";
import type * as uploads from "../uploads.js";
import type * as users from "../users.js";
import type * as weather from "../weather.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  chat: typeof chat;
  classifieds: typeof classifieds;
  collections: typeof collections;
  http: typeof http;
  jobs: typeof jobs;
  locationActivity: typeof locationActivity;
  minerals: typeof minerals;
  safety: typeof safety;
  seed: typeof seed;
  seedCentralWA: typeof seedCentralWA;
  seedExpandedWA: typeof seedExpandedWA;
  seedMassiveWA: typeof seedMassiveWA;
  seedRegional: typeof seedRegional;
  social: typeof social;
  uploads: typeof uploads;
  users: typeof users;
  weather: typeof weather;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
