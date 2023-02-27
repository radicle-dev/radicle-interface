import { parseNodeId } from "@app/lib/utils";

// Formats COBs Object Ids
export function formatObjectId(id: string): string {
  return id.substring(0, 11);
}

export function stripDidPrefix(array: string[]): string[] {
  return array.map(id => id.replace("did:key:", ""));
}

export function validateTag(
  value: string,
  items: string[],
): { success: false; error: string } | { success: true } {
  if (value.trim().length > 0) {
    if (items.includes(value)) {
      return { success: false, error: "This tag is already added" };
    } else {
      return { success: true };
    }
  }
  return { success: false, error: "This tag is not valid" };
}

export function validateAssignee(
  value: string,
  items: string[],
): { success: false; error: string } | { success: true } {
  const nodeId = parseNodeId(value);
  if (nodeId) {
    if (items.includes(`${nodeId.prefix}${nodeId.pubkey}`)) {
      return { success: false, error: "This assignee is already added" };
    } else {
      return { success: true };
    }
  }
  return { success: false, error: "This assignee is not valid" };
}
