import { Tooltip } from "@mantine/core";
import { NavLink } from "react-router";
import classes from "./AppSidebar.module.css";

const AppSidebarLink = ({ link, badge, collapsed, onNavigate }) => {
  const Icon = link.icon;

  const content = (
    <NavLink to={link.path} className={classes.link} onClick={onNavigate} aria-label={collapsed ? link.title : undefined}>
      <Icon size={16} stroke={1.75} className={classes.linkIcon} />
      {!collapsed && <span className={classes.linkLabel}>{link.title}</span>}
      {badge > 0 && (collapsed ? (<span className={classes.dot} />) : (<span className={classes.count}>{badge}</span>))}
    </NavLink>
  );

  return collapsed ? (
    <Tooltip label={link.title} position="right" offset={12}>
      {content}
    </Tooltip>
  ) : (
    content
  );
};
export default AppSidebarLink;