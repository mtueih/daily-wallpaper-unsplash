/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


const UNSPLASH_API_URL = "https://api.unsplash.com/photos/random";


export function generateRequestParamString(paramInfo) {
	return new URLSearchParams(paramInfo.unsplash).toString();
}

export function generateCompleteImageUrl(imageUrls, paramInfo) {
	const url = imageUrls?.[paramInfo.imageSize.get("size")];
	if (!url) {
		return null;
	}

	return `${url}${new URLSearchParams(paramInfo.other).toString()}`;
}

export async function getImageUrlsByRequest(requestParamString, accessToken) {
	/* 向 Unsplash API 发起请求。 */
	let response;
	try {
		response = await fetch(`${UNSPLASH_API_URL}?${requestParamString}`, {
			headers: {
				"Authorization": `Client-ID ${accessToken}`,
			},
		});
	} catch {
		return null;
	}
	if (response.status !== 200) {
		return null;
	}

	/* 获取响应体 JSON。 */
	let responseJson;
	try {
		responseJson = await response.json();
	} catch {
		return null;
	}

	/* 返回 urls 字段。 */
	return responseJson?.urls;
}
