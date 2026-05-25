import { FlexBox, Typography, Thumbnail } from '@wanteddev/wds';
import type { Product } from '@/types';

interface ProductMiniCardProps {
  product: Product;
}

export default function ProductMiniCard({ product }: ProductMiniCardProps) {
  return (
    <FlexBox
      alignItems="center"
      gap="10px"
      sx={theme => ({
        padding: '10px 12px',
        borderRadius: '8px',
        border: `1px solid ${theme.semantic.line.solid.alternative}`,
        backgroundColor: theme.semantic.background.normal.alternative,
      })}
    >
      <Thumbnail
        src={product.thumbnail}
        alt={product.name}
        ratio="1:1"
        width="44px"
        radius
        border
        sx={{ flexShrink: 0 }}
      />
      <FlexBox flexDirection="column" gap="2px" sx={{ flex: 1, overflow: 'hidden' }}>
        <Typography
          variant="caption1"
          sx={theme => ({ color: theme.semantic.label.alternative })}
          noWrap
        >
          {product.brand}
        </Typography>
        <Typography variant="label2" weight="medium" noWrap>
          {product.name}
        </Typography>
        <Typography variant="caption1" weight="bold" sx={theme => ({ color: theme.semantic.primary.normal })}>
          {product.price.toLocaleString()}원
        </Typography>
      </FlexBox>
    </FlexBox>
  );
}
