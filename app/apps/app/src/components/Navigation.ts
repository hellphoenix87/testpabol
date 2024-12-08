import { ChartBarIcon, BookOpenIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { FormAttributes } from "@app/pages/FormAttributes";
import { FormTitlePlot } from "@app/pages/FormTitlePlot";
import { FormFinish } from "@app/pages/FormFinish";

export const NAVIGATION = [
  { name: "Attributes", icon: AdjustmentsHorizontalIcon, form: FormAttributes },
  { name: "Title and Plot", icon: BookOpenIcon, form: FormTitlePlot },
  { name: "Finish", icon: ChartBarIcon, form: FormFinish },
];
