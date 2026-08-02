"use client";
import { useState } from "react";
import { Banner, Link } from "@hulianui/ui";
import { Sparkles, Rocket } from "lucide-react";
export function BannerBlock() {
  const [showInfo, setShowInfo] = useState(true);
  const [showPromo, setShowPromo] = useState(true);
  return (
    <div className="flex flex-col">
      {showInfo && (
        <Banner
          tone="brand"
          variant="soft"
          icon={<Rocket />}
          align="center"
          onClose={() => setShowInfo(false)}
          closeLabel="Close"
          action={
            <Link href="https://example.com/#changelog" className="text-current underline">
              View changelog
            </Link>
          }
        >
          HanCloud v3: scale-to-zero compute and more than 300 edge nodes
        </Banner>
      )}

      {showPromo && (
        <Banner
          tone="brand"
          variant="solid"
          icon={<Sparkles />}
          align="center"
          onClose={() => setShowPromo(false)}
          closeLabel="Close"
          action={
            <Link href="https://example.com/#upgrade" className="text-current underline">
              Get it now
            </Link>
          }
        >
          Limited-time offer: save 20% on an annual Pro plan, plus a ¥200 compute credit for new
          users
        </Banner>
      )}
    </div>
  );
}
