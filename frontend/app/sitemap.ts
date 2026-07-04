import type { MetadataRoute } from "next";
import { publicVeilEnabled } from "@/lib/publicVeil";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://younginvestors.co.za";
  if (publicVeilEnabled()) {
    return [
      { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
      { url: "https://www.younginvestors.co.za", lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
    ];
  }

  return [
    { url: `${base}/join`,          lastModified: new Date(), changeFrequency: "monthly", priority: 1.0 },
    { url: `${base}/login`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/academy`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/kitchen`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${base}/vault`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${base}/lounge`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${base}/shop`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.5 },
    { url: `${base}/reset-password`,lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];
}
