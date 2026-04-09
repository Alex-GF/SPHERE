import Editor, { Monaco } from '@monaco-editor/react';
import { grey } from '../../../core/theme/palette';
import { useState, useEffect, useRef } from 'react';
import { Pricing, retrievePricingFromYaml } from 'pricing4ts';

import { PricingRenderer } from '../../components/pricing-renderer';
import LoadingView from '../../../core/pages/loading';
import { flex } from '../../../core/theme/css';
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
        const regex = /^syntaxVersion:\s*['"]?([^'"\n\r]+)['"]?$/m;
        const syntaxVersion = templatePricing.match(regex)?.[1];
        let parsedPricing: Pricing;

        if (syntaxVersion !== '3.0'){
          const response = await fetch('/api/pricings', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pricing: templatePricing }),
          })

          parsedPricing = await response.json();
        }else{
          parsedPricing = retrievePricingFromYaml(templatePricing);
        }
        
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
      <div className="grid h-full w-full gap-4 bg-slate-300 lg:grid-cols-2">
        <div className="h-full min-h-0">
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
        </div>
        <div className="box-border flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden bg-slate-200 py-2">
          <div className="w-full">
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
          </div>
        </div>
      </div>
      <Alerts messages={errors} />
    </>
  );
}
