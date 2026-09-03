import "server-only";

import { getPrisma } from "@/lib/prisma";
import {
  isWorkingDayId,
  isWorkingTimePeriodId,
  type WorkingDayId,
  type WorkingTimePeriodId,
} from "@/lib/working-hours";

export const SITE_SETTINGS_ID = "site";

export type SitePhoneData = {
  id: string;
  label: string | null;
  phone: string;
  sortOrder: number;
};

export type SiteAddressData = {
  address: string;
  id: string;
  sortOrder: number;
  title: string | null;
};

export type SiteWorkingHourData = {
  endDay: WorkingDayId;
  endPeriod: WorkingTimePeriodId;
  endTime: string;
  id: string;
  sortOrder: number;
  startDay: WorkingDayId;
  startPeriod: WorkingTimePeriodId;
  startTime: string;
};

export type SiteSettingsData = {
  addresses: SiteAddressData[];
  ceoMessage: string | null;
  city: string | null;
  eitaaUrl: string | null;
  instagramUrl: string | null;
  laboratoryName: string | null;
  latitude: number | null;
  longitude: number | null;
  phoneNumbers: SitePhoneData[];
  province: string | null;
  rubikaUrl: string | null;
  shortDescription: string | null;
  surveyFormUrl: string | null;
  whatsappUrl: string | null;
  workingHours: SiteWorkingHourData[];
};

export const emptySiteSettings: SiteSettingsData = {
  addresses: [],
  ceoMessage: null,
  city: null,
  eitaaUrl: null,
  instagramUrl: null,
  laboratoryName: null,
  latitude: null,
  longitude: null,
  phoneNumbers: [],
  province: null,
  rubikaUrl: null,
  shortDescription: null,
  surveyFormUrl: null,
  whatsappUrl: null,
  workingHours: [],
};

export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const settings = await getPrisma().siteSettings.findUnique({
      include: {
        addresses: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        phoneNumbers: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
        workingHours: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      },
      where: { id: SITE_SETTINGS_ID },
    });

    if (!settings) return emptySiteSettings;

    return {
      addresses: settings.addresses.map((address) => ({
        address: address.address,
        id: address.id,
        sortOrder: address.sortOrder,
        title: address.title,
      })),
      ceoMessage: settings.ceoMessage,
      city: settings.city,
      eitaaUrl: settings.eitaaUrl,
      instagramUrl: settings.instagramUrl,
      laboratoryName: settings.laboratoryName,
      latitude: settings.latitude === null ? null : Number(settings.latitude),
      longitude:
        settings.longitude === null ? null : Number(settings.longitude),
      phoneNumbers: settings.phoneNumbers.map((phone) => ({
        id: phone.id,
        label: phone.label,
        phone: phone.phone,
        sortOrder: phone.sortOrder,
      })),
      province: settings.province,
      rubikaUrl: settings.rubikaUrl,
      shortDescription: settings.shortDescription,
      surveyFormUrl: settings.surveyFormUrl,
      whatsappUrl: settings.whatsappUrl,
      workingHours: settings.workingHours.map((workingHour) => ({
        endDay: isWorkingDayId(workingHour.endDay)
          ? workingHour.endDay
          : "SATURDAY",
        endPeriod: isWorkingTimePeriodId(workingHour.endPeriod)
          ? workingHour.endPeriod
          : "NIGHT",
        endTime: workingHour.endTime,
        id: workingHour.id,
        sortOrder: workingHour.sortOrder,
        startDay: isWorkingDayId(workingHour.startDay)
          ? workingHour.startDay
          : "SATURDAY",
        startPeriod: isWorkingTimePeriodId(workingHour.startPeriod)
          ? workingHour.startPeriod
          : "MORNING",
        startTime: workingHour.startTime,
      })),
    };
  } catch {
    // The public site stays available while the settings migration is being applied.
    return emptySiteSettings;
  }
}
