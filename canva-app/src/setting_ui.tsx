import React, { useEffect, useState } from "react";
import { Button, FormField, TextInput, Select } from "@canva/app-ui-kit";
import type { RegisterOnContextChange } from "@canva/intents/content";

type Props = {
  updatePublishSettings: (settings: string) => void;
  registerOnContextChange: RegisterOnContextChange;
};

const IMAGE_TYPES = [
  { value: "background", label: "Game Background (1920×1080)" },
  { value: "logo", label: "Game Logo (500×500)" },
  { value: "question_image", label: "Question Image (800×600)" },
  { value: "card_image", label: "Card Image (400×400)" },
  { value: "thankyou_bg", label: "Thank You Background (1920×1080)" },
  { value: "overlay", label: "Overlay Image (1080×1920)" },
];

export function SettingUi({ updatePublishSettings, registerOnContextChange }: Props) {
  const [gameId, setGameId] = useState("");
  const [imageType, setImageType] = useState("background");
  const [authToken, setAuthToken] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("promogames_canva_settings");
    if (stored) {
      const parsed = JSON.parse(stored);
      setGameId(parsed.gameId || "");
      setImageType(parsed.imageType || "background");
      setAuthToken(parsed.authToken || "");
    }
  }, []);

  useEffect(() => {
    const settings = JSON.stringify({ gameId, imageType, authToken });
    localStorage.setItem("promogames_canva_settings", settings);
    updatePublishSettings(settings);
  }, [gameId, imageType, authToken, updatePublishSettings]);

  useEffect(() => {
    const unsubscribe = registerOnContextChange(() => {
      return Promise.resolve();
    });
    return () => unsubscribe();
  }, [registerOnContextChange]);

  return (
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
        🎨 Send to PromoGames
      </h2>

      <FormField label="Game ID (optional)">
        <TextInput
          value={gameId}
          onChange={setGameId}
          placeholder="Enter game ID or leave empty"
        />
      </FormField>

      <FormField label="Design Type">
        <Select
          value={imageType}
          onChange={setImageType}
          options={IMAGE_TYPES}
        />
      </FormField>

      <FormField label="Auth Token (from PromoGames)">
        <TextInput
          value={authToken}
          onChange={setAuthToken}
          placeholder="Paste your PromoGames auth token"
          type="password"
        />
      </FormField>

      <div style={{ marginTop: "16px", padding: "12px", background: "#F3F4F6", borderRadius: "8px", fontSize: "12px", color: "#666" }}>
        <strong>How to use:</strong>
        <ol style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>Design your image in Canva</li>
          <li>Select the design type above</li>
          <li>Click "Publish" to send to PromoGames</li>
        </ol>
      </div>
    </div>
  );
}
