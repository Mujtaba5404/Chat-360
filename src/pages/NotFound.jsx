import { Button, Center, EmptyState } from "@mantine/core";
import { IconCompass } from "@tabler/icons-react";
import { useParams } from "react-router";
import WorkspaceLink from "../components/WorkspaceLink";
import { ADMIN_HOME_PATH, HOME_PATH } from "../layouts/navigation";

const NotFound = () => {
  const { workspaceId } = useParams();

  return (
    <Center h="100%" p="lg">
      <EmptyState
        size="sm"
        withIndicatorBackground
        icon={<IconCompass size={20} />}
        title="Page not found"
        description="The page you're looking for doesn't exist or was moved."
      >
        <Button
          component={WorkspaceLink}
          to={workspaceId ? HOME_PATH : ADMIN_HOME_PATH}
          mt="md"
        >
          {workspaceId ? "Back to inbox" : "Back to workspaces"}
        </Button>
      </EmptyState>
    </Center>
  );
};

export default NotFound;
