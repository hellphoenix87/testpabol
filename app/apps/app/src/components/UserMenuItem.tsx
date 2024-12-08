import { ComponentType, ElementType } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Menu } from "@headlessui/react";

import { classNames } from "@frontend/utils/classNames";

import { selectUser } from "@app/redux/selectors/user";

interface UserMenuItemProps {
  to: string;
  name: string;
  icon?: ComponentType<{ className: string }> | ElementType;
  authRequired?: boolean;
  creatorRequired?: boolean;
}

export default function UserMenuItem(props: UserMenuItemProps) {
  const { to, name, icon: IconComponent = null, authRequired = false, creatorRequired = false } = props;

  const user = useSelector(selectUser);

  // If the user is not logged in and the menu item requires authentication, don't show it
  if (authRequired && !user?.loggedIn) {
    return null;
  }

  // If the user is not a creator and the menu item requires creator, don't show it
  if (creatorRequired && !user?.is_creator) {
    return null;
  }

  return (
    <Menu.Item>
      {({ active }) => (
        <Link to={to} className={classNames(active ? "bg-gray-100" : "", "group flex items-center px-4 py-2 text-sm")}>
          {IconComponent && (
            <IconComponent className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
          )}
          {name}
        </Link>
      )}
    </Menu.Item>
  );
}
