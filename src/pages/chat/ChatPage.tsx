import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useActivityParams } from '@stackflow/react';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import { useQuery } from '@tanstack/react-query';
import {
  FlexBox,
  Box,
  Typography,
  Avatar,
  TopNavigation,
  TopNavigationButton,
  IconButton,
  TextField,
  TextFieldContent,
  Thumbnail,
  Loading,
} from '@wanteddev/wds';
import { IconChevronLeft, IconCamera, IconSend, IconSendFill } from '@wanteddev/wds-icon';
import { CURRENT_USER } from '@/mocks/data';
import type { ChatRoom, Message } from '@/types';
import { useFlow } from '@/stackflow';

export default function ChatPage() {
  const { roomId } = useActivityParams<{ roomId: string }>();
  const { pop } = useFlow();

  const { data: room, isLoading } = useQuery<ChatRoom>({
    queryKey: ['chat', roomId],
    queryFn: () => fetch(`/api/chat/${roomId}`).then(r => r.json()),
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (room?.messages) setMessages(room.messages);
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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

  if (!room) return null;

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: `m${Date.now()}`,
        senderId: CURRENT_USER.id,
        text: input.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setInput('');
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <AppScreen>
      <FlexBox
        flexDirection="column"
        sx={{ height: '100vh', maxWidth: '480px', margin: '0 auto' }}
      >
        {/* TopNavigation */}
        <TopNavigation
          leadingContent={
            <TopNavigationButton variant="icon" onClick={() => pop()}>
              <IconChevronLeft />
            </TopNavigationButton>
          }
        >
          {room.reviewer.name} 리뷰어
        </TopNavigation>

        {/* 상품 컨텍스트 바 (스크롤해도 고정) */}
        <FlexBox
          alignItems="center"
          gap="10px"
          sx={theme => ({
            padding: '10px 16px',
            backgroundColor: theme.semantic.background.normal.alternative,
            borderBottom: `1px solid ${theme.semantic.line.solid.alternative}`,
            flexShrink: 0,
          })}
        >
          <Thumbnail
            src={room.reviewer.avatar}
            alt={room.reviewer.name}
            ratio="1:1"
            width="36px"
            radius
            border
            sx={{ flexShrink: 0 }}
          />
          <FlexBox flexDirection="column" gap="1px">
            <Typography variant="caption1" weight="medium" noWrap>
              무신사 스탠다드 오버사이즈 체크 울 코트
            </Typography>
            <Typography
              variant="caption2"
              sx={theme => ({ color: theme.semantic.label.alternative })}
            >
              {room.reviewer.name} 리뷰어와 상담 중
            </Typography>
          </FlexBox>
        </FlexBox>

        {/* 메시지 목록 */}
        <FlexBox
          flexDirection="column"
          gap="12px"
          sx={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '80px' }}
        >
          <AnimatePresence initial={false}>
          {messages.map(msg => {
            const isMine = msg.senderId === CURRENT_USER.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
              <FlexBox
                justifyContent={isMine ? 'flex-end' : 'flex-start'}
                alignItems="flex-end"
                gap="6px"
              >
                {!isMine && (
                  <Avatar
                    variant="person"
                    size="xsmall"
                    src={room.reviewer.avatar}
                    alt={room.reviewer.name}
                    sx={{ flexShrink: 0, marginBottom: '4px' }}
                  />
                )}
                <FlexBox
                  flexDirection="column"
                  gap="2px"
                  alignItems={isMine ? 'flex-end' : 'flex-start'}
                  sx={{ maxWidth: '70%' }}
                >
                  <Box
                    sx={theme => ({
                      padding: '10px 14px',
                      borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      backgroundColor: isMine
                        ? theme.semantic.primary.normal
                        : theme.semantic.background.normal.alternative,
                      maxWidth: '100%',
                    })}
                  >
                    <Typography
                      variant="body2"
                      sx={theme => ({
                        color: isMine
                          ? theme.semantic.static.white
                          : theme.semantic.label.normal,
                        wordBreak: 'break-word',
                      })}
                    >
                      {msg.text}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption2"
                    sx={theme => ({ color: theme.semantic.label.assistive })}
                  >
                    {formatTime(msg.timestamp)}
                  </Typography>
                </FlexBox>
              </FlexBox>
              </motion.div>
            );
          })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </FlexBox>

        {/* 하단 입력 바 — position:fixed 제거: height:100vh flex 레이아웃에서 fixed는 Stackflow transform과 충돌 */}
        <FlexBox
          alignItems="center"
          gap="8px"
          sx={theme => ({
            flexShrink: 0,
            padding: '10px 12px',
            paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
            backgroundColor: theme.semantic.background.normal.normal,
            borderTop: `1px solid ${theme.semantic.line.solid.alternative}`,
          })}
        >
          <IconButton variant="background" size="small">
            <IconCamera />
          </IconButton>
          <TextField
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSend()}
            placeholder="메시지 입력..."
            sx={{ flex: 1 }}
            trailingContent={
              <TextFieldContent variant="icon-button">
                <IconButton
                  variant="background"
                  size="small"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  sx={theme => ({
                    color: input.trim()
                      ? theme.semantic.primary.normal
                      : theme.semantic.label.assistive,
                  })}
                >
                  {input.trim() ? <IconSendFill /> : <IconSend />}
                </IconButton>
              </TextFieldContent>
            }
          />
        </FlexBox>
      </FlexBox>
    </AppScreen>
  );
}
