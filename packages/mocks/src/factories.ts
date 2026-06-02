import { faker } from "@faker-js/faker";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

/**
 * 确定性种子 —— 同一 seed 永远产出同一批数据，
 * 避免 SSR/CSR 两端数据不一致导致的 hydration mismatch。
 */
export function makeUsers(count = 24, seed = 42): DemoUser[] {
  faker.seed(seed);
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(["管理员", "编辑", "访客"]),
    avatar: faker.image.avatar(),
  }));
}

export interface DemoSeriesPoint {
  month: string;
  revenue: number;
  orders: number;
}

/** 确定性时间序列样例（图表 demo 用），同 seed 永远同一批，防 hydration mismatch。 */
export function makeTimeseries(count = 12, seed = 7): DemoSeriesPoint[] {
  faker.seed(seed);
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  return Array.from({ length: count }, (_, i) => ({
    month: months[i % 12],
    revenue: faker.number.int({ min: 20, max: 120 }),
    orders: faker.number.int({ min: 50, max: 400 }),
  }));
}
