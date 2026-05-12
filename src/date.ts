function zeroPadding(value: number): string {
  if (value > 10) return value.toString();
  return "0" + value.toString();
}

export namespace DateUtil {
  export function removeTime(dateTime: Date): Date {
    return new Date(
      dateTime.getFullYear(),
      dateTime.getMonth(),
      dateTime.getDate(),
    );
  }

  export function removeDay(dateTime: Date): Date {
    return new Date(dateTime.getFullYear(), dateTime.getMonth());
  }

  export function formatYYYYMMDD(date: Date): string {
    return `${date.getFullYear()}-${zeroPadding(date.getMonth() + 1)}-${zeroPadding(date.getDate())}`;
  }
  export function formatUTCYYYYMMDD(date: Date): string {
    return `${date.getUTCFullYear()}-${zeroPadding(date.getUTCMonth() + 1)}-${zeroPadding(date.getUTCDate())}`;
  }
  export function fromUTCYYYMMDD(str: string): Date {
    return new Date(
      `${str.slice(0, 4)}-${str.slice(5, 7)}-${str.slice(8, 10)}T00:00:00.000Z`,
    );
  }
  export function formatUTCHHMMSS(date: Date): string {
    return `${zeroPadding(date.getUTCHours())}:${zeroPadding(date.getUTCMinutes())}:${zeroPadding(date.getUTCSeconds())}`;
  }
}
