import { type AppMeta } from '../../utils/AppMeta'

type SelectLangProps = {
    appMeta: AppMeta;
    availableLangs: string[];
    currentLang: string;
    onChangeLang: (newLang: string) => void;
}

function SelectLang({ appMeta, availableLangs, currentLang, onChangeLang }: SelectLangProps) {

    return (
      <div>
        {availableLangs.map((lang) => (
          <button
            key={lang}
            onClick={() => onChangeLang(lang)}
            style={{ fontWeight: lang === currentLang ? "bold" : "normal" }}
          >
            {appMeta['contents-text'][lang].native}
          </button>
        ))}
      </div>
    );
}  

export default SelectLang;