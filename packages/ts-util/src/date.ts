import { zeroPadding } from "./utils.js";

/**
 * Shared utility functions for Date manipulation.
 * * @remarks
 * **Known Limitations:**
 * - **Two-digit Year Behavior:** Due to native JavaScript `Date` constructor rules, year values between 0 and 99 are interpreted as 1900-1999 (e.g., year 26 becomes 1926).
 * - **Automatic Date Rollover:** Invalid dates (such as month 13 or day 32) do not throw errors. The native `Date` object will silently roll over and recalculate to the next valid date.
 */
export namespace DateUtil {
  /** Create new date without time */
  export function removeTime(dateTime: Date): Date {
    return new Date(
      dateTime.getFullYear(),
      dateTime.getMonth(),
      dateTime.getDate(),
    );
  }

  /** Create new date without time and days */
  export function removeDay(dateTime: Date): Date {
    return new Date(dateTime.getFullYear(), dateTime.getMonth());
  }

  /** Formats a date to YYYY-MM-DD */
  export function formatYYYYMMDD(date: Date, delimit: string = "-"): string {
    return `${date.getFullYear()}${delimit}${zeroPadding(date.getMonth() + 1)}${delimit}${zeroPadding(date.getDate())}`;
  }

  /** Formats a date to YYYY-MM */
  export function formatYYYYMM(date: Date, delimit: string = "-"): string {
    return `${date.getFullYear()}${delimit}${zeroPadding(date.getMonth() + 1)}`;
  }

  /** Formats a date to HH:MM:SS */
  export function formatHHMMSS(date: Date, delimit: string = ":"): string {
    return `${zeroPadding(date.getHours())}${delimit}${zeroPadding(date.getMinutes())}${delimit}${zeroPadding(date.getSeconds())}`;
  }

  /** Formats a date to HH:MM */
  export function formatHHMM(date: Date, delimit: string = ":"): string {
    return `${zeroPadding(date.getHours())}${delimit}${zeroPadding(date.getMinutes())}`;
  }

  /** Formats a date to UTC YYYY-MM-DD */
  export function formatUTCYYYYMMDD(date: Date, delimit: string = "-"): string {
    return `${date.getUTCFullYear()}${delimit}${zeroPadding(date.getUTCMonth() + 1)}${delimit}${zeroPadding(date.getUTCDate())}`;
  }

  /** Formats a date to UTC YYYY-MM */
  export function formatUTCYYYYMM(date: Date, delimit: string = "-"): string {
    return `${date.getUTCFullYear()}${delimit}${zeroPadding(date.getUTCMonth() + 1)}`;
  }

  /** Formats a date to UTC HH:MM:SS */
  export function formatUTCHHMMSS(date: Date, delimit: string = ":"): string {
    return `${zeroPadding(date.getUTCHours())}${delimit}${zeroPadding(date.getUTCMinutes())}${delimit}${zeroPadding(date.getUTCSeconds())}`;
  }

  /** Formats a date to UTC HH:MM */
  export function formatUTCHHMM(date: Date, delimit: string = ":"): string {
    return `${zeroPadding(date.getUTCHours())}${delimit}${zeroPadding(date.getUTCMinutes())}`;
  }

  /** Parses a string formatted as YYYY-MM-DD into a Date */
  export function fromYYYYMMDD(str: string, delimit: string = "-"): Date {
    const [year, month, day] = str.split(delimit).map(Number);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      throw Error("format not valid");
    }

    return new Date(year!, month! - 1, day!);
  }

  /** Parses a string formatted as YYYY-MM-DD into a UTC Date */
  export function fromUTCYYYYMMDD(str: string, delimit: string = "-"): Date {
    const [year, month, day] = str.split(delimit).map(Number);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      throw Error("format not valid");
    }

    return new Date(Date.UTC(year!, month! - 1, day!));
  }

  /** Korean full names of the days of the week */
  export const KoreanWeekNames = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];

  /** Korean short names of the days of the week */
  export const KoreanWeekNamesShort = [
    "일",
    "월",
    "화",
    "수",
    "목",
    "금",
    "토",
  ];

  /** English full names of the days of the week */
  export const EnglishWeekNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  /** English short names of the days of the week */
  export const EnglishWeekNamesShort = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];
}
