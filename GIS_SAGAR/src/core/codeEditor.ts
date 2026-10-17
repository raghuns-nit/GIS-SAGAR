// Kept in sync by scripts/generate-code-editor.mjs from the shared SDK builder.
import template from '../../gee/code-editor-template.js?raw';
import type {Site,GridCell} from './geometry.ts';
export function codeEditorScript(site:Site,cells:GridCell[]){return 'var REQUEST = '+JSON.stringify({schema:'gis-sagar-request-v1',site,cells,scale:30})+';\n'+template;}
