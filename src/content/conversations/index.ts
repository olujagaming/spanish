import type { ConversationSource } from '../types';
import { CONVERSATIONS_BASIC } from './basic';
import { CONVERSATIONS_ADVANCED } from './advanced';

export const CONVERSATIONS: ConversationSource[] = [...CONVERSATIONS_BASIC, ...CONVERSATIONS_ADVANCED];

export function getConversation(id: string): ConversationSource | undefined {
  return CONVERSATIONS.find((c) => c.id === id);
}
