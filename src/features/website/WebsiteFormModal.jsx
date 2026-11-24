import { Select, Stack, Switch, TagsInput, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import {
  useCreateWebsiteMutation,
  useUpdateWebsiteMutation,
} from "../../api/website";
import FormModal from "../../components/FormModal";
import WEBSITE, {
  toWebsitePayload,
  toWebsiteValues,
} from "../../constants/WEBSITE";
import { rules } from "../../utils/validation";

const WebsiteFormModal = ({ website, onClose, onCreated }) => {
  const isEdit = Boolean(website);
  const createMutation = useCreateWebsiteMutation();
  const updateMutation = useUpdateWebsiteMutation();
  const form = useForm({
    initialValues: toWebsiteValues(website),
    validate: {
      title: (value) => (value.trim() ? null : "Website name is required"),
      domain: rules.domain,
      allowedDomains: (values) =>
        values.map(rules.domain).find(Boolean) ? "Enter valid domains" : null,
    },
  });

  // A domain typed but not yet confirmed with Enter still counts on submit.
  const [pendingDomain, setPendingDomain] = useState("");

  const submit = form.onSubmit((values) => {
    const pending = pendingDomain.trim();
    if (pending && rules.domain(pending))
      return form.setFieldError("allowedDomains", rules.domain(pending));

    const payload = toWebsitePayload(
      {
        ...values,
        allowedDomains: pending
          ? [...values.allowedDomains, pending]
          : values.allowedDomains,
      },
      website,
    );

    if (isEdit)
      updateMutation.mutate(
        { id: website._id, ...payload },
        { onSuccess: onClose },
      );
    else
      createMutation.mutate(payload, {
        onSuccess: ({ data }) => onCreated(data),
      });
  });

  return (
    <FormModal
      opened
      onClose={onClose}
      title={isEdit ? "Edit website" : "Add website"}
      submitLabel={isEdit ? "Save changes" : "Add website"}
      loading={createMutation.isPending || updateMutation.isPending}
      onSubmit={submit}
    >
      <TextInput
        label="Website name"
        placeholder="Marketing site"
        withAsterisk
        data-autofocus
        {...form.getInputProps("title")}
      />
      <TextInput
        label="Domain"
        placeholder="https://www.example.com"
        withAsterisk
        {...form.getInputProps("domain")}
      />
      <TagsInput
        label="Allowed domains"
        description="Other origins the widget may load on, e.g. subdomains. Press Enter after each."
        placeholder="https://shop.example.com"
        clearable
        searchValue={pendingDomain}
        onSearchChange={setPendingDomain}
        {...form.getInputProps("allowedDomains")}
      />
      <Select
        label="Status"
        data={WEBSITE.STATUSES}
        allowDeselect={false}
        {...form.getInputProps("status")}
      />
      <Stack gap="sm">
        <Switch
          label="Enforce origin check"
          description="Only load chat on the domain and allowed domains above."
          {...form.getInputProps("enforceOriginCheck", { type: "checkbox" })}
        />
        <Switch
          label="Collect visitor location"
          description="Show each visitor's approximate city and country."
          {...form.getInputProps("collectVisitorLocation", {
            type: "checkbox",
          })}
        />
      </Stack>
    </FormModal>
  );
};

export default WebsiteFormModal;
