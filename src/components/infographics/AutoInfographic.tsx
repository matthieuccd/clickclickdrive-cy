import type { AutoInfographicData, Locale } from "@/lib/types";
import { AutoFlowInfographic } from "./AutoFlowInfographic";
import { AutoCompareInfographic } from "./AutoCompareInfographic";
import { AutoVersusInfographic } from "./AutoVersusInfographic";
import { AutoChecklistInfographic } from "./AutoChecklistInfographic";
import { AutoTimelineInfographic } from "./AutoTimelineInfographic";

export function AutoInfographic({
  locale,
  data,
}: {
  locale: Locale;
  data: AutoInfographicData;
}) {
  const content = data[locale];

  switch (content.template) {
    case "flow":
      return <AutoFlowInfographic content={content} />;
    case "compare":
      return <AutoCompareInfographic content={content} />;
    case "versus":
      return <AutoVersusInfographic content={content} />;
    case "checklist":
      return <AutoChecklistInfographic content={content} />;
    case "timeline":
      return <AutoTimelineInfographic content={content} />;
    default:
      return null;
  }
}
