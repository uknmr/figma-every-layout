const DEFAULT_FONT_SIZE = 16
const DEFAULT_GAP_STACK = 1
const DEFAULT_GAP_CLUSTER = 0.5
const SPACING_TOKENS = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4, 8]

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

const makeAutoLayout = (
  node: FrameNode,
  component: 'Stack' | 'Cluster',
  gapStr: string,
) => {
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

  const gap = gapStr
    ? parseGap(gapStr)
    : component === 'Stack'
    ? DEFAULT_GAP_STACK
    : DEFAULT_GAP_CLUSTER

  if (gap === 'auto') {
    node.primaryAxisAlignItems = 'SPACE_BETWEEN'
    return
  }

  node.primaryAxisAlignItems = 'MIN'
  node.primaryAxisSizingMode = 'AUTO'

  if (isNaN(gap)) return
  if (!SPACING_TOKENS.includes(gap)) return

  node.itemSpacing = DEFAULT_FONT_SIZE * gap
}

const parseGap = (arg: string) => {
  if (arg === 'auto') {
    return arg
  }

  return parseFloat(arg)
}
