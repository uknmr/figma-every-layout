export const currentPageChanged = () =>
  figma.currentPage.on('nodechange', ({ nodeChanges }) =>
    nodeChanges.forEach(({ type, node, ...rest }) => {
      if (type !== 'PROPERTY_CHANGE') return
      if (node.type !== 'FRAME') return
      if (!('properties' in rest && rest.properties.includes('name'))) return
      if (!('name' in node)) return

      const frameName = /^(Stack|Cluster)(\[(.+)\])?$/.exec(node.name)
      if (!frameName) return

      const { 1: component, 3: gap } = frameName
      makeAutoLayout(node, component as 'Stack' | 'Cluster', gap)
    }),
  )

const DEFAULT_GAP_STACK = '16'
const DEFAULT_GAP_CLUSTER = '8'

const makeAutoLayout = (
  node: FrameNode,
  component: 'Stack' | 'Cluster',
  gapStr: string = component === 'Stack'
    ? DEFAULT_GAP_STACK
    : DEFAULT_GAP_CLUSTER,
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

  node.counterAxisSizingMode = 'AUTO'

  if (gap === 'auto') {
    node.primaryAxisAlignItems = 'SPACE_BETWEEN'
  } else {
    node.primaryAxisAlignItems = 'MIN'
    node.primaryAxisSizingMode = 'AUTO'

    if (!isNaN(gap)) {
      node.itemSpacing = gap
    }
  }
}

const parseGap = (arg: string) => {
  if (arg === 'auto') {
    return arg
  }

  return parseInt(arg, 10)
}
