import type { Meta, StoryObj } from "@storybook/react";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../src";

const meta: Meta<typeof Carousel> = {
  title: "Components/Data Display/Carousel",
  component: Carousel,
  parameters: {
    docs: {
      description: {
        component:
          'Composable slider built on Embla. Compose `CarouselContent` + `CarouselItem`, then drop in `CarouselPrevious` / `CarouselNext` / `CarouselDots` (all read the carousel via context, so they must live inside `<Carousel>`). Pass Embla `opts` (e.g. `{ loop: true, align: "start" }`) and `plugins` (e.g. `[Autoplay({ delay: 4000 })]` — install `embla-carousel-autoplay` in your app). Set `orientation="vertical"` for a vertical track.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Carousel>;

function Slide({ n, className }: { n: number; className?: string }) {
  return (
    <div
      className={
        "flex items-center justify-center rounded-xl border border-hairline bg-mist text-4xl font-bold text-brand-ink " +
        (className ?? "h-48")
      }
    >
      {n}
    </div>
  );
}

/** One slide per view, with arrows and clickable dots. */
export const Playground: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }} className="px-12">
      <Carousel opts={{ loop: true }}>
        <CarouselContent>
          {[1, 2, 3, 4, 5].map((n) => (
            <CarouselItem key={n}>
              <Slide n={n} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <CarouselDots className="mt-5" />
      </Carousel>
    </div>
  ),
};

/** Multiple items per view via a `basis` override on `CarouselItem`. */
export const MultipleItems: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }} className="px-12">
      <Carousel opts={{ loop: true, align: "start" }}>
        <CarouselContent>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <CarouselItem key={n} className="basis-1/2 md:basis-1/3">
              <Slide n={n} className="h-40" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};

/** Vertical track — `orientation="vertical"` with a fixed content height. */
export const Vertical: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }} className="py-12">
      <Carousel orientation="vertical" opts={{ loop: true }}>
        <CarouselContent className="h-48">
          {[1, 2, 3, 4].map((n) => (
            <CarouselItem key={n}>
              <Slide n={n} className="h-full" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
};
