import { RcFile } from "antd/es/upload";
import { store } from "../redux/store";
import { CartDetail } from "../types/types";

export const nameTruncated = (
  name: string | null | undefined,
  truncatedLength: number
): string => {
  if (name && name.length > truncatedLength) {
    const length = truncatedLength === 15 ? 12 : truncatedLength;
    return `${name.substring(0, length)}...`;
  }
  return name ?? "";
};

export function formatAMPM(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? "0" + minutes : minutes.toString();
  return `${hours}:${minutesStr} ${ampm}`;
}

export function convertLocalDateTimeToDate(updated: [number, number, number, number, number, number, number]): Date {
  const [year, month, day, hours, minutes, seconds, milliseconds] = updated;
  // Month in JavaScript Date object is 0-based, so subtract 1 from month
  return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
}

export function calculateDays(cartDetail: CartDetail): number {
  const [checkInYear, checkInMonth, checkInDay] = cartDetail.checkIn;
  const [checkOutYear, checkOutMonth, checkOutDay] = cartDetail.checkOut;

  const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay);
  const checkOutDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);

  const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
  const dayDifference = timeDifference / (1000 * 60 * 60 * 24);

  return dayDifference + 1;
}

export function convertLocalDateTimeToString(updated: [number, number, number, number, number, number, number]): string {
  const [year, month, day, hours, minutes, seconds, milliseconds] = updated;
  // Month in JavaScript Date object is 0-based, so subtract 1 from month
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function convertLocalDateToDate(updated: [number, number, number]): Date {
  const [year, month, day] = updated;
  // Month in JavaScript Date object is 0-based, so subtract 1 from month
  return new Date(year, month - 1, day);
}

export function convertLocalDateToString(updated: [number, number, number]): string {
  const [year, month, day] = updated;
  // Month in JavaScript Date object is 0-based, so subtract 1 from month
  return `${year}-${month}-${day}`;
}

export const getDispatch = () => store.dispatch;

export const uploadToCloudinary = async (
  file: RcFile | File,
  cloudName: string,
  uploadPreset: string
): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data.secure_url || null;
};

export function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function convertToDateString(dateString: string): string {
  const year = dateString.substring(0, 4);
  const month = dateString.substring(4, 6);
  const day = dateString.substring(6, 8);
  return `${year}-${month}-${day}`;
}