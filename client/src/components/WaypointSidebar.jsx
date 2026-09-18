import { WaypointCard } from './WaypointCard';

export function WaypointSidebar({ waypoints }) {
  if (!waypoints.length) return null;

  let enteredIndex = -1;

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto p-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
        Waypoints
      </h2>
      {waypoints.map((wp) => {
        if (wp.type === 'entered') enteredIndex++;
        return (
          <WaypointCard
            key={wp.id}
            waypoint={wp}
            index={wp.type === 'entered' ? enteredIndex : undefined}
          />
        );
      })}
    </div>
  );
}
