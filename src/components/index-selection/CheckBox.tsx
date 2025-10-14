import { type AppMeta } from '../../utils/AppMeta'

type SelectIndexProps = {
    appMeta: AppMeta;
    availableCategories: string[];
    currentLang: string;
    selectedIndicators: string[];
    onChangeSelection: (key: string, checked: boolean) => void;
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
      {availableCategories.map((countryKey) => {
        const countryName =
          appMeta["contents-text"][currentLang].country[countryKey];

        return (
          <div key={countryKey}>
            <h3>{countryName}</h3>

            {appMeta.index[countryKey].map((category) => {
              const categoryName = category["category-name"][currentLang];

              return (
                <fieldset key={categoryName}
                style={{ fontWeight:  "bold" }}
                >
                  <legend>{categoryName}</legend>

                  {category.items.map((item) => {
                    const itemName = item.name[currentLang];
                    return (
                      <label key={item.key}>
                        <input
                          type="checkbox"
                          checked={selectedIndicators.includes(item.key)}
                          onChange={
                            (e) => onChangeSelection(item.key, e.target.checked)
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
