import classes from './TemplateText.module.css';

const VARIABLE = /(\{\{\s*\w+\s*\}\})/g;

/**
 * Renders a canned response with {{variables}} highlighted.
 * With `values`, known variables are replaced by their (highlighted) values.
 */
export default function TemplateText({ text, values }) {
  return text.split(VARIABLE).map((part, index) => {
    if (index % 2 === 0) return part;
    const key = part.replace(/[{}\s]/g, '');
    const value = values?.[key];
    return (
      <span key={index} className={classes.variable} data-filled={value ? true : undefined}>
        {value ?? part}
      </span>
    );
  });
}
