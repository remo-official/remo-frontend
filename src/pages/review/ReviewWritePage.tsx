import { useState, useRef, useCallback, useEffect } from 'react';
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

// ── OCR 추출 결과 타입 ────────────────────────────────────────────
interface OcrExtracted {
  productName: string;
  amount: number;
  date: string;
  platform: string;
}

// ── 드래프트 상태 ─────────────────────────────────────────────────
interface ReviewDraft {
  images: string[];
  product: Product | null;
  fitScore: { shoulder: number; length: number; waist: number; thickness: number };
  text: string;
  purchaseDate: Date | null;
  isVerified: boolean;
  receiptImageUrl: string;
  ocrStatus: 'idle' | 'scanning' | 'success' | 'failed';
  ocrExtracted: OcrExtracted | null;
}

const INITIAL_DRAFT: ReviewDraft = {
  images: [],
  product: null,
  fitScore: { shoulder: 3, length: 3, waist: 3, thickness: 3 },
  text: '',
  purchaseDate: null,
  isVerified: false,
  receiptImageUrl: '',
  ocrStatus: 'idle',
  ocrExtracted: null,
};

// ── Zod 스텝별 유효성 스키마 ──────────────────────────────────────
const step1Schema = z.object({
  images: z.array(z.string()).min(1, '사진을 최소 1장 올려주세요'),
});

const step2Schema = z.object({
  product: z.custom<Product>(val => val !== null, '상품을 선택해주세요'),
});

// step 3: OCR 구매 인증 — isVerified가 true여야 통과
const step3Schema = z.object({
  isVerified: z.literal(true),
});

// step 4: 핏 슬라이더 기본값 3으로 항상 유효 — 스키마 불필요

const step5Schema = z.object({
  text: z.string().refine(s => s.trim().length >= 20, '리뷰는 최소 20자 이상 입력해주세요'),
  purchaseDate: z.instanceof(Date, { message: '구매 날짜를 선택해주세요' }),
});

function isStepValid(step: number, draft: ReviewDraft): boolean {
  switch (step) {
    case 1: return step1Schema.safeParse(draft).success;
    case 2: return step2Schema.safeParse(draft).success;
    case 3: return step3Schema.safeParse(draft).success;
    case 4: return true;
    case 5: return step5Schema.safeParse(draft).success;
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

// ── Step 3 [NEW]: OCR 구매 인증 ───────────────────────────────────

const MOCK_PURCHASE_RECORDS = [
  {
    id: 'pr1',
    platform: '네이버페이',
    productName: '레이어드 오버핏 셔츠 / 화이트 / XL',
    amount: 59000,
    date: '2025-03-14',
    orderId: 'NP2025031412345',
  },
  {
    id: 'pr2',
    platform: '카카오페이',
    productName: '와이드 데님 팬츠 / 인디고 / 29',
    amount: 89000,
    date: '2025-02-28',
    orderId: 'KP2025022867890',
  },
  {
    id: 'pr3',
    platform: '토스페이',
    productName: '크루넥 니트 스웨터 / 오트밀 / M',
    amount: 72000,
    date: '2025-02-10',
    orderId: 'TP2025021043210',
  },
];

// 플랫폼별 브랜드 색상
const PLATFORM_COLORS: Record<string, string> = {
  '네이버페이': '#03c75a',
  '카카오페이': '#fee500',
  '토스페이': '#0064ff',
};

function Step3OCR({ draft, onUpdate }: StepProps) {
  const [tab, setTab] = useState<0 | 1>(0); // 0=영수증 업로드, 1=구매내역
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 스캔 도중 컴포넌트가 unmount됐다가 다시 mount되면(뒤로갔다 재진입) scanning 상태 초기화
  useEffect(() => {
    if (draft.ocrStatus === 'scanning') {
      onUpdate({ ocrStatus: 'idle', isVerified: false });
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startOcrScan = (imageUrl: string, extracted: OcrExtracted) => {
    onUpdate({
      receiptImageUrl: imageUrl,
      ocrStatus: 'scanning',
      isVerified: false,
      ocrExtracted: null,
    });
    setScanProgress(0);

    let progress = 0;
    timerRef.current = setInterval(() => {
      progress += Math.floor(Math.random() * 12) + 6;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setScanProgress(100);
        setTimeout(() => {
          onUpdate({
            isVerified: true,
            ocrStatus: 'success',
            ocrExtracted: extracted,
            purchaseDate: new Date(extracted.date),
          });
        }, 400);
      }
      setScanProgress(progress);
    }, 120);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    e.target.value = '';
    startOcrScan(imageUrl, {
      productName: draft.product?.name ?? '구매 상품',
      amount: draft.product?.price ?? 0,
      date: new Date().toISOString().split('T')[0],
      platform: '영수증',
    });
  };

  const handleSelectPurchaseRecord = (record: (typeof MOCK_PURCHASE_RECORDS)[0]) => {
    startOcrScan('', {
      productName: record.productName,
      amount: record.amount,
      date: record.date,
      platform: record.platform,
    });
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setScanProgress(0);
    onUpdate({ receiptImageUrl: '', isVerified: false, ocrStatus: 'idle', ocrExtracted: null });
  };

  const isScanning = draft.ocrStatus === 'scanning';
  const isSuccess = draft.ocrStatus === 'success';
  const extracted = draft.ocrExtracted;

  return (
    <FlexBox flexDirection="column" sx={{ paddingBottom: '100px' }}>
      {/* 헤더 */}
      <FlexBox flexDirection="column" gap="6px" sx={{ padding: '20px 16px 16px' }}>
        <FlexBox alignItems="center" gap="8px">
          <Typography variant="title3" weight="bold">구매 인증</Typography>
          {isSuccess && (
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <Box
                sx={theme => ({
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  backgroundColor: '#e6f7ef',
                })}
              >
                <Typography variant="caption1" weight="bold" sx={{ color: '#16b162' }}>
                  ✓ 인증 완료
                </Typography>
              </Box>
            </motion.div>
          )}
        </FlexBox>
        <Typography variant="body2" sx={theme => ({ color: theme.semantic.label.alternative })}>
          {isSuccess
            ? '구매가 확인됐어요. 다음 단계로 이동하세요.'
            : '영수증이나 구매내역으로 구매를 인증해주세요'}
        </Typography>
      </FlexBox>

      {/* 탭 선택 (idle 상태에서만 노출) */}
      {!isScanning && !isSuccess && (
        <>
          <FlexBox sx={{ paddingInline: '16px', marginBottom: '16px', gap: '8px' }}>
            {(['영수증 업로드', '구매내역 연동'] as const).map((label, i) => (
              <Box
                key={i}
                as="button"
                onClick={() => setTab(i as 0 | 1)}
                sx={theme => ({
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '10px',
                  border: tab === i
                    ? `1.5px solid ${theme.semantic.primary.normal}`
                    : `1.5px solid ${theme.semantic.line.solid.normal}`,
                  backgroundColor: tab === i ? 'rgba(0,122,255,0.05)' : 'transparent',
                  cursor: 'pointer',
                  background: tab === i ? 'rgba(0,122,255,0.05)' : 'none',
                  transition: 'all 0.15s',
                })}
              >
                <Typography
                  variant="label1"
                  weight="medium"
                  sx={theme => ({
                    color: tab === i ? theme.semantic.primary.normal : theme.semantic.label.normal,
                  })}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </FlexBox>

          {/* 탭 0: 영수증 업로드 */}
          {tab === 0 && (
            <FlexBox flexDirection="column" gap="12px" sx={{ paddingInline: '16px' }}>
              <Box
                as="button"
                onClick={() => fileInputRef.current?.click()}
                sx={theme => ({
                  aspectRatio: '16/9',
                  borderRadius: '12px',
                  border: `2px dashed ${theme.semantic.line.solid.alternative}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  background: 'none',
                  transition: 'border-color 0.15s',
                })}
              >
                <Box
                  sx={theme => ({
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: theme.semantic.background.normal.alternative,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  <IconCamera sx={theme => ({ fontSize: '26px', color: theme.semantic.label.alternative })} />
                </Box>
                <FlexBox flexDirection="column" alignItems="center" gap="4px">
                  <Typography variant="label1" weight="medium">영수증 사진 업로드</Typography>
                  <Typography variant="caption1" sx={theme => ({ color: theme.semantic.label.assistive })}>
                    JPG · PNG · PDF 지원
                  </Typography>
                </FlexBox>
              </Box>

              {/* 안내 문구 */}
              <Box
                sx={theme => ({
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: theme.semantic.background.normal.alternative,
                  display: 'flex',
                  gap: '8px',
                })}
              >
                <Typography variant="caption2">💡</Typography>
                <Typography variant="caption2" sx={theme => ({ color: theme.semantic.label.alternative })}>
                  상품명·금액·날짜가 선명하게 보이도록 촬영해주세요. 주소·연락처 등 개인정보는 자동 마스킹됩니다.
                </Typography>
              </Box>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                style={{ display: 'none' }}
                onChange={handleReceiptUpload}
              />
            </FlexBox>
          )}

          {/* 탭 1: 구매내역 연동 */}
          {tab === 1 && (
            <FlexBox flexDirection="column" sx={{ paddingInline: '16px' }} gap="8px">
              <Typography
                variant="caption1"
                sx={theme => ({ color: theme.semantic.label.alternative, paddingBottom: '4px' })}
              >
                최근 구매 내역 · 네이버페이 · 카카오페이 · 토스페이
              </Typography>
              {MOCK_PURCHASE_RECORDS.map(record => (
                <Box
                  key={record.id}
                  as="button"
                  onClick={() => handleSelectPurchaseRecord(record)}
                  sx={theme => ({
                    padding: '14px',
                    borderRadius: '12px',
                    border: `1.5px solid ${theme.semantic.line.solid.normal}`,
                    background: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  })}
                >
                  <FlexBox justifyContent="space-between" alignItems="flex-start" gap="8px">
                    <FlexBox flexDirection="column" gap="5px" sx={{ flex: 1, minWidth: 0 }}>
                      <FlexBox alignItems="center" gap="6px">
                        <Box
                          sx={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: PLATFORM_COLORS[record.platform] ?? '#888',
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="caption2"
                          weight="bold"
                          sx={theme => ({ color: theme.semantic.label.alternative })}
                        >
                          {record.platform}
                        </Typography>
                        <Typography
                          variant="caption2"
                          sx={theme => ({ color: theme.semantic.label.assistive })}
                        >
                          {record.date}
                        </Typography>
                      </FlexBox>
                      <Typography
                        variant="label2"
                        weight="medium"
                        sx={{
                          textAlign: 'left',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {record.productName}
                      </Typography>
                      <Typography
                        variant="caption2"
                        sx={theme => ({ color: theme.semantic.label.assistive })}
                      >
                        주문번호 {record.orderId}
                      </Typography>
                    </FlexBox>
                    <Typography variant="label1" weight="bold" sx={{ flexShrink: 0 }}>
                      {record.amount.toLocaleString()}원
                    </Typography>
                  </FlexBox>
                </Box>
              ))}
            </FlexBox>
          )}
        </>
      )}

      {/* OCR 스캐닝 중 */}
      {isScanning && (
        <FlexBox flexDirection="column" alignItems="center" gap="24px" sx={{ padding: '24px 24px' }}>
          {/* 스캔 뷰파인더 */}
          <Box
            sx={theme => ({
              width: '220px',
              aspectRatio: '3/4',
              borderRadius: '12px',
              backgroundColor: theme.semantic.background.normal.alternative,
              position: 'relative',
              overflow: 'hidden',
              border: `1.5px solid ${theme.semantic.line.solid.normal}`,
            })}
          >
            {draft.receiptImageUrl && (
              <img
                src={draft.receiptImageUrl}
                alt="영수증"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
              />
            )}
            {/* 스캔 라인 */}
            <motion.div
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #007aff 30%, #5ac8fa 50%, #007aff 70%, transparent)',
                boxShadow: '0 0 16px 6px rgba(0,122,255,0.45)',
              }}
            />
            {/* 코너 마커 */}
            {[
              { top: '6px', left: '6px', borderTop: '2px solid #007aff', borderLeft: '2px solid #007aff' },
              { top: '6px', right: '6px', borderTop: '2px solid #007aff', borderRight: '2px solid #007aff' },
              { bottom: '6px', left: '6px', borderBottom: '2px solid #007aff', borderLeft: '2px solid #007aff' },
              { bottom: '6px', right: '6px', borderBottom: '2px solid #007aff', borderRight: '2px solid #007aff' },
            ].map((style, i) => (
              <Box key={i} sx={{ position: 'absolute', width: '16px', height: '16px', borderRadius: '2px', ...style }} />
            ))}
            {/* 하단 진행률 */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: '12px',
                background: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.55) 100%)',
              }}
            >
              <Typography variant="label2" weight="bold" sx={{ color: '#fff' }}>
                분석 중 {scanProgress}%
              </Typography>
            </Box>
          </Box>

          {/* 프로그레스 바 */}
          <FlexBox flexDirection="column" alignItems="center" gap="8px" sx={{ width: '100%' }}>
            <Box
              sx={theme => ({
                width: '100%',
                height: '6px',
                borderRadius: '100px',
                backgroundColor: theme.semantic.line.solid.alternative,
                overflow: 'hidden',
              })}
            >
              <motion.div
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.12, ease: 'linear' }}
                style={{
                  height: '100%',
                  borderRadius: '100px',
                  background: 'linear-gradient(90deg, #007aff, #5ac8fa)',
                }}
              />
            </Box>
            <Typography variant="caption1" sx={theme => ({ color: theme.semantic.label.alternative })}>
              영수증에서 구매 정보를 추출하고 있어요…
            </Typography>
          </FlexBox>

          {/* 텍스트 롤링 힌트 */}
          <FlexBox flexDirection="column" alignItems="center" gap="6px">
            {['상품명 확인 중', '금액 검증 중', '날짜 추출 중', '개인정보 마스킹 중'].map((hint, i) => (
              <motion.div
                key={hint}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -6] }}
                transition={{ delay: i * 0.6, duration: 0.6, repeat: Infinity, repeatDelay: 2.4 - 0.6 }}
              >
                <Typography variant="caption2" sx={theme => ({ color: theme.semantic.label.assistive })}>
                  {hint}…
                </Typography>
              </motion.div>
            ))}
          </FlexBox>
        </FlexBox>
      )}

      {/* OCR 성공 결과 */}
      {isSuccess && extracted && (
        <FlexBox flexDirection="column" gap="14px" sx={{ padding: '0 16px' }}>
          {/* 추출 정보 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <Box
              sx={theme => ({
                borderRadius: '14px',
                border: '1.5px solid #16b162',
                overflow: 'hidden',
              })}
            >
              {/* 카드 헤더 */}
              <FlexBox
                alignItems="center"
                gap="8px"
                sx={{
                  padding: '12px 14px',
                  backgroundColor: '#e6f7ef',
                  borderBottom: '1px solid #16b16220',
                }}
              >
                <Typography variant="label1" sx={{ color: '#16b162' }}>✓</Typography>
                <Typography variant="label1" weight="bold" sx={{ color: '#16b162' }}>
                  OCR 인증 완료
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  {extracted.platform !== '영수증' && (
                    <Box
                      sx={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: PLATFORM_COLORS[extracted.platform] ?? '#888',
                      }}
                    />
                  )}
                  <Typography variant="caption1" weight="bold" sx={{ color: '#16b162' }}>
                    {extracted.platform}
                  </Typography>
                </Box>
              </FlexBox>

              {/* 추출 데이터 */}
              <FlexBox flexDirection="column" sx={{ padding: '14px' }} gap="12px">
                {[
                  { label: '상품명', value: extracted.productName },
                  { label: '결제금액', value: `${extracted.amount.toLocaleString()}원` },
                  { label: '구매일', value: extracted.date },
                ].map(({ label, value }) => (
                  <FlexBox key={label} justifyContent="space-between" alignItems="flex-start" gap="8px">
                    <Typography
                      variant="caption1"
                      sx={theme => ({ color: theme.semantic.label.alternative, flexShrink: 0 })}
                    >
                      {label}
                    </Typography>
                    <Typography
                      variant="label2"
                      weight="medium"
                      sx={{ textAlign: 'right', flex: 1 }}
                    >
                      {value}
                    </Typography>
                  </FlexBox>
                ))}
              </FlexBox>
            </Box>
          </motion.div>

          {/* 상품 매칭 결과 */}
          {draft.product && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <Box
                sx={theme => ({
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.semantic.line.solid.alternative}`,
                  backgroundColor: theme.semantic.background.normal.alternative,
                })}
              >
                <FlexBox justifyContent="space-between" alignItems="center" gap="8px">
                  <FlexBox flexDirection="column" gap="2px" sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption2" sx={theme => ({ color: theme.semantic.label.assistive })}>
                      선택한 상품과 매칭
                    </Typography>
                    <Typography
                      variant="label2"
                      weight="medium"
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {draft.product.name}
                    </Typography>
                    <Typography variant="caption2" sx={theme => ({ color: theme.semantic.label.alternative })}>
                      {draft.product.brand}
                    </Typography>
                  </FlexBox>
                  <Box
                    sx={{
                      padding: '4px 10px',
                      borderRadius: '100px',
                      backgroundColor: '#e6f7ef',
                      flexShrink: 0,
                    }}
                  >
                    <Typography variant="caption1" weight="bold" sx={{ color: '#16b162' }}>
                      매칭 완료
                    </Typography>
                  </Box>
                </FlexBox>
              </Box>
            </motion.div>
          )}

          {/* 개인정보 마스킹 안내 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Box
              sx={theme => ({
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: theme.semantic.background.normal.alternative,
              })}
            >
              <Typography variant="caption2" sx={theme => ({ color: theme.semantic.label.assistive })}>
                🔒 주소·연락처 등 개인정보는 자동으로 마스킹 처리되었습니다.
              </Typography>
            </Box>
          </motion.div>

          {/* 다시 인증 */}
          <Button variant="outlined" color="assistive" size="medium" onClick={handleReset} fullWidth>
            다시 인증하기
          </Button>
        </FlexBox>
      )}
    </FlexBox>
  );
}

// ── Step 4: 핏 평가 (구 Step 3) ───────────────────────────────────
const FIT_ITEMS = [
  { key: 'shoulder' as const, label: '어깨 폭',  left: '좁음',  right: '넓음'   },
  { key: 'length'   as const, label: '상체 길이', left: '짧음',  right: '긺'     },
  { key: 'waist'    as const, label: '허리 라인', left: '슬림',  right: '넉넉'   },
  { key: 'thickness'as const, label: '소재 두께', left: '얇음',  right: '두꺼움' },
];

function Step4Fit({ draft, onUpdate }: StepProps) {
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

// ── Step 5: 마무리 (구 Step 4) — 영수증 업로드 제거됨 ──────────
function Step5Finish({ draft, onUpdate }: StepProps) {
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
          <Typography
            variant="caption1"
            sx={theme => ({
              color: draft.text.length > 0 && draft.text.trim().length < 20
                ? theme.semantic.status.negative
                : 'transparent',
            })}
          >
            최소 20자 이상 입력해주세요
          </Typography>
          <Typography variant="caption1" sx={theme => ({ color: theme.semantic.label.assistive })}>
            {draft.text.length}/500
          </Typography>
        </FlexBox>
      </FlexBox>

      {/* 구매 날짜 — OCR에서 자동 채워지지만 수정 가능 */}
      <FlexBox flexDirection="column" gap="6px" sx={{ padding: '0 16px 12px' }}>
        <FlexBox alignItems="center" gap="6px">
          <Typography variant="label1" weight="medium">구매 날짜</Typography>
          {draft.ocrExtracted && (
            <Box
              sx={{
                padding: '2px 8px',
                borderRadius: '100px',
                backgroundColor: '#e6f7ef',
              }}
            >
              <Typography variant="caption2" weight="bold" sx={{ color: '#16b162' }}>
                OCR 자동입력
              </Typography>
            </Box>
          )}
        </FlexBox>
        <DatePicker
          value={draft.purchaseDate}
          onChange={value => onUpdate({ purchaseDate: value instanceof Date ? value : null })}
          max={new Date()}
          format="YYYY.MM.DD"
          width="100%"
        />
      </FlexBox>

      {/* 구매 인증 배지 (Step 3에서 완료된 정보 요약) */}
      {draft.isVerified && draft.ocrExtracted && (
        <FlexBox
          alignItems="center"
          gap="8px"
          sx={theme => ({
            margin: '0 16px',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1.5px solid #16b16240',
            backgroundColor: '#e6f7ef',
          })}
        >
          <Typography variant="caption1" sx={{ color: '#16b162' }}>✓</Typography>
          <Typography variant="caption1" weight="medium" sx={{ color: '#16b162' }}>
            구매 인증 완료 · {draft.ocrExtracted.platform} · {draft.ocrExtracted.date}
          </Typography>
        </FlexBox>
      )}
    </FlexBox>
  );
}

// ── 메인 오케스트레이터 ───────────────────────────────────────────
const STEP_LABELS = ['사진', '상품', '인증', '핏 평가', '마무리'] as const;

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-60%' : '60%', opacity: 0 }),
};

const TOTAL_STEPS = 5;

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
    if (step < TOTAL_STEPS) { setDirection(1); setStep(s => s + 1); }
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

        {/* Stepper */}
        <Box
          sx={theme => ({
            position: 'sticky',
            top: '56px',
            zIndex: 9,
            backgroundColor: theme.semantic.background.normal.normal,
            padding: '16px 8px 12px',
          })}
        >
          <Stepper value={String(step)} sx={{ '& span, & p': { whiteSpace: 'nowrap' } }}>
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
              {step === 3 && <Step3OCR draft={draft} onUpdate={updateDraft} />}
              {step === 4 && <Step4Fit draft={draft} onUpdate={updateDraft} />}
              {step === 5 && <Step5Finish draft={draft} onUpdate={updateDraft} />}
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
            {step === TOTAL_STEPS ? '등록 완료' : '다음'}
          </Button>
        </Box>

        {/* 종료 확인 Modal */}
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
