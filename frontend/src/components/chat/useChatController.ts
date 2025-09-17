// chat/useChatController.ts
import { useCallback, useEffect, useState } from "react";
import type { ChatMessage } from "./ChatHistory";
import type { DisplayMessage, UserProfile } from "./actions";
import {
  ChatAction,
  DisplayInChatAction,
  N8nRequest,
  ProposeFilterChangesAction,
  ToastAction,
  UpdateFiltersAction,
  FilterSnapshot,
  FilterPatch,
} from "./actions";
import { sendToN8n } from "./chatGateway";
import { hydrateThread, saveThreadLocal, saveThreadToServer } from "./storage";

export type UseChatControllerOptions = {
  pageId: string;
  threadKey: string;
  // اسنپ‌شات فیلترهای فعلی صفحه
  getFilterSnapshot: () => FilterSnapshot;
  // مرج پچ روی فیلترها + اجرای همان مسیر دکمه دستی (applyFilters)
  applyFilterPatchAndFetch: (patch: FilterPatch) => Promise<void> | void;
  onToast?: (args: {
    title: string;
    description?: string;
    variant?: string;
  }) => void;
  // مسیر فوری: اگر پاس ندی، Cloud استفاده می‌شود
  n8nUrl?: string;
  getUserProfile?: () => UserProfile | null | undefined;
};

// پیشنهاد فیلتر منتظر تایید کاربر
export type PendingProposal = {
  patch: FilterPatch;
  label?: string; // متن دکمه در 1/3
  explain?: string; // پیام راهنما در 1/3
};

export function useChatController({
  pageId,
  threadKey,
  getFilterSnapshot,
  applyFilterPatchAndFetch,
  onToast,
  n8nUrl = "https://questapply.app.n8n.cloud/webhook/82df3d92-3c13-4ba0-bde7-d629345d0596",
  getUserProfile,
}: UseChatControllerOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatBusy, setIsChatBusy] = useState(false);
  const [pendingProposal, setPendingProposal] =
    useState<PendingProposal | null>(null);

  // هیدرات تاریخچه
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const initial = await hydrateThread(threadKey);
      if (!cancelled) setMessages(initial);
    })();
    return () => {
      cancelled = true;
    };
  }, [threadKey]);

  // ذخیره تاریخچه (لوکال + سرور)
  const persist = useCallback(
    (msgs: ChatMessage[]) => {
      saveThreadLocal(threadKey, msgs);
      void saveThreadToServer(threadKey, msgs);
    },
    [threadKey]
  );

  const pushMessage = useCallback(
    (msg: ChatMessage) => {
      setMessages((prev) => {
        const next = [...prev, msg];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // فقط متن ساده‌ی دستیار
  const pushAssistantText = useCallback(
    (content: string) => {
      pushMessage({
        id: String(Date.now()),
        type: "assistant",
        content,
        timestamp: new Date(),
      });
    },
    [pushMessage]
  );

  // پیام دستیار با پیشنهادها (Quick Replies)
  const pushAssistantDisplay = useCallback(
    (m: DisplayMessage) => {
      pushMessage({
        id: String(Date.now()),
        type: "assistant",
        content: m.content,
        timestamp: new Date(),
        // ChatMessage باید suggestions?: QuickReply[] داشته باشد
        // (در ChatHistory.tsx تعریفش را اضافه کرده‌ایم)
        suggestions: m.suggestions,
      } as ChatMessage);
    },
    [pushMessage]
  );

  // اعمال پچ + اجرای مسیر دکمه دستی (فقط بعد از کلیک کاربر در 1/3)
  const applyPatchNow = useCallback(
    async (patch: FilterPatch, announce?: string) => {
      await applyFilterPatchAndFetch(patch);
      if (announce) pushAssistantText(announce);
    },
    [applyFilterPatchAndFetch, pushAssistantText]
  );

  // اکشن‌های n8n (هیچ‌کدام فیلتر را خودکار اعمال نمی‌کند)
  const handleActions = useCallback(
    async (actions: ChatAction[]) => {
      for (const a of actions) {
        switch (a.type) {
          case "DISPLAY_IN_CHAT": {
            const da = a as DisplayInChatAction;
            for (const m of da.messages) pushAssistantDisplay(m);
            break;
          }
          case "PROPOSE_FILTER_CHANGES": {
            const pa = a as ProposeFilterChangesAction;
            setPendingProposal({
              patch: pa.patch,
              label: pa.label,
              explain: pa.explain,
            });
            pushAssistantText(
              pa.explain ??
                "Ready to apply the suggested filters. Tap Filter to continue."
            );
            break;
          }
          case "UPDATE_FILTERS": {
            const ua = a as UpdateFiltersAction;
            setPendingProposal({
              patch: ua.patch,
              label: ua.announce || "Filter",
              explain: ua.announce,
            });
            pushAssistantText(
              ua.announce ?? "I prepared filter changes. Tap Filter to apply."
            );
            break;
          }
          case "TOAST": {
            const ta = a as ToastAction;
            onToast?.({
              title: ta.title,
              description: ta.description,
              variant: ta.variant,
            });
            break;
          }
          default:
            break;
        }
      }
    },
    [onToast, pushAssistantDisplay, pushAssistantText]
  );

  // ارسال پیام کاربر به n8n
  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: String(Date.now()),
        type: "user",
        content: text,
        timestamp: new Date(),
      };
      pushMessage(userMsg);
      setIsChatBusy(true);

      try {
        const profile = getUserProfile?.() || undefined;
        const payload: N8nRequest = {
          message: text,
          pageId,
          threadKey,
          filters: getFilterSnapshot(),
          user: profile,
        };
        const { actions } = await sendToN8n(payload, n8nUrl);
        await handleActions(actions || []);
      } catch (e: any) {
        pushAssistantText(
          "Sorry, something went wrong while processing your request."
        );
        onToast?.({
          title: "Chat error",
          description: e?.message || "Unexpected error",
          variant: "destructive",
        });
      } finally {
        setIsChatBusy(false);
      }
    },
    [
      pushMessage,
      pageId,
      threadKey,
      getFilterSnapshot,
      handleActions,
      onToast,
      n8nUrl,
      getUserProfile,
      pushAssistantText,
    ]
  );

  // کلیک روی یکی از پیشنهادهای زیر پیام دستیار
  const sendQuickReply = useCallback(
    (text: string, originMessageId?: string) => {
      if (originMessageId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === originMessageId
              ? ({ ...m, suggestions: undefined } as ChatMessage)
              : m
          )
        );
      }
      return sendMessage(text);
    },
    [sendMessage]
  );

  // تایید/لغو پیشنهاد (دکمه Filter در 1/3)
  const confirmPendingProposal = useCallback(async () => {
    if (!pendingProposal) return;
    await applyPatchNow(pendingProposal.patch, "Filters applied.");
    setPendingProposal(null);
  }, [pendingProposal, applyPatchNow]);

  const clearPendingProposal = useCallback(() => setPendingProposal(null), []);

  return {
    // state
    messages,
    isChatBusy,
    pendingProposal,
    // actions
    sendMessage,
    sendQuickReply,
    confirmPendingProposal,
    clearPendingProposal,
    // util (اختیاری)
    pushAssistantText,
    setMessages,
  };
}
