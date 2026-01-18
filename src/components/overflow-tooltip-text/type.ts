import { ElTooltipProps } from 'element-plus'

export type OverflowTooltipTextProps = {
  text?: string
  tooltipProps?: Partial<ElTooltipProps>
}

export type OverflowTooltipTextSlots = {
  default: (scope: { text: string }) => any
  content: (scope: { text: string }) => any
}
