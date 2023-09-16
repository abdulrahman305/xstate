import { Ref, shallowRef } from 'vue';
import {
  ActorLogic,
  ActorRefFrom,
  AnyActorLogic,
  EventFrom,
  SnapshotFrom
} from 'xstate';
import { UseActorRefRestParams, useActorRef } from './useActorRef.ts';

export function useActor<TLogic extends AnyActorLogic>(
  actorLogic: TLogic,
  ...[options = {}]: UseActorRefRestParams<TLogic>
): {
  snapshot: Ref<SnapshotFrom<TLogic>>;
  send: (event: EventFrom<TLogic>) => void;
  actorRef: ActorRefFrom<TLogic>;
} {
  if (process.env.NODE_ENV !== 'production') {
    if ('send' in actorLogic && typeof actorLogic.send === 'function') {
      throw new Error(
        `useActor() expects actor logic (e.g. a machine), but received an ActorRef. Use the useSelector(actorRef, ...) hook instead to read the ActorRef's snapshot.`
      );
    }
  }

  function listener(nextState: SnapshotFrom<TLogic>) {
    snapshot.value = nextState;
  }

  const actorRef = useActorRef(actorLogic, options, listener as any);
  const snapshot = shallowRef(actorRef.getSnapshot());

  return {
    snapshot,
    send: actorRef.send,
    actorRef: actorRef as ActorRefFrom<TLogic>
  };
}
