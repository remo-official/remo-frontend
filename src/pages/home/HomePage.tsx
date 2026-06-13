import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import { FlexBox, Box, Typography, Avatar, TopNavigation, SectionHeader, addOpacity } from '@wanteddev/wds';
import { IconWrite } from '@wanteddev/wds-icon';
import ReviewCard from '@/components/review/ReviewCard';
import ReviewCardSkeleton from '@/components/review/ReviewCardSkeleton';
import BodyFilterChips from '@/components/review/BodyFilterChips';
import { CURRENT_USER, MOCK_USERS } from '@/mocks/data';
import type { BodyFilter, Review } from '@/types';
import { useFlow } from '@/stackflow';
import AppBottomNav from '@/components/layout/AppBottomNav';

function filterReviews(reviews: Review[], filter: BodyFilter['type'], user = CURRENT_USER): Review[] {
  switch (filter) {
    case 'mine':
      return reviews.filter(r =>
        Math.abs(r.user.bodyInfo.height - user.bodyInfo.height) <= 5 &&
        Math.abs(r.user.bodyInfo.weight - user.bodyInfo.weight) <= 5,
      );
    case 'height_160':
      return reviews.filter(r => r.user.bodyInfo.height >= 160 && r.user.bodyInfo.height < 170);
    case 'height_170':
      return reviews.filter(r => r.user.bodyInfo.height >= 170 && r.user.bodyInfo.height < 180);
    case 'height_180':
      return reviews.filter(r => r.user.bodyInfo.height >= 180);
    case 'size_slim':
      return reviews.filter(r => r.user.bodyInfo.weight < 55);
    case 'size_normal':
      return reviews.filter(r => r.user.bodyInfo.weight >= 55 && r.user.bodyInfo.weight < 65);
    case 'size_large':
      return reviews.filter(r => r.user.bodyInfo.weight >= 65);
    default:
      return reviews;
  }
}

export default function HomePage() {
  const { push, replace } = useFlow();
  const [activeFilter, setActiveFilter] = useState<BodyFilter['type']>('mine');

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: () => fetch('/api/reviews').then(r => r.json()),
  });

  const handleFilterChange = useCallback((f: BodyFilter) => setActiveFilter(f.type), []);
  const handleChatClick = useCallback((reviewId: string) => push('Chat', { roomId: reviewId }), [push]);
  const handleUserClick = useCallback((_userId: string) => replace('Explore', {}, { animate: false }), [replace]);

  const filtered = filterReviews(reviews, activeFilter);
  const displayReviews = filtered.length > 0 ? filtered : reviews;

  const similarUsers = MOCK_USERS.filter(
    u =>
      u.id !== CURRENT_USER.id &&
      Math.abs(u.bodyInfo.height - CURRENT_USER.bodyInfo.height) <= 8,
  ).slice(0, 5);

  return (
    <AppScreen>
      <FlexBox
        flexDirection="column"
        sx={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto', paddingBottom: '72px' }}
      >
        {/* WDS TopNavigation — toolbar에 BodyFilterChips 결합, sticky로 스크롤 시 고정 */}
        <TopNavigation
          toolbar={
            <BodyFilterChips
              currentUser={CURRENT_USER}
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
            />
          }
          sx={{ position: 'sticky', top: 0, zIndex: 10 }}
        >
          <Typography
            as="span"
            variant="title3"
            weight="bold"
            sx={theme => ({ color: theme.semantic.primary.normal })}
          >
            remo
          </Typography>
        </TopNavigation>

        {/* 나와 체형이 비슷한 스타일리스트 */}
        {similarUsers.length > 0 && (
          <FlexBox flexDirection="column">
            <SectionHeader platform="mobile" size="medium">
              나와 체형이 비슷한 스타일리스트
            </SectionHeader>
            <FlexBox
              gap="16px"
              sx={{
                overflowX: 'auto',
                scrollbarWidth: 'none',
                paddingInline: '16px',
                paddingBlock: '10px',
              }}
            >
              {similarUsers.map(user => (
                <FlexBox
                  key={user.id}
                  flexDirection="column"
                  alignItems="center"
                  gap="6px"
                  sx={{ flexShrink: 0, cursor: 'pointer' }}
                  onClick={() => handleUserClick(user.id)}
                >
                  <Avatar variant="person" size="large" src={user.avatar} alt={user.name} />
                  <FlexBox flexDirection="column" alignItems="center" gap="1px">
                    <Typography variant="caption1" weight="medium">
                      {user.name}
                    </Typography>
                    <Typography
                      variant="caption2"
                      sx={theme => ({ color: theme.semantic.label.alternative })}
                    >
                      {user.bodyInfo.height}cm
                    </Typography>
                  </FlexBox>
                </FlexBox>
              ))}
            </FlexBox>
          </FlexBox>
        )}

        {/* 리뷰 피드 */}
        <FlexBox flexDirection="column">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={i} />)
            : displayReviews.map(review => (
                <ReviewCard key={review.id} review={review} onChatClick={handleChatClick} />
              ))
          }
        </FlexBox>

        {/* 리뷰 등록 FAB — 하단 탭바 위 고정, 컨테이너 우측 16px */}
        <Box
          as="button"
          aria-label="리뷰 등록"
          onClick={() => push('ReviewWrite', {})}
          sx={theme => ({
            position: 'fixed',
            bottom: 'calc(72px + 16px + env(safe-area-inset-bottom))',
            // max()로 뷰포트 너비와 무관하게 480px 컨테이너 우측 16px 고정
            right: 'max(16px, calc((100vw - 480px) / 2 + 16px))',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: theme.semantic.primary.normal,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 16px ${addOpacity(theme.semantic.primary.normal, theme.opacity[35])}`,
            zIndex: 50,
          })}
        >
          <IconWrite sx={theme => ({ fontSize: '24px', color: theme.semantic.static.white })} />
        </Box>

        <AppBottomNav />
      </FlexBox>
    </AppScreen>
  );
}
