import type { Meta, StoryObj } from "@storybook/react";
import { PackageX } from "lucide-react";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Skeleton,
  Spinner,
} from "../src";

const meta: Meta = { title: "Feedback/States" };
export default meta;

type Story = StoryObj;

export const Loading: Story = {
  render: () => <LoadingState title="Загрузка каталога" description="Подождите…" />,
};

export const Error_: Story = {
  name: "Error",
  render: () => (
    <ErrorState
      title="Не удалось загрузить"
      description="Проверьте подключение к интернету."
      actionLabel="Повторить"
      onAction={() => {}}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <EmptyState
      icon={<PackageX size={24} />}
      title="Нет товаров"
      description="Добавьте первый товар в каталог."
      actionLabel="Добавить товар"
      onAction={() => {}}
    />
  ),
};

export const Skeletons: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 10, maxWidth: 320 }}>
      <Skeleton style={{ height: 16, width: "60%" }} />
      <Skeleton style={{ height: 16, width: "90%" }} />
      <Skeleton style={{ height: 16, width: "75%" }} />
    </div>
  ),
};

export const Spinner_: Story = {
  name: "Spinner",
  render: () => <Spinner />,
};
