import { useLocalStorage } from "@mantine/hooks";
import PLATFORM_ROLES from "../constants/PLATFORM_ROLES";

/** True when the signed-in account is a platform super admin. */
const useIsSuperAdmin = () => {
  const [auth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });

  return auth?.platformRole === PLATFORM_ROLES.SUPER_ADMIN;
};

export default useIsSuperAdmin;
