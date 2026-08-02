"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button/button";
import { notification } from "../../../../packages/ui/src/notification/notification";
import type { NotificationPlacement, NotificationType } from "../../../../packages/ui/src/notification/notification.types";
export const notificationShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Five types",
            description: "notification.success / error / info / warning / open, derive the left color bar and default icon.",
            code: `notification.success({ title: "Save successfully", description: "Changes have been synchronized." });
notification.error({ title: "Upload failed", description: "The file is too large, please compress and try again." });
notification.info({ title: "System Notification", description: "The maintenance window will start tonight." });
notification.warning({ title: "Insufficient space", description: "The remaining capacity is less than 10%." });`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => notification.success({ title: "Saved successfully", description: "Changes synchronized." })}>
            success
          </Button>
          <Button variant="outline" onClick={() => notification.error({ title: "Upload failed", description: "The file is too large, please compress and try again." })}>
            error
          </Button>
          <Button variant="outline" onClick={() => notification.info({ title: "System notification", description: "Maintenance window will begin tonight." })}>
            info
          </Button>
          <Button variant="outline" onClick={() => notification.warning({ title: "Insufficient space", description: "Remaining capacity is less than 10%." })}>
            warning
          </Button>
        </div>),
        },
        {
            title: "With operation button + permanent",
            description: "btn slot operation button, it will not close automatically when duration=0.",
            code: `notification.open({
  title: "Received a friend request",
  description: "From Design Department\u00B7Xiao Lian",
  duration: 0,
  btn: <Button size="sm">View</Button>,
});`,
            render: () => (<Button variant="outline" onClick={() => notification.open({
                    title: "Received a friend request",
                    description: "From Design Department\u00B7Xiao Lian",
                    duration: 0,
                    btn: (<Button size="sm" onClick={() => { }}>
                  View
                </Button>),
                })}>
          With operation (resident)
        </Button>),
        },
        {
            title: "Four corner positions",
            description: "placement Specifies the pop-up location: topRight / topLeft / bottomRight / bottomLeft.",
            code: `notification.info({ title: "Prompt", description: "Bounce at the specified corner", placement: "bottomLeft" });`,
            render: () => (<div className="flex flex-wrap gap-2">
          {(["topRight", "topLeft", "bottomRight", "bottomLeft"] as NotificationPlacement[]).map((p) => (<Button key={p} variant="outline" size="sm" onClick={() => notification.info({ title: p, description: `Bounce in ${p}`, placement: p })}>
              {p}
            </Button>))}
        </div>),
        },
    ],
    controls: [
        {
            prop: "type",
            type: "select",
            options: ["open", "success", "error", "info", "warning"],
            defaultValue: "success",
            label: "Type",
        },
        {
            prop: "placement",
            type: "select",
            options: ["topRight", "topLeft", "bottomRight", "bottomLeft"],
            defaultValue: "topRight",
            label: "Location",
        },
        { prop: "title", type: "text", defaultValue: "Action completed", label: "Title" },
        { prop: "description", type: "text", defaultValue: "The data has been successfully synchronized to the cloud.", label: "Description" },
        { prop: "duration", type: "number", defaultValue: 4500, label: "Duration (ms,0=resident)" },
    ],
    states: [
        {
            name: "success",
            render: () => (<Button variant="outline" onClick={() => notification.success({ title: "Saved successfully", description: "Changes synchronized." })}>
          success
        </Button>),
        },
        {
            name: "error",
            render: () => (<Button variant="outline" onClick={() => notification.error({ title: "Upload failed", description: "The file is too large, please compress and try again." })}>
          error
        </Button>),
        },
        {
            name: "info / warning",
            render: () => (<Button variant="outline" onClick={() => {
                    notification.info({ title: "System notification", description: "Maintenance window will begin tonight." });
                    notification.warning({ title: "Insufficient space", description: "Remaining capacity is less than 10%." });
                }}>
          info + warning
        </Button>),
        },
        {
            name: "With operation button + permanent",
            render: () => (<Button variant="outline" onClick={() => notification.open({
                    title: "Received a friend request",
                    description: "From Design Department\u00B7Xiao Lian",
                    duration: 0,
                    btn: (<Button size="sm" onClick={() => { }}>
                  View
                </Button>),
                })}>
          With operation (resident)
        </Button>),
        },
        {
            name: "Four corner positions",
            render: () => (<div className="flex flex-wrap gap-2">
          {(["topRight", "topLeft", "bottomRight", "bottomLeft"] as NotificationPlacement[]).map((p) => (<Button key={p} variant="outline" size="sm" onClick={() => notification.info({ title: p, description: `Bounce in ${p}`, placement: p })}>
              {p}
            </Button>))}
        </div>),
        },
    ],
    renderWithProps: (p) => (<Button onClick={() => notification[p.type as NotificationType]({
            title: p.title as string,
            description: p.description as string,
            placement: p.placement as NotificationPlacement,
            duration: p.duration as number,
        })}>
      Popup notification
    </Button>),
    toCode: (p) => `notification.${p.type}({
  title: "${p.title}",
  description: "${p.description}",
  placement: "${p.placement}",
  duration: ${p.duration},
})`,
};
