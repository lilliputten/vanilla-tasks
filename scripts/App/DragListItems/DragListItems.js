// @ts-check

export class DragListItems {
  /** Handlers exchange object
   * @type {TSharedHandlers}
   */
  callbacks = {};

  /** @type {TSetTimeout} */
  dragTimerHandler = undefined;

  /** @type {TItemId} */
  dragSourceId = undefined;

  /** @type {HTMLElement} */
  dragSourceNode = undefined;

  /** @type {TItemId} */
  dragTargetId = undefined;

  /** @type {HTMLElement} */
  dragTargetNode = undefined;

  /** @type {Boolean} */
  dragTargetAfter = undefined;

  /** @type {TDragListItemsParams['dragId']} */
  dragId = undefined;

  /** @type {string} */
  dragType = undefined;

  /** @type {HTMLElement} */
  listNode = undefined;

  /** @type {TDragListItemsParams['onDragFinish']} */
  onDragFinish = undefined;

  /** @constructor
   * @param {TDragListItemsParams} params
   */
  constructor(params) {
    const { callbacks } = this;

    const { listNode, dragId, onDragFinish } = params;

    this.listNode = listNode;
    this.dragId = dragId;
    this.dragType = ('drag-' + dragId).toLowerCase();

    this.onDragFinish = onDragFinish;
    if (!onDragFinish) {
      const error = new Error(`Drag finish handler has not been specified for "${dragId}"`);
      // eslint-disable-next-line no-console
      console.error('[DragListItems]', error, {
        dragId,
      });
      throw error;
    }

    // Init handler callbacks...
    callbacks.clearDragState = this.clearDragState.bind(this);
    callbacks.updateDragState = this.updateDragState.bind(this);
    callbacks.onDragStart = this.onDragStart.bind(this);
    callbacks.onDragOver = this.onDragOver.bind(this);
    callbacks.onDragEnd = this.onDragEnd.bind(this);

    this.updateDragHandlers();
  }

  // Helpers...

  updateDragHandlers() {
    const { dragId, listNode, callbacks } = this;

    const nodes = listNode.querySelectorAll('.Item[draggable]');

    if (!nodes.length) {
      return;
    }

    const actionHandlers = {
      touchstart: callbacks.onDragStart,
      touchmove: callbacks.onDragOver,
      touchend: callbacks.onDragEnd,
      dragstart: callbacks.onDragStart,
      dragend: callbacks.clearDragState,
      dragover: callbacks.onDragOver,
      drop: callbacks.onDragEnd,
    };
    const actionTypes = Object.keys(actionHandlers);
    nodes.forEach((node) => {
      actionTypes.forEach((actionType) => {
        const action = actionHandlers[actionType];
        if (!action) {
          const error = new Error(`Not found action for id "${actionType}"`);
          // eslint-disable-next-line no-console
          console.warn('[DragListItems:updateDragHandlers]', error, {
            dragId,
            actionType,
            actionHandlers,
          });
          return;
        }
        // Just for case: remove previous listener
        node.removeEventListener(actionType, action);
        // Add listener...
        node.addEventListener(actionType, action);
      });
    });
  }

  /** Apply movement for dom nodes and items list data according to current
   * `TDragListItemsResult` data (should be called from `onDragFinish` handler).
   *
   * @param {TListItem[]} items} -- Items list what will be chaged in place.
   */
  commitMove(items) {
    const { listNode } = this;
    const result = this.getDragListItemsResult();
    const {
      // dragId,
      targetId,
      sourceId,
      insertAfter,
    } = result;
    const sourceNode = listNode.querySelector(`.Item#${sourceId}`);
    const targetNode = listNode.querySelector(`.Item#${targetId}`);
    const sourceIdx = items.findIndex(({ id }) => id === sourceId);
    const targetItemIdx = items.findIndex(({ id }) => id === targetId);
    const targetIdx = insertAfter ? targetItemIdx + 1 : targetItemIdx;
    if (targetIdx === sourceIdx) {
      // No operations are required
      return;
    }
    const insertAfterSource = targetIdx > sourceIdx;
    // NOTE: The index should be changed if we have to insert after source position
    const targetIdxWhenRemoved = insertAfterSource ? targetIdx - 1 : targetItemIdx;
    /* console.log('[TasksListClass:onDragFinish] before', {
     *   sourceNode,
     *   targetNode,
     *   targetIdxWhenRemoved,
     *   targetIdx,
     *   sourceIdx,
     *   items: [...items],
     *   targetId,
     *   sourceId,
     *   insertAfter,
     * });
     */
    // Move list item...
    const removedItems = items.splice(sourceIdx, 1);
    items.splice(targetIdxWhenRemoved, 0, removedItems[0]);
    /* console.log('[TasksListClass:onDragFinish] after', {
     *   removedItems,
     *   items,
     * });
     */
    // Move dom node...
    sourceNode.remove();
    if (insertAfter) {
      targetNode.after(sourceNode);
    } else {
      const parentNode = targetNode.parentElement;
      parentNode.insertBefore(sourceNode, targetNode);
    }
    /* console.log('[TasksListClass:onDragFinish] finished', {
     *   removedItems,
     *   items,
     * });
     */
  }

  clearDragState() {
    const { listNode } = this;
    listNode.classList.toggle('Dragging', false);
    listNode.classList.toggle('hasDragTarget', false);
    const nodes = listNode.querySelectorAll('.Item');
    nodes.forEach((node) => {
      node.classList.toggle('DragTo', false);
      node.classList.toggle('DragFrom', false);
      node.classList.toggle('DragBefore', false);
      node.classList.toggle('DragAfter', false);
    });
    this.dragSourceId = undefined;
    this.dragSourceNode = undefined;
    this.dragTargetId = undefined;
    this.dragTargetNode = undefined;
    this.dragTargetAfter = undefined;
    if (this.dragTimerHandler) {
      clearTimeout(this.dragTimerHandler);
      this.dragTimerHandler = undefined;
    }
  }

  updateDragState() {
    const { dragTargetId, dragTargetNode, dragTargetAfter, listNode } = this;
    this.dragTimerHandler = undefined;
    const dragNodes = listNode.querySelectorAll('.Item.DragTo');
    /* console.log('[DragListItems:updateDragState]', {
     *   dragNodes,
     *   dragTargetNode,
     *   dragTargetId,
     *   // dragTargetAfter,
     *   // listNode,
     * });
     */
    dragNodes.forEach((node) => {
      if (node.id !== dragTargetId) {
        node.classList.toggle('DragTo', false);
        node.classList.toggle('DragBefore', false);
        node.classList.toggle('DragAfter', false);
      }
    });
    if (dragTargetNode) {
      dragTargetNode.classList.toggle('DragTo', true);
      dragTargetNode.classList.toggle('DragBefore', !dragTargetAfter);
      dragTargetNode.classList.toggle('DragAfter', dragTargetAfter);
    }
    listNode.classList.toggle('hasDragTarget', !!dragTargetNode);
  }

  /** @return {TDragListItemsResult} */
  getDragListItemsResult() {
    const {
      // prettier-ignore
      dragId,
      // dragType,
      dragTargetId,
      dragTargetAfter,
      // onDragFinish,
      dragSourceId,
    } = this;
    /** @type {TDragListItemsResult} */
    const result = {
      dragId,
      targetId: dragTargetId,
      sourceId: dragSourceId,
      insertAfter: dragTargetAfter,
    };
    return result;
  }

  // Actions...

  /** @param {DragEvent} event */
  onDragEnd(event) {
    event.preventDefault();
    const { onDragFinish } = this;
    /** @type {TDragListItemsResult} */
    const result = this.getDragListItemsResult();
    const { targetId, sourceId } = result;
    // console.log('[DragListItems:onDragEnd]', this.dragId, result);
    if (targetId && sourceId && onDragFinish) {
      onDragFinish(result);
    }
    this.clearDragState();
  }

  /** @param {DragEvent & TouchEvent} event */
  onDragOver(event) {
    const { dragId, dragSourceId, dragSourceNode } = this;
    const {
      // prettier-ignore
      type,
      touches,
      changedTouches,
      dataTransfer,
    } = event;
    const isTouch = type.startsWith('touch');
    if (!isTouch) {
      event.preventDefault();
    }
    const touch = isTouch ? (touches && touches[0]) || changedTouches[0] : undefined;
    const pageX = isTouch ? touch.pageX : event.pageX;
    const pageY = isTouch ? touch.pageY : event.pageY;
    let targetNode = /** @type {HTMLElement} */ (event.currentTarget);
    if (isTouch) {
      const overNode = document.elementFromPoint(pageX, pageY);
      targetNode = /** @type {HTMLElement} */ (
        overNode.matches('.Item') ? overNode : overNode.closest('.Item')
      );
    }
    if (!targetNode) {
      // ???
      return;
    }
    const targetItemId = targetNode.id;
    const targetDragId = targetNode.getAttribute('drag-id');
    const isSource = targetItemId === dragSourceId;
    const isExpectedDrag = dragId === targetDragId;
    const isValidDrag = isExpectedDrag && !isSource;
    /* console.log('[DragListItems:onDragOver]', this.dragId, isValidDrag, {
     *   dragId,
     *   targetDragId,
     *   dataTransfer,
     *   targetNode,
     *   targetItemId,
     *   isSource,
     *   isValidDrag,
     *   isTouch,
     *   type,
     *   touches,
     *   pageX,
     *   pageY,
     *   event,
     * });
     */
    if (isValidDrag) {
      const rect = targetNode.getBoundingClientRect();
      const { y, height } = rect;
      const middle = y + height / 2;
      const isNextSource = targetNode.nextElementSibling === dragSourceNode;
      const isPrevSource = targetNode.previousElementSibling === dragSourceNode;
      const isAfterMiddle = pageY > middle;
      // NOTE: Prevent movement right before or after the source node
      const isAfter = (isAfterMiddle && !isNextSource) || (!isAfterMiddle && isPrevSource);
      this.dragTargetId = targetItemId;
      this.dragTargetAfter = isAfter;
      this.dragTargetNode = targetNode;
    } else if (isSource) {
      this.dragTargetId = undefined;
      this.dragTargetNode = undefined;
    }
    if (dataTransfer) {
      dataTransfer.dropEffect = isValidDrag ? 'move' : 'none';
    }
    if (!this.dragTimerHandler) {
      this.dragTimerHandler = setTimeout(this.callbacks.updateDragState, 300);
    }
  }

  /** @param {DragEvent} event */
  onDragStart(event) {
    const { dragId, dragType, listNode } = this;
    const sourceNode = /** @type {HTMLElement} */ (event.currentTarget);
    const sourceId = sourceNode.id;
    const itemData = {
      sourceDragId: dragId,
      sourceItemId: sourceId,
    };
    const { type, dataTransfer } = event;
    const isTouch = type.startsWith('touch');
    if (isTouch) {
      // NOTE: This call is required to prevent reload during drag, but blocks item selection (by click).
      // TODO?
      // event.preventDefault();
    }
    /* console.log('[DragListItems:onDragStart]', this.dragId, {
     *   itemData,
     *   sourceId,
     *   sourceNode,
     *   dataTransfer,
     *   event,
     *   dragId,
     *   dragType,
     *   listNode,
     * });
     */
    if (dataTransfer) {
      dataTransfer.setData(dragType, JSON.stringify(itemData));
      dataTransfer.effectAllowed = 'move';
    }
    listNode.classList.toggle('Dragging', true);
    sourceNode.classList.toggle('DragFrom', true);
    this.dragSourceId = sourceId;
    this.dragSourceNode = sourceNode;
  }
}
