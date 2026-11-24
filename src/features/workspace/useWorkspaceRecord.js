import { useLocalStorage } from "@mantine/hooks";
import { useParams } from "react-router";
import { useUpdateAdminWorkspaceMutation } from "src/api/admin";
import {
  useGetWorkspaceQuery,
  useUpdateWorkspaceMutation,
} from "src/api/workspace";
import PLATFORM_ROLES from "src/constants/PLATFORM_ROLES";
import { toWorkspacePayload, toWorkspaceValues } from "src/constants/WORKSPACE";

/**
 * The workspace in the URL, whether the signed-in user may change it, and `save(values)`.
 * A super admin edits any workspace through the admin API; a workspace user edits only
 * the workspace they are in, through PATCH /:slug, and needs the Workspace:UPDATE permission.
 */
const useWorkspaceRecord = () => {
  const { workspaceId } = useParams();
  const [auth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });
  const { data: workspace, isLoading } = useGetWorkspaceQuery(workspaceId);
  const updateMutation = useUpdateWorkspaceMutation(workspaceId);
  const adminUpdateMutation = useUpdateAdminWorkspaceMutation();

  const isSuperAdmin = auth?.platformRole === PLATFORM_ROLES.SUPER_ADMIN;
  const canUpdate =
    isSuperAdmin || Boolean(auth?.permissions?.includes("Workspace:UPDATE"));

  // `values` may be a subset (one settings section); the rest keeps its current value.
  // `values.image` is a newly picked file, if any.
  const save = ({ image = null, ...values }) => {
    const payload = toWorkspacePayload(
      { ...toWorkspaceValues(workspace), ...values },
      workspace,
    );
    const variables = { payload, image, workspace };

    return isSuperAdmin
      ? adminUpdateMutation.mutateAsync(variables)
      : updateMutation.mutateAsync(variables);
  };

  return { workspace, isLoading, canUpdate, save };
};

export default useWorkspaceRecord;
