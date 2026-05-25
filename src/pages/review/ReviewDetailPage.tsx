import { useActivityParams } from '@stackflow/react';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import { useQuery } from '@tanstack/react-query';
import {
  FlexBox,
  Box,
  Typography,
  Button,
  Avatar,
  SectionHeader,
  TopNavigation,
  TopNavigationButton,
  Slider,
  Thumbnail,
  Loading,
} from '@wanteddev/wds';
import { IconChevronLeft, IconShare } from '@wanteddev/wds-icon';
import PurchaseBadge from '@/components/common/PurchaseBadge';
import BodyInfoGrid from '@/components/common/BodyInfoGrid';
import { useFlow } from '@/stackflow';
import type { Review } from '@/types';

export default function ReviewDetailPage() {
  const { id } = useActivityParams<{ id: string }>();
  const { pop, push } = useFlow();

  const { data: review, isLoading } = useQuery<Review>({
    queryKey: ['review', id],
    queryFn: () => fetch(`/api/reviews/${id}`).then(r => r.json()),
  });

  if (isLoading) {
    return (
      <AppScreen>
        <FlexBox
          alignItems="center"
          justifyContent="center"
          sx={{ height: '100vh', maxWidth: '480px', margin: '0 auto' }}
        >
          <Loading variant="circular" />
        </FlexBox>
      </AppScreen>
    );
  }

  if (!review) return null;
  const { user, product, images, text, isVerified, purchaseDate, fitScore } = review;

  const fitItems = [
    { label: '어깨 폭', value: fitScore.shoulder, left: '좁음', right: '넓음' },
    { label: '상체 길이', value: fitScore.length, left: '짧음', right: '긺' },
    { label: '허리 라인', value: fitScore.waist, left: '슬림', right: '넉넉' },
    { label: '소재 두께', value: fitScore.thickness, left: '얇음', right: '두꺼움' },
  ];

  return (
    <AppScreen>
      <FlexBox
        flexDirection="column"
        sx={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh' }}
      >
        {/* TopNavigation */}
        <TopNavigation
          leadingContent={
            <TopNavigationButton variant="icon" onClick={() => pop()}>
              <IconChevronLeft />
            </TopNavigationButton>
          }
          trailingContent={
            <TopNavigationButton variant="icon">
              <IconShare />
            </TopNavigationButton>
          }
        >
          리뷰
        </TopNavigation>

        <FlexBox flexDirection="column" sx={{ paddingBottom: '160px' }}>
          {/* 리뷰어 정보 */}
          <FlexBox alignItems="center" gap="10px" sx={{ padding: '12px 16px' }}>
            <Avatar variant="person" size="medium" src={user.avatar} alt={user.name} />
            <FlexBox flexDirection="column" gap="3px">
              <FlexBox alignItems="center" gap="6px">
                <Typography variant="label1" weight="bold">
                  {user.name}
                </Typography>
                <PurchaseBadge isVerified={isVerified} />
              </FlexBox>
              <Typography
                variant="caption1"
                sx={theme => ({ color: theme.semantic.label.alternative })}
              >
                {user.bodyInfo.height}cm · {user.bodyInfo.weight}kg ·{' '}
                {product.category === '신발' ? user.bodyInfo.bottomSize : user.bodyInfo.topSize}
              </Typography>
            </FlexBox>
            <Typography
              variant="caption2"
              sx={theme => ({ color: theme.semantic.label.assistive, marginLeft: 'auto', flexShrink: 0 })}
            >
              {purchaseDate.slice(0, 7)}
            </Typography>
          </FlexBox>

          {/* 3. 이미지 갤러리 */}
          <Box
            sx={{
              overflowX: 'auto',
              display: 'flex',
              gap: '4px',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {images.map((src: string, i: number) => (
              <Thumbnail
                key={i}
                src={src}
                alt={`착용 이미지 ${i + 1}`}
                ratio="4:3"
                portrait
                width="300px"
                radius
                border
                sx={{ flexShrink: 0 }}
              />
            ))}
          </Box>

          {/* 4. 리뷰 텍스트 */}
          <Typography
            variant="body2"
            sx={theme => ({
              padding: '16px',
              lineHeight: '1.6',
              color: theme.semantic.label.normal,
            })}
          >
            {text}
          </Typography>

          {/* 5. 체형 카드 */}
          <FlexBox flexDirection="column" gap="8px" sx={{ paddingBottom: '16px' }}>
            <SectionHeader platform="mobile" size="small">체형 정보</SectionHeader>
            <Box sx={{ paddingInline: '16px' }}>
              <BodyInfoGrid
                height={user.bodyInfo.height}
                weight={user.bodyInfo.weight}
                normalSize={user.bodyInfo.topSize}
                purchaseSize={user.bodyInfo.topSize}
              />
            </Box>
          </FlexBox>

          {/* 6. 핏 평가 슬라이더 (WDS Slider, readOnly via pointerEvents: none) */}
          <FlexBox flexDirection="column" sx={{ paddingBottom: '16px' }}>
            <SectionHeader platform="mobile" size="small">핏 평가</SectionHeader>
            <FlexBox flexDirection="column" gap="20px" sx={{ paddingInline: '16px', paddingTop: '12px' }}>
              {fitItems.map(item => (
                <FlexBox key={item.label} flexDirection="column" gap="6px">
                  <Typography variant="label2" weight="medium">
                    {item.label}
                  </Typography>
                  <Slider
                    value={[item.value]}
                    onValueChange={() => {}}
                    min={1}
                    max={5}
                    sx={{ pointerEvents: 'none', cursor: 'default' }}
                  />
                  <FlexBox justifyContent="space-between">
                    <Typography
                      variant="caption2"
                      sx={theme => ({ color: theme.semantic.label.alternative })}
                    >
                      {item.left}
                    </Typography>
                    <Typography
                      variant="caption2"
                      sx={theme => ({ color: theme.semantic.label.alternative })}
                    >
                      {item.right}
                    </Typography>
                  </FlexBox>
                </FlexBox>
              ))}
            </FlexBox>
          </FlexBox>

        </FlexBox>

        {/* 하단 고정 CTA */}
        <FlexBox
          flexDirection="column"
          sx={theme => ({
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            backgroundColor: theme.semantic.background.normal.normal,
            borderTop: `1px solid ${theme.semantic.line.solid.alternative}`,
          })}
        >
          {/* 상품 컨텍스트 */}
          <FlexBox
            alignItems="center"
            gap="10px"
            sx={theme => ({
              padding: '10px 16px',
              borderBottom: `1px solid ${theme.semantic.line.solid.alternative}`,
            })}
          >
            <Thumbnail
              src={product.thumbnail}
              alt={product.name}
              ratio="1:1"
              width="36px"
              radius
              border
              sx={{ flexShrink: 0 }}
            />
            <FlexBox flexDirection="column" gap="1px" sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption1" noWrap sx={theme => ({ color: theme.semantic.label.alternative })}>
                {product.brand}
              </Typography>
              <Typography variant="label2" weight="medium" noWrap>
                {product.name}
              </Typography>
            </FlexBox>
            <Typography variant="label2" weight="bold" sx={theme => ({ color: theme.semantic.primary.normal, flexShrink: 0 })}>
              {product.price.toLocaleString()}원
            </Typography>
          </FlexBox>

          {/* CTA 버튼 */}
          <FlexBox
            gap="8px"
            sx={{
              padding: '12px 16px',
              paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
            }}
          >
            <Button
              variant="solid"
              color="primary"
              size="large"
              sx={{ flex: 3 }}
              onClick={() => push('Chat', { roomId: 'c1' })}
            >
              채팅 문의하기
            </Button>
            <Button
              variant="outlined"
              color="assistive"
              size="large"
              sx={{ flex: 2 }}
              as="a"
              href={product.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              ↗ 외부 링크
            </Button>
          </FlexBox>
        </FlexBox>
      </FlexBox>
    </AppScreen>
  );
}
