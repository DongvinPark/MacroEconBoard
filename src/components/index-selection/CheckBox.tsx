import { type AppMeta, type Category } from '../../utils/AppMeta'

type SelectIndexProps = {
    appMeta: AppMeta;
    availableCategories: string[];
    currentLang: string;
    onChangeSelection: () => void;
}

function CheckBox(
  { 
    appMeta,
    availableCategories,
    currentLang,
    onChangeSelection 
  }: SelectIndexProps
) {
    // TODO 사용자가 언어 설정을 바꾸면 여기도 바뀌어야 한다.
    // TODO 사용자가 다른 인덱스들에 체크표시하면, 그 결과를 ShowGraphs.tsx 컴포넌트로 넘겨야 한다.
    console.log("!!! 어베일 !!! : " + availableCategories);
    console.log("!!! 현재 언어 !!! : " + currentLang);
    
  return (
    <div>
      {
        availableCategories.map(
          (category) => (
            <div key={category}>
              <h3>{appMeta['contents-text'][currentLang].country[category]}</h3>
              {

              }
            </div>
          )
        )
      }
    </div>
  );
}

export default CheckBox;
