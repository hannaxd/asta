/**
 * Defines a mapping of event names to their respective payload types
 */
type EventMap = Record<string, unknown>;

/**
 * A basic function that handles events
 * @template T - The type of the actual event payload
 * @param event - The event payload
 */
type EventHandler<T = unknown> = (event: T) => void;

/**
 * An interface representing the actual structure of the event emitter
 * @template Events - The type of events it can handle
 */
interface Emitter<Events extends EventMap = Record<string, unknown>> {
  /**
   * Register a listener for a specific event or wildcard
   * @param type - The event type or '*' for a wildcard
   * @param handler - The function to be called
   */
  on<Key extends keyof Events>(
    type: Key | "*",
    handler: EventHandler<Events[Key]>,
  ): void;
  /**
   * Register a single-use listener for the specific event or wildcard
   * @param type - The event type or '*' for a wildcard
   * @param handler - The function to be called
   */
  once<Key extends keyof Events>(
    type: Key | "*",
    handler: EventHandler<Events[Key]>,
  ): void;

  /**
   * Remove a specific listener
   * @param type - The event type or '*' for a wildcard
   * @param handler - The function to be removed
   */
  off<Key extends keyof Events>(
    type: Key | "*",
    handler: EventHandler<Events[Key]>,
  ): void;

  /**
   * Emit an event, triggering all listeners
   * @param type - The event type to emit
   * @param event - The event payload to pass to listeners
   */
  emit<Key extends keyof Events>(type: Key, event: Events[Key]): void;
}

/**
 * Create a new instance of the emitter.
 * @template Events - The type of events the emitter can handle
 * @returns An instance of the emitter.
 */
export function asta<
  Events extends EventMap = Record<string, unknown>,
>(): Emitter<Events> {
  const events: Record<string, EventHandler[]> = {};
  const wildcardListeners: EventHandler[] = [];

  return {
    /**
     * Register a listener for a specific event or wildcard
     */
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

    /**
     * Register a single-use listener for the specific event or wildcard
     */
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

    /**
     * Remove a specific listener
     */
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

    /**
     * Emit an event, triggering all listeners
     */
    emit<Key extends keyof Events>(type: Key, event: Events[Key]) {
      (events[type as string] || []).forEach((handler) => handler(event));
      wildcardListeners.forEach((handler) =>
        handler({ type, event } as unknown as Events[Key])
      );
    },
  };
}
