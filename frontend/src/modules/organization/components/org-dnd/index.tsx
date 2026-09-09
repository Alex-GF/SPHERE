import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDndContext,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import { MdDragIndicator } from 'react-icons/md';

import Iconify from '../../../core/components/iconify';
import { ORG_ROOT_DROP_ID, type OrgRowDnd } from './row';

interface OrgDndProviderProps {
  /** The organization dropped, and the parent it lands under (null = root). */
  onMove: (organizationId: string, parentId: string | null) => void;
  /** Told which organization is being dragged, so targets can be greyed out. */
  onDragChange?: (organizationId: string | null) => void;
  /** Row rendered under the cursor while dragging. */
  renderDragPreview: (organizationId: string) => ReactNode;
  children: ReactNode;
}

/**
 * Wires an organization tree for dragging rows between parents.
 *
 * Rows are both draggable and droppable, and dropping one on another is what
 * re-parents it; the surrounding page decides which rows may be picked up and
 * which may receive.
 */
export function OrgDndProvider({
  onMove,
  onDragChange,
  renderDragPreview,
  children,
}: Readonly<OrgDndProviderProps>): JSX.Element {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const sensors = useSensors(
    // Rows are also links and buttons, so a drag only starts once the pointer
    // has travelled far enough to rule out a click.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const track = useCallback(
    (organizationId: string | null) => {
      setDraggedId(organizationId);
      onDragChange?.(organizationId);
    },
    [onDragChange]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const target = event.over?.id;
    const organizationId = String(event.active.id);
    track(null);

    if (target === undefined || target === null) {
      return;
    }

    onMove(organizationId, target === ORG_ROOT_DROP_ID ? null : String(target));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={event => track(String(event.active.id))}
      onDragCancel={() => track(null)}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {draggedId ? renderDragPreview(draggedId) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface OrgDragHandleProps {
  dnd: OrgRowDnd;
  /** Why the row cannot be moved, shown as the handle's tooltip. */
  disabledReason?: string;
  isDisabled?: boolean;
}

/**
 * Grip that starts the drag.
 *
 * The drag lives on a handle rather than on the whole row because these rows
 * are links: dragging the row itself would fight the browser's own link
 * dragging and swallow ordinary clicks.
 */
export function OrgDragHandle({
  dnd,
  disabledReason,
  isDisabled = false,
}: Readonly<OrgDragHandleProps>): JSX.Element {
  return (
    <span
      {...(isDisabled ? {} : dnd.dragHandleProps)}
      title={isDisabled ? disabledReason : 'Drag to move this organization'}
      onClick={event => event.preventDefault()}
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-tp-muted transition-colors ${
        isDisabled
          ? 'cursor-not-allowed opacity-30'
          : 'cursor-grab hover:bg-tp-hairline hover:text-tp-steel active:cursor-grabbing'
      }`}
    >
      <MdDragIndicator size={14} />
    </span>
  );
}

interface OrgRootDropZoneProps {
  /** Copy explaining what dropping here does. */
  label: string;
  /** Hidden when the dragged organization already sits at the root. */
  isDisabled?: boolean;
}

/** Drop area that takes an organization out of its parent, back to the root. */
export function OrgRootDropZone({
  label,
  isDisabled = false,
}: Readonly<OrgRootDropZoneProps>): JSX.Element | null {
  const { active } = useDndContext();
  const { setNodeRef, isOver } = useDroppable({ id: ORG_ROOT_DROP_ID, disabled: isDisabled });

  if (!active || isDisabled) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      className={`mb-2 flex items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-xs transition-colors ${
        isOver
          ? 'border-tp-primary bg-tp-primary/10 text-tp-primary'
          : 'border-tp-hairline text-tp-steel'
      }`}
    >
      <Iconify icon="mdi:arrow-up-left" width={14} />
      {label}
    </div>
  );
}
