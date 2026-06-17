import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  core: { disableTelemetry: true },
  async viteFinal(cfg) {
    cfg.plugins = cfg.plugins ?? [];
    // Tailwind v4 processes the @theme tokens + scans component classes.
    cfg.plugins.push(tailwindcss());
    // One physical copy of Radix — Root/Title share React context.
    cfg.resolve = {
      ...cfg.resolve,
      dedupe: [
        ...(cfg.resolve?.dedupe ?? []),
        "react",
        "react-dom",
        "@radix-ui/react-dialog",
        "@radix-ui/react-popover",
        "@radix-ui/react-tooltip",
        "@radix-ui/react-avatar",
      ],
    };
    return cfg;
  },
};

export default config;
