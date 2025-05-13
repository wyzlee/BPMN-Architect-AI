
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-bpmn-xml.ts';
import '@/ai/flows/refine-user-input-flow.ts';
import '@/ai/flows/validate-bpmn-xml-flow.ts';
import '@/ai/flows/correct-bpmn-xml-flow.ts';
