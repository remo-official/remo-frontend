import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import {
  FlexBox,
  Box,
  Typography,
  Avatar,
  SegmentedControl,
  SegmentedControlItem,
  addOpacity,
  Thumbnail,
} from '@wanteddev/wds';
import { IconVerifiedStarFill } from '@wanteddev/wds-icon';
import type { Theme } from '@wanteddev/wds';
import PurchaseBadge from '@/components/common/PurchaseBadge';
import { CURRENT_USER, MOCK_REVIEWS } from '@/mocks/data';
import type { User } from '@/types';
import AppBottomNav from '@/components/layout/AppBottomNav';

// 티어별 색상 — WDS 시멘틱/액센트 토큰 활용
function getTierColor(tier: User['tier']) {
  return (theme: Theme) => {
    switch (tier) {
      case 'Muse':
        return theme.semantic.accent.foreground.orange;
      case 'Mate':
        return theme.semantic.primary.normal;
      case 'Starter':
      default:
        return theme.semantic.label.alternative;
    }
  };
}

export default function MyPage() {
  const [tab, setTab] = useState('reviews');
  const myReviews = MOCK_REVIEWS.filter(r => r.user.id === CURRENT_USER.id);
  const tierColorFn = getTierColor(CURRENT_USER.tier);

  return (
    <AppScreen>
      <FlexBox
        flexDirection="column"
        sx={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto', paddingBottom: '72px' }}
      >

        <FlexBox flexDirection="column" sx={{ padding: '20px 16px' }}>

          {/* 프로필 */}
          <FlexBox
            flexDirection="column"
            alignItems="center"
            gap="12px"
            sx={{ paddingBottom: '20px' }}
          >
            <Avatar
              variant="person"
              size={72}
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
            />
            <FlexBox flexDirection="column" alignItems="center" gap="4px">
              <FlexBox alignItems="center" gap="6px">
                <Typography variant="title3" weight="bold">{CURRENT_USER.name}</Typography>
                <IconVerifiedStarFill
                  sx={theme => ({
                    fontSize: '18px',
                    color: tierColorFn(theme),
                  })}
                />
              </FlexBox>
              <Typography
                variant="body2"
                sx={theme => ({ color: theme.semantic.label.alternative })}
              >
                {CURRENT_USER.bodyInfo.height}cm · {CURRENT_USER.bodyInfo.weight}kg ·{' '}
                {CURRENT_USER.tier} 등급
              </Typography>
            </FlexBox>
          </FlexBox>

          {/* 포인트 대시보드 (프로필 바로 아래 최상단) */}
          {/*
            색상 근거:
            - 텍스트(white): theme.semantic.static.white → var(--semantic-static-white) = #fff
            - 반투명 white: addOpacity('#ffffff', theme.opacity[N]) → hex alpha (#ffffffE0)
              (CSS 변수 기반 token은 -rgb 변수가 없을 경우 실패하므로 hex 직접 전달)
            - 강조색: theme.semantic.status.cautionary (amber #FF9200) → 수익/가치 신호
          */}
          <FlexBox
            sx={theme => ({
              borderRadius: '16px',
              backgroundColor: theme.semantic.primary.normal,
              padding: '20px',
              marginBottom: '20px',
            })}
          >
            {/* 주 메트릭: 포인트 (가장 큰 숫자, 강조색 서브라벨로 차별화) */}
            <FlexBox flex={1} flexDirection="column" alignItems="center" gap="4px">
              <Typography
                variant="headline1"
                weight="bold"
                sx={theme => ({ color: theme.semantic.static.white })}
              >
                {CURRENT_USER.points.toLocaleString()}P
              </Typography>
              {/* amber accent = "수익 증가" 신호 — 흰색과 대비되는 강조색 */}
              <Typography
                variant="caption2"
                sx={theme => ({ color: theme.semantic.status.cautionary })}
              >
                이번달 +1,200P 예상
              </Typography>
            </FlexBox>

            {/* 세로 구분선: addOpacity(hex, opacity token) → #ffffff47 */}
            <Box
              sx={theme => ({
                width: '1px',
                height: '40px',
                alignSelf: 'center',
                flexShrink: 0,
                backgroundColor: addOpacity('#ffffff', theme.opacity[28]),
              })}
            />

            {/* 보조 메트릭: 연결 구매 건수 */}
            <FlexBox flex={1} flexDirection="column" alignItems="center" gap="4px">
              <Typography
                variant="headline1"
                weight="bold"
                sx={theme => ({ color: theme.semantic.static.white })}
              >
                12건
              </Typography>
              <Typography
                variant="caption2"
                sx={theme => ({ color: addOpacity('#ffffff', theme.opacity[88]) })}
              >
                연결 구매
              </Typography>
            </FlexBox>

            {/* 세로 구분선 */}
            <Box
              sx={theme => ({
                width: '1px',
                height: '40px',
                alignSelf: 'center',
                flexShrink: 0,
                backgroundColor: addOpacity('#ffffff', theme.opacity[28]),
              })}
            />

            {/* 보조 메트릭: 채팅→구매 전환율 */}
            <FlexBox flex={1} flexDirection="column" alignItems="center" gap="4px">
              <Typography
                variant="headline1"
                weight="bold"
                sx={theme => ({ color: theme.semantic.static.white })}
              >
                18%
              </Typography>
              <Typography
                variant="caption2"
                sx={theme => ({ color: addOpacity('#ffffff', theme.opacity[88]) })}
              >
                채팅→구매율
              </Typography>
            </FlexBox>
          </FlexBox>

          {/* 탭 */}
          <SegmentedControl
            value={tab}
            onValueChange={setTab}
            sx={{ marginBottom: '16px' }}
          >
            <SegmentedControlItem value="reviews">내 리뷰</SegmentedControlItem>
            <SegmentedControlItem value="points">포인트 내역</SegmentedControlItem>
          </SegmentedControl>

          {/* 탭 컨텐츠 */}
          <AnimatePresence mode="wait">
          {tab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
            <FlexBox flexDirection="column" gap="12px">
              {myReviews.length === 0 ? (
                <Typography
                  variant="body2"
                  sx={theme => ({
                    color: theme.semantic.label.alternative,
                    textAlign: 'center',
                    padding: '32px 0',
                  })}
                >
                  아직 작성한 리뷰가 없어요
                </Typography>
              ) : (
                myReviews.map(review => (
                  <FlexBox
                    key={review.id}
                    alignItems="center"
                    gap="12px"
                    sx={theme => ({
                      padding: '12px',
                      borderRadius: '10px',
                      border: `1px solid ${theme.semantic.line.solid.alternative}`,
                    })}
                  >
                    <Thumbnail
                      src={review.images[0]}
                      alt="리뷰 썸네일"
                      ratio="1:1"
                      width="52px"
                      radius
                      border
                      sx={{ flexShrink: 0 }}
                    />
                    <FlexBox flexDirection="column" gap="4px" sx={{ flex: 1, minWidth: 0 }}>
                      <FlexBox alignItems="center" gap="6px">
                        <PurchaseBadge isVerified={review.isVerified} />
                        <Typography
                          variant="caption1"
                          noWrap
                          sx={theme => ({ color: theme.semantic.label.alternative })}
                        >
                          {review.createdAt}
                        </Typography>
                      </FlexBox>
                      <Typography variant="label2" weight="medium" noWrap>
                        {review.product.name}
                      </Typography>
                      <Typography
                        variant="caption1"
                        sx={theme => ({ color: theme.semantic.label.alternative })}
                      >
                        {review.product.brand}
                      </Typography>
                    </FlexBox>
                    {/* 리뷰별 적립 포인트 — 고품질 리뷰 인센티브 */}
                    <Typography
                      variant="label2"
                      weight="bold"
                      sx={theme => ({
                        color: theme.semantic.primary.normal,
                        flexShrink: 0,
                      })}
                    >
                      +{review.isVerified ? '2,000P' : '500P'}
                    </Typography>
                  </FlexBox>
                ))
              )}
            </FlexBox>
            </motion.div>
          )}

          {tab === 'points' && (
            <motion.div
              key="points"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
            <FlexBox flexDirection="column" gap="8px">
              {[
                { date: '2026-05-20', label: 'OCR 인증 리뷰 적립', amount: '+2,000P', type: 'earn' },
                { date: '2026-05-18', label: '채팅 상담 요청 차감', amount: '-100P', type: 'use' },
                { date: '2026-05-10', label: '일반 리뷰 적립', amount: '+500P', type: 'earn' },
                { date: '2026-05-01', label: 'Q&A 답변 열람', amount: '-200P', type: 'use' },
              ].map((item, i) => (
                <FlexBox
                  key={i}
                  justifyContent="space-between"
                  alignItems="center"
                  sx={theme => ({
                    padding: '12px 0',
                    borderBottom: `1px solid ${theme.semantic.line.solid.alternative}`,
                  })}
                >
                  <FlexBox flexDirection="column" gap="3px">
                    <Typography variant="label2" weight="medium">{item.label}</Typography>
                    <Typography
                      variant="caption1"
                      sx={theme => ({ color: theme.semantic.label.alternative })}
                    >
                      {item.date}
                    </Typography>
                  </FlexBox>
                  <Typography
                    variant="label1"
                    weight="bold"
                    sx={theme => ({
                      color:
                        item.type === 'earn'
                          ? theme.semantic.primary.normal
                          : theme.semantic.status.negative,
                    })}
                  >
                    {item.amount}
                  </Typography>
                </FlexBox>
              ))}
            </FlexBox>
            </motion.div>
          )}
          </AnimatePresence>
        </FlexBox>

        <AppBottomNav />
      </FlexBox>
    </AppScreen>
  );
}
