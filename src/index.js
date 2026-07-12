/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


import {
	requestUrlParser,
} from "./router.js";
import {
	generateRequestParamString,
	generateCompleteImageUrl,
	getImageUrlsByRequest,
} from "./unsplash.js";
import {
	generateCacheKey,
	getImageUrlsFromCache,
	getLimitFromCache,
	setLimitToCache,
	setImageUrlsToCache,
} from "./cache.js";

export default {
	async fetch(request, env, ctx) {
		/* 解析请求 URL，提取 Unsplash 参数、图像尺寸参数和其他参数。 */
		const paramInfo = requestUrlParser(request.url);
		if (!paramInfo) {
			return new Response("400 Bad Request", {status: 400});
		}

		/* 生成 Unsplash API 请求参数字符串。 */
		const requestParamString = generateRequestParamString(paramInfo);
		/* 生成缓存键。 */
		const cacheKey = await generateCacheKey(requestParamString);

		/* 查缓存。 */
		let imageUrls = await getImageUrlsFromCache(env.KV_CACHE, cacheKey);
		/* 命中缓存。 */
		if (imageUrls) {
			return Response.redirect(generateCompleteImageUrl(imageUrls, paramInfo));
		}

		/* 未命中缓存。 */
		/* 查限额。 */
		const limit = await getLimitFromCache(env.KV_CACHE);
		/* 超额。 */
		if (limit === 0) {
			return new Response("429 Too Many Requests", {status: 429});
		}
		/* 未超额。 */
		/* 请求。 */
		imageUrls = await getImageUrlsByRequest(requestParamString, env.UNSPLASH_API_KEY);

		/* 无论请求是否成功，都更新限额（异步执行）。 */
		ctx.waitUntil(setLimitToCache(env.KV_CACHE, limit - 1));

		if (!imageUrls) {
			return new Response("500 Internal Server Error", {status: 500});
		}

		const completeUrl = generateCompleteImageUrl(imageUrls, paramInfo);
		if (!completeUrl) {
			return new Response("500 Internal Server Error", {status: 500});
		}

		/* 请求成功。 */
		/* 先写入缓存（异步执行）。 */
		ctx.waitUntil(setImageUrlsToCache(env.KV_CACHE, cacheKey, imageUrls, env.TIME_ZONE_OFFSET_SEC));

		/* 返回重定向响应。 */
		return Response.redirect(completeUrl);
	},
};
