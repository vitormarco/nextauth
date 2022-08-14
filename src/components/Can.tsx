import { useCan } from "../hooks/useCan";

interface ICanProps {
  children: React.ReactNode;
  permissions?: Array<string>;
  roles?: Array<string>;
}

export const Can = ({ children, permissions, roles }: ICanProps) => {
  const userCanSeeComponet = useCan({ permissions, roles });

  if (!userCanSeeComponet) {
    return null;
  }

  return <>{children}</>;
};
