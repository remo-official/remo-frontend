import { FlexBox, Typography } from '@wanteddev/wds';
import { IconVerifiedCheckFill } from '@wanteddev/wds-icon';

interface PurchaseBadgeProps {
  isVerified: boolean;
}

export default function PurchaseBadge({ isVerified }: PurchaseBadgeProps) {
  if (!isVerified) return null;

  return (
    <FlexBox
      alignItems="center"
      gap="2px"
      sx={theme => ({
        display: 'inline-flex',
        paddingInline: '6px',
        paddingBlock: '2px',
        borderRadius: '4px',
        backgroundColor: theme.semantic.primary.normal,
        flexShrink: 0,
      })}
    >
      <IconVerifiedCheckFill
        sx={theme => ({
          fontSize: '10px',
          color: theme.semantic.static.white,
        })}
      />
      <Typography
        variant="caption2"
        weight="bold"
        sx={theme => ({ color: theme.semantic.static.white })}
      >
        구매인증
      </Typography>
    </FlexBox>
  );
}
