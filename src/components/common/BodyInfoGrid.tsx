import { FlexBox, Typography } from '@wanteddev/wds';

interface BodyInfoGridProps {
  height: number;
  weight: number;
  normalSize: string;
  purchaseSize: string;
}

interface GridCellProps {
  label: string;
  value: string;
}

function GridCell({ label, value }: GridCellProps) {
  return (
    <FlexBox
      flexDirection="column"
      alignItems="center"
      gap="4px"
      sx={theme => ({
        flex: 1,
        padding: '12px 8px',
        backgroundColor: theme.semantic.background.normal.alternative,
        borderRadius: '8px',
      })}
    >
      <Typography variant="caption1" sx={theme => ({ color: theme.semantic.label.alternative })}>
        {label}
      </Typography>
      <Typography variant="label1" weight="bold">
        {value}
      </Typography>
    </FlexBox>
  );
}

export default function BodyInfoGrid({
  height,
  weight,
  normalSize,
  purchaseSize,
}: BodyInfoGridProps) {
  return (
    <FlexBox flexDirection="column" gap="8px">
      <FlexBox gap="8px">
        <GridCell label="키" value={`${height}cm`} />
        <GridCell label="몸무게" value={`${weight}kg`} />
      </FlexBox>
      <FlexBox gap="8px">
        <GridCell label="평소 사이즈" value={normalSize} />
        <GridCell label="구매 사이즈" value={purchaseSize} />
      </FlexBox>
    </FlexBox>
  );
}
