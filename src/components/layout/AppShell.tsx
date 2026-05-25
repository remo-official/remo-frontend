import type { ReactNode } from 'react';
import { FlexBox, TopNavigation, TopNavigationButton } from '@wanteddev/wds';
import { IconChevronLeft } from '@wanteddev/wds-icon';
import { useFlow } from '@/stackflow';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  trailingContent?: ReactNode;
}

export default function AppShell({
  children,
  title,
  showBackButton = false,
  trailingContent,
}: AppShellProps) {
  const { pop } = useFlow();

  return (
    <FlexBox
      flexDirection="column"
      sx={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto', position: 'relative' }}
    >
      {title !== undefined && (
        <TopNavigation
          leadingContent={
            showBackButton ? (
              <TopNavigationButton variant="icon" onClick={() => pop()}>
                <IconChevronLeft />
              </TopNavigationButton>
            ) : undefined
          }
          trailingContent={trailingContent}
          sx={{ position: 'sticky', top: 0, zIndex: 10 }}
        >
          {title}
        </TopNavigation>
      )}

      <FlexBox flexDirection="column" flexGrow={1} sx={{ paddingBottom: '72px' }}>
        {children}
      </FlexBox>
    </FlexBox>
  );
}
