import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import {
  FlexBox,
  Box,
  Typography,
  TextButton,
  Loading,
  addOpacity,
  Card,
  CardThumbnail,
  CardThumbnailContent,
  CardContent,
  CardTitle,
  CardCaption,
  TopNavigation,
  SearchField,
  Category,
  CategoryList,
  CategoryListItem,
} from '@wanteddev/wds';
import { IconChevronRight } from '@wanteddev/wds-icon';
import PurchaseBadge from '@/components/common/PurchaseBadge';
import { CURRENT_USER } from '@/mocks/data.ts';
import type { CategoryFilter, Review } from '@/types';
import { useFlow } from '@/stackflow';
import AppBottomNav from '@/components/layout/AppBottomNav';

const CATEGORIES: CategoryFilter[] = ['전체', '아우터', '상의', '하의', '원피스', '신발', '악세서리'];

// ── 내 체형 필터 카드 ──────────────────────────────────────────────
interface BodyFilterCardProps {
  onEdit: () => void;
}

function BodyFilterCard({ onEdit }: BodyFilterCardProps) {
  const { height, weight, topSize } = CURRENT_USER.bodyInfo;
  return (
    <FlexBox
      alignItems="center"
      justifyContent="space-between"
      sx={theme => ({
        margin: '12px 16px',
        padding: '16px',
        borderRadius: '14px',
        backgroundColor: theme.semantic.primary.normal,
      })}
    >
      <FlexBox flexDirection="column" gap="4px">
        <Typography
          variant="caption1"
          sx={theme => ({ color: addOpacity('#ffffff', theme.opacity[74]) })}
        >
          나의 체형 기준으로 탐색 중
        </Typography>
        <Typography variant="label1" weight="bold" sx={theme => ({ color: theme.semantic.static.white })}>
          {height}cm · {weight}kg · {topSize}
        </Typography>
      </FlexBox>
      <TextButton
        size="small"
        onClick={onEdit}
        sx={theme => ({
          color: addOpacity('#ffffff', theme.opacity[88]),
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          flexShrink: 0,
        })}
      >
        변경
        <IconChevronRight sx={{ fontSize: '14px' }} />
      </TextButton>
    </FlexBox>
  );
}

// ── 그리드 카드 ───────────────────────────────────────────────────
interface GridCardProps {
  review: Review;
  onClick: () => void;
}

function GridCard({ review, onClick }: GridCardProps) {
  const { user, product, images, isVerified } = review;
  const purchasedSize = product.category === '신발'
    ? user.bodyInfo.bottomSize
    : user.bodyInfo.topSize;

  return (
    <Card
      as="button"
      platform="mobile"
      onClick={onClick}
      sx={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
    >
      <CardThumbnail
        src={images[0]}
        alt="착용 이미지"
        ratio="4:3"
        portrait
        width="100%"
        trailingContent={
          isVerified ? (
            <CardThumbnailContent variant="custom">
              <PurchaseBadge isVerified={isVerified} />
            </CardThumbnailContent>
          ) : undefined
        }
      />
      <CardContent>
        <CardTitle>{user.name}</CardTitle>
        <CardCaption noWrap>
          {user.bodyInfo.height}cm · {user.bodyInfo.weight}kg · {purchasedSize}
        </CardCaption>
        <CardCaption noWrap>{product.brand} · {product.name}</CardCaption>
      </CardContent>
    </Card>
  );
}

// ── 메인 탐색 페이지 ───────────────────────────────────────────────
export default function ExplorePage() {
  const { push } = useFlow();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('전체');

  const handleReset = useCallback(() => setSearchQuery(''), []);
  const handleCategoryChange = useCallback((value: string) => setActiveCategory(value as CategoryFilter), []);

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['explore-reviews'],
    queryFn: () => fetch('/api/reviews/explore').then(r => r.json()),
  });

  const filteredReviews = useMemo(() => {
    let result = reviews;
    if (activeCategory !== '전체') {
      result = result.filter(r => r.product.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        r =>
          r.product.name.toLowerCase().includes(q) ||
          r.product.brand.toLowerCase().includes(q) ||
          r.user.name.includes(searchQuery),
      );
    }
    return result;
  }, [reviews, searchQuery, activeCategory]);

  return (
    <AppScreen>
      <FlexBox
        flexDirection="column"
        sx={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto', paddingBottom: '72px' }}
      >
        {/* variant="search" — 검색창이 타이틀 영역을 대체, toolbar에 카테고리 필터 결합 */}
        <TopNavigation
          variant="search"
          toolbar={
            <Category
              value={activeCategory}
              onValueChange={handleCategoryChange}
              disableScrollMoveOnChange
            >
              <CategoryList size="large" horizontalPadding verticalPadding>
                {CATEGORIES.map(cat => (
                  <CategoryListItem key={cat} value={cat}>
                    {cat}
                  </CategoryListItem>
                ))}
              </CategoryList>
            </Category>
          }
          sx={{ position: 'sticky', top: 0, zIndex: 10 }}
        >
          <SearchField
            size="small"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onReset={handleReset}
            placeholder="브랜드, 상품명, 리뷰어 검색"
          />
        </TopNavigation>

        {/* 내 체형 필터 카드 */}
        <BodyFilterCard onEdit={() => push('Onboarding', {})} />

        {/* 리뷰 그리드 (2열) */}
        {isLoading ? (
          <FlexBox alignItems="center" justifyContent="center" sx={{ padding: '48px 16px' }}>
            <Loading variant="circular" />
          </FlexBox>
        ) : filteredReviews.length > 0 ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              paddingInline: '16px',
              paddingBottom: '16px',
            }}
          >
            {filteredReviews.map(review => (
              <GridCard
                key={review.id}
                review={review}
                onClick={() => push('ReviewDetail', { id: review.id })}
              />
            ))}
          </Box>
        ) : (
          <FlexBox
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="8px"
            sx={{ padding: '48px 16px' }}
          >
            <Typography
              variant="body1"
              sx={theme => ({ color: theme.semantic.label.alternative })}
            >
              검색 결과가 없어요
            </Typography>
            <TextButton
              size="small"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('전체');
              }}
            >
              필터 초기화
            </TextButton>
          </FlexBox>
        )}

        <AppBottomNav />
      </FlexBox>
    </AppScreen>
  );
}
