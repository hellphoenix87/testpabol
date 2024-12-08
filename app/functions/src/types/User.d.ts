export interface User {
  uid: string;
  loggedIn: boolean;
  authDataPending: boolean;
  display_name: string;
  email: string;
  about: string;
  avatar_url: string;
  header_url: string;
  twitter: string;
  instagram: string;
  web: string;
  location: string;
  newsletter?: boolean;
  is_creator?: boolean | null;
  is_welcomed?: boolean | null;
  current_creation?: number | null;
  created_at: Date;
}
