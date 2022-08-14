import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UseCanType = {
  permissions?: Array<string>;
  roles?: Array<string>;
};

export function useCan({ permissions, roles }: UseCanType) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return false;
  }

  return validateUserPermissions({
    user,
    permissions,
    roles,
  });
}
