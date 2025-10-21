import { type AppMeta } from '../../utils/AppMeta'

type SelectIndexProps = {
    appMeta: AppMeta;
    availableCategories: string[];
    currentLang: string;
    selectedIndicators: Record<string, string[]>;
    onChangeSelection: (key: string, firstCategoryName: string, idxStr: string, checked: boolean) => void;
}

function CheckBox({
  appMeta,
  availableCategories,
  currentLang,
  selectedIndicators,
  onChangeSelection,
}: SelectIndexProps) {
  return (
    <div>
      {availableCategories.map((countryKey, firstCategoryIdx) => {
        const countryName =
          appMeta["contents-text"][currentLang].country[countryKey];

        return (
          <div key={countryKey}>
            <h3>{countryName}</h3>

            {appMeta.index[countryKey].map((category, secondCategoryIdx) => {
              const categoryName = category["category-name"][currentLang];

              return (
                <fieldset key={categoryName}
                style={{ fontWeight:  "bold" }}
                >
                  <legend>{categoryName}</legend>

                  {category.items.map((item, itemIdx) => {
                    const itemName = item.name[currentLang];
                    const idxStr = 
                      String(firstCategoryIdx) + String(secondCategoryIdx) + String(itemIdx);
                    return (
                      <label key={item.key}>
                        <input
                          type="checkbox"
                          checked={item.key in selectedIndicators}
                          onChange={
                            (e) => onChangeSelection(item.key, countryKey, idxStr, e.target.checked)
                          }
                        />{" "}
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
