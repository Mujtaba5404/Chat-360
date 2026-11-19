import { createContext, useContext, useEffect } from "react";

export const BreadcrumbsContext = createContext({
  crumbs: null,
  setCrumbs: () => {},
});

export const useBreadcrumbTrail = () => useContext(BreadcrumbsContext).crumbs;

// Pages hand their trail to the app header instead of rendering it themselves.
export const useBreadcrumbs = (crumbs = []) => {
  const { setCrumbs } = useContext(BreadcrumbsContext);
  const key = JSON.stringify(crumbs.map(({ label, to }) => [label, to]));

  useEffect(() => {
    setCrumbs(JSON.parse(key).map(([label, to]) => ({ label, to })));
    return () => setCrumbs(null);
  }, [key, setCrumbs]);
};
