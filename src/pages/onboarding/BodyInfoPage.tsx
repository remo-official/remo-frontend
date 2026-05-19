import { useState } from 'react';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import {
  FlexBox,
  Box,
  Typography,
  Button,
  Chip,
  TextField,
  FormField,
  FormControl,
  FormLabel,
} from '@wanteddev/wds';
import { useFlow } from '@/stackflow';

const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BOTTOM_SIZES = ['24', '25', '26', '27', '28', '29', '30', '32', '34', 'FREE'];

export default function BodyInfoPage() {
  const { replace } = useFlow();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [topSize, setTopSize] = useState('');
  const [bottomSize, setBottomSize] = useState('');

  const isValid = height && weight && topSize && bottomSize;

  const handleSubmit = () => {
    if (!isValid) return;
    localStorage.setItem(
      'remo_body_info',
      JSON.stringify({
        height: Number(height),
        weight: Number(weight),
        topSize,
        bottomSize,
      }),
    );
    replace('Home', {});
  };

  return (
    <AppScreen>
      <FlexBox
        flexDirection="column"
        sx={{ minHeight: '100vh', maxWidth: '480px', margin: '0 auto' }}
      >
        <FlexBox flexDirection="column" gap="24px" sx={{ flex: 1, padding: '32px 20px 100px' }}>
          {/* 헤더 */}
          <FlexBox flexDirection="column" gap="6px">
            <Typography variant="title2" weight="bold">
              내 체형을 알려주세요
            </Typography>
            <Typography
              variant="body2"
              sx={theme => ({ color: theme.semantic.label.alternative })}
            >
              나와 비슷한 체형의 리뷰를 먼저 보여드릴게요
            </Typography>
          </FlexBox>

          {/* 키 */}
          <FormField>
            <FormLabel>키 (cm)</FormLabel>
            <FormControl>
              <TextField
                type="number"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="168"
                width="100%"
              />
            </FormControl>
          </FormField>

          {/* 몸무게 */}
          <FormField>
            <FormLabel>몸무게 (kg)</FormLabel>
            <FormControl>
              <TextField
                type="number"
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="58"
                width="100%"
              />
            </FormControl>
          </FormField>

          {/* 평소 상의 사이즈 */}
          <FlexBox flexDirection="column" gap="10px">
            <Typography variant="label1" weight="medium">
              평소 상의 사이즈
            </Typography>
            <FlexBox gap="8px" flexWrap="wrap">
              {TOP_SIZES.map(size => (
                <Chip
                  key={size}
                  variant="outlined"
                  size="small"
                  active={topSize === size}
                  onClick={() => setTopSize(size)}
                >
                  {size}
                </Chip>
              ))}
            </FlexBox>
          </FlexBox>

          {/* 평소 하의 사이즈 */}
          <FlexBox flexDirection="column" gap="10px">
            <Typography variant="label1" weight="medium">
              평소 하의 사이즈
            </Typography>
            <FlexBox gap="8px" flexWrap="wrap">
              {BOTTOM_SIZES.map(size => (
                <Chip
                  key={size}
                  variant="outlined"
                  size="small"
                  active={bottomSize === size}
                  onClick={() => setBottomSize(size)}
                >
                  {size}
                </Chip>
              ))}
            </FlexBox>
          </FlexBox>
        </FlexBox>

        {/* 하단 고정 CTA */}
        <Box
          sx={theme => ({
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '480px',
            padding: '12px 20px',
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
            backgroundColor: theme.semantic.background.normal.normal,
            borderTop: `1px solid ${theme.semantic.line.solid.alternative}`,
          })}
        >
          <Button
            variant="solid"
            color="primary"
            size="large"
            fullWidth
            disabled={!isValid}
            onClick={handleSubmit}
          >
            리모 시작하기
          </Button>
        </Box>
      </FlexBox>
    </AppScreen>
  );
}
