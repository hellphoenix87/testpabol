import { User } from "@shared/types";
import { RootState } from "../store/store";

export const selectUser = (state: RootState) => state.user as User;
