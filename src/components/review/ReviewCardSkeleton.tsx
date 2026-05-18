import { FlexBox, Skeleton, Button, IconButton, Typography } from '@wanteddev/wds';
import { IconBubble, IconHeart, IconBookmark } from '@wanteddev/wds-icon';

export default function ReviewCardSkeleton() {
  return (
    <FlexBox
      flexDirection="column"
      sx={theme => ({
        backgroundColor: theme.semantic.background.normal.normal,
        borderBottom: `8px solid ${theme.semantic.background.normal.alternative}`,
      })}
    >
      {/* 헤더: 아바타(40px) + 이름/체형정보 + 날짜 */}
      <FlexBox alignItems="center" gap="10px" sx={{ padding: '14px 16px 10px' }}>
        <Skeleton variant="circle" width="40px" height="40px" sx={{ flexShrink: 0 }} />
        <FlexBox flexDirection="column" gap="3px" sx={{ flex: 1, minWidth: 0 }}>
          <FlexBox alignItems="center" gap="6px">
            <Skeleton height="20px" sx={{ width: '72px', flexShrink: 0 }} />
            <Skeleton variant="rectangle" width="64px" height="18px" radius="4px" />
          </FlexBox>
          <Skeleton height="16px" width="55%" />
        </FlexBox>
        <Skeleton height="14px" sx={{ width: '40px', flexShrink: 0 }} />
      </FlexBox>

      {/* 이미지: portrait 4:3 → 200×267px */}
      <FlexBox gap="4px" sx={{ paddingInline: '16px', overflow: 'hidden' }}>
        <Skeleton variant="rectangle" width="200px" height="267px" radius="8px" sx={{ flexShrink: 0 }} />
        <Skeleton variant="rectangle" width="200px" height="267px" radius="8px" sx={{ flexShrink: 0 }} />
      </FlexBox>

      {/* 리뷰 텍스트 3줄 */}
      <FlexBox flexDirection="column" gap="4px" sx={{ padding: '12px 16px 0' }}>
        <Skeleton height="22px" />
        <Skeleton height="22px" width="90%" />
        <Skeleton height="22px" width="60%" />
      </FlexBox>

      {/* 액션 바: 데이터 불필요한 버튼은 실제 컴포넌트로 렌더 */}
      <FlexBox
        alignItems="center"
        gap="8px"
        sx={theme => ({
          padding: '10px 16px 14px',
          borderTop: `1px solid ${theme.semantic.line.solid.alternative}`,
        })}
      >
        <Button
          variant="solid"
          color="primary"
          size="small"
          leadingContent={<IconBubble />}
          disableInteraction
          sx={{ flexShrink: 0 }}
        >
          채팅 문의
        </Button>

        <FlexBox flex={1} />

        <FlexBox alignItems="center" gap="4px" sx={{ flexShrink: 0 }}>
          <IconButton
            variant="background"
            size="medium"
            disableInteraction
            sx={theme => ({ color: theme.semantic.label.alternative })}
          >
            <IconHeart />
          </IconButton>
          {/* 좋아요 수만 데이터 의존 → Skeleton */}
          <Skeleton height="16px" sx={{ width: '22px', flexShrink: 0 }} />
        </FlexBox>

        <IconButton
          variant="background"
          size="medium"
          disableInteraction
          sx={theme => ({ color: theme.semantic.label.alternative, flexShrink: 0 })}
        >
          <IconBookmark />
        </IconButton>
      </FlexBox>
    </FlexBox>
  );
}
