"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-session";
import { getPrisma } from "@/lib/prisma";
import { SITE_SETTINGS_ID } from "@/lib/site-settings";
import {
  formatWorkingDayRange,
  isWorkingDayId,
} from "@/lib/working-hours";

export type SettingsActionState = {
  message?: string;
  success?: boolean;
};

export type LocationSearchResult = {
  city: string | null;
  displayName: string;
  latitude: number;
  longitude: number;
  province: string | null;
};

export type LocationSearchState = {
  message?: string;
  results?: LocationSearchResult[];
};

const globalForLocationSearch = globalThis as typeof globalThis & {
  payeshLabLastLocationSearchAt?: number;
};

function getString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function isAuthorizedAdmin() {
  const session = await getAdminSession();
  return session?.role === "ADMIN";
}

function revalidateSettingsPaths() {
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath("/contact");
  revalidatePath("/admin");
}

function normalizeOptionalUrl(value: string) {
  if (!value) return { value: null };

  try {
    const url = new URL(value);
    if (url.protocol !== "https:")
      return { error: "نشانی شبکه اجتماعی باید با https شروع شود." };
    return { value: url.toString() };
  } catch {
    return { error: "یکی از نشانی‌های شبکه اجتماعی معتبر نیست." };
  }
}

function getCoordinate(value: string, minimum: number, maximum: number) {
  if (!value) return { value: null };
  const coordinate = Number(value);
  if (
    !Number.isFinite(coordinate) ||
    coordinate < minimum ||
    coordinate > maximum
  )
    return { error: true };
  return { value: Number(coordinate.toFixed(6)) };
}

function getAddressName(address: Record<string, unknown>, names: string[]) {
  const value = names
    .map((name) => address[name])
    .find((item) => typeof item === "string" && item.trim());
  return typeof value === "string" ? value.trim().slice(0, 100) : null;
}

export async function searchIranLocations(
  provinceInput: string,
  cityInput: string,
): Promise<LocationSearchState> {
  if (!(await isAuthorizedAdmin()))
    return { message: "دسترسی شما برای جست‌وجوی موقعیت معتبر نیست." };

  const province = provinceInput.trim().slice(0, 100);
  const city = cityInput.trim().slice(0, 100);
  const query = [city, province, "Iran"].filter(Boolean).join(", ");
  if (query.length < 4)
    return { message: "نام استان یا شهر را برای جست‌وجو وارد کنید." };

  const now = Date.now();
  const lastSearchAt =
    globalForLocationSearch.payeshLabLastLocationSearchAt ?? 0;
  if (now - lastSearchAt < 1_100)
    return { message: "لطفاً یک لحظه صبر کنید و دوباره جست‌وجو کنید." };
  globalForLocationSearch.payeshLabLastLocationSearchAt = now;

  const searchUrl = new URL("https://nominatim.openstreetmap.org/search");
  searchUrl.searchParams.set("q", query);
  searchUrl.searchParams.set("format", "jsonv2");
  searchUrl.searchParams.set("addressdetails", "1");
  searchUrl.searchParams.set("accept-language", "fa");
  searchUrl.searchParams.set("countrycodes", "ir");
  searchUrl.searchParams.set("limit", "5");

  try {
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          process.env.NOMINATIM_USER_AGENT ??
          "PayeshLab/1.0 (admin location search)",
      },
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok)
      return {
        message: "جست‌وجوی موقعیت در حال حاضر در دسترس نیست. دوباره تلاش کنید.",
      };

    const data: unknown = await response.json();
    if (!Array.isArray(data))
      return { message: "پاسخ جست‌وجوی موقعیت معتبر نیست." };

    const results = data.flatMap((item): LocationSearchResult[] => {
      if (!item || typeof item !== "object") return [];
      const result = item as {
        address?: unknown;
        display_name?: unknown;
        lat?: unknown;
        lon?: unknown;
      };
      const latitude =
        typeof result.lat === "string" ? Number(result.lat) : Number.NaN;
      const longitude =
        typeof result.lon === "string" ? Number(result.lon) : Number.NaN;
      if (
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180 ||
        typeof result.display_name !== "string"
      )
        return [];
      const address =
        result.address &&
        typeof result.address === "object" &&
        !Array.isArray(result.address)
          ? (result.address as Record<string, unknown>)
          : {};
      return [
        {
          city: getAddressName(address, [
            "city",
            "town",
            "village",
            "municipality",
            "county",
          ]),
          displayName: result.display_name.slice(0, 300),
          latitude: Number(latitude.toFixed(6)),
          longitude: Number(longitude.toFixed(6)),
          province: getAddressName(address, [
            "state",
            "province",
            "state_district",
          ]),
        },
      ];
    });

    return results.length > 0
      ? { results }
      : {
          message:
            "موقعیتی با این استان و شهر پیدا نشد. املای نام را بررسی کنید.",
        };
  } catch {
    return {
      message: "ارتباط با سرویس جست‌وجوی موقعیت برقرار نشد. دوباره تلاش کنید.",
    };
  }
}

async function ensureSettings() {
  await getPrisma().siteSettings.upsert({
    create: { id: SITE_SETTINGS_ID },
    update: {},
    where: { id: SITE_SETTINGS_ID },
  });
}

export async function saveSiteSettings(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  if (!(await isAuthorizedAdmin()))
    return { message: "دسترسی شما برای ویرایش تنظیمات معتبر نیست." };

  const laboratoryName = getString(formData, "laboratoryName");
  const shortDescription = getString(formData, "shortDescription");
  const province = getString(formData, "province");
  const city = getString(formData, "city");
  const instagramUrl = normalizeOptionalUrl(
    getString(formData, "instagramUrl"),
  );
  const whatsappUrl = normalizeOptionalUrl(getString(formData, "whatsappUrl"));
  const telegramUrl = normalizeOptionalUrl(getString(formData, "telegramUrl"));
  const latitude = getCoordinate(getString(formData, "latitude"), -90, 90);
  const longitude = getCoordinate(getString(formData, "longitude"), -180, 180);

  if (
    laboratoryName.length > 160 ||
    shortDescription.length > 500 ||
    province.length > 100 ||
    city.length > 100
  )
    return {
      message: "نام، توضیح کوتاه، استان یا شهر بیش از اندازه طولانی است.",
    };
  if (instagramUrl.error || whatsappUrl.error || telegramUrl.error)
    return {
      message: instagramUrl.error ?? whatsappUrl.error ?? telegramUrl.error,
    };
  if (
    latitude.error ||
    longitude.error ||
    (latitude.value === null) !== (longitude.value === null)
  )
    return {
      message: "برای موقعیت، عرض و طول جغرافیایی معتبر را با هم وارد کنید.",
    };

  try {
    await getPrisma().siteSettings.upsert({
      create: {
        id: SITE_SETTINGS_ID,
        city: city || null,
        instagramUrl: instagramUrl.value,
        laboratoryName: laboratoryName || null,
        latitude: latitude.value,
        longitude: longitude.value,
        province: province || null,
        shortDescription: shortDescription || null,
        telegramUrl: telegramUrl.value,
        whatsappUrl: whatsappUrl.value,
      },
      update: {
        instagramUrl: instagramUrl.value,
        city: city || null,
        laboratoryName: laboratoryName || null,
        latitude: latitude.value,
        longitude: longitude.value,
        province: province || null,
        shortDescription: shortDescription || null,
        telegramUrl: telegramUrl.value,
        whatsappUrl: whatsappUrl.value,
      },
      where: { id: SITE_SETTINGS_ID },
    });
  } catch {
    return { message: "ذخیره تنظیمات انجام نشد. دوباره تلاش کنید." };
  }

  revalidateSettingsPaths();
  return { message: "اطلاعات و راه‌های ارتباطی ذخیره شد.", success: true };
}

export async function clearLaboratoryIdentity(): Promise<SettingsActionState> {
  if (!(await isAuthorizedAdmin()))
    return { message: "دسترسی شما برای حذف اطلاعات معتبر نیست." };

  try {
    await getPrisma().siteSettings.upsert({
      create: { id: SITE_SETTINGS_ID },
      update: { laboratoryName: null, shortDescription: null },
      where: { id: SITE_SETTINGS_ID },
    });
  } catch {
    return { message: "حذف اطلاعات انجام نشد. دوباره تلاش کنید." };
  }

  revalidateSettingsPaths();
  return { message: "نام و توضیح آزمایشگاه حذف شد.", success: true };
}

function getPhoneData(formData: FormData) {
  const label = getString(formData, "label");
  const phone = getString(formData, "phone");
  if (label.length > 80 || !/^[+0-9()\s-]{5,40}$/.test(phone)) return null;
  return { label: label || null, phone };
}

export async function createSitePhone(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  if (!(await isAuthorizedAdmin()))
    return { message: "دسترسی شما برای افزودن تلفن معتبر نیست." };
  const phone = getPhoneData(formData);
  if (!phone) return { message: "عنوان یا شماره تلفن را بررسی کنید." };

  try {
    await ensureSettings();
    const latestPhone = await getPrisma().sitePhone.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
      where: { settingsId: SITE_SETTINGS_ID },
    });
    await getPrisma().sitePhone.create({
      data: {
        ...phone,
        settingsId: SITE_SETTINGS_ID,
        sortOrder: (latestPhone?.sortOrder ?? 0) + 10,
      },
    });
  } catch {
    return { message: "شماره تلفن ذخیره نشد. دوباره تلاش کنید." };
  }

  revalidateSettingsPaths();
  return { message: "شماره تلفن اضافه شد.", success: true };
}

export async function updateSitePhone(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const id = getString(formData, "id");
  if (!(await isAuthorizedAdmin()) || !isValidUuid(id))
    return { message: "درخواست ویرایش شماره تلفن معتبر نیست." };
  const phone = getPhoneData(formData);
  if (!phone) return { message: "عنوان یا شماره تلفن را بررسی کنید." };

  try {
    const existing = await getPrisma().sitePhone.findFirst({
      select: { id: true },
      where: { id, settingsId: SITE_SETTINGS_ID },
    });
    if (!existing) return { message: "شماره تلفن پیدا نشد." };
    await getPrisma().sitePhone.update({ data: phone, where: { id } });
  } catch {
    return { message: "ویرایش شماره تلفن انجام نشد." };
  }

  revalidateSettingsPaths();
  return { message: "شماره تلفن به‌روزرسانی شد.", success: true };
}

export async function deleteSitePhone(
  id: string,
): Promise<SettingsActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidUuid(id))
    return { message: "درخواست حذف شماره تلفن معتبر نیست." };

  try {
    const existing = await getPrisma().sitePhone.findFirst({
      select: { id: true },
      where: { id, settingsId: SITE_SETTINGS_ID },
    });
    if (!existing) return { message: "شماره تلفن پیدا نشد." };
    await getPrisma().sitePhone.delete({ where: { id } });
  } catch {
    return { message: "حذف شماره تلفن انجام نشد." };
  }

  revalidateSettingsPaths();
  return { message: "شماره تلفن حذف شد.", success: true };
}

function getAddressData(formData: FormData) {
  const title = getString(formData, "title");
  const address = getString(formData, "address");
  if (title.length > 100 || !address || address.length > 2_000) return null;
  return { address, title: title || null };
}

export async function createSiteAddress(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  if (!(await isAuthorizedAdmin()))
    return { message: "دسترسی شما برای افزودن آدرس معتبر نیست." };
  const address = getAddressData(formData);
  if (!address) return { message: "عنوان یا متن آدرس را بررسی کنید." };

  try {
    await ensureSettings();
    const latestAddress = await getPrisma().siteAddress.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
      where: { settingsId: SITE_SETTINGS_ID },
    });
    await getPrisma().siteAddress.create({
      data: {
        ...address,
        settingsId: SITE_SETTINGS_ID,
        sortOrder: (latestAddress?.sortOrder ?? 0) + 10,
      },
    });
  } catch {
    return { message: "آدرس ذخیره نشد. دوباره تلاش کنید." };
  }

  revalidateSettingsPaths();
  return { message: "آدرس جدید اضافه شد.", success: true };
}

export async function updateSiteAddress(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const id = getString(formData, "id");
  if (!(await isAuthorizedAdmin()) || !isValidUuid(id))
    return { message: "درخواست ویرایش آدرس معتبر نیست." };
  const address = getAddressData(formData);
  if (!address) return { message: "عنوان یا متن آدرس را بررسی کنید." };

  try {
    const existing = await getPrisma().siteAddress.findFirst({
      select: { id: true },
      where: { id, settingsId: SITE_SETTINGS_ID },
    });
    if (!existing) return { message: "آدرس پیدا نشد." };
    await getPrisma().siteAddress.update({ data: address, where: { id } });
  } catch {
    return { message: "ویرایش آدرس انجام نشد." };
  }

  revalidateSettingsPaths();
  return { message: "آدرس به‌روزرسانی شد.", success: true };
}

function getWorkingHourData(formData: FormData) {
  const startDay = getString(formData, "startDay");
  const endDay = getString(formData, "endDay");
  const startTime = getString(formData, "startTime");
  const endTime = getString(formData, "endTime");
  const isValidTime = (value: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

  if (
    !isWorkingDayId(startDay) ||
    !isWorkingDayId(endDay) ||
    !isValidTime(startTime) ||
    !isValidTime(endTime)
  )
    return null;

  return {
    endDay,
    endTime,
    hours: `${startTime} تا ${endTime}`,
    label: formatWorkingDayRange(startDay, endDay),
    startDay,
    startTime,
  };
}

export async function createSiteWorkingHour(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  if (!(await isAuthorizedAdmin()))
    return { message: "دسترسی شما برای افزودن ساعات کاری معتبر نیست." };

  const workingHour = getWorkingHourData(formData);
  if (!workingHour)
    return { message: "روزها و ساعت‌های انتخاب‌شده را بررسی کنید." };

  try {
    await ensureSettings();
    const latestWorkingHour = await getPrisma().siteWorkingHour.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
      where: { settingsId: SITE_SETTINGS_ID },
    });
    await getPrisma().siteWorkingHour.create({
      data: {
        ...workingHour,
        settingsId: SITE_SETTINGS_ID,
        sortOrder: (latestWorkingHour?.sortOrder ?? 0) + 10,
      },
    });
  } catch {
    return { message: "ساعات کاری ذخیره نشد. دوباره تلاش کنید." };
  }

  revalidateSettingsPaths();
  return { message: "بازهٔ کاری جدید اضافه شد.", success: true };
}

export async function updateSiteWorkingHour(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const id = getString(formData, "id");
  if (!(await isAuthorizedAdmin()) || !isValidUuid(id))
    return { message: "درخواست ویرایش ساعات کاری معتبر نیست." };

  const workingHour = getWorkingHourData(formData);
  if (!workingHour)
    return { message: "روزها و ساعت‌های انتخاب‌شده را بررسی کنید." };

  try {
    const existing = await getPrisma().siteWorkingHour.findFirst({
      select: { id: true },
      where: { id, settingsId: SITE_SETTINGS_ID },
    });
    if (!existing) return { message: "بازهٔ کاری پیدا نشد." };

    await getPrisma().siteWorkingHour.update({
      data: workingHour,
      where: { id },
    });
  } catch {
    return { message: "ویرایش ساعات کاری انجام نشد." };
  }

  revalidateSettingsPaths();
  return { message: "ساعات کاری به‌روزرسانی شد.", success: true };
}

export async function deleteSiteWorkingHour(
  id: string,
): Promise<SettingsActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidUuid(id))
    return { message: "درخواست حذف ساعات کاری معتبر نیست." };

  try {
    const existing = await getPrisma().siteWorkingHour.findFirst({
      select: { id: true },
      where: { id, settingsId: SITE_SETTINGS_ID },
    });
    if (!existing) return { message: "بازهٔ کاری پیدا نشد." };

    await getPrisma().siteWorkingHour.delete({ where: { id } });
  } catch {
    return { message: "حذف ساعات کاری انجام نشد." };
  }

  revalidateSettingsPaths();
  return { message: "بازهٔ کاری حذف شد.", success: true };
}

export async function deleteSiteAddress(
  id: string,
): Promise<SettingsActionState> {
  if (!(await isAuthorizedAdmin()) || !isValidUuid(id))
    return { message: "درخواست حذف آدرس معتبر نیست." };

  try {
    const existing = await getPrisma().siteAddress.findFirst({
      select: { id: true },
      where: { id, settingsId: SITE_SETTINGS_ID },
    });
    if (!existing) return { message: "آدرس پیدا نشد." };
    await getPrisma().siteAddress.delete({ where: { id } });
  } catch {
    return { message: "حذف آدرس انجام نشد." };
  }

  revalidateSettingsPaths();
  return { message: "آدرس حذف شد.", success: true };
}
