import type { Decorator, Preview } from "@storybook/react";
import * as React from "react";

import { TajUIProvider, TooltipProvider, type Locale } from "../src";
import "./preview.css";

/**
 * Theme and density go on <html>, like in an app, so portaled overlays
 * (Dialog, Popover, Tooltip, DropdownMenu) render under <body> with the same
 * theme. Locale feeds TajUIProvider, which localizes every component string.
 */
function DocumentAttributes({
  theme,
  density,
  locale,
}: {
  theme: string;
  density: string;
  locale: Locale;
}) {
  React.useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-density", density);
    root.setAttribute("lang", locale);
  }, [theme, density, locale]);
  return null;
}

const withProviders: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) ?? "light";
  const density = (context.globals.density as string) ?? "comfortable";
  const locale = (context.globals.locale as Locale) ?? "ru";
  // Full-page example screens opt out of the default canvas padding.
  const fullscreen = context.parameters?.layout === "fullscreen";

  return (
    <TajUIProvider locale={locale}>
      <DocumentAttributes theme={theme} density={density} locale={locale} />
      <TooltipProvider>
        <div
          style={{
            background: "var(--ui-bg)",
            color: "var(--ui-ink-1)",
            minHeight: "100vh",
            padding: fullscreen ? 0 : "2rem",
          }}
        >
          <Story />
        </div>
      </TooltipProvider>
    </TajUIProvider>
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
          ["Welcome", "Installation", "Theming", "Localization"],
          "Examples",
          [
            "Dashboard",
            "POS Terminal",
            "POS Tablet",
            "Customer Card",
            "AI Approvals",
            "Sales Report",
            "Warehouse Receiving",
            "Landing",
            "Login",
            "Settings",
          ],
          "Foundations",
          [
            "Colors",
            "Typography",
            "Spacing & Radii",
            "Density",
            "Shadows",
            "Icons",
            "Brand",
          ],
          "Patterns",
          "Components",
          [
            "Actions",
            "Inputs",
            "Layout",
            "Data Display",
            "Navigation",
            "Feedback",
            "Overlays",
            "POS",
            "Business",
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
    locale: {
      description: "Interface language",
      defaultValue: "ru",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [
          { value: "ru", title: "Русский (RU)" },
          { value: "tg", title: "Тоҷикӣ (TJ)" },
          { value: "en", title: "English (EN)" },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: "Control density",
      defaultValue: "comfortable",
      toolbar: {
        title: "Density",
        icon: "component",
        items: [
          { value: "compact", title: "Compact (reports)" },
          { value: "comfortable", title: "Comfortable" },
          { value: "touch", title: "Touch (POS tablet)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withProviders],
};

export default preview;
