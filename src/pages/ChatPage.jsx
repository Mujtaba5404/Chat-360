import { Center, Drawer, EmptyState, Kbd, Text } from "@mantine/core";
import {
  useDisclosure,
  useHotkeys,
  useLocalStorage,
  useMediaQuery,
} from "@mantine/hooks";
import { showNotification } from "../notifications/showNotification";
import { IconMessages } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import useFilters from "../hooks/useFilters";
import { useAssignableAgents, useCurrentUser, usersStore } from "../api/user";
import { useCurrentWorkspace, useTeams } from "../api/workspace";
import ContactPanel from "../features/chat/ContactPanel";
import ConversationComposer from "../features/chat/ConversationComposer";
import ConversationHeader from "../features/chat/ConversationHeader";
import ConversationList from "../features/chat/ConversationList";
import InboxNav from "../features/chat/InboxNav";
import MessageList from "../features/chat/MessageList";
import {
  INBOX_VIEWS,
  STATUS_VIEWS,
  matchesInbox,
  matchesQuery,
  sortConversations,
} from "../features/chat/inbox";
import {
  markConversationRead,
  sendMessage,
  setConversationStatus,
  useContacts,
  useConversations,
} from "../api/chat";
import classes from "./ChatPage.module.css";

const ChatPage = () => {
  const { filters, setFilters } = useFilters();
  const { inbox: inboxParam, status: statusParam } = filters;
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();
  const workspace = useCurrentWorkspace();
  const teams = useTeams();
  const conversations = useConversations();
  const contacts = useContacts();
  const users = usersStore.useItems();
  const agents = useAssignableAgents();

  const inbox = inboxParam ?? "all";
  const status = statusParam ?? "open";
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [navOpened, nav] = useDisclosure(false);
  // Panels are added as space allows: inbox nav column from 1536px, inline details from 1200px.
  const showNavColumn = useMediaQuery("(min-width: 96em)", undefined, {
    getInitialValueInEffect: false,
  });
  const isWide = useMediaQuery("(min-width: 75em)", undefined, {
    getInitialValueInEffect: false,
  });
  // Desktop remembers the details panel preference; on smaller screens it is an on-demand drawer.
  const [panelPinned, setPanelPinned] = useLocalStorage({
    key: "cm-chat-context-open",
    defaultValue: true,
  });
  const [drawerOpened, setDrawerOpened] = useState(false);
  const contextOpen = isWide ? panelPinned : drawerOpened;
  const setContextOpen = isWide ? setPanelPinned : setDrawerOpened;

  const contactById = useMemo(
    () => new Map(contacts.map((c) => [c.id, c])),
    [contacts],
  );
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const inInbox = useMemo(
    () => conversations.filter((c) => matchesInbox(c, inbox, user.id)),
    [conversations, inbox, user.id],
  );
  const visible = useMemo(
    () =>
      sortConversations(
        inInbox.filter(
          (c) =>
            c.status === status &&
            matchesQuery(c, contactById.get(c.contactId), query),
        ),
        sort,
      ),
    [inInbox, status, query, sort, contactById],
  );

  const inboxCounts = useMemo(() => {
    const active = conversations.filter((c) => c.status !== "resolved");
    const ids = [
      ...INBOX_VIEWS.map((v) => v.id),
      ...teams.map((t) => `team:${t.id}`),
    ];
    return Object.fromEntries(
      ids.map((id) => [
        id,
        active.filter((c) => matchesInbox(c, id, user.id)).length,
      ]),
    );
  }, [conversations, teams, user.id]);
  const statusCounts = Object.fromEntries(
    STATUS_VIEWS.map((s) => [
      s.id,
      inInbox.filter((c) => c.status === s.id).length,
    ]),
  );

  const selected = conversations.find((c) => c.id === conversationId);
  const contact = selected && contactById.get(selected.contactId);
  const history = selected
    ? conversations.filter(
        (c) => c.contactId === selected.contactId && c.id !== selected.id,
      )
    : [];

  // Opening a conversation marks it read (sync with the external store, keyed on selection only).
  useEffect(() => {
    if (conversationId) markConversationRead(conversationId);
  }, [conversationId]);

  const open = (id) =>
    navigate({ pathname: `/chat/${id}`, search: location.search });
  const close = () => navigate({ pathname: "/chat", search: location.search });

  const step = (delta) => {
    if (!visible.length) return;
    const index = visible.findIndex((c) => c.id === conversationId);
    const next =
      visible[Math.min(visible.length - 1, Math.max(0, index + delta))];
    if (next) open(next.id);
  };
  useHotkeys([
    ["j", () => step(1)],
    ["k", () => step(-1)],
  ]);

  const handleSend = (message, resolve) => {
    sendMessage(selected.id, { ...message, authorId: user.id });
    if (!message.note && selected.status === "resolved" && !resolve)
      setConversationStatus(selected.id, "open", user.name);
    if (resolve) {
      setConversationStatus(selected.id, "resolved", user.name);
      showNotification({ message: "Reply sent and conversation resolved" });
    }
  };

  const inboxTitle =
    INBOX_VIEWS.find((v) => v.id === inbox)?.label ??
    teams.find((t) => `team:${t.id}` === inbox)?.name ??
    "Conversations";
  const statusLabel = STATUS_VIEWS.find((s) => s.id === status)?.label;

  const inboxNav = (
    <InboxNav
      inbox={inbox}
      status={status}
      inboxCounts={inboxCounts}
      statusCounts={statusCounts}
      onInboxChange={(id) => {
        setFilters({ inbox: id === "all" ? null : id });
        nav.close();
      }}
      onStatusChange={(id) => {
        setFilters({ status: id === "open" ? null : id });
        nav.close();
      }}
    />
  );

  const contactPanel = selected && contact && (
    <ContactPanel
      key={contact.id}
      conversation={selected}
      contact={contact}
      history={history}
      agents={agents}
      currentUser={user}
      onOpenConversation={open}
      onClose={() => setContextOpen(false)}
    />
  );

  return (
    <div
      className={classes.inbox}
      data-view={selected ? "conversation" : "list"}
    >
      {showNavColumn ? (
        <aside className={classes.nav}>{inboxNav}</aside>
      ) : (
        <Drawer
          opened={navOpened}
          onClose={nav.close}
          position="left"
          size={260}
          padding={0}
          withCloseButton={false}
        >
          {inboxNav}
        </Drawer>
      )}

      <section className={classes.list} aria-label="Conversations">
        <ConversationList
          title={`${inboxTitle} · ${statusLabel}`}
          conversations={visible}
          contactById={contactById}
          userById={userById}
          selectedId={conversationId}
          onSelect={open}
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          onOpenNav={showNavColumn ? undefined : nav.open}
        />
      </section>

      <section className={classes.conversation} aria-label="Conversation">
        {selected && contact ? (
          <>
            <ConversationHeader
              conversation={selected}
              contact={contact}
              assignee={userById.get(selected.assigneeId)}
              agents={agents}
              currentUser={user}
              onBack={close}
              contextOpen={contextOpen}
              onToggleContext={() => setContextOpen((value) => !value)}
            />
            <MessageList
              key={selected.id}
              messages={selected.messages}
              contact={contact}
              userById={userById}
            />
            <ConversationComposer
              key={`composer-${selected.id}`}
              conversation={selected}
              contact={contact}
              currentUser={user}
              workspaceName={workspace.name}
              onSend={handleSend}
            />
          </>
        ) : (
          <Center h="100%" p="lg">
            <EmptyState
              size="sm"
              withIndicatorBackground
              icon={<IconMessages size={20} />}
              title={
                conversationId
                  ? "Conversation not found"
                  : "Select a conversation"
              }
              description={
                <Text size="sm" c="dimmed" component="span">
                  Use <Kbd>J</Kbd> and <Kbd>K</Kbd> to move between
                  conversations.
                </Text>
              }
            />
          </Center>
        )}
      </section>

      {isWide
        ? contextOpen &&
          contactPanel && (
            <aside className={classes.context}>{contactPanel}</aside>
          )
        : contactPanel && (
            <Drawer
              opened={contextOpen}
              onClose={() => setContextOpen(false)}
              position="right"
              size={340}
              padding={0}
              withCloseButton={false}
            >
              {contactPanel}
            </Drawer>
          )}
    </div>
  );
};

export default ChatPage;
