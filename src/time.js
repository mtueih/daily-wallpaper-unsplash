/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


export function getNextHourUnix() {
	const now = Math.floor(Date.now() / 1000);
	return now - now % 3600 + 3600;
}

export function getNextMidnightUnix(timeZoneOffset) {
	const nowSeconds  = Math.floor(Date.now() / 1000);

	const timeZoneOffsetSeconds = Number(timeZoneOffset) || 0;

	const localNow  = nowSeconds + timeZoneOffsetSeconds;
	const nextLocalMidnight = localNow - (localNow % 86400) + 86400;

	return nextLocalMidnight - timeZoneOffsetSeconds;
}
