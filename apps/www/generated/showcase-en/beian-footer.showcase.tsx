"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { BeianFooter } from "../../../../packages/ui/src/beian-footer/beian-footer";
const ICP = [{ number: "Fujian ICP No. 2024073556-1" }, { number: "Fujian ICP No. 2024073556-2" }];
const POLICE = { number: "Fujian Public Network Security No. 35030302900030" };
export const beianFooterShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in a single ICP registration number, and the default link will be to the Ministry of Industry and Information Technology registration system.",
            code: `<BeianFooter icp={[{ number: "FujianICPPrepared2024073556-1" }]} />`,
            render: () => <BeianFooter icp={[{ number: "Fujian ICP No. 2024073556-1" }]}/>,
        },
        {
            title: "Multiple ICP filings",
            description: "When multiple sites are under the same entity, multiple registration numbers (such as -1 / -2) can be passed in.",
            code: `<BeianFooter
  icp={[
    { number: "FujianICPPrepared2024073556-1" },
    { number: "FujianICPPrepared2024073556-2" },
  ]}
/>`,
            render: () => <BeianFooter icp={ICP}/>,
        },
        {
            title: "Public network security",
            description: "The police badge icon is displayed when police is passed in, and the default link is to the Ministry of Public Security filing system.",
            code: `<BeianFooter
  icp={[{ number: "FujianICPPrepared2024073556-1" }]}
  police={{ number: "Fujian Public Network Security No. 35030302900030" }}
/>`,
            render: () => <BeianFooter icp={[{ number: "Fujian ICP No. 2024073556-1" }]} police={POLICE}/>,
        },
        {
            title: "Line with copyright",
            description: "copyright is rendered below the filing information and is often used in the compliance bar at the bottom of the site.",
            code: `<BeianFooter
  icp={[
    { number: "FujianICPPrepared2024073556-1" },
    { number: "FujianICPPrepared2024073556-2" },
  ]}
  police={{ number: "Fujian Public Network Security No. 35030302900030" }}
  copyright="\u00A9 2026 Hulian \u00B7 Abel"
/>`,
            render: () => <BeianFooter icp={ICP} police={POLICE} copyright="© 2026 Hulian · Abel"/>,
        },
    ],
    controls: [],
    states: [
        {
            name: "Complete (Multiple ICP + Public Network Security)",
            render: () => <BeianFooter icp={ICP} police={POLICE} copyright="© 2026 Hulian · Abel"/>,
        },
        {
            name: "Single ICP only",
            render: () => <BeianFooter icp={[{ number: "Fujian ICP No. 2024073556-1" }]}/>,
        },
        {
            name: "ICP + Public Network Security (No Copyright Line)",
            render: () => <BeianFooter icp={[{ number: "Fujian ICP No. 2024073556-1" }]} police={POLICE}/>,
        },
    ],
    renderWithProps: () => <BeianFooter icp={ICP} police={POLICE} copyright="© 2026 Hulian · Abel"/>,
    toCode: () => `<BeianFooter
  icp={[{ number: "FujianICP No. 2024073556-1" }, { number: "FujianICP No. 2024073556-2" }]}
  police={{ number: "Fujian Public Network Security No. 35030302900030" }}
  copyright="\u00A9 2026 Hulian \u00B7 Abel"
/>`,
};
