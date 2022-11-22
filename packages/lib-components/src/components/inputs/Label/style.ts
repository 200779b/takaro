import { LabelPosition } from '.';
import { styled, Size } from '../../../styled';

export const Container = styled.label<{
  error: boolean;
  size: Size;
  position: LabelPosition;
}>`
  color: ${({ theme, error }): string =>
    error ? theme.colors.error : theme.colors.text};
  width: 100%;
  user-select: none;
  font-size: 1.4rem;
  font-weight: 500;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  justify-content: space-between;

  span {
    font-size: 1rem;
    color: ${({ theme, error }): string =>
      error ? theme.colors.error : theme.colors.text};
  }

  margin: ${({ theme, position }) => {
    switch (position) {
      case 'top':
        return `${theme.spacing[0]} ${theme.spacing[0]} ${theme.spacing['0_5']} ${theme.spacing[0]}`;
      case 'right':
        return `${theme.spacing[0]} ${theme.spacing[0]} ${theme.spacing[0]} ${theme.spacing['0_5']}`;
      case 'bottom':
        return `${theme.spacing['0_5']} ${theme.spacing[0]} ${theme.spacing[0]} ${theme.spacing[0]}`;
      case 'left':
        return `${theme.spacing[0]} ${theme.spacing['0_5']} ${theme.spacing[0]} ${theme.spacing[0]}`;
    }
  }};
`;