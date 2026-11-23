import { useLocalStorage } from "@mantine/hooks";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { upsertAuthUser } from "src/api/user";
import { HOME_PATH } from "../../layouts/navigation";
import AuthLayout, { AuthSwitch } from "./AuthLayout";
import { REGISTER_PATHS } from "./registerPaths";
import { AccountStep, OtpStep } from "./RegisterSteps";

const STEPS = [
  {
    path: REGISTER_PATHS.account,
    title: "Create your account",
    description: "Set up your support workspace in a couple of minutes.",
    Form: AccountStep,
  },
  {
    path: REGISTER_PATHS.otp,
    title: "Verify your email",
    description: "Enter the 6-digit code we sent to your inbox.",
    Form: OtpStep,
  },
];

const Register = () => {
  const [auth, setAuth] = useLocalStorage({
    key: "auth",
    getInitialValueInEffect: false,
  });
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // Furthest step unlocked so far. Collected data lives only in memory, so a refresh or a
  // deep link to a later step sends the user back to where they can actually continue.
  const [reached, setReached] = useState(0);
  const [data, setData] = useState({});
  const active = STEPS.findIndex((step) => step.path === pathname);

  if (auth?.id) return <Navigate to={HOME_PATH} replace />;

  if (active < 0 || active > reached)
    return <Navigate to={STEPS[reached].path} replace />;

  const { title, description, Form } = STEPS[active];

  const back = () => navigate(STEPS[active - 1].path);

  const next = (values) => {
    const collected = { ...data, ...values };
    setData(collected);

    if (active < STEPS.length - 1) {
      setReached(Math.max(reached, active + 1));
      return navigate(STEPS[active + 1].path);
    }

    // Signup already set the auth cookies — once the email is verified the user is signed in.
    upsertAuthUser(collected.user);
    setAuth(collected.user);
    navigate(HOME_PATH, { replace: true });
  };

  return (
    <AuthLayout title={title} description={description}>
      <Form key={active} data={data} onNext={next} onBack={back} />

      {active === 0 && (
        <AuthSwitch
          prompt="Already have an account?"
          to="/login"
          label="Sign in"
        />
      )}
    </AuthLayout>
  );
};

export default Register;
