export const currentPageChanged = () =>
  figma.currentPage.on('nodechange', ({ nodeChanges }) =>
    nodeChanges.forEach(({ type, node }) => {
      if (type !== 'PROPERTY_CHANGE') return
      if (node.type !== 'FRAME') return

      if ('name' in node) {
        const frameName = /^(Stack|Cluster)(\[(auto|\d+)\])?$/.exec(node.name)
        if (!frameName) return

        const { 1: component, 3: gap } = frameName
        makeAutoLayout(node, component as 'Stack' | 'Cluster', gap)
      }
    }),
  )

const makeAutoLayout = (
  node: FrameNode,
  component: 'Stack' | 'Cluster',
  gapStr: string,
) => {
  const gap = parseGap(gapStr)

  switch (component) {
    case 'Stack':
      node.layoutMode = 'VERTICAL'
      node.layoutWrap = 'NO_WRAP'
      break
    case 'Cluster':
      node.layoutMode = 'HORIZONTAL'
      node.layoutWrap = 'WRAP'
      break
  }

  if (gap === 'auto') {
    node.primaryAxisAlignItems = 'SPACE_BETWEEN'
  } else {
    node.primaryAxisAlignItems = 'MIN'
    node.itemSpacing = gap
  }
}

const parseGap = (arg: string) => {
  if (arg === 'auto') {
    return arg
  }

  return parseInt(arg, 10)
}
