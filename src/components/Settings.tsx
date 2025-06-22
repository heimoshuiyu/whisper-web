import { useTranslation } from "react-i18next";
import { SettingsProps } from "../types";

const Settings: React.FC<SettingsProps> = ({
  showSettings,
  apiEndpoint,
  setApiEndpoint,
  key,
  setKey,
  language,
  setLanguage,
  useFFmpeg,
  setUseFFmpeg,
  onOpenModal,
}) => {
  const { t } = useTranslation();

  if (!showSettings) return null;

  return (
    <div className="my-4 settings">
      <span className="my-4">
        <label className="my-4 block text-gray-700 text-sm font-bold mb-2">
          {t("settings.apiEndpoint")}: This is a demo API. You can
          <button
            className="ml-2 text-blue-500 underline hover:text-blue-700"
            onClick={onOpenModal}
          >
            host your own whisper backend
          </button>
        </label>
        <input
          spellCheck={false}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          value={apiEndpoint}
          onChange={(e) => setApiEndpoint(e.target.value)}
        />
      </span>
      <span className="my-4">
        <label className="my-4 block text-gray-700 text-sm font-bold mb-2">
          {t("settings.apiKey")}:
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </span>
      <span className="my-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {t("settings.language")}
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />
      </span>
      <span className="my-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {t("settings.useFFmpeg")}
        </label>
        <input
          type="checkbox"
          checked={useFFmpeg}
          onChange={(e) => setUseFFmpeg(e.target.checked)}
        />
      </span>
    </div>
  );
};

export default Settings;
