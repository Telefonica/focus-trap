/**
 * Traverses the slots of the open shadowroots and returns all children matching the query.
 * @param {ShadowRoot | HTMLElement} root
 * @param skipNode
 * @param isMatch
 * @param {number} maxDepth
 * @param {number} depth
 * @returns {HTMLElement[]}
 */
export function queryShadowRoot (root: ShadowRoot | HTMLElement,
                                 skipNode: (($elem: HTMLElement) => boolean),
                                 isMatch: (($elem: HTMLElement) => boolean),
                                 maxDepth: number = 20,
                                 depth: number = 0): HTMLElement[] {
	let matches: HTMLElement[] = [];

	// If the depth is above the max depth, abort the searching here.
	if (depth >= maxDepth) {
		return matches;
	}

	// Traverses a slot element
	const traverseSlot = ($slot: HTMLSlotElement) => {

		// Only check nodes that are of the type Node.ELEMENT_NODE
		// Read more here https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
		const assignedNodes = $slot.assignedNodes().filter(node => node.nodeType === 1);
		if (assignedNodes.length > 0) {
			return queryShadowRoot(assignedNodes[0].parentElement!, skipNode, isMatch, maxDepth, depth + 1);
		}

		return [];
	};

	// Go through each child and continue the traversing if necessary
	const children = <HTMLElement[]>Array.from(root.children);
	for (const $child of children) {

		// Check if the node and its descendants should be skipped
		if (skipNode($child)) {
			continue;
		}

		// If the child matches we always add it
		if (isMatch($child)) {
			matches.push($child);
		}

		if ($child.shadowRoot != null) {
			matches.push(...queryShadowRoot($child.shadowRoot, skipNode, isMatch, maxDepth, depth + 1));

		} else if ($child.tagName === "SLOT") {
			matches.push(...traverseSlot(<HTMLSlotElement>$child));

		} else {
			matches.push(...queryShadowRoot($child, skipNode, isMatch, maxDepth, depth + 1));
		}
	}

	return matches;
}
