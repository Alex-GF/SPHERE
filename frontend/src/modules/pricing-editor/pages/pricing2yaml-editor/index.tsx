import Grid from '@mui/material/Grid2';
import Editor, { Monaco } from '@monaco-editor/react';
import { grey } from '../../../core/theme/palette';
import { useState, useEffect, useRef } from 'react';
import { Pricing, retrievePricingFromYaml } from 'pricing4ts';

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
import { useCacheApi } from '../../components/pricing-renderer/api/cacheApi';
import { TEMPLATE_PETCLINIC_PRICING } from './templates/petclinic';

export default function EditorPage() {
  const [pricing, setPricing] = useState<Pricing>();
  const [errors, setErrors] = useState<string[]>([]);

  const { mode } = useMode();
  const { editorValue, setEditorValue } = useEditorValue();
  const {getFromCache} = useCacheApi();

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
          
          if (parsedPricing.syntaxVersion !== '3.0'){
            throw new Error('Only Pricing YAML syntax version 3.0 is supported in this editor.');
          }
          
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
    const fetchPricing = async () => {
      const queryParams = new URLSearchParams(globalThis.location.search);
      const pricingParam = queryParams.get('pricing');
      const pricingUrlParam = queryParams.get('pricingUrl');
      
      let templatePricing: string = '';

      if (pricingUrlParam){
        const response = await fetch(pricingUrlParam);
        templatePricing = await response.text();
      }else if (!pricingParam) {
        templatePricing = TEMPLATE_PETCLINIC_PRICING;
      } else {
        if (pricingParam.length > 36){ // It is greater that UUID          
          templatePricing = parseEncodedYamlToStringYaml(pricingParam);
        }else{
          const cachedPricing = await getFromCache(pricingParam);
          
          templatePricing = parseEncodedYamlToStringYaml(cachedPricing);
        }
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
    };

    fetchPricing();
  }, []);

  useEffect(() => {
    handleEditorChange(editorValue)
  }, [editorValue]);

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
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: grey[200],
            boxSizing: 'border-box',
            ...flex({ direction: 'column' }),
            py: 2,
          }}
        >
          <Box sx={{ width: '100%' }}>
            {pricing ? <PricingRenderer pricing={pricing} errors={errors} onApplyVariables={(variables) => {
              // Update the YAML in the editorValue replacing or inserting the variables block
              const newYaml = (function replaceVariablesInYaml(yaml: string, vars: Record<string, unknown>) {
                // build variables block
                const serializeVal = (v: unknown) => {
                  if (typeof v === 'string') return JSON.stringify(v);
                  if (typeof v === 'boolean') return v ? 'true' : 'false';
                  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
                  // fallback
                  return JSON.stringify(v);
                };

                const varsLines = ['variables:'];
                for (const k of Object.keys(vars)) {
                  varsLines.push(`  ${k}: ${serializeVal(vars[k])}`);
                }
                const varsBlock = varsLines.join('\n');

                const variablesRegex = /^variables:\n(?:[ \t]+.+\n?)*/gm;

                if (variablesRegex.test(yaml)) {
                  // replace existing variables block
                  return yaml.replace(variablesRegex, varsBlock + '\n');
                } else {
                  // insert after top-level 'createdAt' or 'currency' if present, else append
                  const insertAfterRegex = /^(createdAt:.*|currency:.*)$/mi;
                  const m = insertAfterRegex.exec(yaml);
                  if (m) {
                    const idx = (m.index ?? 0) + (m[0]?.length ?? 0);
                    return yaml.slice(0, idx) + '\n' + varsBlock + yaml.slice(idx);
                  }
                  return yaml + '\n' + varsBlock + '\n';
                }
              })(editorValue, variables);

              setEditorValue(newYaml);
            }} /> : <LoadingView />}
          </Box>
        </Grid>
      </Grid>
      <Alerts messages={errors} />
    </>
  );
}
