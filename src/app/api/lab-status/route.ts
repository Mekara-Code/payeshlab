import { getCurrentLabStatus } from "@/lib/lab-availability";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Authoritative open/closed state. The timestamp is produced on the server so
 * the countdown on the page never depends on the viewer's device clock.
 */
export async function GET() {
  const settings = await getSiteSettings();
  const status = getCurrentLabStatus({
    holidays: settings.holidays.map((holiday) => holiday.date),
    workingHours: settings.workingHours,
  });

  return Response.json(status, {
    headers: { "cache-control": "no-store, max-age=0" },
  });
}
