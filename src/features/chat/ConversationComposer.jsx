import {
  ActionIcon,
  Button,
  CloseButton,
  FileButton,
  Menu,
  Popover,
  SegmentedControl,
  SimpleGrid,
  Text,
  TextInput,
  Textarea,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import {
  IconBolt,
  IconChevronUp,
  IconCircleCheck,
  IconInfoCircle,
  IconMoodSmile,
  IconPaperclip,
  IconSearch,
  IconSend,
} from "@tabler/icons-react";
import { useMemo, useRef, useState } from "react";
import fillTemplate from "../../utils/fillTemplate";
import formatBytes from "../../utils/formatBytes";
import { emojis } from "../../mocks/conversations";
import { recordUsage, useAvailableResponses } from "../../api/cannedResponse";
import CannedResponsePicker from "./CannedResponsePicker";
import classes from "./Composer.module.css";

const MAX_PICKER_RESULTS = 8;

const ConversationComposer = ({
  conversation,
  contact,
  currentUser,
  workspaceName,
  onSend,
}) => {
  const textareaRef = useRef(null);
  const [mode, setMode] = useState("reply");
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [slashDismissed, setSlashDismissed] = useState(false);
  const [buttonQuery, setButtonQuery] = useState(null); // non-null while the picker is opened from the toolbar
  const [activeIndex, setActiveIndex] = useState(0);
  const [emojiOpened, setEmojiOpened] = useState(false);
  const responses = useAvailableResponses(currentUser.id);

  const isNote = mode === "note";
  const slashQuery = slashDismissed ? undefined : text.match(/^\/(\S*)$/)?.[1];
  const pickerOpen = slashQuery !== undefined || buttonQuery !== null;
  const query = (buttonQuery ?? slashQuery ?? "").toLowerCase();

  const matches = useMemo(
    () =>
      responses
        .filter(
          (r) =>
            r.shortcut.startsWith(query) ||
            r.title.toLowerCase().includes(query),
        )
        .slice(0, MAX_PICKER_RESULTS),
    [responses, query],
  );
  const highlighted = Math.min(activeIndex, Math.max(0, matches.length - 1));

  const variables = {
    customer_name: contact.name.split(" ")[0],
    agent_name: currentUser.name.split(" ")[0],
    company_name: workspaceName,
    customer_email: contact.email,
    ticket_id: `#${conversation.id.replace(/\D/g, "").padStart(4, "0")}`,
  };

  const focusAt = (position) =>
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(position, position);
    });

  const updateText = (value) => {
    setText(value);
    setSlashDismissed(false);
    setActiveIndex(0);
  };

  const insertAtCursor = (snippet) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    updateText(text.slice(0, start) + snippet + text.slice(end));
    focusAt(start + snippet.length);
  };

  const selectResponse = (response) => {
    if (!response) return;
    const filled = fillTemplate(response.message, variables);
    recordUsage(response.id);
    if (buttonQuery !== null) {
      setButtonQuery(null);
      insertAtCursor(filled);
    } else {
      updateText(filled);
      focusAt(filled.length);
    }
  };

  const send = (resolve = false) => {
    const body = text.trim();
    if (!body && !attachments.length) return;
    onSend({ body, note: isNote, attachments }, resolve);
    updateText("");
    setAttachments([]);
  };

  // Shared arrow / enter / escape handling for the picker (from the textarea or the picker search).
  const handlePickerKeys = (event, close) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(
        (highlighted + delta + matches.length) % Math.max(matches.length, 1),
      );
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      selectResponse(matches[highlighted]);
      return true;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return true;
    }
    return false;
  };

  const onTextareaKeyDown = (event) => {
    if (
      slashQuery !== undefined &&
      handlePickerKeys(event, () => setSlashDismissed(true))
    )
      return;
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      send();
    }
  };

  const addFiles = (files) =>
    setAttachments((current) => [
      ...current,
      ...files.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type.startsWith("image/") ? "image" : "file",
      })),
    ]);

  return (
    <div className={classes.root}>
      {conversation.status === "resolved" && !isNote && (
        <Text size="xs" c="dimmed" className={classes.banner}>
          <IconInfoCircle size={14} /> This conversation is resolved. Sending a
          reply will reopen it.
        </Text>
      )}

      <Popover
        opened={pickerOpen}
        onDismiss={() =>
          buttonQuery !== null ? setButtonQuery(null) : setSlashDismissed(true)
        }
        position="top-start"
        width="target"
        offset={6}
        trapFocus={buttonQuery !== null}
        returnFocus
      >
        <Popover.Target>
          <div className={classes.box} data-note={isNote || undefined}>
            <div className={classes.boxHeader}>
              <SegmentedControl
                size="xs"
                value={mode}
                onChange={setMode}
                data={[
                  { value: "reply", label: "Reply" },
                  { value: "note", label: "Private note" },
                ]}
                aria-label="Composer mode"
              />
              <Text size="xs" c="dimmed" truncate className={classes.hint}>
                {isNote
                  ? "Only visible to your team · @mention teammates"
                  : `Replying to ${contact.name}`}
              </Text>
            </div>

            <Textarea
              ref={textareaRef}
              variant="unstyled"
              autosize
              minRows={2}
              maxRows={8}
              value={text}
              onChange={(event) => updateText(event.currentTarget.value)}
              onKeyDown={onTextareaKeyDown}
              placeholder={isNote ? "Add a private note…" : "Write a reply…"}
              aria-label={isNote ? "Private note" : "Reply message"}
              classNames={{ input: classes.input }}
            />

            {attachments.length > 0 && (
              <div className={classes.files}>
                {attachments.map((file, index) => (
                  <span key={`${file.name}-${index}`} className={classes.file}>
                    <IconPaperclip size={12} />
                    <span className={classes.fileName}>{file.name}</span>
                    <Text span size="xs" c="dimmed">
                      {formatBytes(file.size, 1)}
                    </Text>
                    <CloseButton
                      size="xs"
                      aria-label={`Remove ${file.name}`}
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter((_, i) => i !== index),
                        )
                      }
                    />
                  </span>
                ))}
              </div>
            )}

            <div className={classes.toolbar}>
              <Popover
                opened={emojiOpened}
                onDismiss={() => setEmojiOpened(false)}
                position="top-start"
                width={232}
              >
                <Popover.Target>
                  <Tooltip label="Emoji">
                    <ActionIcon
                      onClick={() => setEmojiOpened((o) => !o)}
                      aria-label="Insert emoji"
                    >
                      <IconMoodSmile size={16} stroke={1.75} />
                    </ActionIcon>
                  </Tooltip>
                </Popover.Target>
                <Popover.Dropdown p="xs">
                  <SimpleGrid cols={8} spacing={2}>
                    {emojis.map((emoji) => (
                      <UnstyledButton
                        key={emoji}
                        className={classes.emoji}
                        aria-label={`Insert ${emoji}`}
                        onClick={() => {
                          insertAtCursor(emoji);
                          setEmojiOpened(false);
                        }}
                      >
                        {emoji}
                      </UnstyledButton>
                    ))}
                  </SimpleGrid>
                </Popover.Dropdown>
              </Popover>

              <FileButton onChange={addFiles} multiple>
                {(props) => (
                  <Tooltip label="Attach files">
                    <ActionIcon {...props} aria-label="Attach files">
                      <IconPaperclip size={16} stroke={1.75} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </FileButton>

              <Tooltip label="Canned responses  /">
                <ActionIcon
                  onClick={() => {
                    setActiveIndex(0);
                    setButtonQuery((current) => (current === null ? "" : null));
                  }}
                  aria-label="Insert canned response"
                >
                  <IconBolt size={16} stroke={1.75} />
                </ActionIcon>
              </Tooltip>

              {/* <Text size="xs" c="dimmed" className={classes.keys}>
                Enter to send · Shift + Enter for new line
              </Text> */}

              <Button.Group ml="auto">
                <Button
                  size="xs"
                  color={isNote ? "yellow" : undefined}
                  leftSection={<IconSend size={14} />}
                  onClick={() => send()}
                  disabled={!text.trim() && !attachments.length}
                >
                  {isNote ? "Add note" : "Send"}
                </Button>
                {!isNote && (
                  <Menu position="top-end" width={190}>
                    <Menu.Target>
                      <Button
                        size="xs"
                        px={6}
                        aria-label="More send options"
                        disabled={!text.trim() && !attachments.length}
                      >
                        <IconChevronUp size={14} />
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<IconCircleCheck size={14} />}
                        onClick={() => send(true)}
                      >
                        Send and resolve
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Button.Group>
            </div>
          </div>
        </Popover.Target>

        <Popover.Dropdown p={0}>
          {buttonQuery !== null && (
            <TextInput
              variant="unstyled"
              px="sm"
              className={classes.pickerSearch}
              leftSection={<IconSearch size={14} />}
              placeholder="Search canned responses"
              value={buttonQuery}
              onChange={(event) => {
                setButtonQuery(event.currentTarget.value);
                setActiveIndex(0);
              }}
              onKeyDown={(event) =>
                handlePickerKeys(event, () => setButtonQuery(null))
              }
              data-autofocus
              aria-label="Search canned responses"
            />
          )}
          <CannedResponsePicker
            responses={matches}
            activeIndex={highlighted}
            variables={variables}
            onSelect={selectResponse}
            onActiveChange={setActiveIndex}
          />
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};

export default ConversationComposer;
