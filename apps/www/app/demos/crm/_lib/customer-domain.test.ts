import { describe, expect, it } from "vitest";
import { customers } from "../_data/customers";
import { OWNERS } from "../_data/types";
import { createCustomer, filterCustomers } from "./customer-domain";

describe("CRM customer protocol values", () => {
  it.each([
    ["林晚晴", ["C1001", "C1006", "C1013", "C1019", "C1024"]],
    ["周明远", ["C1002", "C1007", "C1011", "C1016", "C1021"]],
    ["高敏", ["C1003", "C1008", "C1012", "C1017", "C1023"]],
    ["陈策", ["C1004", "C1009", "C1014", "C1018", "C1022"]],
    ["苏晓", ["C1005", "C1010", "C1015", "C1020"]],
  ] as const)("filters the canonical owner %s", (owner, expectedIds) => {
    expect(filterCustomers(customers, { owner }).map((customer) => customer.id)).toEqual(expectedIds);
  });

  it("stores only canonical union values when creating a customer", () => {
    const customer = createCustomer(customers, {
      name: "Acme",
      company: "Acme Inc.",
      contactName: "Ada",
      phone: "13800000000",
      email: "ada@example.com",
      level: "普通",
      status: "待分配",
      owner: OWNERS[0],
      industry: "制造",
      region: "Shanghai",
      regionCodes: [],
    });
    expect(customer).toMatchObject({
      level: "普通",
      status: "待分配",
      owner: "林晚晴",
      industry: "制造",
    });
  });

  it("rejects translated display labels as stored protocol values", () => {
    expect(() => createCustomer(customers, {
      name: "Acme",
      company: "Acme Inc.",
      contactName: "Ada",
      phone: "13800000000",
      email: "ada@example.com",
      level: "Standard",
      status: "Unassigned",
      owner: "Wanqing Lin",
      industry: "Manufacturing",
      region: "Shanghai",
      regionCodes: [],
    })).toThrow(/canonical CRM value/);
  });
});
