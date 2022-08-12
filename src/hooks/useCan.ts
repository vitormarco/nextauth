import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

type UseCanType = {
  permissions?: Array<string>;
  roles?: Array<string>;
};

export function useCan({ permissions, roles }: UseCanType) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return false;
  }

  if (permissions && permissions.length > 0) {
    const hasAllPermissions = permissions.every((permission) => {
      return user?.permissions.includes(permission);
    });

    if (!hasAllPermissions) return false;
  }

  if (roles && roles.length > 0) {
    const hasAllRoles = roles.some((role) => {
      return user?.roles.includes(role);
    });

    if (!hasAllRoles) return false;
  }

  return true;
}
