import { NextResponse } from "next/server";
import { exportColumns } from "@/config/export-mapping";
import { getSession } from "@/lib/server/auth";
import { getRepository } from "@/lib/server/repository";
import { cleanFilter } from "@/lib/server/filters";

export const dynamic = "force-dynamic";

function csvCell(v: string | number): string {
  let s = String(v ?? "");
  // Prevent spreadsheet formula injection (plain numbers like +2348031234567 are left alone)
  if (/^[=+\-@\t\r]/.test(s) && !/^[+-]?\d[\d .]*$/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role === "viewer") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const apps = await getRepository().listApplications(cleanFilter(sp));
  const lines = [
    exportColumns.map((c) => csvCell(c.header)).join(","),
    ...apps.map((a) => exportColumns.map((c) => csvCell(c.value(a))).join(",")),
  ];
  console.info(`[audit] ${session.email} exported ${apps.length} applications`);
  // BOM so Excel opens UTF-8 (₦, Yoruba names) correctly
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="lubarsch-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
