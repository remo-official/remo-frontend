import { useState } from 'react';
import { FlexBox, Box, Avatar, Typography, IconButton, Button, Thumbnail } from '@wanteddev/wds';
import { useFlow } from '@/stackflow';
import {
  IconHeart,
  IconHeartFill,
  IconBubble,
  IconBookmark,
  IconBookmarkFill,
} from '@wanteddev/wds-icon';
import type { Review } from '@/types';
import PurchaseBadge from '../common/PurchaseBadge';

interface ReviewCardProps {
  review: Review;
  onChatClick: (reviewId: string) => void;
}

export default function ReviewCard({ review, onChatClick }: ReviewCardProps) {
  const { push } = useFlow();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const { user, product, images, text, isVerified, purchaseDate, likes } = review;

  return (
    <FlexBox
      flexDirection="column"
      sx={theme => ({
        backgroundColor: theme.semantic.background.normal.normal,
        borderBottom: `8px solid ${theme.semantic.background.normal.alternative}`,
      })}
    >
      {/* 헤더: 아바타 + 이름 + 배지 / 체형 정보 */}
      <FlexBox alignItems="center" gap="10px" sx={{ padding: '14px 16px 10px' }}>
        <Avatar
          variant="person"
          size="medium"
          src={user.avatar}
          alt={user.name}
          sx={{ flexShrink: 0, cursor: 'pointer' }}
        />
        <FlexBox flexDirection="column" gap="3px" sx={{ flex: 1, minWidth: 0 }}>
          {/* 이름 + 구매인증배지 (배지가 이름 바로 오른쪽 첫 번째) */}
          <FlexBox alignItems="center" gap="6px">
            <Typography variant="label1" weight="bold" noWrap>
              {user.name}
            </Typography>
            <PurchaseBadge isVerified={isVerified} />
          </FlexBox>
          {/* 체형 정보 (두 번째 줄) — 사이즈는 구매 prefix 없이 단순 표기 */}
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
          sx={theme => ({ color: theme.semantic.label.assistive, flexShrink: 0 })}
        >
          {purchaseDate.slice(0, 7)}
        </Typography>
      </FlexBox>

      {/* 착용 이미지 가로 스크롤 */}
      <Box
        onClick={() => push('ReviewDetail', { id: review.id })}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: '4px',
          paddingInline: '16px',
          scrollbarWidth: 'none',
          cursor: 'pointer',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {images.map((src, i) => (
          <Thumbnail
            key={i}
            src={src}
            alt={`착용 이미지 ${i + 1}`}
            ratio="4:3"
            portrait
            width="200px"
            radius
            border
            sx={{ flexShrink: 0, scrollSnapAlign: 'start' }}
          />
        ))}
      </Box>

      {/* 리뷰 텍스트 */}
      <FlexBox flexDirection="column" gap="4px" sx={{ padding: '12px 16px 0' }}>
        <Typography
          variant="body2"
          sx={theme => ({
            color: theme.semantic.label.normal,
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: expanded ? 'visible' : 'hidden',
            lineHeight: '1.5',
          })}
        >
          {text}
        </Typography>
        {text.length > 80 && !expanded && (
          <Typography
            variant="caption1"
            weight="bold"
            sx={theme => ({
              color: theme.semantic.label.alternative,
              cursor: 'pointer',
            })}
            onClick={() => setExpanded(true)}
          >
            더보기
          </Typography>
        )}
      </FlexBox>

      {/* 하단 액션 */}
      <FlexBox
        alignItems="center"
        gap="8px"
        sx={theme => ({
          padding: '10px 16px 14px',
          borderTop: `1px solid ${theme.semantic.line.solid.alternative}`,
        })}
      >
        {/* 채팅 문의 — GEMINI.md 원칙: 채팅이 Primary CTA, solid로 강조 */}
        <Button
          variant="solid"
          color="primary"
          size="small"
          leadingContent={<IconBubble />}
          onClick={() => onChatClick(review.id)}
          sx={{ flexShrink: 0 }}
        >
          채팅 문의
        </Button>

        <FlexBox flex={1} />

        {/* 좋아요 — medium 사이즈로 탭 영역 확보 */}
        <FlexBox alignItems="center" gap="4px" sx={{ flexShrink: 0 }}>
          <IconButton
            variant="background"
            size="medium"
            onClick={() => setLiked(prev => !prev)}
            sx={theme => ({
              color: liked
                ? theme.semantic.status.negative
                : theme.semantic.label.alternative,
            })}
          >
            {liked ? <IconHeartFill /> : <IconHeart />}
          </IconButton>
          <Typography
            variant="caption1"
            weight="medium"
            sx={theme => ({ color: theme.semantic.label.alternative, minWidth: '22px' })}
          >
            {liked ? likes + 1 : likes}
          </Typography>
        </FlexBox>

        {/* 저장 — medium 사이즈 */}
        <IconButton
          variant="background"
          size="medium"
          onClick={() => setSaved(prev => !prev)}
          sx={theme => ({
            color: saved
              ? theme.semantic.primary.normal
              : theme.semantic.label.alternative,
            flexShrink: 0,
          })}
        >
          {saved ? <IconBookmarkFill /> : <IconBookmark />}
        </IconButton>
      </FlexBox>
    </FlexBox>
  );
}
