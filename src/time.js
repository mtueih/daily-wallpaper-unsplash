/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


import {
	toZonedTime,
	fromZonedTime,
} from "date-fns-tz";

export function getNextHourUnix() {
	const now = Math.floor(Date.now() / 1000);
	return now - now % 3600 + 3600;
}

export function getNextMidnightUnix(timeZone) {
	const zoned = toZonedTime(new Date(), timeZone);

	zoned.setDate(zoned.getDate() + 1);
	zoned.setHours(0, 0, 0, 0);

	const utc = fromZonedTime(zoned, timeZone);

	return Math.floor(utc.getTime() / 1000);
}
