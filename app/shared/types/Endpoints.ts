export interface GenerateMovie {
  creationId: string;
  title: string;
  genre: number;
  tags: string[];
  audience: number;
  description: string;
  isAgeRestricted: boolean;
  isMock: boolean;
}
