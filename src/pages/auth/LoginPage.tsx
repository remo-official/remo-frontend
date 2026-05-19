import { useState } from 'react';
import { AppScreen } from '@stackflow/plugin-basic-ui';
import { FlexBox, Box, Typography, Button, Loading } from '@wanteddev/wds';
import { IconLogoKakaoColor, IconLogoGoogleColor } from '@wanteddev/wds-icon';
import { useFlow } from '@/stackflow';

export default function LoginPage() {
  const { replace } = useFlow();
  const [loading, setLoading] = useState<'kakao' | 'google' | null>(null);

  const handleLogin = (provider: 'kakao' | 'google') => {
    setLoading(provider);
    setTimeout(() => {
      setLoading(null);
      replace('Home', {});
    }, 1500);
  };

  return (
    <AppScreen>
      <FlexBox
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: '100vh', padding: '24px', maxWidth: '480px', margin: '0 auto' }}
      >
        {/* 로고 */}
        <FlexBox
          flexDirection="column"
          alignItems="center"
          gap="8px"
          sx={{ marginBottom: '64px' }}
        >
          <Typography
            variant="display3"
            weight="bold"
            sx={theme => ({ color: theme.semantic.primary.normal, letterSpacing: '-1px' })}
          >
            remo
          </Typography>
          <Typography
            variant="body2"
            sx={theme => ({ color: theme.semantic.label.alternative })}
          >
            검증된 리뷰로 발견하는 패션
          </Typography>
        </FlexBox>

        {/* 로그인 버튼 */}
        <FlexBox flexDirection="column" gap="12px" sx={{ width: '100%' }}>
          {/* 카카오 로그인 — Kakao 브랜드 컬러(#FEE500)는 WDS 토큰에 없어 예외 적용 */}
          <Box
            as="button"
            onClick={() => !loading && handleLogin('kakao')}
            disabled={loading !== null}
            sx={theme => ({
              width: '100%',
              height: '52px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#FEE500',
              color: theme.semantic.label.normal,
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading !== null ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading !== null && loading !== 'kakao' ? 0.5 : 1,
              transition: 'opacity 0.15s',
            })}
          >
            {loading === 'kakao' ? (
              <Loading size="small" />
            ) : (
              <>
                <IconLogoKakaoColor sx={{ fontSize: '22px' }} />
                카카오로 계속하기
              </>
            )}
          </Box>

          {/* 구글 로그인 — WDS Button outlined assistive */}
          <Button
            variant="outlined"
            color="assistive"
            size="large"
            fullWidth
            loading={loading === 'google'}
            disabled={loading !== null && loading !== 'google'}
            leadingContent={loading !== 'google' ? <IconLogoGoogleColor /> : undefined}
            onClick={() => handleLogin('google')}
          >
            Google로 계속하기
          </Button>
        </FlexBox>

        <Typography
          variant="caption2"
          sx={theme => ({
            color: theme.semantic.label.assistive,
            marginTop: '24px',
            textAlign: 'center',
          })}
        >
          가입 시 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </Typography>
      </FlexBox>
    </AppScreen>
  );
}
