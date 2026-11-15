import { useApp } from "@/app/providers/AppContext";
import { presets } from "@/mocks/presets";
import { Icon } from "@/shared/components/Icon";
import { time } from "@/shared/lib/time";
import {
  Badge,
  Button,
  Confirm,
  Field,
  PageTitle,
  SectionHead,
} from "@/shared/ui";
import { useState } from "react";

export function DemoControls() {
  const { s, act } = useApp();
  const [preset, setPreset] = useState(s.preset);

  return (
    <div
      data-slot="demo-page"
      className="**:focus-visible:outline-demo"
      data-demo-scope=""
    >
      <PageTitle
        title="Demo"
        description="Reproduce campus journeys and exceptions without waiting in real time."
      />
      <div
        data-slot="two-col"
        className="grid grid-cols-2 gap-5 **:data-[slot~=two-col]:gap-4 max-[900px]:gap-4 max-[600px]:grid-cols-1 max-[600px]:**:data-[slot~=two-col]:grid-cols-1"
      >
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <SectionHead
            title="Scenario presets"
            subtitle="Loading a preset replaces the current actions."
          />
          <Field label="Choose a scenario">
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="border border-solid border-control-border rounded-xs bg-panel min-h-11 text-content text-sm max-w-full hover:bg-soft cursor-pointer py-2 px-3"
            >
              {presets.map(([id, title]) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </Field>
          <p className="leading-[1.65] mt-3 mb-5 mx-0">
            {presets.find((p) => p[0] === preset)?.[2]}
          </p>
          <Confirm
            demo
            title="Load this preset?"
            description="Your local actions and records will be replaced with a reproducible fixture snapshot."
            trigger={<Button>Load selected preset</Button>}
            onConfirm={() => act({ type: "preset", preset })}
          />
          <div
            className="bg-demo-surface rounded-xs mt-5 [&_p]:mt-2 [&_p]:mb-4 **:focus-visible:outline-demo [&_>_strong]:text-demo p-5 [&_p]:mx-0"
            data-demo-scope=""
          >
            <h3 className="text-demo">Current preset</h3>
            <Badge>{presets.find((p) => p[0] === s.preset)?.[1]}</Badge>
          </div>
        </section>
        <section
          data-slot="panel"
          className="bg-panel rounded-sm min-w-0 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
        >
          <SectionHead
            title="Clock"
            subtitle="20 October 2026 · Asia/Ho_Chi_Minh"
          />
          <div
            data-slot="clock-display"
            className="text-lg leading-[1.3] tracking-[-3px] text-demo max-[600px]:text-lg my-5 mx-0 demo:text-demo"
          >
            {time(s.clock)}
          </div>
          <p className="leading-[1.65] mt-3 mb-5 mx-0">
            Advancing time expires holds and no-show bookings. Overstaying
            vehicles stay physically parked.
          </p>
          <div className="flex items-center flex-wrap gap-3 mt-5 *:data-[slot~=button]:shrink-0">
            {[5, 15, 60].map((m) => (
              <Button
                variant="secondary"
                key={m}
                onClick={() => act({ type: "advance", minutes: m })}
              >
                +{m} minutes
              </Button>
            ))}
          </div>
          <div
            className="bg-demo-surface rounded-xs mt-5 **:focus-visible:outline-demo [&_>_strong]:text-demo p-5"
            data-demo-scope=""
          >
            <h3 className="text-demo">Scripted sample event</h3>
            <p className="leading-[1.65] mt-2 mb-4 mx-0">
              A fixture battery update to EV-001. Repeated or older samples are
              visibly ignored.
            </p>
            <Button variant="secondary" onClick={() => act({ type: "sample" })}>
              Play sample update
            </Button>
          </div>
        </section>
      </div>
      <section
        data-slot="panel"
        className="mt-5 bg-panel rounded-sm min-w-0 max-[600px]:mt-5 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead
          title="Reset the demonstration"
          subtitle="Restore the original fixtures, clear local changes, and return the clock to 09:00."
        />
        <Confirm
          demo
          title="Reset all data?"
          description="All holds, rides, new bookings, operator actions and scenario runs will be discarded."
          trigger={
            <Button variant="danger">
              <Icon name="refresh" />
              Reset data
            </Button>
          }
          onConfirm={() => {
            act({ type: "reset" });
            setPreset("normal");
          }}
        />
      </section>
      <section
        data-slot="panel"
        className="mt-5 bg-panel rounded-sm min-w-0 max-[600px]:mt-5 max-[600px]:rounded-xs p-5 max-[600px]:p-5"
      >
        <SectionHead title="Preset walkthroughs" />
        {presets.map(([id, title, description]) => (
          <div
            className="flex justify-between items-center gap-3 border-b border-solid border-b-divider text-sm last:border-b-0 last:border-solid [&_>_span:first-child_>_svg]:inline [&_>_span:first-child_>_svg]:align-middle [&_>_span:first-child_>_svg]:mr-2 max-[600px]:items-start max-[600px]:*:data-[slot~=badge]:whitespace-normal max-[600px]:*:data-[slot~=badge]:text-right max-[600px]:*:data-[slot~=badge]:justify-end py-4 px-0"
            key={id}
          >
            <span>
              <strong>{title}</strong>
              <small className="leading-[1.6] block">{description}</small>
            </span>
            <Badge>{id === s.preset ? "Selected" : "Available"}</Badge>
          </div>
        ))}
      </section>
    </div>
  );
}
