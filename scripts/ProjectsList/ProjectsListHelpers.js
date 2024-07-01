// @ts-check

/** @param {PointerEvent} event */
export function getEventProjectNode(event) {
  const node = /** @type {HTMLElement} */ (event.currentTarget);
  return node.closest('.Project.Item');
}

/** @param {PointerEvent} event */
export function getEventProjectId(event) {
  const projectNode = getEventProjectNode(event);
  return projectNode && projectNode.id;
}
