import { useEffect, useState } from "react";
import { classNames } from "@frontend/utils/classNames";
import { DefaultResources } from "@app/constants/DefaultResources";
import { getProfileImageDownloadUrl } from "@app/util";

interface AvatarProps {
  uid: string;
  avatarUrl?: string | null;
  className?: string;
}

export function Avatar(props: AvatarProps) {
  const { uid, avatarUrl, className } = props;

  const [imageUrl, setImageUrl] = useState<string | undefined>(DefaultResources.USER);

  useEffect(() => {
    if (!uid || !avatarUrl) {
      return;
    }

    void getProfileImageDownloadUrl(uid, avatarUrl).then(url => setImageUrl(url));
  });

  // If avatarUrl is empty, display a default avatar
  return (
    <img className={classNames("inline-block h-9 w-9 rounded-full", className)} src={imageUrl} alt="Avatar Img" />
  );
}
