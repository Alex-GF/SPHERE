import * as LZString from 'lz-string';

export function parseStringYamlToEncodedYaml(yaml: string): string {
  const compressed = LZString.compressToEncodedURIComponent(yaml);
  return `${window.location.href}?pricing=${compressed}`;
}

export function parseEncodedYamlToStringYaml(encodedYaml: string): string {
  const original = LZString.decompressFromEncodedURIComponent(encodedYaml);
  if (original === null) {
    window.location.href = window.location.href.split('?')[0];
  }
  return original;
}
