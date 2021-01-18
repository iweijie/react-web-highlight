const insideElement = (target: Element, wrap: Element): boolean => {
  let node = target;
  while (node) {
    if (node === wrap) return true;
    node = node.parentElement as Element;
  }
  return false;
};

export default insideElement;
