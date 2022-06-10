class ExpandShrink {
  constructor(canvas) {
    this.c = canvas;
  }

  start() {
    if (this.c.expanded) {
      this.expand();
    } else {
      this.shrink();
    }
  }

  expand() {
    const node = this.getFirstNode();
    if (
      node === this.c.endBlockId &&
      this.c.tabs[this.c.selectedTab].type !== "f_body"
    ) {
      this.c.setExpanded();
      return;
    }
    this.c.pauseRenderX = false;
    this.getNodesAndVisit(node);
  }

  shrink() {
    this.c.loadTabByIndex(this.c.selectedTab);
  }

  getFirstNode() {
    return this.c.graph.getNodeEdges(this.c.startBlockId)[0];
  }

  getNodesAndVisit(node) {
    this.c.update();
    const troncalNodes = [node];
    this.getTroncalNodes(node, troncalNodes);
    this.visitNodes(troncalNodes);
  }

  getTroncalNodes(node, troncalNodes) {
    const edges = this.c.graph.getNodeEdges(node);
    if (edges === null || edges.length < 1) return;
    if (edges[0] !== this.c.endBlockId) troncalNodes.push(edges[0]);
    this.getTroncalNodes(edges[0], troncalNodes);
  }

  visitNodes(nodes) {
    for (const node of nodes) {
      this.visitNode(node);
    }
  }

  visitNode(node) {
    const children = this.c.getChildren(node);
    let allDescendants = this.getAllDescendants(node, children, true);
    if (!allDescendants.length) return;
    const [first, ...rest] = allDescendants;
    allDescendants = [...rest, first];
    for (let i = 0; i < allDescendants.length; i++) {
      this.setNewWidth(allDescendants[i]);
    }
  }

  setNewWidth(descendant) {
    const { parent, children } = descendant;
    const parentIndex = this.c.getBlockIndex(parent);
    const { x, y, type } = this.c.program[parentIndex];
    let branchWidthYes = 0;
    let branchWidthNo = 0;
    let plusIfWYes = 0;
    let plusIfWNo = 0;
    if (type === "ifBlock") {
      const { branchYes, branchNo, plusWYes, plusWNo } = this.setNewIfWidth(
        children,
        parentIndex
      );
      branchWidthYes = branchYes;
      branchWidthNo = branchNo;
      plusIfWYes = plusWYes;
      plusIfWNo = plusWNo;
    } else {
      branchWidthYes = this.setNewLoopWidth(children, parentIndex);
    }
    this.c.program[parentIndex].updateWidth(
      branchWidthYes,
      branchWidthNo,
      plusIfWYes,
      plusIfWNo
    );
    this.c.program[parentIndex].move(x, y);
  }

  setNewLoopWidth(children, parentIndex) {
    const {
      type,
      w,
      incrementWidthLeftLine,
      blockProps: { defaultLongBranch },
    } = this.c.program[parentIndex];
    const lineAdd = 30 / 1.5;
    const { maxWidth, type: maxType, idx } = this.getMaxWidth(children);
    if (maxType === "ifBlock") {
      const childrenIf = this.c.getChildren(this.c.program[idx].id);
      if (!childrenIf.length) {
        return type === "doWhileBlock"
          ? lineAdd + incrementWidthLeftLine - defaultLongBranch
          : lineAdd + incrementWidthLeftLine;
      }
      const {
        maxWidth: maxWYes,
        type: maxTypeYes,
        idx: idxYes,
      } = this.getMaxWidth(
        childrenIf.filter((child) => child.props.branch === "YES")
      );
      const {
        maxWidth: maxWNo,
        type: maxTypeNo,
        idx: idxNo,
      } = this.getMaxWidth(
        childrenIf.filter((child) => child.props.branch === "NO")
      );
      if (maxWYes >= maxWNo) {
        const childHalfW = this.c.program[idx].branchDimension.r;
        const parentHalfW =
          type === "doWhileBlock"
            ? incrementWidthLeftLine + defaultLongBranch
            : w / 2 + incrementWidthLeftLine + defaultLongBranch;
        const wHalf = w / 2 + defaultLongBranch;
        if (childHalfW > parentHalfW) {
          return childHalfW - wHalf + lineAdd;
        } else if (childHalfW < parentHalfW) {
          const sub = wHalf - childHalfW;
          return type === "doWhileBlock"
            ? sub <= lineAdd && sub >= 0
              ? lineAdd
              : incrementWidthLeftLine - defaultLongBranch
            : sub <= lineAdd && sub >= 0
            ? lineAdd
            : incrementWidthLeftLine;
        } else {
          return type === "doWhileBlock"
            ? lineAdd + incrementWidthLeftLine - defaultLongBranch
            : lineAdd + incrementWidthLeftLine;
        }
      } else {
        const childHalfW = this.c.program[idx].branchDimension.l;
        const parentHalfW =
          type === "doWhileBlock"
            ? incrementWidthLeftLine + defaultLongBranch
            : w / 2 + incrementWidthLeftLine + defaultLongBranch;
        const wHalf = w / 2 + defaultLongBranch;
        if (childHalfW > parentHalfW) {
          return childHalfW - wHalf + lineAdd;
        } else if (childHalfW < parentHalfW) {
          const sub = wHalf - childHalfW;
          return type === "doWhileBlock"
            ? sub <= lineAdd && sub >= 0
              ? lineAdd
              : incrementWidthLeftLine - defaultLongBranch
            : sub <= lineAdd && sub >= 0
            ? lineAdd
            : incrementWidthLeftLine;
        } else {
          return type === "doWhileBlock"
            ? lineAdd + incrementWidthLeftLine - defaultLongBranch
            : lineAdd + incrementWidthLeftLine;
        }
      }
    } else {
      const childHalfW = maxWidth / 2;
      const parentHalfW =
        type === "doWhileBlock"
          ? incrementWidthLeftLine + defaultLongBranch
          : w / 2 + incrementWidthLeftLine + defaultLongBranch;
      const wHalf = w / 2 + defaultLongBranch;
      if (childHalfW > parentHalfW) {
        return childHalfW - wHalf + lineAdd;
      } else if (childHalfW < parentHalfW) {
        const sub = wHalf - childHalfW;
        return type === "doWhileBlock"
          ? sub <= lineAdd && sub >= 0
            ? lineAdd
            : incrementWidthLeftLine - defaultLongBranch
          : sub <= lineAdd && sub >= 0
          ? lineAdd
          : incrementWidthLeftLine;
      } else {
        return type === "doWhileBlock"
          ? lineAdd + incrementWidthLeftLine - defaultLongBranch
          : lineAdd + incrementWidthLeftLine;
      }
    }
  }

  setNewIfWidth(children, parentIndex) {
    const { w } = this.c.program[parentIndex];
    const {
      maxWidth: maxWYes,
      type: maxTypeYes,
      idx: idxYes,
    } = this.getMaxWidth(
      children.filter((child) => child.props.branch === "YES")
    );
    const {
      maxWidth: maxWNo,
      type: maxTypeNo,
      idx: idxNo,
    } = this.getMaxWidth(
      children.filter((child) => child.props.branch === "NO")
    );
    let branchYes = 0;
    let branchNo = 0;
    let plusWYes = 0;
    let plusWNo = 0;
    if (idxYes > -1) {
      if (maxTypeYes === "ifBlock") {
        branchYes = this.c.program[idxYes].branchDimension.l;
        plusWYes = this.c.program[idxYes].branchDimension.r;
      } else {
        const childHalfW = this.c.program[idxYes].lastDimension.w / 2;
        branchYes = childHalfW > w ? childHalfW - w : 0;
        plusWYes = childHalfW;
      }
    }
    if (idxNo > -1) {
      if (maxTypeNo === "ifBlock") {
        branchNo = this.c.program[idxNo].branchDimension.r;
        plusWNo = this.c.program[idxNo].branchDimension.l;
      } else {
        const childHalfW = this.c.program[idxNo].lastDimension.w / 2;
        branchNo = childHalfW > w ? childHalfW - w : 0;
        plusWNo = childHalfW;
      }
    }
    return { branchYes, branchNo, plusWYes, plusWNo };
  }

  getMaxWidth(children) {
    let maxWidth = 0;
    let type = "";
    let idx = -1;
    children.forEach((child) => {
      const index = this.c.getBlockIndex(child.id);
      const { maxWidth: maxW, type: maxType } = this.calculateMaxWidth({
        maxWidth,
        index,
      });
      if (maxW > maxWidth) {
        maxWidth = maxW;
        type = maxType;
        idx = index;
      }
    });
    return { maxWidth, type, idx };
  }

  calculateMaxWidth({ maxWidth, index }) {
    const {
      lastDimension: { w: lastDimension },
      type,
    } = this.c.program[index];
    maxWidth = lastDimension > maxWidth ? lastDimension : maxWidth;
    return { maxWidth, type };
  }

  getAllDescendants(node, children, includeAll = false) {
    let all = children.length > 0 ? [{ parent: node, children }] : [];
    const getDescendants = (children) => {
      for (let i = 0; i < children.length; i++) {
        let childs = !includeAll
          ? this.c
              .getChildren(children[i].id)
              .filter((child) => this.blockStatement.includes(child.type))
          : this.c.getChildren(children[i].id);
        getDescendants(childs);
        if (childs.length > 0) {
          all = [...all, { parent: children[i].id, children: [...childs] }];
        }
      }
    };
    getDescendants(children);
    return all;
  }
}
