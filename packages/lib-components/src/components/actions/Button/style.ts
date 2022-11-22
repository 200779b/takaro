import { styled, Color, Size, AlertVariants } from '../../../styled';

export type ButtonColor = Color | AlertVariants | 'background' | 'white';

export const Default = styled.button<{
  size: Size;
  color: ButtonColor;
  icon: boolean;
  isLoading: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  border-radius: 0.5rem;
  background-size: 200% auto;
  cursor: ${({ isLoading }) => (isLoading ? 'default' : 'pointer')};
  line-height: 1.9rem;
  letter-spacing: 0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: ${({ theme, color }) => theme.colors[color]};

  &:focus {
    outline: 0;
  }
  &:hover {
    background-position: right center;
  }

  span {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${({ theme, color }) =>
      color === 'white' ? theme.colors.primary : 'white'};
    margin-left: ${({ icon, isLoading }): string =>
      icon || isLoading ? '10px' : '0px'};
  }

  &:disabled {
    cursor: default;
    background: ${({ theme }) => theme.colors.gray};
    border-color: white;
  }

  svg {
    display: ${({ icon, isLoading }): string =>
      icon || isLoading ? 'block' : 'none'};
    cursor: pointer;
    fill: white;
    stroke: white;
  }

  ${({ size, theme }) => {
    switch (size) {
      case 'tiny':
        return `
          padding: ${theme.spacing['0_25']} ${theme.spacing['0_75']};
        `;
      case 'small':
        return `
          padding: ${theme.spacing['0_5']} ${theme.spacing['1']}
        `;
      case 'medium':
        return `
          padding: ${theme.spacing['0_75']} ${theme.spacing['1_5']}
        `;
      case 'large':
        return `
          padding: ${theme.spacing['1']} ${theme.spacing['2']}
        `;
      case 'huge':
        return `
          span {
            font-size: 105%;
          }
          padding: ${theme.spacing[1]} ${theme.spacing[2]}
        `;
    }
  }}
`;

export const Outline = styled(Default)<{ color: ButtonColor }>`
  background: transparent;
  border: 0.2rem solid ${({ theme, color }): string => theme.colors[color]};
  span {
    color: ${({ theme, color }): string => theme.colors[color]};
  }
  &:disabled {
    background: none;
    border-color: ${({ theme }): string => theme.colors.gray};
    span {
      color: ${({ theme }): string => theme.colors.gray};
    }
    svg {
      fill: ${({ theme }): string => theme.colors.gray};
      stroke: ${({ theme }): string => theme.colors.gray};
    }
  }

  svg {
    fill: ${({ theme, color }): string => theme.colors[color]};
    stroke: ${({ theme, color }): string => theme.colors[color]};
  }
`;

export const Clear = styled(Outline)`
  background: transparent;
  box-shadow: none;
  border: none;
  span {
    color: ${({ theme, color }): string => theme.colors[color]};
  }
`;

export const White = styled(Clear)`
  background: ${({ theme }): string => theme.colors.white};
  &:disabled {
    background-color: white;
  }
`;