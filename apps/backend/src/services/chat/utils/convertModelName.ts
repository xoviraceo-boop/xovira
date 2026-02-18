import { modelMapping, NormalizedModelOption, ModelOption } from "@xovira/types";

export const convertModelName = (normalizedModelName: NormalizedModelOption): ModelOption => modelMapping[normalizedModelName];
