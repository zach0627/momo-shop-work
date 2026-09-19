import { Component, type ReactNode } from 'react';

import type { HomeSection } from '@momo/home-data-access';
import { reportError } from '@momo/shared-util';

interface SectionBoundaryProps {
  section: HomeSection;
  children: ReactNode;
}

interface SectionBoundaryState {
  hasError: boolean;
  /** 上一次 render 拿到的資料，用來判斷資料有沒有換。 */
  section: HomeSection;
}

/** 一個區塊渲染時拋錯：只拿掉那一塊並回報，其餘區塊照常。error boundary 只能用 class 寫。 */
export class SectionBoundary extends Component<
  SectionBoundaryProps,
  SectionBoundaryState
> {
  override state: SectionBoundaryState = {
    hasError: false,
    section: this.props.section,
  };

  static getDerivedStateFromError(): Partial<SectionBoundaryState> {
    return { hasError: true };
  }

  // 資料換了就再試一次。內容沒變的區塊是同一個物件（TanStack Query 的 structural sharing），不會白白重試
  static getDerivedStateFromProps(
    props: SectionBoundaryProps,
    state: SectionBoundaryState,
  ): Partial<SectionBoundaryState> | null {
    return props.section === state.section
      ? null
      : { hasError: false, section: props.section };
  }

  override componentDidCatch(error: unknown) {
    const { section } = this.props;
    reportError(error, { sectionId: section.id, sectionType: section.type });
  }

  override render() {
    return this.state.hasError ? null : this.props.children;
  }
}
