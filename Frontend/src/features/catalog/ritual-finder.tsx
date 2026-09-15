"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { IconArrowRight } from "@/components/icons/icons";

const CONCERNS = [
  { label: "Engraved saddles", href: "/collections/engraved-saddles" },
  { label: "Western saddles", href: "/collections/western-saddles" },
  { label: "Crystal rhinestone", href: "/collections/crystal-rhinestone" },
  { label: "Studded leather", href: "/collections/studded-leather" },
  { label: "Custom colors", href: "/collections/custom-colors" },
  { label: "Personalized", href: "/collections/personalized" },
  { label: "Complete sets", href: "/collections/complete-sets" },
] as const;

const ROUTINES = [
  { label: "New arrivals", href: "/collections/new" },
  { label: "Shop all", href: "/collections/all" },
  { label: "Leather care", href: "/collections/care" },
] as const;

type ConcernHref = (typeof CONCERNS)[number]["href"];
type RoutineHref = (typeof ROUTINES)[number]["href"];

export function RitualFinder() {
  const router = useRouter();
  const [concern, setConcern] = useState<string>(CONCERNS[0].href as ConcernHref);
  const [routine, setRoutine] = useState<string>(ROUTINES[0].href as RoutineHref);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(concern || routine);
  };

  return (
    <section className="ritual-finder" aria-labelledby="ritual-finder-title">
      <div className="ritual-finder-inner">
        <h2 id="ritual-finder-title" className="ritual-finder-title">
          Find the <span className="section-mark">right leather</span> for your ride!
        </h2>
        <form className="ritual-finder-bar" onSubmit={onSubmit}>
          <label className="ritual-finder-field">
            <span className="sr-only">What you need</span>
            <select
              className="ritual-finder-select"
              value={concern}
              onChange={(event) => setConcern(event.target.value)}
            >
              {CONCERNS.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="ritual-finder-field">
            <span className="sr-only">Collection</span>
            <select
              className="ritual-finder-select"
              value={routine}
              onChange={(event) => setRoutine(event.target.value)}
            >
              {ROUTINES.map((item) => (
                <option key={item.href} value={item.href}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="ritual-finder-submit">
            Search
            <IconArrowRight className="ritual-finder-submit-icon" />
          </button>
        </form>
      </div>
    </section>
  );
}
