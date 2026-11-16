import { Avatar, SegmentedControl } from '@mantine/core';
import { IconHelp, IconMessage, IconMessageCircle, IconSend, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { readableTextColor } from '../store';
import classes from './WidgetPreview.module.css';

const LAUNCHER_ICONS = { message: IconMessage, chat: IconMessageCircle, help: IconHelp };
const PREVIEW_AGENTS = ['Sarah Mitchell', 'Lucas Fernández', 'Emma Schultz'];

// Widget UI strings for the preview, per supported widget language.
const COPY = {
  en: { placeholder: 'Write a message…', start: 'Start conversation', minutes: 'Typically replies in a few minutes', hours: 'Typically replies in a few hours', day: 'Typically replies within a day', visitor: 'Hi! Do you offer annual billing?' },
  es: { placeholder: 'Escribe un mensaje…', start: 'Iniciar conversación', minutes: 'Suele responder en unos minutos', hours: 'Suele responder en unas horas', day: 'Suele responder en un día', visitor: '¡Hola! ¿Tienen facturación anual?' },
  fr: { placeholder: 'Écrivez un message…', start: 'Démarrer la conversation', minutes: 'Répond généralement en quelques minutes', hours: 'Répond généralement en quelques heures', day: 'Répond généralement sous 24 h', visitor: 'Bonjour ! Proposez-vous une facturation annuelle ?' },
  de: { placeholder: 'Nachricht schreiben…', start: 'Unterhaltung starten', minutes: 'Antwortet meist in wenigen Minuten', hours: 'Antwortet meist in wenigen Stunden', day: 'Antwortet meist innerhalb eines Tages', visitor: 'Hallo! Gibt es eine jährliche Abrechnung?' },
  pt: { placeholder: 'Escreva uma mensagem…', start: 'Iniciar conversa', minutes: 'Normalmente responde em minutos', hours: 'Normalmente responde em horas', day: 'Normalmente responde em um dia', visitor: 'Olá! Vocês têm cobrança anual?' },
  ja: { placeholder: 'メッセージを入力…', start: '会話を始める', minutes: '通常数分で返信します', hours: '通常数時間で返信します', day: '通常1日以内に返信します', visitor: 'こんにちは！年払いはありますか？' },
};

/** Realistic, live-updating preview of the chat widget on a mock website. */
export default function WidgetPreview({ widget }) {
  const [selectedView, setView] = useState('conversation');
  // Fall back when the pre-chat form gets disabled while it's being previewed.
  const view = selectedView === 'prechat' && !widget.prechatEnabled ? 'conversation' : selectedView;
  const copy = COPY[widget.language] ?? COPY.en;
  const LauncherIcon = LAUNCHER_ICONS[widget.launcherIcon] ?? IconMessage;
  const accentText = readableTextColor(widget.color);
  const open = view !== 'closed';
  const showPrechat = view === 'prechat';
  const fields = widget.prechatFields.filter((field) => field.enabled);
  const style = { '--widget-color': widget.color, '--widget-text': accentText };

  return (
    <div className={classes.root}>
      <SegmentedControl
        fullWidth
        value={view}
        onChange={setView}
        data={[
          { value: 'conversation', label: 'Conversation' },
          { value: 'prechat', label: 'Pre-chat', disabled: !widget.prechatEnabled },
          { value: 'closed', label: 'Launcher' },
        ]}
        aria-label="Preview state"
      />

      <div className={classes.stage} data-theme={widget.theme} style={style} aria-label="Widget preview">
        <div className={classes.site} aria-hidden="true">
          <div className={classes.siteNav} />
          <div className={classes.siteHero} />
          <div className={classes.siteLine} style={{ width: '70%' }} />
          <div className={classes.siteLine} style={{ width: '55%' }} />
          <div className={classes.siteLine} style={{ width: '62%' }} />
        </div>

        {open && (
          <div className={classes.panel} data-position={widget.position}>
            <div className={classes.panelHeader}>
              <div className={classes.panelTitle}>
                <strong>{widget.companyName || widget.name || 'Your company'}</strong>
                <span>{copy[widget.replyTime]}</span>
              </div>
              {widget.showAgentAvatars && (
                <Avatar.Group spacing={8}>
                  {PREVIEW_AGENTS.map((name) => (
                    <Avatar key={name} name={name} color="initials" size={26} className={classes.agent} />
                  ))}
                </Avatar.Group>
              )}
            </div>

            <div className={classes.panelBody}>
              {showPrechat ? (
                <div className={classes.prechat}>
                  <p className={classes.welcomeTitle}>{widget.welcomeTitle}</p>
                  {fields.map((field) => (
                    <label key={field.id} className={classes.field}>
                      <span>
                        {field.label}
                        {field.required && ' *'}
                      </span>
                      <span className={classes.fakeInput} />
                    </label>
                  ))}
                  <span className={classes.primaryButton}>{copy.start}</span>
                </div>
              ) : (
                <>
                  <div className={classes.bubbleIn}>
                    <strong>{widget.welcomeTitle}</strong>
                    <div>{widget.welcomeMessage}</div>
                  </div>
                  <div className={classes.bubbleOut}>{copy.visitor}</div>
                </>
              )}
            </div>

            {!showPrechat && (
              <div className={classes.composer}>
                <span>{copy.placeholder}</span>
                <IconSend size={16} />
              </div>
            )}
            {widget.showBranding && <div className={classes.branding}>Powered by Chat Model</div>}
          </div>
        )}

        <div className={classes.launcher} data-position={widget.position} data-with-text={widget.launcherStyle === 'icon-text' || undefined}>
          {open ? <IconX size={20} /> : <LauncherIcon size={20} />}
          {!open && widget.launcherStyle === 'icon-text' && <span>{widget.launcherText}</span>}
        </div>
      </div>
    </div>
  );
}
