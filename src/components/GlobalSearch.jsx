import { Spotlight } from "@mantine/spotlight";
import {
  IconBolt,
  IconMessageChatbot,
  IconSearch,
  IconTag,
  IconUserPlus,
  IconWorldWww,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { ADMIN_NAV_LINKS, visibleNavLinks } from "../layouts/navigation";
import useIsSuperAdmin from "../hooks/useIsSuperAdmin";
import { getLastMessage, useContacts, useConversations } from "../api/chat";
import { usersStore } from "../api/user";
import useWorkspacePath from "../hooks/useWorkspacePath";
import UserAvatar from "./UserAvatar";

const QUICK_ACTIONS = [
  {
    id: "new-user",
    label: "Invite user",
    path: "/users?edit=new",
    icon: IconUserPlus,
    superAdminOnly: true,
  },
  {
    id: "new-canned",
    label: "New canned response",
    path: "/canned-responses?edit=new",
    icon: IconBolt,
  },
  {
    id: "new-tag",
    label: "New tag",
    path: "/tags?edit=new",
    icon: IconTag,
  },
  {
    id: "new-widget",
    label: "Create widget",
    path: "/widgets/new",
    icon: IconMessageChatbot,
  },
  {
    id: "new-website",
    label: "Add website",
    path: "/website?edit=new",
    icon: IconWorldWww,
  },
];

const icon = (Icon) => <Icon size={16} stroke={1.75} />;

/** ⌘K command palette: pages, quick actions, conversations and teammates. */
const GlobalSearch = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const toWorkspace = useWorkspacePath();
  const conversations = useConversations();
  const contacts = useContacts();
  const users = usersStore.useItems();
  const isSuperAdmin = useIsSuperAdmin();

  const actions = useMemo(() => {
    // The admin console only has its own pages.
    if (!workspaceId)
      return ADMIN_NAV_LINKS.map((link) => ({
        id: `page-${link.path}`,
        label: link.title,
        description: link.description,
        leftSection: icon(link.icon),
        onClick: () => navigate(link.path),
      }));

    const go = (path) => () => navigate(toWorkspace(path));
    const contactById = new Map(contacts.map((c) => [c.id, c]));

    // Users (the page, inviting, teammate profiles) is for super admins only.
    const groups = [
      {
        group: "Pages",
        actions: visibleNavLinks(isSuperAdmin).map((link) => ({
          id: `page-${link.path}`,
          label: link.title,
          description: link.description,
          leftSection: icon(link.icon),
          onClick: go(link.path),
        })),
      },
      {
        group: "Quick actions",
        actions: QUICK_ACTIONS.filter(
          (item) => isSuperAdmin || !item.superAdminOnly,
        ).map((item) => ({
          id: item.id,
          label: item.label,
          leftSection: icon(item.icon),
          onClick: go(item.path),
        })),
      },
      {
        group: "Conversations",
        actions: conversations
          .filter((c) => c.status !== "resolved")
          .map((c) => {
            const contact = contactById.get(c.contactId);
            return {
              id: `conversation-${c.id}`,
              label: contact?.name ?? "Unknown contact",
              description: getLastMessage(c)?.body,
              leftSection: <UserAvatar name={contact?.name} size={24} />,
              onClick: go(`/chat/${c.id}`),
            };
          }),
      },
      {
        group: "Teammates",
        actions: users.map((user) => ({
          id: `user-${user.id}`,
          label: user.name,
          description: user.email,
          leftSection: <UserAvatar name={user.name} size={24} />,
          onClick: go(`/users?view=${user.id}`),
        })),
      },
    ];

    return isSuperAdmin
      ? groups
      : groups.filter((group) => group.group !== "Teammates");
  }, [
    workspaceId,
    isSuperAdmin,
    contacts,
    conversations,
    users,
    navigate,
    toWorkspace,
  ]);

  return (
    <Spotlight
      actions={actions}
      limit={10}
      shortcut={["mod + K"]}
      highlightQuery
      nothingFound="No results"
      scrollable
      maxHeight={420}
      radius="md"
      searchProps={{
        leftSection: <IconSearch size={16} stroke={1.75} />,
        placeholder: workspaceId
          ? "Search pages, conversations, people…"
          : "Search admin pages…",
      }}
    />
  );
};

export default GlobalSearch;
