import React, { useEffect, useState } from "react";
import type { RegisterOnPreviewChange } from "@canva/intents/content";

type Props = {
  registerOnPreviewChange: RegisterOnPreviewChange;
};

export function PreviewUi({ registerOnPreviewChange }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  useEffect(() => {
    const unsubscribe = registerOnPreviewChange(async () => {
      setStatus("sending");
      return {
        ready: true,
      };
    });
    return () => unsubscribe();
  }, [registerOnPreviewChange]);

  return (
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>
        {status === "idle" && "🎨"}
        {status === "sending" && "⏳"}
        {status === "success" && "✅"}
        {status === "error" && "❌"}
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}>
        {status === "idle" && "Ready to Send"}
        {status === "sending" && "Sending to PromoGames..."}
        {status === "success" && "Sent Successfully!"}
        {status === "error" && "Failed to Send"}
      </h3>

      <p style={{ fontSize: "13px", color: "#666", marginBottom: "16px" }}>
        {status === "idle" && "Your design will be sent to PromoGames when you click Publish."}
        {status === "sending" && "Please wait..."}
        {status === "success" && "Check your PromoGames dashboard for the uploaded design."}
        {status === "error" && "Something went wrong. Please try again."}
      </p>

      {status === "idle" && (
        <div style={{ padding: "12px", background: "#EEF2FF", borderRadius: "8px", fontSize: "12px", color: "#4338CA" }}>
          <strong>PromoGames</strong> — Game Marketing Platform
        </div>
      )}
    </div>
  );
}
