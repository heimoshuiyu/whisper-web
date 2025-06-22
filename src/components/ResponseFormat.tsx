import { useTranslation } from "react-i18next";

interface ResponseFormatProps {
  selectResponseFormat: string;
  setSelectResponseFormat: (value: string) => void;
}

const ResponseFormat: React.FC<ResponseFormatProps> = ({
  selectResponseFormat,
  setSelectResponseFormat,
}) => {
  const { t } = useTranslation();

  return (
    <div className="my-4 settings">
      <span className="my-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {t("settings.responseFormat")}:
        </label>
        <select
          id="response_format"
          className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
          value={selectResponseFormat}
          onChange={(e) => setSelectResponseFormat(e.target.value)}
        >
          <option value="text">Text</option>
          <option value="srt">SRT</option>
          <option value="vtt">VTT</option>
          <option value="stream">stream</option>
          <option value="json">JSON</option>
        </select>
      </span>
    </div>
  );
};

export default ResponseFormat;
