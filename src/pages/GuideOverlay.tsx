import { useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface Step {
  id: string;
  selector?: string;
  text: string;
  center?: boolean;
}

export default function GuideOverlay({
                                       steps,
                                       onFinish,
                                     }: {
  steps: Step[];
  onFinish: () => void;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [open, setOpen] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  const step = steps[index];

  const finish = () => {
    setOpen(false);
    onFinish();
  };

  const next = () => {
    if (index < steps.length - 1) setIndex((i) => i + 1);
    else finish(); // ✅ важно: не onFinish()
  };

  useLayoutEffect(() => {
    if (!open) return;
    if (!step || step.center) return;

    const updatePosition = () => {
      const target = step.selector
          ? (document.querySelector(step.selector) as HTMLElement | null)
          : null;
      const card = cardRef.current;
      if (!target || !card) return;

      const rect = target.getBoundingClientRect();
      const cardWidth = card.offsetWidth;
      const cardHeight = card.offsetHeight;
      const margin = 12;

      let top = rect.top + window.scrollY - cardHeight - margin;
      if (top < 8) top = rect.bottom + window.scrollY + margin;

      let left = rect.left + rect.width / 2 - cardWidth / 2;
      if (left < 8) left = 8;
      if (left + cardWidth > window.innerWidth - 8) {
        left = window.innerWidth - cardWidth - 8;
      }

      setPos({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [open, step]);

  if (!open || !step) return null;

  return (
      <div
          className="fixed inset-0 z-[99] bg-black/50 flex items-center justify-center transition-opacity duration-300"
          onClick={finish} // ✅ атрибут, не строка в JSX
      >
        <div
            ref={cardRef}
            onClick={(e) => e.stopPropagation()}
            className={`absolute bg-[#FFF3E0] border-4 border-amber-800 rounded-2xl 
                    text-center shadow-2xl p-5 w-72 sm:w-96 transition-all duration-300 ${
                step.center
                    ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    : ""
            }`}
            style={!step.center ? { top: pos.top, left: pos.left } : undefined}
        >
          <p className="text-amber-800 shantell font-bold text-base mb-3 leading-snug whitespace-pre-wrap">
            {t(step.text)}
          </p>

          <button
              onClick={next}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-1.5 rounded-full
                     font-bold shantell text-sm tracking-wide transition"
          >
            {index < steps.length - 1
                ? t("common.buttons.next")
                : t("common.buttons.done")}
          </button>
        </div>
      </div>
  );
}