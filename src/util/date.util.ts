import moment from "moment";

export class DateUtil {

	static getRelativeTime = (timestamp) => {
		const time = moment.unix(timestamp);
		const now = moment();

		const diffInMinutes = now.diff(time, 'minutes');
		const diffInHours = now.diff(time, 'hours');
		const diffInDays = now.diff(time, 'days');
		const diffInWeeks = now.diff(time, 'weeks');
		const diffInMonths = now.diff(time, 'months');
		const diffInYears = now.diff(time, 'years');

		let date;
		if (diffInMinutes < 1) {
			date = 'Just now';
		} else if (diffInMinutes == 1) {
			date = 'a minute ago';
		} else if (diffInMinutes < 60) {
			date = `${diffInMinutes} minutes ago`;
		} else if (diffInHours == 1) {
			date = `an hour ago`;
		} else if (diffInHours < 24) {
			date = `${diffInHours} hours ago`;
		} else if (diffInDays == 0) {
			date = 'Today';
		} else if (diffInDays == 1) {
			date = 'Yesterday';
		} else if (diffInDays < 7) {
			date = `${diffInDays} days ago`;
		} else if (diffInWeeks < 2) {
			date = 'Last week'
		} else if (diffInWeeks >= 2 && diffInMonths < 1) {
			date = `${diffInWeeks} weeks ago`;
		} else if (diffInMonths == 1) {
			date = 'A month ago';
		} else if (diffInMonths < 12) {
			date = `${diffInMonths} months ago`;
		} else if (diffInYears < 2) {
			date = 'A year ago';
		} else {
			date = `${diffInYears} years ago`;
		}

		return date;
	}

}