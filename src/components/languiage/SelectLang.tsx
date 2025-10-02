import { type AppMeta } from '../../utils/AppMeta'

type SelectLangProps = {
    appMeta: AppMeta;
    availableLangs: string[];
    currentLang: string;
    onChangeLang: (newLang: string) => void;
}

function SelectLang(
    { appMeta, availableLangs, currentLang, onChangeLang }: SelectLangProps
) {
    return (
      <div>
        {
        // appMeta 안에 정의된 언어팩에 맞춰서 버튼목록이 뜨게 만든다.
        availableLangs.map(
            (lang) => (
                <button
                    key={lang}
                    onClick={() => onChangeLang(lang)}
                    style={{ fontWeight: lang === currentLang ? "bold" : "normal" }}
                >
                    {appMeta['contents-text'][lang].native}
                </button>
            )
        )
        }
      </div>
    );
}  

export default SelectLang;