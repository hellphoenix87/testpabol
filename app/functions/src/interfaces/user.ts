type NullableString = string | null;

export interface User {
  uid: string;
  display_name: string;
  email: string;
  avatar_url: string;
  header_url: NullableString;
  about: NullableString;
  location: NullableString;
  web: NullableString;
  twitter: NullableString;
  instagram: NullableString;
  email_comments: boolean;
  is_creator: boolean;
  is_welcomed: boolean;
}
