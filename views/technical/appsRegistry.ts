
// @ts-ignore
import RAW_DATA from "../../csv/apps.csv?raw";

export interface AppNode {
  id: string;
  displayName: string;
  appId: string;
  homepage: string;
  createdDateTime: string;
  state: string;
  certificateExpiryStatus: string;
  activeCertificateExpiryDate: string;
  appStatus: string;
  appVisibility: string;
  appProxy: string;
  identifierUri: string;
}

/**
 * Institutional Registry Parser
 * Processes the raw CSV string into structured AppNode objects
 */
function parseInstitutionalRegistry(csv: string): AppNode[] {
  if (!csv || csv.trim() === "") return [];
  
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  
  // Regex to split by comma while ignoring commas inside double quotes
  const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

  return lines.slice(1).map(line => {
    const values = line.split(regex).map(v => {
      return (v || '').trim().replace(/^"|"$/g, '').trim();
    });

    const node: any = {};
    headers.forEach((header, index) => {
      node[header] = values[index] || '';
    });
    
    return node as AppNode;
  });
}

export const APP_NODES: AppNode[] = parseInstitutionalRegistry(RAW_DATA);
