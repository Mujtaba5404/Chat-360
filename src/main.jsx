import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import mantineTheme, { cssVariablesResolver } from "../mantine.config.js";
import App from "./App.jsx";
import { zIndex } from "./constants/TOKENS";
import "./index.css";

const theme = createTheme(mantineTheme);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MantineProvider
        theme={theme}
        cssVariablesResolver={cssVariablesResolver}
        defaultColorScheme="auto"
      >
        <Notifications
          position="bottom-right"
          limit={3}
          zIndex={zIndex.toast}
          autoClose={3500}
        />
        <App />
      </MantineProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
