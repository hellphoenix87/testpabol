import { Utils } from "@backoffice/interfaces/Utils";
import { RootState } from "../store/store";

export const selectUtils = (state: RootState) => state.utils as Utils;
