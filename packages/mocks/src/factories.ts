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
