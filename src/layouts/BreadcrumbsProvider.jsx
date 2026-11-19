import { useMemo, useState } from "react";
import { BreadcrumbsContext } from "./breadcrumbs";

const BreadcrumbsProvider = ({ children }) => {
  const [crumbs, setCrumbs] = useState(null);
  const value = useMemo(() => ({ crumbs, setCrumbs }), [crumbs]);

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  );
};

export default BreadcrumbsProvider;
