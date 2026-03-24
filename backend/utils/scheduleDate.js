/**
 * One calendar day key for scheduling (YYYY-MM-DD).
 * Set SCHEDULE_TZ (e.g. Asia/Colombo) in production if the API host uses UTC
 * but drivers/admins work in a specific region.
 */
const SCHEDULE_TZ = process.env.SCHEDULE_TZ;

const enCAOpts = () => (SCHEDULE_TZ ? { timeZone: SCHEDULE_TZ } : undefined);

function todayScheduleDate() {
  return new Date().toLocaleDateString("en-CA", enCAOpts());
}

function normalizeScheduleDate(dateInput) {
  if (dateInput == null || String(dateInput).trim() === "") {
    return todayScheduleDate();
  }
  const s = String(dateInput).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }
  return d.toLocaleDateString("en-CA", enCAOpts());
}

/** Normalize a Firestore/string/Date `date` field to YYYY-MM-DD for comparison. */
function scheduleDateKeyFromStored(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string") {
    const s = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString("en-CA", enCAOpts());
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toLocaleDateString("en-CA", enCAOpts());
  }
  if (typeof value.toDate === "function") {
    try {
      const d = value.toDate();
      return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-CA", enCAOpts());
    } catch {
      return "";
    }
  }
  return String(value).trim();
}

module.exports = {
  todayScheduleDate,
  normalizeScheduleDate,
  scheduleDateKeyFromStored,
  SCHEDULE_TZ,
};
