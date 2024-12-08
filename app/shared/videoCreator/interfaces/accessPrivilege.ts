import { Env } from "../enum";

export interface AccessPrivilege {
  methodName: string;
  env?: Env;
  isReady?: boolean;
  hasCanvas?: boolean;
}
