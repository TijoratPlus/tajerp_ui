import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Button,
  FileUpload,
  type FileRejection,
  Label,
  TajUIProvider,
} from "../../src";

const meta: Meta<typeof FileUpload> = {
  title: "Components/Inputs/FileUpload",
  component: FileUpload,
  parameters: {
    docs: {
      description: {
        component:
          "Drop zone plus file list for Excel / 1C imports, product photos and scanned contracts. Drag & drop, click, or focus the zone and press Enter/Space to open the picker. Validates `accept`, `maxSize` (bytes) and `maxFiles`, and reports refusals with localized messages via `onReject`. Uploading is up to the app — pass `progress` (0–100 by file name) to show it.",
      },
    },
  },
  args: { multiple: true, disabled: false },
  argTypes: {
    disabled: { control: "boolean" },
    multiple: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof FileUpload>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 520 }}>
      <FileUpload {...args} />
    </div>
  ),
};

export const ExcelImport: Story = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    const [rejected, setRejected] = React.useState<FileRejection[]>([]);
    return (
      <div className="flex max-w-lg flex-col gap-2">
        <Label htmlFor="import-zone">Импорт товаров из Excel или 1С</Label>
        <FileUpload
          id="import-zone"
          accept=".xlsx,.xls,.csv,.xml"
          maxSize={10 * 1024 * 1024}
          title="Перетащите выгрузку из 1С или Excel"
          description="XLSX, XLS, CSV или XML · До 10 МБ"
          value={files}
          onValueChange={setFiles}
          onReject={setRejected}
        />
        <p className="text-ui-helper text-ink-3">
          Выбрано: {files.length} · отклонено: {rejected.length}
        </p>
        <Button disabled={files.length === 0}>Импортировать</Button>
      </div>
    );
  },
};

export const ProductPhotos: Story = {
  render: () => {
    const [files, setFiles] = React.useState<File[]>([]);
    const [progress, setProgress] = React.useState<Record<string, number>>({});
    React.useEffect(() => {
      if (files.length === 0) return;
      const id = setInterval(() => {
        setProgress((p) => {
          const next = { ...p };
          for (const f of files)
            next[f.name] = Math.min(100, (next[f.name] ?? 0) + 7);
          return next;
        });
      }, 300);
      return () => clearInterval(id);
    }, [files]);
    return (
      <div style={{ maxWidth: 520 }}>
        <FileUpload
          multiple
          accept="image/*"
          maxFiles={5}
          maxSize={5 * 1024 * 1024}
          value={files}
          onValueChange={setFiles}
          progress={progress}
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <FileUpload disabled description="Импорт доступен после закрытия смены" />
    </div>
  ),
};

export const Tajik: Story = {
  render: () => (
    <TajUIProvider locale="tg">
      <div style={{ maxWidth: 520 }}>
        <FileUpload
          multiple
          accept=".xlsx,.csv"
          maxSize={10 * 1024 * 1024}
          maxFiles={3}
          title="Ҳисоботро аз 1С ба ин ҷо кашед"
        />
      </div>
    </TajUIProvider>
  ),
};
