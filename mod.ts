type EventMap = Record<string, unknown>;
type EventHandler<T = unknown> = (event: T) => void;

interface Emitter<Events extends EventMap = Record<string, unknown>> {
  on<Key extends keyof Events>(
    type: Key | "*",
    handler: EventHandler<Events[Key]>,
  ): void;
  once<Key extends keyof Events>(
    type: Key | "*",
    handler: EventHandler<Events[Key]>,
  ): void;
  off<Key extends keyof Events>(
    type: Key | "*",
    handler: EventHandler<Events[Key]>,
  ): void;
  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void;
}

export function asta<
  Events extends EventMap = Record<string, unknown>,
>(): Emitter<Events> {
  const events: Record<string, EventHandler[]> = {};
  const wildcardListeners: EventHandler[] = [];

  return {
    on<Key extends keyof Events>(
      type: Key | "*",
      handler: EventHandler<Events[Key]>,
    ) {
      if (type === "*") {
        wildcardListeners.push(handler as EventHandler);
        return;
      }

      if (!events[type as string]) {
        events[type as string] = [];
      }

      events[type as string].push(handler as EventHandler);
    },

    once<Key extends keyof Events>(
      type: Key | "*",
      handler: EventHandler<Events[Key]>,
    ) {
      const onceHandler = (event: Events[Key]) => {
        handler(event);
        this.off(type, onceHandler);
      };

      this.on(type, onceHandler);
    },

    off<Key extends keyof Events>(
      type: Key | "*",
      handler: EventHandler<Events[Key]>,
    ) {
      if (type === "*") {
        const index = wildcardListeners.indexOf(handler as EventHandler);
        if (index !== -1) {
          wildcardListeners.splice(index, 1);
        }
        return;
      }

      const handlers = events[type as string];
      if (handlers) {
        const index = handlers.indexOf(handler as EventHandler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    },

    emit<Key extends keyof Events>(type: Key, event: Events[Key]) {
      (events[type as string] || []).forEach((handler) => handler(event));
      wildcardListeners.forEach((handler) =>
        handler({ type, event } as unknown as Events[Key])
      );
    },
  };
}
