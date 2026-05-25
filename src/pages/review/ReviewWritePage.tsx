import { useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { z } from 'zod';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import {
  FlexBox,
  Box,
  Typography,
  Button,
  SearchField,
  Slider,
  DatePicker,
  Thumbnail,
  SectionHeader,
  TopNavigation,
  TopNavigationButton,
  Stepper,
  StepperItem,
  Modal,
  ModalContainer,
  ModalNavigation,
  ModalContent,
  ModalContentItem,
  ModalHeading,
  ModalDescription,
  ActionArea,
  ActionAreaButton,
} from '@wanteddev/wds';
import { IconChevronLeft, IconClose, IconCamera, IconCircleCloseFill } from '@wanteddev/wds-icon';
import ProductMiniCard from '@/components/product/ProductMiniCard';
import { MOCK_PRODUCTS } from '@/mocks/data';
import type { Product } from '@/types';
import { useFlow } from '@/stackflow';

// ── 드래프트 상태 ─────────────────────────────────────────────────
interface ReviewDraft {
  images: string[];
  product: Product | null;
  fitScore: { shoulder: number; length: number; waist: number; thickness: number };
  text: string;
  purchaseDate: Date | null;
  isVerified: boolean;
  receiptImageUrl: string;
}

const INITIAL_DRAFT: ReviewDraft = {
  images: [],
  product: null,
  fitScore: { shoulder: 3, length: 3, waist: 3, thickness: 3 },
  text: '',
  purchaseDate: null,
  isVerified: false,
  receiptImageUrl: '',
};

// ── Zod 스텝별 유효성 스키마 ──────────────────────────────────────
const step1Schema = z.object({
  images: z.array(z.string()).min(1, '사진을 최소 1장 올려주세요'),
});

const step2Schema = z.object({
  product: z.custom<Product>(val => val !== null, '상품을 선택해주세요'),
});

// step 3: 슬라이더 기본값 3으로 항상 유효 — 스키마 불필요

const step4Schema = z.object({
  text: z.string().refine(s => s.trim().length >= 20, '리뷰는 최소 20자 이상 입력해주세요'),
  purchaseDate: z.instanceof(Date, { message: '구매 날짜를 선택해주세요' }),
});

function isStepValid(step: number, draft: ReviewDraft): boolean {
  switch (step) {
    case 1: return step1Schema.safeParse(draft).success;
    case 2: return step2Schema.safeParse(draft).success;
    case 3: return true;
    case 4: return step4Schema.safeParse(draft).success;
    default: return false;
  }
}

// ── Step Props ────────────────────────────────────────────────────
interface StepProps {
  draft: ReviewDraft;
  onUpdate: (patch: Partial<ReviewDraft>) => void;
}

// ── Step 1: 사진 올리기 ────────────────────────────────────────────
function Step1Photo({ draft, onUpdate }: StepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - draft.images.length;
    const newUrls = files.slice(0, remaining).map(f => URL.createObjectURL(f));
    onUpdate({ images: [...draft.images, ...newUrls] });
    e.target.value = '';
  };

  const handleRemove = (index: number) => {
    onUpdate({ images: draft.images.filter((_, i) => i !== index) });
  };

  return (
    <FlexBox flexDirection="column" gap="16px" sx={{ padding: '20px 16px 100px' }}>
      <FlexBox flexDirection="column" gap="6px">
        <Typography variant="title3" weight="bold">착용 사진을 올려주세요</Typography>
        <Typography variant="body2" sx={theme => ({ color: theme.semantic.label.alternative })}>
          내 체형을 잘 보여주는 사진일수록 도움이 돼요
        </Typography>
      </FlexBox>

      {/* 3열 사진 그리드 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {/* 추가 슬롯 */}
        {draft.images.length < 5 && (
          <Box
            as="button"
            onClick={() => fileInputRef.current?.click()}
            sx={theme => ({
              aspectRatio: '3/4',
              borderRadius: '8px',
              border: `1.5px dashed ${theme.semantic.line.solid.alternative}`,
              backgroundColor: theme.semantic.background.normal.alternative,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              background: 'none',
            })}
          >
            <IconCamera sx={theme => ({ fontSize: '24px', color: theme.semantic.label.alternative })} />
            <Typography variant="caption2" sx={theme => ({ color: theme.semantic.label.alternative })}>
              {draft.images.length}/5
            </Typography>
          </Box>
        )}

        {/* 썸네일 */}
        {draft.images.map((src, i) => (
          <Box key={i} sx={{ position: 'relative' }}>
            <Thumbnail
              src={src}
              alt={`사진 ${i + 1}`}
              ratio="4:3"
              portrait
              width="100%"
              radius
              border
            />
            <Box
              as="button"
              onClick={() => handleRemove(i)}
              sx={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <IconCircleCloseFill sx={theme => ({ fontSize: '22px', color: theme.semantic.static.white })} />
            </Box>
          </Box>
        ))}
      </Box>

      <Typography variant="caption1" sx={theme => ({ color: theme.semantic.label.assistive })}>
        사진은 최소 1장, 최대 5장 등록할 수 있어요
      </Typography>

      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
    </FlexBox>
  );
}

// ── Step 2: 상품 연결 ─────────────────────────────────────────────
function Step2Product({ draft, onUpdate }: StepProps) {
  const [query, setQuery] = useState('');

  const filtered = MOCK_PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.brand.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <FlexBox flexDirection="column" sx={{ paddingBottom: '100px' }}>
      <FlexBox flexDirection="column" gap="6px" sx={{ padding: '20px 16px 12px' }}>
        <Typography variant="title3" weight="bold">어떤 상품을 입으셨나요?</Typography>
        <Typography variant="body2" sx={theme => ({ color: theme.semantic.label.alternative })}>
          리뷰할 상품을 선택해주세요
        </Typography>
      </FlexBox>

      <Box sx={{ paddingInline: '16px', paddingBottom: '12px' }}>
        <SearchField
          value={query}
          onChange={e => setQuery(e.target.value)}
          onReset={() => setQuery('')}
          placeholder="브랜드, 상품명 검색"
          width="100%"
        />
      </Box>

      <FlexBox flexDirection="column" gap="8px" sx={{ paddingInline: '16px' }}>
        {filtered.map(product => (
          <Box
            key={product.id}
            as="button"
            onClick={() => onUpdate({ product })}
            sx={theme => ({
              background: 'none',
              padding: 0,
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '10px',
              outline: 'none',
              border: draft.product?.id === product.id
                ? `2px solid ${theme.semantic.primary.normal}`
                : '2px solid transparent',
              transition: 'border-color 0.15s',
            })}
          >
            <ProductMiniCard product={product} />
          </Box>
        ))}
      </FlexBox>
    </FlexBox>
  );
}

// ── Step 3: 핏 평가 ───────────────────────────────────────────────
const FIT_ITEMS = [
  { key: 'shoulder' as const, label: '어깨 폭',  left: '좁음',  right: '넓음'   },
  { key: 'length'   as const, label: '상체 길이', left: '짧음',  right: '긺'     },
  { key: 'waist'    as const, label: '허리 라인', left: '슬림',  right: '넉넉'   },
  { key: 'thickness'as const, label: '소재 두께', left: '얇음',  right: '두꺼움' },
];

function Step3Fit({ draft, onUpdate }: StepProps) {
  return (
    <FlexBox flexDirection="column" sx={{ paddingBottom: '100px' }}>
      <FlexBox flexDirection="column" gap="6px" sx={{ padding: '20px 16px 4px' }}>
        <Typography variant="title3" weight="bold">핏을 평가해주세요</Typography>
        <Typography variant="body2" sx={theme => ({ color: theme.semantic.label.alternative })}>
          실제 착용 느낌을 솔직하게 알려주세요
        </Typography>
      </FlexBox>

      <FlexBox flexDirection="column" gap="28px" sx={{ padding: '20px 16px 0' }}>
        {FIT_ITEMS.map(item => (
          <FlexBox key={item.key} flexDirection="column" gap="10px">
            <Typography variant="label1" weight="medium">{item.label}</Typography>
            <Slider
              value={[draft.fitScore[item.key]]}
              onValueChange={([v]) => onUpdate({ fitScore: { ...draft.fitScore, [item.key]: v } })}
              min={1}
              max={5}
              step={1}
            />
            <FlexBox justifyContent="space-between">
              <Typography variant="caption2" sx={theme => ({ color: theme.semantic.label.alternative })}>{item.left}</Typography>
              <Typography variant="caption2" sx={theme => ({ color: theme.semantic.label.alternative })}>{item.right}</Typography>
            </FlexBox>
          </FlexBox>
        ))}
      </FlexBox>
    </FlexBox>
  );
}

// ── Step 4: 마무리 (텍스트 + 선택적 구매 인증) ───────────────────
function Step4Finish({ draft, onUpdate }: StepProps) {
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpdate({ receiptImageUrl: URL.createObjectURL(file), isVerified: true });
  };

  return (
    <FlexBox flexDirection="column" sx={{ paddingBottom: '100px' }}>
      <FlexBox flexDirection="column" gap="6px" sx={{ padding: '20px 16px 4px' }}>
        <Typography variant="title3" weight="bold">리뷰를 작성해주세요</Typography>
        <Typography variant="body2" sx={theme => ({ color: theme.semantic.label.alternative })}>
          핏감, 소재, 사이즈 선택 기준을 알려주세요
        </Typography>
      </FlexBox>

      {/* 텍스트 */}
      <FlexBox flexDirection="column" gap="4px" sx={{ padding: '12px 16px' }}>
        <Box
          as="textarea"
          value={draft.text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onUpdate({ text: e.target.value })}
          placeholder="핏감, 소재, 사이즈 선택 기준 등 자세히 알려주세요 (최소 20자)"
          maxLength={500}
          rows={6}
          sx={theme => ({
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${theme.semantic.line.solid.normal}`,
            backgroundColor: theme.semantic.background.normal.normal,
            color: theme.semantic.label.normal,
            fontSize: '15px',
            lineHeight: '1.6',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            '&:focus': { borderColor: theme.semantic.primary.normal },
            '&::placeholder': { color: theme.semantic.label.assistive },
          })}
        />
        <FlexBox justifyContent="space-between" alignItems="center">
          <Typography variant="caption1" sx={theme => ({
            color: draft.text.length > 0 && draft.text.trim().length < 20
              ? theme.semantic.status.negative
              : 'transparent',
          })}>
            최소 20자 이상 입력해주세요
          </Typography>
          <Typography variant="caption1" sx={theme => ({ color: theme.semantic.label.assistive })}>
            {draft.text.length}/500
          </Typography>
        </FlexBox>
      </FlexBox>

      {/* 구매 날짜 */}
      <FlexBox flexDirection="column" gap="6px" sx={{ padding: '0 16px 24px' }}>
        <Typography variant="label1" weight="medium">구매 날짜</Typography>
        <DatePicker
          value={draft.purchaseDate}
          onChange={value => onUpdate({ purchaseDate: value instanceof Date ? value : null })}
          max={new Date()}
          format="YYYY.MM.DD"
          width="100%"
        />
      </FlexBox>

      {/* 구매 인증 (선택) */}
      <SectionHeader platform="mobile" size="small">구매 인증으로 포인트 받기</SectionHeader>

      <FlexBox flexDirection="column" gap="10px" sx={{ padding: '12px 16px 0' }}>
        {draft.receiptImageUrl ? (
          <FlexBox
            alignItems="center"
            justifyContent="space-between"
            gap="8px"
            sx={theme => ({
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${theme.semantic.primary.normal}`,
            })}
          >
            <FlexBox alignItems="center" gap="8px">
              <Thumbnail
                src={draft.receiptImageUrl}
                alt="영수증"
                ratio="1:1"
                width="36px"
                radius
                border
                sx={{ flexShrink: 0 }}
              />
              <Typography variant="label2" weight="medium">영수증 인증 완료</Typography>
            </FlexBox>
            <Box
              as="button"
              onClick={() => onUpdate({ receiptImageUrl: '', isVerified: false })}
              sx={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <IconCircleCloseFill sx={theme => ({ fontSize: '20px', color: theme.semantic.label.alternative })} />
            </Box>
          </FlexBox>
        ) : (
          <Button
            variant="outlined"
            color="assistive"
            size="medium"
            onClick={() => receiptInputRef.current?.click()}
            fullWidth
            trailingContent={
              <Typography
                variant="caption1"
                weight="bold"
                sx={theme => ({ color: theme.semantic.accent.foreground.blue })}
              >
                +2,000P
              </Typography>
            }
          >
            영수증 사진 업로드
          </Button>
        )}
      </FlexBox>

      <input ref={receiptInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleReceiptChange} />
    </FlexBox>
  );
}

// ── 메인 오케스트레이터 ───────────────────────────────────────────
const STEP_LABELS = ['사진', '상품', '핏 평가', '마무리'] as const;

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
};

export default function ReviewWritePage() {
  const { pop, push } = useFlow();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1=forward, -1=backward
  const [draft, setDraft] = useState<ReviewDraft>(INITIAL_DRAFT);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const updateDraft = useCallback((patch: Partial<ReviewDraft>) => {
    setDraft(prev => ({ ...prev, ...patch }));
  }, []);

  const handleBack = () => {
    if (step === 1) setShowExitDialog(true);
    else { setDirection(-1); setStep(s => s - 1); }
  };

  const handleNext = () => {
    if (step < 4) { setDirection(1); setStep(s => s + 1); }
    else push('Home', {});
  };

  return (
    <AppScreen>
      <FlexBox flexDirection="column" sx={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto' }}>

        {/* TopNavigation */}
        <TopNavigation
          leadingContent={
            <TopNavigationButton variant="icon" onClick={handleBack}>
              <IconChevronLeft />
            </TopNavigationButton>
          }
          trailingContent={
            <TopNavigationButton variant="icon" onClick={() => setShowExitDialog(true)}>
              <IconClose />
            </TopNavigationButton>
          }
          sx={{ position: 'sticky', top: 0, zIndex: 10 }}
        >
          리뷰 등록
        </TopNavigation>

        {/* Stepper — nav 바로 아래 sticky, 레퍼런스처럼 여백 넉넉하게 */}
        <Box
          sx={theme => ({
            position: 'sticky',
            top: '56px',
            zIndex: 9,
            backgroundColor: theme.semantic.background.normal.normal,
            padding: '28px 20px 24px',
          })}
        >
          <Stepper value={String(step)}>
            {STEP_LABELS.map((label, i) => (
              <StepperItem key={i} value={String(i + 1)} label={label} completedLabel={label} />
            ))}
          </Stepper>
        </Box>

        {/* 단계별 컨텐츠 — 방향 인식 슬라이드 */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.32, 0, 0.67, 0] }}
            >
              {step === 1 && <Step1Photo draft={draft} onUpdate={updateDraft} />}
              {step === 2 && <Step2Product draft={draft} onUpdate={updateDraft} />}
              {step === 3 && <Step3Fit draft={draft} onUpdate={updateDraft} />}
              {step === 4 && <Step4Finish draft={draft} onUpdate={updateDraft} />}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* 하단 고정 CTA */}
        <Box
          sx={theme => ({
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            padding: '12px 16px',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
            backgroundColor: theme.semantic.background.normal.normal,
            borderTop: `1px solid ${theme.semantic.line.solid.alternative}`,
            zIndex: 50,
          })}
        >
          <Button
            variant="solid"
            color={isStepValid(step, draft) ? 'primary' : 'assistive'}
            size="large"
            disabled={!isStepValid(step, draft)}
            fullWidth
            onClick={handleNext}
          >
            {step === 4 ? '등록 완료' : '다음'}
          </Button>
        </Box>

        {/* 종료 확인 Modal (Step 1에서 뒤로가기 시) */}
        <Modal open={showExitDialog} onOpenChange={setShowExitDialog}>
          <ModalContainer variant="popup">
            <ModalNavigation variant="floating" />
            <ModalContent>
              <ModalContentItem flexDirection="column" alignItems="center" gap="4px">
                <ModalHeading>작성을 그만할까요?</ModalHeading>
                <ModalDescription>지금까지 입력한 내용이 모두 사라져요</ModalDescription>
              </ModalContentItem>
            </ModalContent>
            <ActionArea variant="strong">
              <ActionAreaButton variant="main" onClick={() => setShowExitDialog(false)}>계속 작성</ActionAreaButton>
              <ActionAreaButton variant="alternative" onClick={() => pop()}>작성 취소</ActionAreaButton>
            </ActionArea>
          </ModalContainer>
        </Modal>
      </FlexBox>
    </AppScreen>
  );
}
