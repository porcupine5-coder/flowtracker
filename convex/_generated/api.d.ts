/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as aiAgent from "../aiAgent.js";
import type * as auth from "../auth.js";
import type * as cycles from "../cycles.js";
import type * as dailyMessages from "../dailyMessages.js";
import type * as http from "../http.js";
import type * as mealReminders from "../mealReminders.js";
import type * as notifications from "../notifications.js";
import type * as router from "../router.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  aiAgent: typeof aiAgent;
  auth: typeof auth;
  cycles: typeof cycles;
  dailyMessages: typeof dailyMessages;
  http: typeof http;
  mealReminders: typeof mealReminders;
  notifications: typeof notifications;
  router: typeof router;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
