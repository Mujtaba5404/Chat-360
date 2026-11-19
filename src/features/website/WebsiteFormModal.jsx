import { TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "../../notifications/showNotification";
import FormModal from "../../components/FormModal";
import { all, normalizeDomain, rules } from "../../utils/validation";
import { createWidget } from "../../api/widget";
import WIDGET from "../../constants/WIDGET";
import { websitesStore } from "../../api/website";

const WebsiteFormModal = ({ website, onClose, onCreated }) => {
  const isEdit = Boolean(website);
  const form = useForm({
    initialValues: website
      ? {
          name: website.name,
          domain: website.domain,
        }
      : { name: "", domain: ""},
  });

  const submit = form.onSubmit((values) => {
    const data = {
      ...values,
      name: values.name.trim(),
      domain: normalizeDomain(values.domain),
    };
    if (isEdit) {
      const domainChanged = data.domain !== website.domain;
      websitesStore.update(website.id, {
        ...data,
        ...(domainChanged && {
          verification: "pending",
          connection: "disconnected",
        }),
      });
      showNotification({
        message: domainChanged
          ? "Domain updated — verify the installation again"
          : "Website updated",
      });
      onClose();
      return;
    }
    const record = websitesStore.add({
      ...data,
      activeWidgetId: null,
      verification: "pending",
      connection: "disconnected",
      lastActivityAt: null,
      monthlyVisitors: 0,
    });
    // Start every website with a default widget so it can be installed right away.
    createWidget({
      ...WIDGET.DEFAULTS,
      websiteId: record.id,
      name: `${data.name} widget`,
      companyName: data.name,
    });
    showNotification({
      title: "Website added",
      message:
        "A default widget was created. Follow the setup steps to install it.",
    });
    onCreated(record);
  });

  return (
    <FormModal
      opened
      onClose={onClose}
      title={isEdit ? "Edit website" : "Add website"}
      submitLabel={isEdit ? "Save changes" : "Add website"}
      onSubmit={submit}
    >
      <TextInput
        label="Website name"
        placeholder="Marketing site"
        withAsterisk
        data-autofocus
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Domain"
        placeholder="example.com"
        leftSectionWidth={60}
        withAsterisk
        {...form.getInputProps("domain")}
      />
      {/* <Select label="Platform" data={platforms} allowDeselect={false} {...form.getInputProps('platform')} /> */}
    </FormModal>
  );
};

export default WebsiteFormModal;