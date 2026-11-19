import { Select, SimpleGrid, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { usersStore } from "../../api/user";
import { useTeams } from "../../api/workspace";
import FormModal from "../../components/FormModal";
import ROLES from "../../constants/ROLES";
import { showNotification } from "../../notifications/showNotification";

const EMPTY_USER = {
  name: "",
  email: "",
  role: "agent",
  team: "support",
  title: "",
};
const ASSIGNABLE_ROLES = ROLES.filter((option) => option.value !== "owner");

/** Create (invite) or edit a user. Mount with a `key` per record so the form resets. */
const UserFormModal = ({ user, onClose }) => {
  const teams = useTeams();
  const isEdit = Boolean(user);
  const form = useForm({
    initialValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
          team: user.team,
          title: user.title,
        }
      : EMPTY_USER,
  });

  const submit = form.onSubmit((values) => {
    const data = {
      ...values,
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
    };
    if (isEdit) {
      usersStore.update(user.id, data);
      showNotification({ message: `${data.name} updated` });
    } else {
      usersStore.add({
        ...data,
        status: "invited",
        presence: "offline",
        phone: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        lastActiveAt: null,
        stats: { conversations: 0, avgResponse: 0, csat: 0 },
      });
      showNotification({
        title: "Invitation sent",
        message: `${data.name} will receive an email at ${data.email}`,
      });
    }
    onClose();
  });

  return (
    <FormModal opened onClose={onClose} title={isEdit ? "Edit user" : "Invite user"} submitLabel={isEdit ? "Save changes" : "Send invite"} onSubmit={submit}>
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
        <TextInput label="Full name" placeholder="Jane Cooper" withAsterisk data-autofocus {...form.getInputProps("name")}/>
        <TextInput label="Job title" placeholder="Support Specialist" {...form.getInputProps("title")}/>
      </SimpleGrid>
      <TextInput label="Email" placeholder="jane@company.com" type="email" withAsterisk {...form.getInputProps("email")}/>
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
        <Select label="Role" data={user?.role === "owner" ? ROLES : ASSIGNABLE_ROLES} disabled={user?.role === "owner"} withAsterisk {...form.getInputProps("role")}/>
        <Select label="Team" data={teams.map((team) => ({ value: team.id, label: team.name }))} {...form.getInputProps("team")}/>
      </SimpleGrid>
    </FormModal>
  );
};
export default UserFormModal;