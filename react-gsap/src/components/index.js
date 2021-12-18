import { AnimatingTargetElement } from './AnimatingTargetElement'
import { AnimatingAllDescendantElements } from './AnimatingAllDescendantElements'
import { AnimatingSomeDescendantElements } from './AnimatingSomeDescendantElements'
import { ControllingAnimationTimeline } from './ControllingAnimationTimeline'
import { ControllingAnimationStart } from './ControllingAnimationStart'
import { AnimationStartPropChange } from './AnimationStartPropChange'
import { AnimationStartUserAction } from './AnimationStartUserAction'
import { AnimationWithoutFlash } from './AnimationWithoutFlash'
import { PassingTimelineThroughProps } from './PassingTimelineThroughProps'
import { PassingCallbackThroughProps } from './PassingCallbackThroughProps'
import { PassingTimelineThroughContext } from './PassingTimelineThroughContext'
import { ImperativeHandleMousePosition } from './ImperativeHandleMousePosition'
import { ReusableAnimationWrapper } from './ReusableAnimationWrapper'
import { ReusableAnimationRegisterEffect } from './ReusableAnimationRegisterEffect'
import { RemovingSingleElementFromDom } from './RemovingSingleElementFromDom'
import { RemovingMultipleElementsFromDom } from './RemovingMultipleElementsFromDom'

export const componentMap = {
  AnimatingTargetElement,
  AnimatingAllDescendantElements,
  AnimatingSomeDescendantElements,
  ControllingAnimationTimeline,
  ControllingAnimationStart,
  AnimationStartPropChange,
  AnimationStartUserAction,
  AnimationWithoutFlash,
  PassingTimelineThroughProps,
  PassingCallbackThroughProps,
  PassingTimelineThroughContext,
  ImperativeHandleMousePosition,
  ReusableAnimationWrapper,
  ReusableAnimationRegisterEffect,
  RemovingSingleElementFromDom,
  RemovingMultipleElementsFromDom
}
