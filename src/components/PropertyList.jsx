import classes from "./PropertyList.module.css";

/** Label/value pairs for record details. items: [{ label, value, icon? }] */
const PropertyList = ({ items }) => {
  return (
    <dl className={classes.list}>
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className={classes.row}>
          <dt className={classes.label}>
            {Icon && <Icon size={14} stroke={1.75} />}
            {label}
          </dt>
          <dd className={classes.value}>{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
};

export default PropertyList;
