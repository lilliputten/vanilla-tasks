// @ts-check

/** @param {PointerEvent} event */
export function getEventTaskNode(event) {
  const node = /** @type {HTMLElement} */ (event.currentTarget);
  return node.closest('.Task.Item');
}

/** @param {PointerEvent} event */
export function getEventTaskId(event) {
  const projectNode = getEventTaskNode(event);
  return projectNode && projectNode.id;
}
