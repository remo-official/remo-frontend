import { memo, useCallback } from 'react';
import { useActivity } from '@stackflow/react';
import { Box, BottomNavigation, BottomNavigationItem, addOpacity } from '@wanteddev/wds';
import { IconHome, IconCompass, IconPerson } from '@wanteddev/wds-icon';
import { useFlow } from '@/stackflow';

const AppBottomNav = memo(function AppBottomNav() {
  const { name } = useActivity();
  const { replace } = useFlow();

  const goHome = useCallback(() => replace('Home', {}, { animate: false }), [replace]);
  const goExplore = useCallback(() => replace('Explore', {}, { animate: false }), [replace]);
  const goMy = useCallback(() => replace('My', {}, { animate: false }), [replace]);

  return (
    // Box로 배경 격리: WDS BottomNavigation 내부의 scroll 감지 로직이
    // document.body scroll=0일 때 background를 제거하는 버그 방지
    <Box
      sx={theme => ({
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        zIndex: 100,
        backgroundColor: addOpacity('#ffffff', theme.opacity[74]),
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${theme.semantic.line.solid.alternative}`,
      })}
    >
      <BottomNavigation value={name}>
        <BottomNavigationItem value="Home" icon={<IconHome />} label="홈" onClick={goHome} />
        <BottomNavigationItem value="Explore" icon={<IconCompass />} label="탐색" onClick={goExplore} />
        <BottomNavigationItem value="My" icon={<IconPerson />} label="마이" onClick={goMy} />
      </BottomNavigation>
    </Box>
  );
});

export default AppBottomNav;
