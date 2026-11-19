import {
  Avatar,
  Button,
  ColorSwatch,
  MultiSelect,
  Text,
  Tooltip,
} from "@mantine/core";
import { showNotification } from "../../notifications/showNotification";
import { IconUsersGroup } from "@tabler/icons-react";
import { useState } from "react";
import FormModal from "../../components/FormModal";
import SettingsSection from "../../components/SettingsSection";
import pluralize from "../../utils/pluralize";
import { usersStore } from "../../api/user";
import { updateTeamMembers, useTeams } from "../../api/workspace";
import classes from "./WorkspaceSettings.module.css";

const MembersModal = ({ team, users, onClose }) => {
  const [memberIds, setMemberIds] = useState(team.memberIds);

  const submit = (event) => {
    event.preventDefault();
    updateTeamMembers(team.id, memberIds);
    showNotification({
      message: `${team.name} now has ${pluralize(memberIds.length, "member")}`,
    });
    onClose();
  };

  return (
    <FormModal
      opened
      onClose={onClose}
      title={`Manage ${team.name}`}
      onSubmit={submit}
      submitLabel="Save members"
    >
      <MultiSelect
        label="Members"
        description="Conversations routed to this team are visible to all members."
        data={users.map((user) => ({ value: user.id, label: user.name }))}
        value={memberIds}
        onChange={setMemberIds}
        searchable
        hidePickedOptions
        maxDropdownHeight={240}
        data-autofocus
      />
    </FormModal>
  );
};

const TeamsSettings = () => {
  const teams = useTeams();
  const users = usersStore.useItems();
  const [editingId, setEditingId] = useState(null);
  const editing = teams.find((team) => team.id === editingId);
  const userById = new Map(users.map((user) => [user.id, user]));

  return (
    <SettingsSection
      title="Teams"
      description="Group agents into team inboxes for routing and reporting."
      
    >
      {teams.map((team) => {
        const members = team.memberIds
          .map((id) => userById.get(id))
          .filter(Boolean);
        return (
          <div key={team.id} className={classes.listRow}>
            <ColorSwatch
              color={`var(--mantine-color-${team.color}-6)`}
              size={10}
              withShadow={false}
            />
            <div className={classes.listText}>
              <Text size="sm" fw={500}>
                {team.name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {team.description}
              </Text>
            </div>
            <Tooltip.Group openDelay={200}>
              <Avatar.Group spacing={6} visibleFrom="xs">
                {members.slice(0, 4).map((member) => (
                  <Tooltip key={member.id} label={member.name}>
                    <Avatar name={member.name} color="initials" size={24} />
                  </Tooltip>
                ))}
                {members.length > 4 && (
                  <Avatar size={24}>+{members.length - 4}</Avatar>
                )}
              </Avatar.Group>
            </Tooltip.Group>
            <Button
              variant="default"
              size="xs"
              leftSection={<IconUsersGroup size={14} />}
              onClick={() => setEditingId(team.id)}
            >
              Manage
            </Button>
          </div>
        );
      })}
      {editing && (
        <MembersModal
          key={editing.id}
          team={editing}
          users={users.filter((user) => user.status !== "inactive")}
          onClose={() => setEditingId(null)}
        />
      )}
    </SettingsSection>
  );
};

export default TeamsSettings;
