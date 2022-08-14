type User = {
  permissions: Array<string>;
  roles: Array<string>;
};

interface IValidateUserPermissionsParams {
  user?: User;
  permissions?: Array<string>;
  roles?: Array<string>;
}

export const validateUserPermissions = ({
  user,
  permissions,
  roles,
}: IValidateUserPermissionsParams) => {
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
};
