// Re-export the icon set so consumers can get icons from the design system
// instead of depending on lucide-react directly:
//
//   import { Search, Plus } from "tajerp_ui/icons";
//
// Icons are stateless SVG components (no React context), so this is purely an
// ergonomic single-source-of-truth convenience.
export * from "lucide-react";
