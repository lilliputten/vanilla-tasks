// @ts-check

/** @param {Event} event */
export function getEventProjectNode(event) {
  const node = /** @type {HTMLElement} */ (event.currentTarget);
  return node.closest('.Project.Item');
}

/** @param {Event} event */
export function getEventProjectId(event) {
  const projectNode = getEventProjectNode(event);
  return projectNode && projectNode.id;
}
