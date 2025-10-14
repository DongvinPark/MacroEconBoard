import { type AppMeta, type Category } from '../../utils/AppMeta'

type SelectIndexProps = {
    appMeta: AppMeta;
    availableCategories: string[];
    currentLang: string;
    onChangeSelection: () => void;
}

function CheckBox({
  appMeta,
  availableCategories,
  currentLang,
  onChangeSelection,
}: SelectIndexProps) {
  // TODO 사용자가 다른 인덱스들에 체크표시하면, 그 결과를 ShowGraphs.tsx 컴포넌트로 넘겨야 한다. 즉, onChangeSelection을 수정해야 한다.
  return (
    <div>
      {availableCategories.map((countryKey) => {
        const countryName =
          appMeta["contents-text"][currentLang].country[countryKey];

        return (
          <div key={countryKey}>
            <h3>{countryName}</h3>

            {appMeta.index[countryKey].map((category) => {
              const categoryName = category["category-name"][currentLang];

              return (
                <fieldset key={categoryName}>
                  <legend>{categoryName}</legend>

                  {category.items.map((item) => {
                    const itemName = item.name[currentLang];
                    return (
                      <label key={item.key}>
                        <input type="checkbox" onChange={onChangeSelection} />{" "}
                        {itemName}
                        <br />
                      </label>
                    );
                  })}
                </fieldset>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default CheckBox;
