import { FC, useEffect, useMemo } from 'react';
import {
  FileTabs,
  SandpackStack,
  SandpackThemeProvider,
  useActiveCode,
  useSandpack,
} from '@codesandbox/sandpack-react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { useModule } from 'hooks/useModule';
import { useDebounce, styled } from '@takaro/lib-components';
import { handleCustomTypes } from './customTypes';
import { defineTheme } from './theme';
import { useFunctionUpdate } from 'queries/modules/queries';

const Wrapper = styled.div`
  flex: 1;
  a,
  p,
  div,
  li,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  header,
  footer {
    font-family: 'Fira Code';
    color: none;
  }
`;

const StyledFileTabs = styled(FileTabs)`
  &:hover {
    svg {
      fill: ${({ theme }): string => theme.colors.primary};
      stroke: ${({ theme }): string => theme.colors.primary};
    }
  }
`;

export const Editor: FC = () => {
  const { code, updateCode } = useActiveCode();
  const monaco = useMonaco();
  const debouncedCode = useDebounce<string>(code, 2000);
  const { moduleData } = useModule();
  const { sandpack } = useSandpack();
  const { mutateAsync: updateFunction } = useFunctionUpdate();

  // TODO: find a better solution to exclude package.json
  useEffect(() => {
    sandpack.deleteFile('/package.json');
  }, []);

  useMemo(() => {
    if (monaco) {
      defineTheme(monaco);
      monaco.editor.setTheme('takaro');

      // only load monaco types if there is no model
      if (monaco.editor.getModels().length === 0) {
        handleCustomTypes(monaco);
      }
    }
  }, [monaco]);

  useEffect(() => {
    if (debouncedCode !== '' && moduleData.fileMap[sandpack.activeFile]) {
      updateFunction({
        functionId: moduleData.fileMap[sandpack.activeFile].functionId,
        fn: { code: debouncedCode },
      });
    }
  }, [debouncedCode, sandpack.activeFile, moduleData.fileMap]);

  return (
    <SandpackThemeProvider theme="auto">
      <SandpackStack style={{ height: '100vh', margin: 0 }}>
        <StyledFileTabs closableTabs />
        <Wrapper>
          <MonacoEditor
            width="100%"
            height="100%"
            language="typescript"
            theme="takaro"
            key={sandpack.activeFile}
            defaultValue={code}
            className="code-editor"
            onChange={(value) => updateCode(value || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              lineNumbers: 'on',
              contextmenu: false,
              'semanticHighlighting.enabled': true,
              readOnly: false,
              fontSize: 17,
              fontWeight: 'bold',
              fontLigatures: false,
            }}
          />
        </Wrapper>
      </SandpackStack>
    </SandpackThemeProvider>
  );
};
