import type {
  ContentPublisherIntent,
  GetPublishConfigurationResponse,
  PublishContentRequest,
  PublishContentResponse,
  RenderPreviewUiRequest,
  RenderSettingsUiRequest,
} from "@canva/intents/content";
import { prepareContentPublisher } from "@canva/intents/content";
import { createRoot } from "react-dom/client";
import "@canva/app-ui-kit/styles.css";
import { AppUiProvider } from "@canva/app-ui-kit";
import { PreviewUi } from "./preview_ui";
import { SettingUi } from "./setting_ui";

const PROMOGAMES_API = "http://localhost:8000/api/canva";

function renderSettingsUi({
  updatePublishSettings,
  registerOnContextChange,
}: RenderSettingsUiRequest) {
  const root = createRoot(document.getElementById("root") as Element);
  root.render(
    <AppUiProvider>
      <SettingUi
        updatePublishSettings={updatePublishSettings}
        registerOnContextChange={registerOnContextChange}
      />
    </AppUiProvider>,
  );
}

function renderPreviewUi({ registerOnPreviewChange }: RenderPreviewUiRequest) {
  const root = createRoot(document.getElementById("root") as Element);
  root.render(
    <AppUiProvider>
      <PreviewUi registerOnPreviewChange={registerOnPreviewChange} />
    </AppUiProvider>,
  );
}

async function getPublishConfiguration(): Promise<GetPublishConfigurationResponse> {
  return {
    status: "completed",
    outputTypes: [
      {
        id: "promogames_design",
        displayName: "PromoGames Design",
        mediaSlots: [
          {
            id: "media",
            displayName: "Design",
            fileCount: { exact: 1 },
            accepts: {
              image: {
                format: "png",
                aspectRatio: { min: 0.1, max: 10 },
              },
            },
          },
        ],
      },
    ],
  };
}

async function publishContent(
  request: PublishContentRequest,
): Promise<PublishContentResponse> {
  try {
    const { outputMedia, publishRef } = request;
    const settings = publishRef ? JSON.parse(publishRef) : {};

    const imageFile = outputMedia[0]?.files?.[0];

    if (!imageFile) {
      return {
        status: "error",
        error: {
          message: "No image selected",
        },
      };
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    const dataUrl = `data:image/png;base64,${base64}`;

    const response = await fetch(`${PROMOGAMES_API}/upload-design`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.authToken || ""}`,
      },
      body: JSON.stringify({
        imageBase64: dataUrl,
        gameId: settings.gameId || null,
        imageType: settings.imageType || "background",
        templateId: settings.templateId || null,
        source: "canva_app",
      }),
    });

    const result = await response.json();

    if (!result.success) {
      return {
        status: "error",
        error: {
          message: result.message || "Upload failed",
        },
      };
    }

    return {
      status: "completed",
      externalId: result.filename || "design",
      externalUrl: result.imageUrl || "",
    };
  } catch (error) {
    return {
      status: "error",
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

const contentPublisher: ContentPublisherIntent = {
  renderSettingsUi,
  renderPreviewUi,
  getPublishConfiguration,
  publishContent,
};

prepareContentPublisher(contentPublisher);
