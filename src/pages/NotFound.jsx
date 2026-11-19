import { Button, Center, EmptyState } from "@mantine/core";
import { IconCompass } from "@tabler/icons-react";
import { Link } from "react-router";
import { HOME_PATH } from "../layouts/navigation";

const NotFound = () => (
  <Center h="100%" p="lg">
    <EmptyState
      size="sm"
      withIndicatorBackground
      icon={<IconCompass size={20} />}
      title="Page not found"
      description="The page you're looking for doesn't exist or was moved."
    >
      <Button component={Link} to={HOME_PATH} mt="md">
        Back to inbox
      </Button>
    </EmptyState>
  </Center>
);

export default NotFound;
