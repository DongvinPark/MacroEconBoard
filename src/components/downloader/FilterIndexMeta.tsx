import type { AppMeta, Category, IndexItem } from "../../utils/AppMeta";

type IndexMetaProps = {
    meta: AppMeta;
    categoryName: string;
    indexName: string;
}

// ex
// sortedIndicators == { kospi: ["kr", "000"], kosdaq: ["kr", "001"] }
export function getIndexMetaList(
  meta: AppMeta, sortedIndicators: Record<string, string[]>
) {
  let list: IndexItem[] = [];
  const keys: string[] = Object.keys(sortedIndicators);

  for (let i=0; i<keys.length; i++){
    const indexName: string = keys[i];
    const categoryName: string = sortedIndicators[indexName][0];
    const indexItem: IndexItem|null = getIndexMeta({meta, categoryName, indexName});
    if(indexItem !== null){
      list.push(indexItem);
    }
  }

  return list;
}

function getIndexMeta(
    {meta, categoryName, indexName}: IndexMetaProps
): IndexItem | null {
    const categoryList: Category[] = meta.index[categoryName];

    for(let i=0; i<(categoryList).length; i++){
        const category: Category = categoryList[i];
        const itemList: IndexItem[] = category.items;

        for(let j=0; j<(itemList).length; j++){
            const indexItem: IndexItem = itemList[j];
            if(indexItem.key === indexName){
                return indexItem;
            }
        }//inner for
    }//outer for
    return null;
}

/*
Javascript, Typescript 의 특징을 적극 활용하면
아래와 같이 더 간단하게 getIndexMeta 함수를 작성할 수 있다.

export function getIndexMeta({
  appMeta,
  categoryName,
  indexName,
}: IndexMetaProps): IndexItem | undefined {
  const categoryList = appMeta.index[categoryName];

  for (const category of categoryList) {
    for (const item of category.items) {
      if (item.key === indexName) return item;
    }
  }

  return undefined;
}

혹은 map 함수와 find를 써서 더 줄일 수도 있다.
export function getIndexMeta({
  appMeta,
  categoryName,
  indexName,
}: IndexMetaProps): IndexItem | undefined {
  return appMeta.index[categoryName]
    .flatMap(c => c.items)
    .find(item => item.key === indexName);
}

*/

export default getIndexMetaList;