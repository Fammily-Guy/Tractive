/**
 * CSV export column order — edit to match your existing Excel loan register.
 * Each column has a header and a function that reads the value from an application.
 * Reorder, rename or delete rows freely; the export updates automatically.
 */
import type { ApplicationRecord } from "@/lib/server/types";
import { markets } from "@/lib/content";

const marketName = (a: ApplicationRecord) =>
  a.applicant.market === "other" ? a.applicant.marketOther : markets.find((m) => m.id === a.applicant.market)?.name ?? a.applicant.market;

export const exportColumns: { header: string; value: (a: ApplicationRecord) => string | number }[] = [
  { header: "Reference", value: (a) => a.reference },
  { header: "Date applied", value: (a) => a.createdAt.slice(0, 10) },
  { header: "Status", value: (a) => a.status },
  { header: "Customer name", value: (a) => a.applicant.fullName },
  { header: "Phone", value: (a) => a.applicant.phone },
  { header: "WhatsApp", value: (a) => a.applicant.whatsapp },
  { header: "Gender", value: (a) => a.applicant.gender },
  { header: "Date of birth", value: (a) => a.applicant.dob },
  { header: "Home address", value: (a) => a.applicant.address },
  { header: "LGA", value: (a) => a.applicant.lga },
  { header: "Business type", value: (a) => a.applicant.businessType },
  { header: "Market", value: marketName },
  { header: "Stall", value: (a) => a.applicant.stall },
  { header: "Years in business", value: (a) => a.applicant.years },
  { header: "Daily sales range", value: (a) => a.applicant.dailySales },
  { header: "Product", value: (a) => a.applicant.product },
  { header: "Tenor", value: (a) => a.applicant.tenor },
  { header: "Amount requested (NGN)", value: (a) => a.applicant.amount },
  { header: "Interest (NGN)", value: (a) => a.quote?.interest ?? "" },
  { header: "Admin fee (NGN)", value: (a) => a.quote?.adminFee ?? "" },
  { header: "Cash to customer (NGN)", value: (a) => a.quote?.cashReceived ?? "" },
  { header: "Instalment (NGN)", value: (a) => a.quote?.instalment ?? "" },
  { header: "No. of instalments", value: (a) => a.quote?.numberOfPayments ?? "" },
  { header: "Total repayable (NGN)", value: (a) => a.quote?.totalRepaid ?? "" },
  { header: "Purpose", value: (a) => a.applicant.purpose },
  { header: "ID type", value: (a) => a.applicant.idType },
  { header: "ID number (last 4)", value: (a) => a.applicant.idNumberLast4 },
  { header: "BVN (last 4)", value: (a) => a.applicant.bvnLast4 },
  { header: "Guarantor name", value: (a) => a.applicant.guarantorName },
  { header: "Guarantor phone", value: (a) => a.applicant.guarantorPhone },
  { header: "Guarantor relationship", value: (a) => a.applicant.guarantorRelationship },
  { header: "Assigned officer", value: (a) => a.assignedOfficer ?? "" },
  { header: "Agent code", value: (a) => a.applicant.agentCode },
];
