/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


import {
	getNextHourUnix,
	getNextMidnightUnix,
} from "./time.js";


const LIMIT_CACHE_KEY = "unsplash:remaining_requests_this_hour";
const RATE_LIMIT_PER_HOUR = 50;


async function generateStringSHA256(str) {
	return [...new Uint8Array(
		await crypto.subtle.digest(
			"SHA-256",
			new TextEncoder().encode(str),
		),
	)].map(b =>
		b.toString(16).padStart(2, "0"),
	).join("");
}

export async function generateCacheKey(requestParamString) {
	const sha256Hash = await generateStringSHA256(requestParamString);

	return `unsplash_image_hash:${sha256Hash}`;
}

export async function getImageUrlsFromCache(cacheKV, cacheKey) {
	const cacheValue = await cacheKV.get(cacheKey);
	if (!cacheValue) {
		return null;
	}

	/* 从缓存字符串（JSON）解析对象。 */
	return JSON.parse(cacheValue);
}

export async function getLimitFromCache(cacheKV) {
	const limit = await cacheKV.get(LIMIT_CACHE_KEY);

	return limit ? Number(limit) : RATE_LIMIT_PER_HOUR;
}

export async function setLimitToCache(cacheKV, limit) {
	await cacheKV.put(LIMIT_CACHE_KEY, limit, {
		/* 绝对过期时间。设为下一个 UTC 整点小时时过期。 */
		expiration: getNextHourUnix(),
	});
}

export async function setImageUrlsToCache(cacheKV, cacheKey, imageUrls, timeZoneOffset) {
	await cacheKV.put(cacheKey, JSON.stringify(imageUrls), {
		/* 绝对过期时间。设为指定时区下下一天 0:00。 */
		expiration: getNextMidnightUnix(timeZoneOffset),
	});
}
