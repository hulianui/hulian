import {
  CUSTOMER_LEVELS,
  CUSTOMER_STATUSES,
  INDUSTRIES,
  OWNERS,
  type Customer,
  type CustomerIndustry,
  type CustomerLevel,
  type CustomerOwner,
  type CustomerStatus,
} from "../_data/types";

export interface CustomerFilters {
  keyword?: string;
  status?: CustomerStatus | "";
  level?: CustomerLevel | "";
  owner?: CustomerOwner | "";
}

export interface CustomerFormValues extends Record<string, unknown> {
  name: string;
  company: string;
  contactName: string;
  phone: string;
  email: string;
  level: CustomerLevel;
  status: CustomerStatus;
  owner: CustomerOwner;
  industry: CustomerIndustry;
  region: string;
  regionCodes: string[];
}

export function filterCustomers(rows: readonly Customer[], filters: CustomerFilters): Customer[] {
  const keyword = filters.keyword?.trim() ?? "";
  return rows.filter((row) => {
    if (keyword && !`${row.name}${row.company}${row.contactName}`.includes(keyword)) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (filters.level && row.level !== filters.level) return false;
    if (filters.owner && row.owner !== filters.owner) return false;
    return true;
  });
}

function includes<T extends string>(values: readonly T[], value: unknown): value is T {
  return typeof value === "string" && values.includes(value as T);
}

export function assertCustomerFormValues(value: Record<string, unknown>): asserts value is CustomerFormValues {
  if (
    !includes(CUSTOMER_LEVELS, value.level) ||
    !includes(CUSTOMER_STATUSES, value.status) ||
    !includes(OWNERS, value.owner) ||
    !includes(INDUSTRIES, value.industry)
  ) {
    throw new Error("Expected canonical CRM value for level, status, owner, and industry");
  }
}

export function createCustomer(rows: readonly Customer[], raw: Record<string, unknown>): Customer {
  assertCustomerFormValues(raw);
  const { regionCodes: _regionCodes, ...values } = raw;
  return {
    id: `C${1000 + rows.length + 1}`,
    ...values,
    amount: 0,
    lastFollowAt: "2026-06-04",
    createdAt: "2026-06-04",
    tags: [],
  };
}
