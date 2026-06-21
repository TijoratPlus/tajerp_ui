import type { Decorator, Preview } from "@storybook/react";
import * as React from "react";
import "./preview.css";

/** Wrap every story so the brand background + dark-mode class apply. */
const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "light";
  // Full-page example screens opt out of the default canvas padding.
  const fullscreen = context.parameters?.layout === "fullscreen";
  return (
    <div
      className={theme === "dark" ? "dark" : ""}
      style={{
        background: "var(--ui-bg)",
        color: "var(--ui-ink-1)",
        minHeight: "100vh",
        padding: fullscreen ? 0 : "2rem",
      }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    options: {
      storySort: {
        order: [
          "Get Started",
          ["Welcome", "Installation", "Theming"],
          "Examples",
          ["Dashboard", "POS Terminal", "Landing", "Login", "Settings"],
          "Foundations",
          ["Colors", "Typography", "Spacing & Radii", "Shadows", "Icons", "Brand"],
          "Components",
          [
            "Actions",
            "Inputs",
            "Layout",
            "Data Display",
            "Navigation",
            "Feedback",
            "Overlays",
          ],
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Brand theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
};

export default preview;
