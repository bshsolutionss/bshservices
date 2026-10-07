"use client";

import { useEffect, useState } from "react";

const LINE_1 = "BSH SOLUTIONS";
/** Rotating second line; the first one is also what crawlers and screen readers get. */
const PHRASES = ["Creative Agency", "Digital Experts", "Automation Experts"];

const TYPE_MS = 70;
const ERASE_MS = 40;
const HOLD_MS = 1500;

/**
 * Hero heading with a typing animation.
 *
 * SEO / accessibility: the server-rendered HTML contains the complete heading
 * ("BSH SOLUTIONS Creative Agency"); the animated text is aria-hidden and a
 * visually-hidden copy is what assistive tech reads, so nothing depends on
 * the animation running. The typing itself is short, finite per phrase and
 * plays for everyone (it is a small text effect, not large-scale motion).
 */
export default function TypedHeading() {
  // Start with the full text so the first paint (and no-JS) is the real heading.
  const [line1, setLine1] = useState(LINE_1);
  const [line2, setLine2] = useState(PHRASES[0]);
  const [caretOn, setCaretOn] = useState<1 | 2>(2);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = window.setTimeout(resolve, ms);
      });

    (async () => {
      // type "BSH SOLUTIONS", then the first phrase, from an empty heading
      setLine1("");
      setLine2("");
      setCaretOn(1);
      await wait(250);
      for (let i = 1; i <= LINE_1.length && !cancelled; i++) {
        setLine1(LINE_1.slice(0, i));
        await wait(TYPE_MS);
      }
      setCaretOn(2);

      let index = 0;
      while (!cancelled) {
        const phrase = PHRASES[index];
        for (let i = 1; i <= phrase.length && !cancelled; i++) {
          setLine2(phrase.slice(0, i));
          await wait(TYPE_MS);
        }
        await wait(HOLD_MS);
        for (let i = phrase.length - 1; i >= 0 && !cancelled; i--) {
          setLine2(phrase.slice(0, i));
          await wait(ERASE_MS);
        }
        await wait(250);
        index = (index + 1) % PHRASES.length;
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  const caret = (
    <span
      aria-hidden="true"
      className="ml-1 inline-block h-[0.9em] w-[0.08em] translate-y-[0.1em] bg-current animate-[caret-blink_1s_steps(1)_infinite]"
    />
  );

  return (
    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A14A5] drop-shadow-sm tracking-tight">
      <span className="sr-only">BSH SOLUTIONS Creative Agency</span>
      <span aria-hidden="true">
        {/* the hidden full string reserves the line's width/height so nothing jumps */}
        <span className="relative inline-block">
          <span className="invisible">{LINE_1}</span>
          <span className="absolute inset-0">
            {line1}
            {caretOn === 1 && caret}
          </span>
        </span>
        <span className="block min-h-[1.2em] text-[#231F20]">
          {line2}
          {caretOn === 2 && caret}
        </span>
      </span>
    </h1>
  );
}
