import Grid from '@mui/material/Grid2';
import Editor, { Monaco } from '@monaco-editor/react';
import { grey } from '../../../core/theme/palette';
import { useState, useEffect, useRef } from 'react';
import { retrievePricingFromYaml, Pricing } from 'pricing4ts';

import { PricingRenderer } from '../../components/pricing-renderer';
import LoadingView from '../../../core/pages/loading';
import { flex } from '../../../core/theme/css';
import { Box } from '@mui/material';
import { Helmet } from 'react-helmet';
import Alerts from '../../../core/components/alerts';
import { useMode } from '../../../core/hooks/useTheme';
import GithubDarkTheme from '../../../core/theme/editor-themes/GitHub-Dark.json';
import TextmateTheme from '../../../core/theme/editor-themes/Textmate.json';
import monaco from 'monaco-editor';
import { useEditorValue } from '../../hooks/useEditorValue';
import { parseEncodedYamlToStringYaml } from '../../services/export.service';

const TEMPLATE_PRICING_PATH = `${import.meta.env.VITE_ASSETS_URL}/pricings/templates/petclinic.yml`;

export default function EditorPage() {
  const [pricing, setPricing] = useState<Pricing>();
  const [errors, setErrors] = useState<string[]>([]);

  const { mode } = useMode();
  const { editorValue, setEditorValue } = useEditorValue();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleEditorChange(value: string | undefined) {
    if (value) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        try {
          setEditorValue(value);
          const parsedPricing: Pricing = retrievePricingFromYaml(value);
          setPricing(parsedPricing);
          setErrors([]);
        } catch (err) {
          const errorMessage = (err as Error).message;
          setErrors(prevErrors => {
            if (!prevErrors.includes(errorMessage)) {
              return [...prevErrors, errorMessage];
            }
            return prevErrors;
          });
        }
      }, 1000);
    }
  }

  function handleEditorDidMount(editorInstance: Monaco) {
    editorInstance.editor.defineTheme(
      'github-dark',
      GithubDarkTheme as monaco.editor.IStandaloneThemeData
    );
    editorInstance.editor.defineTheme(
      'textmate',
      TextmateTheme as monaco.editor.IStandaloneThemeData
    );
  }

  useEffect(() => {
    fetch(TEMPLATE_PRICING_PATH).then(async response => {
      const pricingParam = new URLSearchParams(window.location.search).get('pricing');
      let templatePricing: string = '';

      if (!pricingParam) {
        templatePricing = await response.text();
      } else {
        templatePricing = parseEncodedYamlToStringYaml(pricingParam);
      }

      try {
        const parsedPricing: Pricing = retrievePricingFromYaml(templatePricing);
        
        setPricing(parsedPricing);
        setEditorValue(templatePricing);
        setErrors([]);
      } catch (err) {
        const errorMessage = (err as Error).message;
        setErrors(prevErrors => {
          if (!prevErrors.includes(errorMessage)) {
            return [...prevErrors, errorMessage];
          }
          return prevErrors;
        });
      }
    });
  }, []);

  useEffect(() => {}, [editorValue]);

  return (
    <>
      <Helmet>
        <title>SPHERE - Pricing2Yaml Editor</title>
      </Helmet>
      <Grid
        container
        spacing={1.5}
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: grey[400],
        }}
      >
        <Grid size={6} sx={{ height: '100%' }}>
          <Editor
            height="100%"
            defaultLanguage="yaml"
            onChange={handleEditorChange}
            value={editorValue}
            theme={mode === 'light' ? 'textmate' : 'github-dark'}
            beforeMount={handleEditorDidMount}
            options={{
              minimap: {
                enabled: false,
              },
              fontSize: 16,
            }}
          />
        </Grid>
        <Grid
          size={6}
          sx={{
            height: '100%',
            overflow: 'scroll',
            backgroundColor: grey[200],
            ...flex({ direction: 'column' }),
          }}
        >
          <Box sx={{ width: '100%' }}>
            {pricing ? <PricingRenderer pricing={pricing} errors={errors} /> : <LoadingView />}
          </Box>
        </Grid>
      </Grid>
      <Alerts messages={errors} />
    </>
  );
}
