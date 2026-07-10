/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


import {Constants} from "./constants";


/**
 * 只支持查询参数，URL 路径不做处理。
 *
 * 将据此建立缓存。不同的参数应当分别单独建立缓存。
 * 相同的参数同一天内，应该请求到相同的图片。
 * 因此，相同的参数同一天内，只请求一次 Unsplash API。
 * 如果请求成功，应缓存结果 URL。
 *
 * 选项类型的参数，如果出现不支持的选项，则回退到默认值。
 *
 * collections、topics、username、query 四个参数是一组的。
 * 只要指定了其中任何一个，都会覆盖默认值。
 *
 * 其余参数全部透传给最终的图片 URL。
 */
export function requestUrlParser(requestUrlString) {
	const ParamConfig = Constants.Router.PARAM_CONFIG;

	let requestUrl;

	try {
		requestUrl = new URL(requestUrlString);
	} catch {
		return null;
	}

	const params = requestUrl.searchParams;

	const paramInfo = {
		unsplash: {
			/* 非选项参数采用先默认空值，指定覆盖后，如果都没有覆盖过，再上默认值的策略。 */
			query: "",
			username: "",
			topics: [],
			collections: [],
			/* 选项参数采用先默认值，如果指定则覆盖的策略。 */
			orientation: ParamConfig.OptionDefault.orientation,
			content_filter: ParamConfig.OptionDefault.content_filter,
			size: ParamConfig.OptionDefault.size,
		},
		/* 其他参数默认使用 Map，以确保键唯一。 */
		other: new Map(),
	};

	for (const [key, value] of params) {
		/* 忽略为空字符串的键和值。 */
		if (value.trim().length === 0 || key.trim().length === 0) {
			continue;
		}

		/* 单值参数处理。 */
		if (ParamConfig.SingleValueKeys.has(key)) {
			paramInfo.unsplash[key] = value;
		}
		/* 多值参数处理。 */
		else if (ParamConfig.MultiValueKeys.has(key)) {
			/* 对多值参数进行去重和排序。 */
			paramInfo.unsplash[key] = [...new Set(
				value.split(",").filter(Boolean),
			)].sort();
		}
		/* 选项参数处理。 */
		else if (ParamConfig.OptionKeys.has(key)) {
			if (ParamConfig.OptionAllowed[key].has(value)) {
				paramInfo.unsplash[key] = value;
			}
		}
		/* 其他参数处理。 */
		else {
			paramInfo.other.set(key, value);
		}
	}

	/* 处理非选项参数默认值。如果都没有被指定过，才采用默认值。 */
	if (paramInfo.unsplash.query.length === 0 && paramInfo.unsplash.username.length === 0 &&
		paramInfo.unsplash.topics.length === 0 && paramInfo.unsplash.collections.length === 0
	) {
		paramInfo.unsplash.topics = ParamConfig.MultiValueDefaults.topics;
	}

	return paramInfo;
}
