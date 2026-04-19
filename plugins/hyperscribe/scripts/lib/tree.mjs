export function renderTree(node, registry, ctx = {}) {
  const fn = registry[node.component];
  if (!fn) throw new Error(`No renderer for component: ${node.component}`);
  const children = Array.isArray(node.children) ? node.children : [];
  const renderChildren = () => children.map(c => renderTree(c, registry, ctx)).join("");
  return fn(node.props || {}, renderChildren, ctx);
}
