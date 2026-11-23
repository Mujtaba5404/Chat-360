import { Anchor, Group, Text } from "@mantine/core";
import { Link } from "react-router";
import Logo from "../../components/Logo";
import classes from "./Login.module.css";
import LoginShowcase from "./LoginShowcase";

const YEAR = new Date().getFullYear();

export const AuthSwitch = ({ prompt, to, label }) => (
  <Text size="sm" c="dimmed" ta="center" mt="lg">
    {prompt}{" "}
    <Anchor component={Link} to={to} size="sm" fw={600}>
      {label}
    </Anchor>
  </Text>
);

const AuthLayout = ({ title, description, children }) => (
  <div className={classes.page}>
    <main className={classes.formSide}>
      <header className={classes.top}>
        <Group gap="sm">
          <Logo size={30} />
          <Text fw={600} size="md">
            Chat Model
          </Text>
        </Group>
        {/* <ThemeSwitcher withLabels={false} /> */}
      </header>

      <div className={classes.formWrap}>
        <h1 className={classes.title}>{title}</h1>
        <Text c="dimmed" size="sm" mb="xl">
          {description}
        </Text>

        {children}
      </div>

      <footer className={classes.bottom}>
        <Text size="xs" c="dimmed">
          © {YEAR} Chat Model
        </Text>
        <Text size="xs" c="dimmed">
          Live chat & customer support platform
        </Text>
      </footer>
    </main>

    <div className={classes.showcaseSide}>
      <LoginShowcase />
    </div>
  </div>
);

export default AuthLayout;
