import { currentPageChanged } from './currentPageChange'

export default function () {
  // figma.closePlugin('Hello, World!')
  currentPageChanged()
  figma.on('currentpagechange', currentPageChanged)
}
