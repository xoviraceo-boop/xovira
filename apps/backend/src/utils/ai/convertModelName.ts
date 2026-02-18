import { modelMapping, NormalizedModelOption, ModelOption, Command } from "@xovira/types";

export const convertModelName = (normalizedModelName: NormalizedModelOption): ModelOption => modelMapping[normalizedModelName];

